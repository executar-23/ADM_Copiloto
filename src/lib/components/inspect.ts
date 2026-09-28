// ANALYZE/CLASSIFY: inspeciona material recebido e classifica cada componente encontrado.
import { basename, dirname, extname, join, relative } from "node:path";
import { readdirSync } from "node:fs";
import { parseFrontmatter, toolList, wordCount } from "./frontmatter.ts";
import { lintComponent, type LintKind } from "./lint.ts";
import { existsSync, isDir, isFile, readJson, readText, sha256, toPosix, treeHash, walkFiles } from "../util.ts";
import type { Finding } from "../estado/validate.ts";

export type DetectedType =
  | "skill"
  | "agent"
  | "command"
  | "hook-config"
  | "mcp-config"
  | "plugin-manifest"
  | "marketplace-manifest"
  | "archive"
  | "document"
  | "unknown";

export interface InspectedComponent {
  path: string;
  detected_type: DetectedType;
  confidence: "alta" | "media" | "baixa";
  name: string | null;
  description: string | null;
  tools: string[];
  frontmatter_keys: string[];
  words: number;
  sha256: string;
  referenced_files: string[];
  findings: Finding[];
  mcp_servers?: string[];
  hook_events?: string[];
}

function classifyMarkdown(file: string, fm: Record<string, unknown> | null): { type: DetectedType; confidence: InspectedComponent["confidence"] } {
  const parent = basename(dirname(file));
  if (basename(file) === "SKILL.md") return { type: "skill", confidence: "alta" };
  if (!fm) return { type: "document", confidence: "media" };
  if (parent === "agents") return { type: "agent", confidence: "alta" };
  if (parent === "commands") return { type: "command", confidence: "alta" };
  const desc = typeof fm.description === "string" ? fm.description : "";
  if ("allowed-tools" in fm || "argument-hint" in fm) return { type: "command", confidence: "media" };
  if ("tools" in fm || "model" in fm || "color" in fm || /<example>/.test(desc)) return { type: "agent", confidence: "media" };
  if ("name" in fm && "description" in fm) return { type: "skill", confidence: "baixa" };
  return { type: "document", confidence: "baixa" };
}

function inspectFile(file: string, base: string): InspectedComponent {
  const rel = toPosix(relative(base, file)) || basename(file);
  const ext = extname(file).toLowerCase();
  const raw = readText(file);
  const common = { path: rel, sha256: sha256(raw), words: 0, tools: [] as string[], frontmatter_keys: [] as string[], referenced_files: [] as string[], findings: [] as Finding[] };
  if ([".zip", ".skill", ".plugin", ".tgz"].includes(ext)) {
    return { ...common, detected_type: "archive", confidence: "alta", name: basename(file, ext), description: null, findings: [{ level: "warning", code: "ARCHIVE", message: `${rel}: arquivo compactado — extraia (ingestion_start faz isso) antes de analisar`, ref: rel }] };
  }
  const name = basename(file);
  if (name === "hooks.json" || name === ".mcp.json" || name === "plugin.json" || name === "marketplace.json") {
    let json: Record<string, unknown> = {};
    const findings: Finding[] = [];
    try {
      json = JSON.parse(raw) as Record<string, unknown>;
    } catch (e) {
      findings.push({ level: "error", code: "JSON", message: `${rel}: JSON inválido (${(e as Error).message})`, ref: rel });
    }
    if (name === "hooks.json") {
      const hooks = (json.hooks ?? json) as Record<string, unknown>;
      if (!json.hooks) findings.push({ level: "warning", code: "HOOKS_FORMAT", message: `${rel}: plugin usa o formato wrapper {"hooks":{...}}`, ref: rel });
      return { ...common, detected_type: "hook-config", confidence: "alta", name: null, description: typeof json.description === "string" ? json.description : null, hook_events: Object.keys(hooks), findings };
    }
    if (name === ".mcp.json") {
      const servers = Object.keys((json.mcpServers ?? {}) as object);
      return { ...common, detected_type: "mcp-config", confidence: "alta", name: null, description: null, mcp_servers: servers, findings };
    }
    return {
      ...common,
      detected_type: name === "plugin.json" ? "plugin-manifest" : "marketplace-manifest",
      confidence: "alta",
      name: typeof json.name === "string" ? json.name : null,
      description: typeof json.description === "string" ? json.description : null,
      findings,
    };
  }
  if (ext !== ".md") return { ...common, detected_type: "unknown", confidence: "baixa", name: null, description: null };
  const { frontmatter: fm, body } = parseFrontmatter(raw);
  const { type, confidence } = classifyMarkdown(file, fm);
  const refs = [...new Set(body.match(/(?:references|scripts|examples|assets)\/[\w./-]+\.\w+/g) ?? [])];
  let findings: Finding[] = [];
  if (type === "skill" || type === "agent" || type === "command") {
    findings = lintComponent(type as LintKind, file, { label: rel });
  }
  const nm = typeof fm?.name === "string" ? fm.name : type === "skill" ? basename(dirname(file)) : basename(file, ".md");
  return {
    ...common,
    detected_type: type,
    confidence,
    name: nm,
    description: typeof fm?.description === "string" ? fm.description : null,
    tools: [...toolList(fm?.tools), ...toolList(fm?.["allowed-tools"])],
    frontmatter_keys: Object.keys(fm ?? {}),
    words: wordCount(body),
    referenced_files: refs,
    findings,
  };
}

/**
 * Inspeciona um arquivo ou diretório. Em diretório, classifica cada componente:
 * SKILL.md vira uma skill (o diretório inteiro é a unidade); .md soltos com frontmatter
 * viram agent/command; manifests e configs são reportados.
 */
export function inspectPath(target: string): { root: string; tree_sha256?: string; files: number; components: InspectedComponent[]; skipped: string[] } {
  if (!existsSync(target)) throw new Error(`caminho não existe: ${target}`);
  if (isFile(target)) {
    return { root: target, files: 1, components: [inspectFile(target, dirname(target))], skipped: [] };
  }
  const files = walkFiles(target);
  const skillDirs = new Set(files.filter((f) => basename(f) === "SKILL.md").map((f) => dirname(f)));
  const components: InspectedComponent[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    const insideSkill = [...skillDirs].some((d) => f !== join(d, "SKILL.md") && f.startsWith(`${d}/`));
    const rel = toPosix(relative(target, f));
    if (insideSkill) {
      skipped.push(rel);
      continue;
    }
    const b = basename(f);
    const ext = extname(f).toLowerCase();
    if (b === "SKILL.md" || [".zip", ".skill", ".plugin"].includes(ext) || ["hooks.json", ".mcp.json", "plugin.json", "marketplace.json"].includes(b)) {
      components.push(inspectFile(f, target));
    } else if (ext === ".md") {
      const c = inspectFile(f, target);
      if (c.detected_type === "document" && /^(readme|license|changelog)/i.test(b)) skipped.push(rel);
      else components.push(c);
    } else skipped.push(rel);
  }
  const th = treeHash(target);
  return { root: target, tree_sha256: th.hash, files: th.files, components, skipped };
}

export function listDirNames(dir: string): string[] {
  return isDir(dir) ? readdirSync(dir).sort() : [];
}

export { readJson };
