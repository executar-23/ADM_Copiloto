// Catálogo em disco: catalog/components/<tipo>/<nome>.json + CATALOG.md gerado.
import { join, relative } from "node:path";
import { COMPONENT_TYPES, ComponentSchema, type Component } from "./schema.ts";
import { PATHS } from "../workspace.ts";
import { existsSync, readJson, readText, toPosix, walkFiles, writeJsonAtomic, writeTextAtomic } from "../util.ts";
import type { Finding } from "../estado/validate.ts";

export interface CatalogEntry {
  file: string;
  record: Component;
}

export interface LoadedCatalog {
  entries: CatalogEntry[];
  findings: Finding[];
}

export function componentFile(root: string, type: string, name: string): string {
  return join(root, PATHS.catalogDir, type, `${name}.json`);
}

export function loadCatalog(root: string): LoadedCatalog {
  const dir = join(root, PATHS.catalogDir);
  const entries: CatalogEntry[] = [];
  const findings: Finding[] = [];
  if (!existsSync(dir)) return { entries, findings };
  const seen = new Map<string, string>();
  for (const file of walkFiles(dir)) {
    const rel = toPosix(relative(root, file));
    if (!file.endsWith(".json")) {
      findings.push({ level: "warning", code: "CATALOG_STRAY", message: `arquivo não-JSON no catálogo: ${rel}`, ref: rel });
      continue;
    }
    let raw: unknown;
    try {
      raw = readJson(file);
    } catch (e) {
      findings.push({ level: "error", code: "CATALOG_JSON", message: `${rel}: JSON inválido (${(e as Error).message})`, ref: rel });
      continue;
    }
    const parsed = ComponentSchema.safeParse(raw);
    if (!parsed.success) {
      for (const i of parsed.error.issues) {
        findings.push({ level: "error", code: "CATALOG_SCHEMA", message: `${rel}: ${i.path.join(".") || "(raiz)"}: ${i.message}`, ref: rel });
      }
      continue;
    }
    const r = parsed.data;
    const expected = toPosix(relative(root, componentFile(root, r.type, r.name)));
    if (expected !== rel) {
      findings.push({ level: "error", code: "CATALOG_LOCATION", message: `${rel}: deveria estar em ${expected}`, ref: rel });
    }
    if (seen.has(r.id)) findings.push({ level: "error", code: "CATALOG_DUP", message: `id duplicado ${r.id} (${seen.get(r.id)} e ${rel})`, ref: rel });
    seen.set(r.id, rel);
    entries.push({ file: rel, record: r });
  }
  // Referências cruzadas devem apontar para ids existentes.
  const ids = new Set(entries.map((e) => e.record.id));
  for (const { record: r, file } of entries) {
    const refs = [
      ...r.related.skills.map((x) => `skill:${x}`),
      ...r.related.agents.map((x) => `agent:${x}`),
      ...r.related.commands.map((x) => `command:${x}`),
      ...(r.parent ? [r.parent] : []),
      ...r.dependencies.filter((d) => /^[a-z-]+:/.test(d) && COMPONENT_TYPES.some((t) => d.startsWith(`${t}:`))),
    ];
    for (const ref of refs) {
      if (!ids.has(ref)) findings.push({ level: "error", code: "CATALOG_REF", message: `${file}: referência a componente inexistente ${ref}`, ref: file });
    }
  }
  entries.sort((a, b) => a.record.id.localeCompare(b.record.id));
  return { entries, findings };
}

export function saveComponent(root: string, record: Component): string {
  const parsed = ComponentSchema.parse(record);
  const file = componentFile(root, parsed.type, parsed.name);
  writeJsonAtomic(file, parsed);
  return toPosix(relative(root, file));
}

const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function renderCatalogMd(entries: CatalogEntry[]): string {
  const out: string[] = [
    "# Catálogo de componentes do Maestro",
    "",
    "> **Gerado de `catalog/components/**/*.json` — não editar à mão.** Fonte de verdade para expansão.",
    "> Registrar/atualizar: ferramenta MCP `catalog_register` (servidor `registry`) ou editar o JSON e rodar `npm run render`.",
    "",
  ];
  const counts = COMPONENT_TYPES.map((t) => `${t}: ${entries.filter((e) => e.record.type === t).length}`).join(" · ");
  out.push(`**Total:** ${entries.length} · ${counts}`, "");
  for (const type of COMPONENT_TYPES) {
    const list = entries.filter((e) => e.record.type === type);
    if (!list.length) continue;
    out.push(`## ${type}`, "", "| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |", "|---|---|---|---|---|---|---|---|");
    for (const { record: r } of list) {
      const rel = [
        ...r.related.agents.map((x) => `agent:${x}`),
        ...r.related.skills.map((x) => `skill:${x}`),
        ...r.related.commands.map((x) => `command:${x}`),
        ...(r.parent ? [r.parent] : []),
      ].join(", ");
      const origin = `${r.origin.kind}${r.origin.sha ? ` @${r.origin.sha.slice(0, 8)}` : ""}`;
      out.push(
        `| \`${r.name}\` | ${r.status} | ${esc(r.version)} | ${origin} | ${esc(r.responsibility)} | ${esc(rel) || "—"} | ${r.integration.ingestion ?? "—"} | ${r.tests.length} |`,
      );
    }
    out.push("");
  }
  return `${out.join("\n").trimEnd()}\n`;
}

export function writeCatalogMd(root: string): void {
  const { entries } = loadCatalog(root);
  writeTextAtomic(join(root, PATHS.catalogMd), renderCatalogMd(entries));
}

export function catalogMdInSync(root: string): boolean {
  const p = join(root, PATHS.catalogMd);
  if (!existsSync(p)) return false;
  return readText(p) === renderCatalogMd(loadCatalog(root).entries);
}
