// Convenções de componentes (derivadas de plugin-dev + Agent Skills + verificações desta sessão).
import { basename, dirname, join } from "node:path";
import { parseFrontmatter, toolList, wordCount } from "./frontmatter.ts";
import { existsSync, readText } from "../util.ts";
import { FULL_TOOL_NAMES, PLUGIN_NAME } from "../../mcp/manifest.ts";
import type { Finding } from "../estado/validate.ts";

export type LintKind = "skill" | "agent" | "command";

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Campos que subagentes de plugin IGNORAM — guardrail colocado ali não vale (EV-010). */
const IGNORED_IN_PLUGIN_AGENTS = ["hooks", "mcpServers", "permissionMode"];

function checkToolRefs(tools: string[], where: string, f: Finding[]) {
  const prefix = `mcp__plugin_${PLUGIN_NAME}_`;
  for (const t of tools) {
    const base = t.replace(/\(.*\)$/, "");
    if (base.startsWith(prefix) && !base.endsWith("*") && !FULL_TOOL_NAMES.has(base)) {
      f.push({ level: "error", code: "UNKNOWN_MCP_TOOL", message: `${where}: ferramenta MCP inexistente ${base}`, ref: where });
    }
  }
}

function checkRelativeRefs(body: string, baseDir: string, pluginRoot: string | undefined, where: string, f: Finding[]) {
  const rel = body.match(/(?<![\w/$.])(?:references|scripts|examples|assets)\/[\w./-]+\.\w+/g) ?? [];
  for (const r of new Set(rel)) {
    if (!existsSync(join(baseDir, r))) f.push({ level: "error", code: "BROKEN_REF", message: `${where}: referência inexistente ${r}`, ref: where });
  }
  if (pluginRoot) {
    const abs = body.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/[\w./-]+/g) ?? [];
    for (const r of new Set(abs)) {
      const p = r.replace("${CLAUDE_PLUGIN_ROOT}/", "").replace(/[.,;:)]+$/, "");
      if (!existsSync(join(pluginRoot, p))) f.push({ level: "error", code: "BROKEN_REF", message: `${where}: ${r} não existe no plugin`, ref: where });
    }
  }
}

export function lintComponent(kind: LintKind, file: string, opts: { pluginRoot?: string; label?: string } = {}): Finding[] {
  const f: Finding[] = [];
  const where = opts.label ?? file;
  if (!existsSync(file)) return [{ level: "error", code: "MISSING", message: `${where}: arquivo não existe`, ref: where }];
  const { frontmatter: fm, body, error } = parseFrontmatter(readText(file));
  if (error) f.push({ level: "error", code: "FRONTMATTER", message: `${where}: ${error}`, ref: where });
  if (!fm) {
    f.push({ level: "error", code: "NO_FRONTMATTER", message: `${where}: sem frontmatter YAML`, ref: where });
    return f;
  }
  const desc = typeof fm.description === "string" ? fm.description : "";
  if (!desc.trim()) f.push({ level: "error", code: "NO_DESCRIPTION", message: `${where}: description obrigatória`, ref: where });

  if (kind === "skill") {
    const dirName = basename(dirname(file));
    if (basename(file) !== "SKILL.md") f.push({ level: "error", code: "SKILL_FILE", message: `${where}: o arquivo deve se chamar SKILL.md`, ref: where });
    if (fm.name === undefined) f.push({ level: "warning", code: "SKILL_NAME", message: `${where}: name ausente (padrão Agent Skills pede name = nome do diretório)`, ref: where });
    else if (fm.name !== dirName) f.push({ level: "error", code: "SKILL_NAME", message: `${where}: name '${String(fm.name)}' ≠ diretório '${dirName}'`, ref: where });
    if (!KEBAB.test(dirName) || dirName.length > 64) f.push({ level: "error", code: "SKILL_NAME_FORMAT", message: `${where}: nome deve ser kebab-case ≤ 64`, ref: where });
    if (desc.length > 1024) f.push({ level: "error", code: "DESC_TOO_LONG", message: `${where}: description > 1024 caracteres (${desc.length})`, ref: where });
    if (desc && desc.length < 40) f.push({ level: "warning", code: "DESC_SHORT", message: `${where}: description curta demais para disparar com precisão`, ref: where });
    const lines = body.split("\n").length;
    if (lines > 500) f.push({ level: "warning", code: "SKILL_LONG", message: `${where}: SKILL.md com ${lines} linhas — mova detalhe para references/ (progressive disclosure)`, ref: where });
    checkToolRefs(toolList(fm["allowed-tools"]), where, f);
    checkRelativeRefs(body, dirname(file), opts.pluginRoot, where, f);
  }

  if (kind === "agent") {
    const fileName = basename(file, ".md");
    const name = typeof fm.name === "string" ? fm.name : "";
    if (!name) f.push({ level: "error", code: "AGENT_NAME", message: `${where}: name obrigatório`, ref: where });
    else {
      if (name !== fileName) f.push({ level: "error", code: "AGENT_NAME", message: `${where}: name '${name}' ≠ arquivo '${fileName}'`, ref: where });
      if (!KEBAB.test(name) || name.length < 3 || name.length > 50) f.push({ level: "error", code: "AGENT_NAME_FORMAT", message: `${where}: name kebab-case 3–50`, ref: where });
    }
    if (!/<example>/.test(desc)) f.push({ level: "warning", code: "AGENT_EXAMPLES", message: `${where}: description sem blocos <example> (padrão plugin-dev)`, ref: where });
    if (!fm.model) f.push({ level: "warning", code: "AGENT_MODEL", message: `${where}: model ausente (use inherit se não houver motivo)`, ref: where });
    for (const k of IGNORED_IN_PLUGIN_AGENTS) {
      if (k in fm) {
        f.push({
          level: "error",
          code: "IGNORED_IN_PLUGIN",
          message: `${where}: '${k}' é ignorado em subagente de plugin — guardrail no lugar errado (EV-010); use hooks/hooks.json`,
          ref: where,
        });
      }
    }
    if (wordCount(body) < 60) f.push({ level: "warning", code: "AGENT_PROMPT_SHORT", message: `${where}: system prompt muito curto`, ref: where });
    checkToolRefs([...toolList(fm.tools), ...toolList(fm.disallowedTools)], where, f);
    checkRelativeRefs(body, dirname(file), opts.pluginRoot, where, f);
  }

  if (kind === "command") {
    checkToolRefs(toolList(fm["allowed-tools"]), where, f);
    checkRelativeRefs(body, dirname(file), opts.pluginRoot, where, f);
  }
  return f;
}
