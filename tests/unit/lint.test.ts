import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { lintComponent } from "../../src/lib/components/lint.ts";
import { discoverPluginComponents } from "../../src/lib/components/discover.ts";
import { REPO, tmpDir, write } from "../helpers.ts";

const errs = (f: { level: string; code: string }[]) => f.filter((x) => x.level === "error").map((x) => x.code);

test("EV-010: hooks/mcpServers/permissionMode em agent de plugin são recusados", () => {
  const root = tmpDir();
  const p = write(root, "agents/lane-x.md", "---\nname: lane-x\ndescription: faz x <example>a</example>\nmodel: inherit\nhooks:\n  PreToolUse: []\npermissionMode: acceptEdits\n---\n" + "palavra ".repeat(80));
  const c = errs(lintComponent("agent", p));
  assert.equal(c.filter((x) => x === "IGNORED_IN_PLUGIN").length, 2);
});

test("allowlist Agent(...) exige nomes com prefixo do plugin e agents existentes (achado do E0)", () => {
  const root = tmpDir();
  write(root, "agents/folha.md", "---\nname: folha\ndescription: d\n---\nx\n");
  const p = write(root, "agents/chefe.md", "---\nname: chefe\ndescription: d <example>x</example>\nmodel: inherit\ntools: Agent(folha, maestro:folha, maestro:fantasma), Read\n---\n" + "palavra ".repeat(80));
  const c = errs(lintComponent("agent", p, { pluginRoot: root }));
  assert.equal(c.filter((x) => x === "AGENT_ALLOWLIST").length, 2);
});

test("skill: nome ≠ diretório, descrição longa e referência quebrada", () => {
  const root = tmpDir();
  const p = write(root, "skills/minha-skill/SKILL.md", `---\nname: outra\ndescription: ${"x".repeat(1100)}\n---\nVeja references/nao-existe.md\n`);
  const c = errs(lintComponent("skill", p));
  for (const k of ["SKILL_NAME", "DESC_TOO_LONG", "BROKEN_REF"]) assert.ok(c.includes(k), k);
});

test("ferramenta MCP do maestro inexistente é acusada", () => {
  const root = tmpDir();
  const p = write(root, "commands/x.md", "---\ndescription: \"teste\"\nallowed-tools: mcp__plugin_maestro_estado__nao_existe, Read\n---\ncorpo\n");
  assert.deepEqual(errs(lintComponent("command", p)), ["UNKNOWN_MCP_TOOL"]);
});

test("README em agents/ ou commands/ é carregado como componente — descoberta acusa", () => {
  const root = tmpDir();
  write(root, "agents/README.md", "# docs\n");
  write(root, "commands/notas.txt", "x");
  const { findings } = discoverPluginComponents(root);
  const c = findings.map((f) => f.code).sort();
  assert.deepEqual(c, ["README_LOADED_AS_COMPONENT", "STRAY_IN_COMPONENT_DIR"]);
});

test("componentes reais do plugin passam no lint sem erros", () => {
  const { components, findings } = discoverPluginComponents(REPO);
  assert.deepEqual(findings, []);
  const lintable = components.filter((c) => c.type === "agent" || c.type === "skill" || c.type === "command");
  assert.equal(lintable.length, 16);
  for (const c of lintable) {
    const f = lintComponent(c.type as "agent" | "skill" | "command", join(REPO, c.path), { pluginRoot: REPO, label: c.path });
    assert.deepEqual(errs(f), [], `${c.path}: ${JSON.stringify(f)}`);
  }
});
