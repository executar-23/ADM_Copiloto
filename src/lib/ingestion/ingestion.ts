// Pipeline permanente de ingestão: RECEIVE → … → REGISTER. Registros em ingestion/records/.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { stringify } from "yaml";
import { parseFrontmatter } from "../components/frontmatter.ts";
import { loadCatalog } from "../catalog/store.ts";
import { COMPONENT_TYPES } from "../catalog/schema.ts";
import { PATHS } from "../workspace.ts";
import { existsSync, isDir, readText, sha256, today, toPosix, walkFiles, writeTextAtomic } from "../util.ts";
import { readFileSync } from "node:fs";
import type { Finding } from "../estado/validate.ts";

export const STAGES = [
  "RECEIVE",
  "ANALYZE",
  "CLASSIFY",
  "COMPARE",
  "CHECK_CONFLICTS",
  "ADAPT",
  "VALIDATE",
  "TEST",
  "DOCUMENT",
  "INTEGRATE",
  "REGISTER",
] as const;
export const DECISIONS = ["pendente", "adaptar", "reutilizar", "rejeitar", "referenciar"] as const;
export const RECORD_STATUS = ["aberta", "integrada", "parcial", "rejeitada"] as const;

export interface RecordComponent {
  nome: string;
  tipo: string;
  decisao: (typeof DECISIONS)[number];
  destino: string | null;
  catalog_id: string | null;
}

export interface IngestionRecord {
  id: string;
  titulo: string;
  status: (typeof RECORD_STATUS)[number];
  estagio_atual: (typeof STAGES)[number];
  recebido_em: string;
  origem: string;
  received_dir: string | null;
  componentes: RecordComponent[];
  file: string;
}

export function listRecords(root: string): { records: IngestionRecord[]; findings: Finding[] } {
  const dir = join(root, PATHS.ingestionRecords);
  const records: IngestionRecord[] = [];
  const findings: Finding[] = [];
  if (!isDir(dir)) return { records, findings };
  for (const f of readdirSync(dir).filter((x) => /^ING-\d{4}.*\.md$/.test(x)).sort()) {
    const rel = `${PATHS.ingestionRecords}/${f}`;
    const { frontmatter: fm, error } = parseFrontmatter(readText(join(dir, f)));
    if (!fm || error) {
      findings.push({ level: "error", code: "INGESTION_FRONTMATTER", message: `${rel}: frontmatter ausente/inválido ${error ?? ""}`, ref: rel });
      continue;
    }
    records.push({
      id: String(fm.id ?? ""),
      titulo: String(fm.titulo ?? ""),
      status: fm.status as IngestionRecord["status"],
      estagio_atual: fm.estagio_atual as IngestionRecord["estagio_atual"],
      recebido_em: String(fm.recebido_em ?? ""),
      origem: String(fm.origem ?? ""),
      received_dir: (fm.received_dir as string | null) ?? null,
      componentes: (fm.componentes as RecordComponent[] | undefined) ?? [],
      file: rel,
    });
  }
  return { records, findings };
}

export function nextIngestionId(root: string): string {
  const nums = [
    ...listRecords(root).records.map((r) => r.id),
    ...(isDir(join(root, PATHS.ingestionReceived)) ? readdirSync(join(root, PATHS.ingestionReceived)) : []),
  ]
    .map((s) => /^ING-(\d{4})/.exec(s)?.[1])
    .filter(Boolean)
    .map(Number);
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ING-${String(n).padStart(4, "0")}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function writeManifest(dir: string): { file: string; entries: number } {
  const lines = walkFiles(dir)
    .filter((f) => basename(f) !== "MANIFEST.sha256")
    .map((f) => `${sha256(readFileSync(f))}  ${toPosix(relative(dir, f))}`);
  const file = join(dir, "MANIFEST.sha256");
  writeTextAtomic(file, `${lines.join("\n")}\n`);
  return { file, entries: lines.length };
}

const ARCHIVE_EXT = [".zip", ".skill", ".plugin"];

/** Extrai um compactado (e compactados aninhados, até 3 níveis) ao lado do original. */
function extractArchive(archive: string, destDir: string, depth = 0): string[] {
  try {
    mkdirSync(destDir, { recursive: true });
    execFileSync("unzip", ["-q", "-o", archive, "-d", destDir, "-x", "__MACOSX/*", "*/.DS_Store"], { stdio: "ignore" });
  } catch {
    return [];
  }
  const out = [destDir];
  if (depth < 3) {
    for (const f of walkFiles(destDir)) {
      if (ARCHIVE_EXT.includes(extname(f).toLowerCase())) {
        out.push(...extractArchive(f, join(dirname(f), `${basename(f, extname(f))}.extraido`), depth + 1));
      }
    }
  }
  return out;
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `{{${k}}}`);
}

export interface StartInput {
  titulo: string;
  origem: string;
  caminhos: string[];
  mover?: boolean;
  templatePath: string;
}

