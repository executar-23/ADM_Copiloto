// Descobre os componentes que o plugin realmente carrega (espelha a auto-descoberta do Claude Code).
import { basename, join, relative } from "node:path";
import { readdirSync } from "node:fs";
import { PATHS } from "../workspace.ts";
import { existsSync, isDir, readJson, toPosix } from "../util.ts";
import { TOOLS } from "../../mcp/manifest.ts";
import type { Finding } from "../estado/validate.ts";

export interface DiskComponent {
  id: string;
  type: "agent" | "skill" | "command" | "hook" | "mcp-server" | "mcp-tool";
  name: string;
  path: string;
}

export function discoverPluginComponents(root: string): { components: DiskComponent[]; findings: Finding[] } {
  const out: DiskComponent[] = [];
  const findings: Finding[] = [];
  const rel = (p: string) => toPosix(relative(root, p));

  for (const [dir, type] of [
    ["agents", "agent"],
    ["commands", "command"],
  ] as const) {
    const d = join(root, dir);
    if (!isDir(d)) continue;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === ".gitkeep") continue;
      const p = join(d, e.name);
      if (!e.isFile() || !e.name.endsWith(".md")) {
        findings.push({ level: "error", code: "STRAY_IN_COMPONENT_DIR", message: `${rel(p)}: só componentes .md são permitidos em ${dir}/`, ref: rel(p) });
        continue;
      }
      if (/^readme\.md$/i.test(e.name)) {
        findings.push({
          level: "error",
          code: "README_LOADED_AS_COMPONENT",
          message: `${rel(p)}: README em ${dir}/ é carregado como ${type} pelo Claude Code (verificado) — mova para docs/`,
          ref: rel(p),
        });
      }
      const name = basename(e.name, ".md");
      out.push({ id: `${type}:${name}`, type, name, path: rel(p) });
    }
  }
  const skillsDir = join(root, "skills");
  if (isDir(skillsDir)) {
    for (const e of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const p = join(skillsDir, e.name, "SKILL.md");
      if (existsSync(p)) out.push({ id: `skill:${e.name}`, type: "skill", name: e.name, path: rel(p) });
      else findings.push({ level: "error", code: "SKILL_WITHOUT_SKILL_MD", message: `skills/${e.name}/ sem SKILL.md`, ref: `skills/${e.name}` });
    }
  }
  const hooksFile = join(root, PATHS.hooksJson);
  if (existsSync(hooksFile)) {
    const cfg = readJson<{ hooks?: Record<string, Array<{ hooks?: Array<{ command?: string }> }>> }>(hooksFile);
    const names = new Set<string>();
    for (const groups of Object.values(cfg.hooks ?? {})) {
      for (const g of groups) {
        for (const h of g.hooks ?? []) {
          const m = /dist\/hooks\/([\w-]+)\.js/.exec(h.command ?? "");
          if (m) names.add(m[1]!);
        }
      }
    }
    for (const n of names) out.push({ id: `hook:${n}`, type: "hook", name: n, path: `src/hooks/${n}.ts` });
  }
  const mcpFile = join(root, PATHS.mcpJson);
  if (existsSync(mcpFile)) {
    const cfg = readJson<{ mcpServers?: Record<string, unknown> }>(mcpFile);
    const servers = Object.keys(cfg.mcpServers ?? {});
    for (const s of servers) out.push({ id: `mcp-server:${s}`, type: "mcp-server", name: s, path: `src/mcp/${s}.ts` });
    for (const t of TOOLS) {
      if (servers.includes(t.server)) {
        out.push({ id: `mcp-tool:${t.server}.${t.name}`, type: "mcp-tool", name: `${t.server}.${t.name}`, path: `src/mcp/${t.server}.ts` });
      }
    }
  }
  return { components: out, findings };
}
