import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TOOLS } from "../../src/mcp/manifest.ts";
import { makeWorkspace, mcpClient, node, write } from "../helpers.ts";

let root: string;
let c: Awaited<ReturnType<typeof mcpClient>>;

before(async () => {
  root = makeWorkspace([node({ id: "A", status: "READY" }), node({ id: "B", depends_on: ["A"] }), node({ id: "C", status: "READY", efeito_externo: true })]);
  c = await mcpClient("estado", { MAESTRO_WORKSPACE: root });
});
after(async () => c.close());

test("expõe exatamente as ferramentas do manifesto, com anotações", async () => {
  const { tools } = await c.client.listTools();
  const expected = TOOLS.filter((t) => t.server === "estado");
  assert.deepEqual(tools.map((t) => t.name).sort(), expected.map((t) => t.name).sort());
  for (const t of tools) {
    const m = expected.find((x) => x.name === t.name)!;
    assert.equal(t.annotations?.readOnlyHint, m.readOnly, t.name);
    assert.equal(t.annotations?.destructiveHint, m.destructive, t.name);
    assert.ok((t.description ?? "").length > 40, `${t.name} sem descrição útil`);
  }
});

test("state_summary e node_next leem o ledger", async () => {
  const s = await c.call("state_summary");
  assert.equal(s.isError, false);
  assert.equal((s.data.proximo_elegivel as { id: string }).id, "A");
  const n = await c.call("node_next");
  assert.equal(n.data.modo, "iniciar");
});

test("EV-001/002 via MCP: WIP e DONE sem evidência são recusados; fluxo completo com evidência passa", async () => {
  assert.equal((await c.call("node_transition", { id: "A", para: "DOING", motivo: "iniciar", ator: "maestro" })).isError, false);
  const wip = await c.call("node_transition", { id: "C", para: "DOING", motivo: "iniciar", ator: "maestro" });
  assert.equal(wip.isError, true);
  assert.equal(wip.data.codigo, "WIP");
  write(root, "07-execucao/A/saida.md", "# saída\n");
  await c.call("node_update", { id: "A", output: ["07-execucao/A/saida.md"], motivo: "saída salva", ator: "maestro" });
  assert.equal((await c.call("node_transition", { id: "A", para: "VERIFY", motivo: "rascunho", ator: "maestro" })).isError, false);
  const semEvidencia = await c.call("node_transition", { id: "A", para: "DONE", motivo: "fim", ator: "maestro", verificacao: "ok ok" });
  assert.equal(semEvidencia.data.codigo, "EVIDENCE");
  const inexistente = await c.call("evidence_add", { id: "A", caminho: "nao/existe.md", criterio: "x", classe: "A_OBSERVADO", ator: "maestro" });
  assert.equal(inexistente.isError, true);
  assert.equal((await c.call("evidence_add", { id: "A", caminho: "07-execucao/A/saida.md", criterio: "arquivo existe", classe: "A_OBSERVADO", ator: "maestro" })).isError, false);
  const done = await c.call("node_transition", { id: "A", para: "DONE", motivo: "fim", ator: "maestro", verificacao: "arquivo revisado" });
  assert.equal(done.isError, false);
  // B foi desbloqueado por dependência
  assert.equal(((await c.call("node_next")).data.no as { id: string }).id, "B");
  // projeção regenerada a cada escrita
  assert.match(readFileSync(join(root, "07-execucao/ESTADO.md"), "utf8"), /\| A \| nó A \| ✅ CONCLUÍDO/);
});

test("EV-003 via MCP: efeito externo sem autorização vai para BLOCKED + USER_ACTION_REQUIRED; com autorização conclui", async () => {
  await c.call("node_transition", { id: "C", para: "DOING", motivo: "preparar", ator: "maestro" });
  write(root, "07-execucao/C/pub.md", "x");
  await c.call("node_update", { id: "C", output: ["07-execucao/C/pub.md"], motivo: "pronto", ator: "maestro" });
  await c.call("node_transition", { id: "C", para: "VERIFY", motivo: "rascunho", ator: "maestro" });
  await c.call("evidence_add", { id: "C", caminho: "07-execucao/C/pub.md", criterio: "preparado", classe: "A_OBSERVADO", ator: "maestro" });
  const r = await c.call("node_transition", { id: "C", para: "DONE", motivo: "publicar", ator: "maestro", verificacao: "publicado" });
  assert.equal(r.data.codigo, "AUTORIZACAO");
  const n = (await c.call("node_get", { id: "C" })).data;
  assert.equal(n.status, "BLOCKED");
  assert.equal((n.motivo_bloqueio as { codigo: string }).codigo, "USER_ACTION_REQUIRED");
  assert.equal((await c.call("state_summary")).data.acao_do_usuario instanceof Array, true);
  await c.call("authorization_grant", { id: "C", escopo: "publicação de teste", fonte: "usuário: 'pode publicar'" });
  await c.call("node_transition", { id: "C", para: "VERIFY", motivo: "autorizado", ator: "maestro" });
  assert.equal((await c.call("node_transition", { id: "C", para: "DONE", motivo: "publicado", ator: "maestro", verificacao: "evidência de publicação" })).isError, false);
});

test("decisões: RESPONDIDA exige fonte; change control exige os 7 campos", async () => {
  assert.equal((await c.call("decision_record", { id: "D1", tipo: "decisao", titulo: "Fonte de verdade", status: "RESPONDIDA", resposta: "C", nota: "x x x" })).isError, true);
  assert.equal((await c.call("decision_record", { id: "D1", tipo: "decisao", titulo: "Fonte de verdade", status: "RESPONDIDA", resposta: "C", fonte: "usuário, 2026-09-28", nota: "respondida" })).isError, false);
  assert.equal((await c.call("decision_record", { id: "CC-001", tipo: "change-control", titulo: "Mudar C-01", status: "REGISTRADA", detalhes: { CURRENT: "a" }, nota: "x x x" })).isError, true);
  const list = await c.call("decision_list", { status: "RESPONDIDA" });
  assert.equal(list.data.total, 1);
});

test("state_validate aprova o ledger resultante; state_init não sobrescreve", async () => {
  const v = await c.call("state_validate");
  assert.equal(v.data.ok, true, JSON.stringify(v.data));
  assert.equal((await c.call("state_init", { projeto_id: "X1", projeto_nome: "Outro" })).isError, true);
});