/** RECEIVE: copia o lote para received/ING-NNNN (imutável), extrai compactados, gera MANIFEST.sha256 e o registro. */
export function startIngestion(root: string, input: StartInput) {
  if (!input.caminhos.length) throw new Error("informe ao menos um caminho");
  if (!existsSync(input.templatePath)) throw new Error(`template de registro não encontrado: ${input.templatePath}`);
  const id = nextIngestionId(root);
  const slug = slugify(input.titulo) || "lote";
  const receivedRel = `${PATHS.ingestionReceived}/${id}`;
  const dest = join(root, receivedRel);
  mkdirSync(dest, { recursive: true });
  const inbox = resolve(root, PATHS.ingestionInbox);
  const moved: string[] = [];
  const extracted: string[] = [];
  for (const c of input.caminhos) {
    const src = resolve(root, c);
    if (!existsSync(src)) throw new Error(`caminho não existe: ${c}`);
    if (src.startsWith(resolve(root, PATHS.ingestionReceived))) throw new Error(`já recebido: ${c}`);
    const target = join(dest, basename(src));
    cpSync(src, target, { recursive: true, filter: (p) => !p.includes("__MACOSX") && basename(p) !== ".DS_Store" });
    if (ARCHIVE_EXT.includes(extname(src).toLowerCase())) {
      for (const out of extractArchive(target, join(dest, `${basename(src, extname(src))}.extraido`))) {
        extracted.push(toPosix(relative(root, out)));
      }
    }
    if ((input.mover ?? true) && src.startsWith(`${inbox}/`)) {
      rmSync(src, { recursive: true, force: true });
      moved.push(c);
    }
  }
  const manifest = writeManifest(dest);
  const recordRel = `${PATHS.ingestionRecords}/${id}-${slug}.md`;
  const vars = {
    ID: id,
    TITULO: input.titulo,
    DATA: today(),
    ORIGEM: input.origem,
    RECEIVED_DIR: receivedRel,
    MANIFEST: `${receivedRel}/MANIFEST.sha256 (${manifest.entries} arquivos)`,
    ITENS: input.caminhos.map((c) => `- \`${c}\``).join("\n"),
  };
  writeTextAtomic(join(root, recordRel), renderTemplate(readText(input.templatePath), vars));
  return { id, record: recordRel, received_dir: receivedRel, manifest_entries: manifest.entries, extracted, moved_from_inbox: moved };
}

export function recordFrontmatter(r: Omit<IngestionRecord, "file">): string {
  return `---\n${stringify(r).trimEnd()}\n---\n`;
}

/** Registros fechados precisam de todas as seções preenchidas e componentes registrados (REGISTER). */
export function validateRecords(root: string): Finding[] {
  const { records, findings } = listRecords(root);
  const catalog = new Map(loadCatalog(root).entries.map((e) => [e.record.id, e.record]));
  const ids = new Set<string>();
  for (const r of records) {
    const where = r.file;
    if (!/^ING-\d{4}$/.test(r.id)) findings.push({ level: "error", code: "INGESTION_ID", message: `${where}: id inválido '${r.id}'`, ref: where });
    if (ids.has(r.id)) findings.push({ level: "error", code: "INGESTION_DUP", message: `${where}: id duplicado ${r.id}`, ref: where });
    ids.add(r.id);
    if (!basename(where).startsWith(r.id)) findings.push({ level: "error", code: "INGESTION_FILE", message: `${where}: nome do arquivo deve começar com ${r.id}`, ref: where });
    if (!RECORD_STATUS.includes(r.status)) findings.push({ level: "error", code: "INGESTION_STATUS", message: `${where}: status inválido ${String(r.status)}`, ref: where });
    if (!STAGES.includes(r.estagio_atual)) findings.push({ level: "error", code: "INGESTION_STAGE", message: `${where}: estagio_atual inválido ${String(r.estagio_atual)}`, ref: where });
    if (r.received_dir && !existsSync(join(root, r.received_dir))) {
      findings.push({ level: "error", code: "INGESTION_RECEIVED", message: `${where}: received_dir inexistente ${r.received_dir}`, ref: where });
    }
    if (r.received_dir && !existsSync(join(root, r.received_dir, "MANIFEST.sha256"))) {
      findings.push({ level: "error", code: "INGESTION_MANIFEST", message: `${where}: falta MANIFEST.sha256 em ${r.received_dir}`, ref: where });
    }
    const body = readText(join(root, where));
    const closed = r.status !== "aberta";
    for (const [i, s] of STAGES.entries()) {
      const heading = new RegExp(`^## ${i + 1}\\. ${s}\\b`, "m");
      if (!heading.test(body)) findings.push({ level: "error", code: "INGESTION_SECTION", message: `${where}: falta seção "## ${i + 1}. ${s}"`, ref: where });
    }
    if (closed) {
      if (r.estagio_atual !== "REGISTER") findings.push({ level: "error", code: "INGESTION_NOT_REGISTERED", message: `${where}: fechado (${r.status}) mas estagio_atual=${r.estagio_atual}`, ref: where });
      if (/\bPENDENTE\b|\{\{\w+\}\}/.test(body)) findings.push({ level: "error", code: "INGESTION_PENDING", message: `${where}: fechado com seção PENDENTE ou placeholder`, ref: where });
      for (const c of r.componentes) {
        if (!DECISIONS.includes(c.decisao)) findings.push({ level: "error", code: "INGESTION_DECISION", message: `${where}: decisão inválida '${String(c.decisao)}' em ${c.nome}`, ref: where });
        if (c.decisao === "pendente") findings.push({ level: "error", code: "INGESTION_DECISION", message: `${where}: componente ${c.nome} sem decisão`, ref: where });
        const catalogued = (COMPONENT_TYPES as readonly string[]).includes(c.tipo);
        if (catalogued && ["adaptar", "reutilizar", "referenciar"].includes(c.decisao)) {
          const rec = c.catalog_id ? catalog.get(c.catalog_id) : undefined;
          if (!rec) findings.push({ level: "error", code: "INGESTION_CATALOG", message: `${where}: ${c.nome} → catalog_id ${c.catalog_id ?? "∅"} inexistente (REGISTER)`, ref: where });
          else if (rec.integration.ingestion !== r.id) {
            findings.push({ level: "error", code: "INGESTION_CATALOG_LINK", message: `${where}: ${c.catalog_id}.integration.ingestion=${rec.integration.ingestion} ≠ ${r.id}`, ref: where });
          }
        }
      }
    }
  }
  return findings;
}
