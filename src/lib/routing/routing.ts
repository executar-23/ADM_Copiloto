// Tabela de roteamento intenção/entrega → lane → skill (mapa/roteamento.json).
import { join } from "node:path";
import { z } from "zod";
import { PATHS } from "../workspace.ts";
import { existsSync, queryScore, readJson, readText, writeTextAtomic } from "../util.ts";
import type { Finding } from "../estado/validate.ts";

const STATUS = z.enum(["HIPOTESE", "VALIDADO"]);

export const RoutingSchema = z.object({
  versao: z.literal(1),
  status_global: STATUS,
  fonte: z.string(),
  nota: z.string().optional(),
  lanes: z.array(
    z.object({
      id: z.string().regex(/^[a-z-]+$/),
      nome: z.string(),
      origem: z.enum(["macro", "derivada"]),
      skills_oficiais: z.array(z.string()),
      skills_proprietarias: z.array(z.string()),
      nota: z.string().optional(),
    }),
  ),
  entregas: z.array(
    z.object({
      id: z.string().regex(/^R-\d{3}$/),
      entrega: z.string(),
      grupo: z.string(),
      lane: z.string(),
      primaria: z.object({ skill: z.string().nullable(), disponivel: z.enum(["sim", "nao", "A DEFINIR"]) }),
      apoio: z.array(z.string()),
      lacuna: z.string().nullable(),
      status: STATUS,
      decisao_ref: z.array(z.string()).default([]),
    }),
  ),
  sobreposicoes: z.array(
    z.object({
      intencao: z.string(),
      concorrentes: z.array(z.string()).min(2),
      proposta: z.string().nullable(),
      motivo: z.string(),
      status: STATUS,
    }),
  ),
  fallbacks: z.array(z.object({ quando: z.string(), usar: z.string(), fonte: z.string() })),
});
export type Routing = z.infer<typeof RoutingSchema>;

export function loadRouting(root: string): Routing | null {
  const p = join(root, PATHS.routingJson);
  if (!existsSync(p)) return null;
  return RoutingSchema.parse(readJson(p));
}

export function lookupRouting(r: Routing, query: string, lane?: string) {
  const entregas = r.entregas
    .filter((e) => !lane || e.lane === lane)
    .map((e) => ({ ...e, score: queryScore(query, `${e.entrega} ${e.grupo} ${e.lane} ${e.primaria.skill ?? ""} ${e.apoio.join(" ")}`) }))
    .filter((e) => e.score > 0 || query.trim() === "")
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  const skills = new Set(entregas.flatMap((e) => [e.primaria.skill, ...e.apoio]).filter(Boolean) as string[]);
  const sobreposicoes = r.sobreposicoes.filter((s) => s.concorrentes.some((c) => skills.has(c)) || queryScore(query, s.intencao) > 0);
  const fallbacks = r.fallbacks.filter((f) => queryScore(query, `${f.quando} ${f.usar}`) > 0 || entregas.some((e) => e.primaria.disponivel !== "sim" && f.quando.includes(e.primaria.skill ?? "∅")));
  const lanes = r.lanes.filter((l) => entregas.some((e) => e.lane === l.id) || l.id === lane);
  return { status_global: r.status_global, entregas, lanes, sobreposicoes, fallbacks };
}

const esc = (s: string) => s.replace(/\|/g, "\\|");

export function renderRoutingMd(r: Routing): string {
  const out = [
    "# Roteamento — entregas × lanes × skills",
    "",
    `> **Gerado de \`mapa/roteamento.json\` — não editar à mão.** Status global: **${r.status_global}**. Fonte: ${r.fonte}.`,
    r.nota ? `> ${r.nota}` : "",
    "",
    "## Lanes",
    "",
    "| Lane | Origem | Skills oficiais | Skills proprietárias |",
    "|---|---|---|---|",
    ...r.lanes.map((l) => `| ${l.nome} (\`${l.id}\`) | ${l.origem} | ${esc(l.skills_oficiais.join(", ") || "—")} | ${esc(l.skills_proprietarias.join(", ") || "—")} |`),
    "",
    "## Entregas",
    "",
    "| ID | Entrega | Grupo | Lane | Skill primária | Disponível | Apoio | Lacuna | Status |",
    "|---|---|---|---|---|---|---|---|---|",
    ...r.entregas.map(
      (e) =>
        `| ${e.id} | ${esc(e.entrega)} | ${esc(e.grupo)} | ${e.lane} | ${e.primaria.skill ? `\`${e.primaria.skill}\`` : "—"} | ${e.primaria.disponivel} | ${esc(e.apoio.join(", ") || "—")} | ${esc(e.lacuna ?? "—")} | ${e.status} |`,
    ),
    "",
    "## Sobreposições (uma vencedora por intenção)",
    "",
    "| Intenção | Concorrentes | Proposta | Motivo | Status |",
    "|---|---|---|---|---|",
    ...r.sobreposicoes.map((s) => `| ${esc(s.intencao)} | ${esc(s.concorrentes.join(" × "))} | ${esc(s.proposta ?? "A DEFINIR")} | ${esc(s.motivo)} | ${s.status} |`),
    "",
    "## Fallbacks",
    "",
    ...r.fallbacks.map((f) => `- **Quando** ${f.quando} → **usar** ${f.usar} _(fonte: ${f.fonte})_`),
  ];
  return `${out.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trimEnd()}\n`;
}

export function writeRoutingMd(root: string): void {
  const r = loadRouting(root);
  if (r) writeTextAtomic(join(root, PATHS.routingMd), renderRoutingMd(r));
}

export function validateRouting(root: string): Finding[] {
  const p = join(root, PATHS.routingJson);
  if (!existsSync(p)) return [];
  const parsed = RoutingSchema.safeParse(readJson(p));
  if (!parsed.success) return parsed.error.issues.map((i) => ({ level: "error" as const, code: "ROUTING_SCHEMA", message: `roteamento.json ${i.path.join(".")}: ${i.message}` }));
  const f: Finding[] = [];
  const lanes = new Set(parsed.data.lanes.map((l) => l.id));
  const ids = new Set<string>();
  for (const e of parsed.data.entregas) {
    if (ids.has(e.id)) f.push({ level: "error", code: "ROUTING_DUP", message: `entrega duplicada ${e.id}` });
    ids.add(e.id);
    if (!lanes.has(e.lane)) f.push({ level: "error", code: "ROUTING_LANE", message: `${e.id}: lane inexistente ${e.lane}` });
    if (!e.primaria.skill && !e.lacuna) f.push({ level: "error", code: "ROUTING_GAP", message: `${e.id}: sem skill primária e sem lacuna declarada` });
  }
  const md = join(root, PATHS.routingMd);
  if (!existsSync(md) || readText(md) !== renderRoutingMd(parsed.data)) {
    f.push({ level: "error", code: "ROUTING_PROJECTION", message: `${PATHS.routingMd} ausente ou divergente — rode \`maestro render\`` });
  }
  return f;
}
