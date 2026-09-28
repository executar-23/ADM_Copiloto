// Consistência do repositório real: o que está no disco, no catálogo, no ledger e nos manifestos concorda.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validateWorkspace } from "../../src/lib/validate.ts";
import { loadCatalog } from "../../src/lib/catalog/store.ts";
import { loadEstado } from "../../src/lib/estado/store.ts";
import { TOOLS } from "../../src/mcp/manifest.ts";
import { REPO } from "../helpers.ts";

const json = <T = Record<string, unknown>>(rel: string) => JSON.parse(readFileSync(join(REPO, rel), "utf8")) as T;

test("maestro validate: workspace do plugin sem erros", () => {
  const rep = validateWorkspace(REPO);
  assert.equal(rep.is_plugin_root, true);
  assert.deepEqual(rep.errors, []);
});

test("manifesto MCP ↔ catálogo: cada ferramenta tem registro e vice-versa", () => {
  const catalogTools = loadCatalog(REPO).entries.filter((e) => e.record.type === "mcp-tool").map((e) => e.record.name).sort();
  assert.deepEqual(catalogTools, TOOLS.map((t) => `${t.server}.${t.name}`).sort());
});

test(".mcp.json e hooks.json apontam para bundles existentes via ${CLAUDE_PLUGIN_ROOT}", () => {
  const mcp = json<{ mcpServers: Record<string, { args: string[] }> }>(".mcp.json");
  for (const [name, s] of Object.entries(mcp.mcpServers)) {
    const arg = s.args[0]!;
    assert.ok(arg.startsWith("${CLAUDE_PLUGIN_ROOT}/"), name);
    assert.ok(existsSync(join(REPO, arg.replace("${CLAUDE_PLUGIN_ROOT}/", ""))), arg);
  }
  const hooks = readFileSync(join(REPO, "hooks/hooks.json"), "utf8");
  for (const m of hooks.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/(dist\/hooks\/[\w-]+\.js)/g)) assert.ok(existsSync(join(REPO, m[1]!)), m[1]);
  // raiz do plugin = raiz do projeto: cópias de projeto do .mcp.json precisam estar desativadas
  const settings = json<{ disabledMcpjsonServers?: string[] }>(".claude/settings.json");
  assert.deepEqual([...(settings.disabledMcpjsonServers ?? [])].sort(), Object.keys(mcp.mcpServers).sort());
});

test("versões consistentes entre package.json, plugin.json e marketplace.json", () => {
  const v = json<{ version: string }>("package.json").version;
  assert.equal(json<{ version: string }>(".claude-plugin/plugin.json").version, v);
  assert.equal(json<{ plugins: Array<{ version: string }> }>(".claude-plugin/marketplace.json").plugins[0]!.version, v);
});

test("ledger seed fiel ao pacote: E0–E9, F0–F8, FICHA com 22 pontos sem títulos inventados", () => {
  const e = loadEstado(REPO);
  const ids = new Set(e.nos.map((n) => n.id));
  for (let i = 0; i <= 9; i++) assert.ok(ids.has(`E${i}`));
  for (let i = 0; i <= 8; i++) assert.ok(ids.has(`F${i}`));
  const ficha = e.nos.find((n) => n.id === "FICHA")!;
  const pontos = ficha.dados!.pontos as Array<{ ponto: string; status: string; resumo: string }>;
  assert.equal(pontos.length, 22);
  const count = (s: string) => pontos.filter((p) => p.status === s).length;
  assert.deepEqual([count("PREENCHIDO"), count("PARCIAL"), count("REMETE"), count("TBD")], [6, 4, 1, 11]);
  assert.ok(pontos.filter((p) => p.status === "TBD").every((p) => p.resumo === "TBD"), "pontos TBD não recebem conteúdo inventado");
});

test("EV-006: divergência Process Doc × SOP-KP-001 está registrada, não escolhida", () => {
  const e = loadEstado(REPO);
  const div = e.decisoes.find((d) => d.id === "DIV-001")!;
  assert.equal(div.tipo, "divergencia");
  const d2 = e.decisoes.find((d) => d.id === "D2")!;
  assert.equal(d2.status, "ABERTA");
});

test("decisões respondidas têm fonte do usuário; change controls têm os 7 campos", () => {
  const e = loadEstado(REPO);
  for (const d of e.decisoes.filter((x) => x.status === "RESPONDIDA" || x.status === "PARCIAL")) assert.match(d.fonte ?? "", /usuário/, d.id);
  for (const d of e.decisoes.filter((x) => x.tipo === "change-control")) {
    assert.deepEqual(Object.keys(d.detalhes ?? {}).sort(), ["CONFLICT", "CURRENT", "EVIDENCE", "IMPACT", "PROPOSED_CHANGE", "REVIEW_REQUIRED", "STATUS"]);
  }
});

test("contratos C-00…C-04 presentes, versionados e com procedência", () => {
  for (const c of ["C-00-invariantes-comuns", "C-01-estado-unificado", "C-02-agent-spec", "C-03-eval-suite", "C-04-handoff-entre-agentes"]) {
    const t = readFileSync(join(REPO, "contratos", `${c}.md`), "utf8");
    assert.match(t, /Versão \*\*1\.0\.0\*\*/, c);
    assert.match(t, /ING-0002/, c);
  }
});

test("originais recebidos batem com o MANIFEST.sha256 (imutabilidade)", async () => {
  const { createHash } = await import("node:crypto");
  const dir = join(REPO, "ingestion/received/ING-0002");
  const lines = readFileSync(join(dir, "MANIFEST.sha256"), "utf8").trim().split("\n");
  assert.ok(lines.length >= 30);
  for (const l of lines) {
    const [hash, ...rest] = l.split("  ");
    const f = rest.join("  ");
    assert.equal(createHash("sha256").update(readFileSync(join(dir, f))).digest("hex"), hash, f);
  }
});
