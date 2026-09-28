import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TOOLS } from "../../src/mcp/manifest.ts";
import { REPO, mcpClient, skillRecord, tmpDir, write } from "../helpers.ts";

let root: string;
let c: Awaited<ReturnType<typeof mcpClient>>;

before(async () => {
  root = tmpDir();
  mkdirSync(join(root, "catalog/components"), { recursive: true });
  cpSync(join(REPO, "ingestion/TEMPLATE.md"), join(root, "ingestion/TEMPLATE.md"));
  cpSync(join(REPO, "mapa/roteamento.json"), join(root, "mapa/roteamento.json"));
  write(root, "ingestion/inbox/lote/skills/code-review/SKILL.md", "---\nname: code-review\ndescription: Revisa código com checklist de segurança e desempenho quando o usuário pedir review.\n---\nCorpo.\n");
  write(root, "ingestion/inbox/lote/agents/lane-devops.md", "---\nname: lane-devops\ndescription: faz deploy\nmodel: inherit\npermissionMode: bypassPermissions\n---\n" + "texto ".repeat(70));
  c = await mcpClient("registry", { MAESTRO_WORKSPACE: root });
});
after(async () => c.close());

test("expõe exatamente as ferramentas do manifesto", async () => {
  const { tools } = await c.client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), TOOLS.filter((t) => t.server === "registry").map((t) => t.name).sort());
});

test("RECEIVE → ANALYZE/CLASSIFY: ingestion_start + component_inspect classificam o lote", async () => {
  const s = await c.call("ingestion_start", { titulo: "Lote teste", origem: "teste de integração", caminhos: ["ingestion/inbox/lote"] });
  assert.equal(s.isError, false, s.text);
  assert.equal(s.data.id, "ING-0001");
  assert.ok(existsSync(join(root, "ingestion/received/ING-0001/MANIFEST.sha256")));
  const i = await c.call("component_inspect", { path: "ingestion/received/ING-0001" });
  assert.deepEqual(i.data.por_tipo, { agent: 1, skill: 1 });
  const agent = (i.data.components as Array<{ detected_type: string; findings: Array<{ code: string }> }>).find((x) => x.detected_type === "agent")!;
  assert.ok(agent.findings.some((f) => f.code === "IGNORED_IN_PLUGIN"), "permissionMode em agent de plugin deve ser acusado (EV-010)");
  const list = await c.call("ingestion_list");
  assert.equal(list.data.total, 1);
});

test("EV-013: catalog_register recusa componente próprio sem anti-overkill e aceita completo", async () => {
  const semAo = await c.call("catalog_register", { record: skillRecord({ anti_overkill: undefined }) });
  assert.equal(semAo.isError, true);
  assert.match(semAo.text, /anti_overkill/);
  const okr = await c.call("catalog_register", { record: skillRecord() });
  assert.equal(okr.isError, false, okr.text);
  assert.ok(existsSync(join(root, "catalog/components/skill/exemplo.json")));
  assert.match(readFileSync(join(root, "catalog/CATALOG.md"), "utf8"), /`exemplo`/);
  assert.equal((await c.call("catalog_register", { record: skillRecord() })).isError, true, "duplicata sem replace");
  assert.equal((await c.call("catalog_get", { id: "skill:exemplo" })).data.status, "experimental");
  assert.equal((await c.call("catalog_search", { query: "coisa útil" })).data.total, 1);
});

test("CHECK_CONFLICTS e roteamento", async () => {
  const cc = await c.call("conflict_check", { candidates: [{ type: "command", name: "exemplo" }, { type: "skill", name: "nova" }] });
  assert.deepEqual(cc.data.resumo, { conflito: 1, revisar: 0, "sem-conflito": 1 });
  const r = await c.call("routing_lookup", { query: "runbook" });
  assert.equal((r.data.entregas as Array<{ lane: string }>)[0]!.lane, "devops");
});

test("skill_fingerprint detecta drift entre cópias (EV-008)", async () => {
  write(root, "copias/a/qf/SKILL.md", "---\nname: qf\ndescription: x\n---\nA\n");
  write(root, "copias/b/qf/SKILL.md", "---\nname: qf\ndescription: x\n---\nB\n");
  const f = await c.call("skill_fingerprint", { paths: ["copias/a/qf", "copias/b/qf"] });
  assert.equal(f.data.drift, true);
});

test("upstream_search: sem vendor informa como inicializar", async () => {
  const u = await c.call("upstream_search", { query: "plugin structure" });
  assert.equal(u.isError, true);
  assert.equal(u.data.codigo, "UPSTREAM_NOT_INITIALIZED");
});

test("upstream_search no repositório real encontra padrões oficiais (se o submodule estiver inicializado)", async (t) => {
  if (!existsSync(join(REPO, "vendor/upstream/claude-plugins-official/plugins"))) return t.skip("vendor/upstream não inicializado");
  const real = await mcpClient("registry", { MAESTRO_WORKSPACE: REPO });
  try {
    const u = await real.call("upstream_search", { query: "plugin structure manifest", type: "skill" });
    assert.equal(u.isError, false, u.text);
    const hits = u.data.resultados as Array<{ name: string; sha: string }>;
    assert.ok(hits.some((h) => h.name === "plugin-structure"));
    assert.match(hits[0]!.sha, /^[0-9a-f]{40}$/);
  } finally {
    await real.close();
  }
});

test("workspace_validate roda e reporta", async () => {
  const v = await c.call("workspace_validate");
  assert.equal(typeof v.data.ok, "boolean");
});
