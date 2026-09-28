// Auditoria do ledger: invariantes globais que nenhuma transição isolada garante.
import { join, relative } from "node:path";
import { EstadoSchema, type Estado } from "./schema.ts";
import { renderEstadoMd } from "./render.ts";
import { isADefinir, openDeps } from "./machine.ts";
import { PATHS } from "../workspace.ts";
import { existsSync, readJson, readText, toPosix, walkFiles } from "../util.ts";

export interface Finding {
  level: "error" | "warning";
  code: string;
  message: string;
  ref?: string;
}

export function validateEstadoData(estado: Estado): Finding[] {
  const f: Finding[] = [];
  const ids = new Set<string>();
  for (const n of estado.nos) {
    if (ids.has(n.id)) f.push({ level: "error", code: "DUP_ID", message: `id duplicado: ${n.id}`, ref: n.id });
    ids.add(n.id);
  }
  const doing = estado.nos.filter((n) => n.status === "DOING");
  if (doing.length > 1) {
    f.push({ level: "error", code: "WIP", message: `WIP=1 violado: ${doing.map((n) => n.id).join(", ")} em DOING (I-01)` });
  }
  for (const n of estado.nos) {
    for (const d of n.depends_on) {
      if (!ids.has(d)) f.push({ level: "error", code: "DEP_UNKNOWN", message: `${n.id} depende de nó inexistente ${d}`, ref: n.id });
    }
    if (n.status === "DONE") {
      if (!n.evidencias.length) f.push({ level: "error", code: "DONE_NO_EVIDENCE", message: `${n.id} está DONE sem evidência (I-04)`, ref: n.id });
      if (isADefinir(n.dod)) f.push({ level: "error", code: "DONE_NO_DOD", message: `${n.id} está DONE com dod 'A DEFINIR' (I-04)`, ref: n.id });
      if (n.efeito_externo && !n.autorizacao) f.push({ level: "error", code: "DONE_NO_AUTH", message: `${n.id} tem efeito externo e está DONE sem autorização (I-05)`, ref: n.id });
    }
    if ((n.status === "DOING" || n.status === "DONE") && openDeps(estado, n).length) {
      f.push({ level: "error", code: "DEPS_OPEN", message: `${n.id} em ${n.status} com dependências abertas: ${openDeps(estado, n).join(", ")}`, ref: n.id });
    }
    if (n.status === "BLOCKED" && !n.motivo_bloqueio) f.push({ level: "error", code: "BLOCKED_NO_REASON", message: `${n.id} BLOCKED sem motivo`, ref: n.id });
    if (n.status !== "BLOCKED" && n.motivo_bloqueio) f.push({ level: "warning", code: "STALE_REASON", message: `${n.id} tem motivo_bloqueio mas não está BLOCKED`, ref: n.id });
    if (n.historico.length === 0) f.push({ level: "warning", code: "NO_HISTORY", message: `${n.id} sem histórico de transições (I-10)`, ref: n.id });
    const last = n.historico.at(-1);
    if (last && last.para !== n.status) f.push({ level: "error", code: "HISTORY_MISMATCH", message: `${n.id}: status ${n.status} ≠ última transição ${last.para}`, ref: n.id });
  }
  // ciclos
  const visiting = new Set<string>();
  const done = new Set<string>();
  const byId = new Map(estado.nos.map((n) => [n.id, n]));
  const dfs = (id: string, path: string[]): void => {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      f.push({ level: "error", code: "CYCLE", message: `ciclo de dependências: ${[...path, id].join(" → ")}` });
      return;
    }
    visiting.add(id);
    for (const d of byId.get(id)?.depends_on ?? []) if (byId.has(d)) dfs(d, [...path, id]);
    visiting.delete(id);
    done.add(id);
  };
  for (const n of estado.nos) dfs(n.id, []);
  const decIds = new Set<string>();
  for (const d of estado.decisoes) {
    if (decIds.has(d.id)) f.push({ level: "error", code: "DUP_DECISION", message: `decisão duplicada: ${d.id}` });
    decIds.add(d.id);
    if (d.status === "RESPONDIDA" && (!d.resposta || !d.fonte)) {
      f.push({ level: "error", code: "DECISION_NO_SOURCE", message: `${d.id} RESPONDIDA sem resposta+fonte (I-02)`, ref: d.id });
    }
  }
  return f;
}

/** Valida o ledger no disco: schema, invariantes, projeção em dia e ausência de ledger paralelo (EV-012). */
export function validateEstadoWorkspace(root: string): Finding[] {
  const p = join(root, PATHS.estadoJson);
  if (!existsSync(p)) return [];
  const parsed = EstadoSchema.safeParse(readJson(p));
  if (!parsed.success) {
    return parsed.error.issues.map((i) => ({ level: "error" as const, code: "SCHEMA", message: `estado.json ${i.path.join(".")}: ${i.message}` }));
  }
  const f = validateEstadoData(parsed.data);
  const md = join(root, PATHS.estadoMd);
  if (!existsSync(md)) {
    f.push({ level: "error", code: "PROJECTION_MISSING", message: `${PATHS.estadoMd} ausente — rode \`maestro render\`` });
  } else if (readText(md) !== renderEstadoMd(parsed.data)) {
    f.push({ level: "error", code: "PROJECTION_DIVERGENT", message: `${PATHS.estadoMd} diverge de estado.json (EV-012) — rode \`maestro render\`; nunca editar a projeção` });
  }
  // Ledger paralelo: outro ESTADO*.md / estado*.json fora de 07-execucao e das áreas de referência.
  // Heurística por conteúdo: JSON com `nos` + `wip_limite`, ou markdown com cabeçalho de ESTADO + WIP.
  const ignore = /^(vendor|node_modules|ingestion\/received|tests\/fixtures|dist|\.git|\.tmp)\//;
  for (const file of walkFiles(root, { maxDepth: 6 })) {
    const rel = toPosix(relative(root, file));
    if (ignore.test(rel) || rel.startsWith(`${PATHS.execucaoDir}/`)) continue;
    const base = rel.split("/").pop()!;
    let suspicious = false;
    if (/^estado.*\.json$/i.test(base)) {
      try {
        const j = readJson<Record<string, unknown>>(file);
        suspicious = Array.isArray(j.nos) || "wip_limite" in j;
      } catch {
        suspicious = false;
      }
    } else if (/^estado.*\.md$/i.test(base)) {
      suspicious = /^#\s*ESTADO\b/m.test(readText(file)) && /\bWIP\b/.test(readText(file));
    }
    if (suspicious) {
      f.push({ level: "error", code: "PARALLEL_LEDGER", message: `ledger paralelo: ${rel} (I-06) — há um só ledger (07-execucao/estado.json)`, ref: rel });
    }
  }
  return f;
}
