import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { makeWorkspace, node, runHook, tmpDir, write } from "../helpers.ts";

const W = (root: string, file: string, extra: Record<string, unknown> = {}) => ({ cwd: root, hook_event_name: "PreToolUse", tool_name: "Write", tool_input: { file_path: join(root, file), content: "x" }, ...extra });

test("guard-write: upstream, received, ledger e projeções bloqueados (exit 2)", () => {
  const root = makeWorkspace();
  for (const f of ["vendor/upstream/claude-plugins-official/x.md", "ingestion/received/ING-0001/a.md", "07-execucao/estado.json", "07-execucao/ESTADO.md", "catalog/CATALOG.md", "mapa/roteamento.md"]) {
    const r = runHook("guard-write", W(root, f));
    assert.equal(r.code, 2, f);
    assert.match(r.stderr, /\[maestro\]/);
  }
  assert.equal(runHook("guard-write", W(root, "docs/nota.md")).code, 0);
});

test("EV-010: o mesmo bloqueio vale para chamadas vindas de subagente de plugin", () => {
  const root = makeWorkspace();
  const r = runHook("guard-write", W(root, "vendor/upstream/x.md", { agent_id: "a1", agent_type: "maestro:evidence-researcher" }));
  assert.equal(r.code, 2);
  assert.match(r.stderr, /subagente maestro:evidence-researcher/);
});

test("guard-write: contratos pedem confirmação (ask)", () => {
  const root = makeWorkspace();
  const r = runHook("guard-write", W(root, "contratos/C-00-invariantes-comuns.md"));
  assert.equal(r.code, 0);
  assert.equal(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision, "ask");
});

test("C-04: escopo de escrita do nó ativo é imposto", () => {
  const root = makeWorkspace([node({ id: "A", status: "DOING", escopo_escrita: ["skills/nova/**"] })]);
  assert.equal(runHook("guard-write", W(root, "skills/nova/SKILL.md")).code, 0);
  assert.equal(runHook("guard-write", W(root, "07-execucao/A/notas.md")).code, 0, "07-execucao sempre permitido");
  const fora = runHook("guard-write", W(root, "agents/outro.md"));
  assert.equal(fora.code, 2);
  assert.match(fora.stderr, /fora do escopo de escrita do nó ativo A/);
});

test("hooks não interferem fora de um workspace do Maestro", () => {
  const plain = tmpDir();
  assert.equal(runHook("guard-write", W(plain, "vendor/upstream/x.md")).code, 0);
  assert.equal(runHook("guard-external", { cwd: plain, tool_name: "Bash", tool_input: { command: "git push" } }).stdout, "");
  assert.equal(runHook("session-context", { cwd: plain }).stdout, "");
});

test("EV-003/I-05: guard-external pede aprovação para efeito externo, salvo autorização no nó ativo", () => {
  const root = makeWorkspace();
  const push = runHook("guard-external", { cwd: root, tool_name: "Bash", tool_input: { command: "git push -u origin main" } });
  assert.equal(JSON.parse(push.stdout).hookSpecificOutput.permissionDecision, "ask");
  assert.equal(runHook("guard-external", { cwd: root, tool_name: "Bash", tool_input: { command: "git status" } }).stdout, "");
  const mcp = runHook("guard-external", { cwd: root, tool_name: "mcp__Notion__notion-create-pages", tool_input: {} });
  assert.equal(JSON.parse(mcp.stdout).hookSpecificOutput.permissionDecision, "ask");
  assert.equal(runHook("guard-external", { cwd: root, tool_name: "Bash", tool_input: { command: "git push" } }, { MAESTRO_EXTERNAL_GUARD: "off" }).stdout, "");

  const auth = makeWorkspace([node({ id: "P", status: "DOING", efeito_externo: true, autorizacao: { escopo: "push da branch", concedida_em: "2026-09-28", fonte: "usuário: 'pode'" } })]);
  assert.equal(runHook("guard-external", { cwd: auth, tool_name: "Bash", tool_input: { command: "git push" } }).stdout, "");
  const grant = runHook("guard-external", { cwd: auth, tool_name: "mcp__plugin_maestro_estado__authorization_grant", tool_input: {} });
  assert.equal(JSON.parse(grant.stdout).hookSpecificOutput.permissionDecision, "ask", "autorização sempre passa pelo humano");
});

test("validate-on-write: registro de catálogo inválido e agent com guardrail no frontmatter são barrados", () => {
  const root = makeWorkspace();
  write(root, "catalog/components/skill/x.json", JSON.stringify({ id: "skill:x", name: "x" }));
  const bad = runHook("validate-on-write", { cwd: root, tool_name: "Write", tool_input: { file_path: join(root, "catalog/components/skill/x.json") } });
  assert.equal(bad.code, 2);
  assert.match(bad.stderr, /viola o contrato/);
  write(root, "agents/lane.md", "---\nname: lane\ndescription: d <example>x</example>\nmodel: inherit\nhooks: {}\n---\n" + "p ".repeat(80));
  assert.equal(runHook("validate-on-write", { cwd: root, tool_name: "Write", tool_input: { file_path: join(root, "agents/lane.md") } }).code, 2);
  write(root, "docs/livre.md", "qualquer coisa");
  assert.equal(runHook("validate-on-write", { cwd: root, tool_name: "Write", tool_input: { file_path: join(root, "docs/livre.md") } }).code, 0);
});

test("EV-014: session-context injeta WIP, próximo elegível e comandos", () => {
  const root = makeWorkspace();
  const r = runHook("session-context", { cwd: root, hook_event_name: "SessionStart", source: "startup" });
  const ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext as string;
  assert.match(ctx, /Próximo elegível: A/);
  assert.match(ctx, /\/maestro:executar/);
});
