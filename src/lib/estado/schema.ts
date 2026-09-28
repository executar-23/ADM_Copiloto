// Contrato C-01 em código: vocabulário canônico (Copiloto EXECUTAR) e esquema do nó.
import { z } from "zod";

export const STATUSES = ["BACKLOG_VALIDATED", "READY", "DOING", "VERIFY", "DONE", "BLOCKED"] as const;
export type Status = (typeof STATUSES)[number];

/** Rótulos PT e símbolos do ESTADO.md (C-01). A UI em português é só rótulo. */
export const STATUS_LABEL: Record<Status, { pt: string; simbolo: string }> = {
  BACKLOG_VALIDATED: { pt: "VALIDADO", simbolo: "⬜" },
  READY: { pt: "PRONTO", simbolo: "⬜" },
  DOING: { pt: "EM EXECUÇÃO", simbolo: "🔄" },
  VERIFY: { pt: "VERIFICAR", simbolo: "🔎" },
  DONE: { pt: "CONCLUÍDO", simbolo: "✅" },
  BLOCKED: { pt: "BLOQUEADO", simbolo: "⛔" },
};

export const BLOCK_CODES = [
  "USER_ACTION_REQUIRED",
  "DEPENDENCIA",
  "DECISAO_PENDENTE",
  "INSUMO_AUSENTE",
  "FALHA_GATE",
  "OUTRO",
] as const;

/**
 * Classes de evidência do Mapa-OS (`A_OBSERVADO…E_INFERIDO`). Só A, D e E têm nome
 * conhecido nas fontes lidas; B e C aceitam qualquer sufixo até a legenda ser fornecida
 * (I-02: não inventar nomes).
 */
export const EVIDENCE_CLASS = z
  .string()
  .regex(/^[A-E]_[A-Z_]+$/, "classe_evidencia deve seguir A_…/B_…/C_…/D_…/E_… (ex.: A_OBSERVADO, D_INTERNO, E_INFERIDO)");
export const KNOWN_EVIDENCE_CLASSES = ["A_OBSERVADO", "D_INTERNO", "E_INFERIDO"] as const;

export const A_DEFINIR = "A DEFINIR";

const NODE_ID = z.string().regex(/^[A-Z0-9][A-Za-z0-9._-]*$/, "id do nó: letras/números/._- começando com maiúscula ou número");

export const EvidenceSchema = z.object({
  id: z.string(),
  caminho: z.string().optional(),
  url: z.string().optional(),
  criterio: z.string().min(3),
  classe: EVIDENCE_CLASS,
  registrada_em: z.string(),
  ator: z.string().default("maestro"),
  nota: z.string().optional(),
});

export const HistoryEntrySchema = z.object({
  em: z.string(),
  de: z.enum(STATUSES).nullable(),
  para: z.enum(STATUSES),
  motivo: z.string(),
  ator: z.string(),
});

export const AuthorizationSchema = z.object({
  escopo: z.string().min(3),
  concedida_em: z.string(),
  fonte: z.string().min(3),
});

export const NodeSchema = z.object({
  id: NODE_ID,
  trilha: z.enum(["S", "L"]),
  tipo: z.enum(["estagio", "fase", "tarefa", "ficha", "ingestao"]),
  titulo: z.string().min(2),
  literal: z.string().optional(),
  lane: z.string().nullable().default(null),
  skill: z.string().nullable().default(null),
  skill_version: z.string().nullable().default(null),
  playbook: z.string().nullable().default(null),
  status: z.enum(STATUSES),
  motivo_bloqueio: z
    .object({ codigo: z.enum(BLOCK_CODES), detalhe: z.string().min(3) })
    .nullable()
    .default(null),
  dono_canonico: z.enum(["repo", "control-center"]),
  depends_on: z.array(NODE_ID).default([]),
  dod: z.string().min(1),
  efeito_externo: z.boolean().default(false),
  autorizacao: AuthorizationSchema.nullable().default(null),
  escopo_escrita: z.array(z.string()).default([]),
  output: z.array(z.string()).default([]),
  evidencias: z.array(EvidenceSchema).default([]),
  gaps: z.array(z.string()).default([]),
  conflitos: z.array(z.string()).default([]),
  decisao: z.enum(["SKIPPED", "DEPRECATED"]).nullable().default(null),
  refs: z.array(z.string()).default([]),
  dados: z.record(z.string(), z.unknown()).optional(),
  historico: z.array(HistoryEntrySchema).default([]),
  atualizado_em: z.string(),
});
export type Node = z.infer<typeof NodeSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;

export const DecisionSchema = z.object({
  id: z.string().regex(/^(D\d+(-v\d+)?|DIV-\d{3,}|CC-\d{3,})$/, "id: D#, D#-v#, DIV-### ou CC-###"),
  tipo: z.enum(["decisao", "divergencia", "change-control"]),
  titulo: z.string().min(3),
  onde: z.string().optional(),
  status: z.enum(["ABERTA", "PARCIAL", "RESPONDIDA", "SUPERADA", "REGISTRADA"]),
  recomendacao: z.string().optional(),
  opcoes: z.array(z.string()).optional(),
  resposta: z.string().optional(),
  fonte: z.string().optional(),
  data: z.string().optional(),
  bloqueia: z.array(z.string()).default([]),
  /** change-control: CURRENT→EVIDENCE→CONFLICT→PROPOSED_CHANGE→IMPACT→REVIEW_REQUIRED→STATUS */
  detalhes: z.record(z.string(), z.string()).optional(),
  historico: z
    .array(z.object({ em: z.string(), status: z.string(), nota: z.string() }))
    .default([]),
});
export type Decision = z.infer<typeof DecisionSchema>;

export const EstadoSchema = z.object({
  versao_schema: z.literal(1),
  projeto: z.object({ id: z.string(), nome: z.string() }),
  vocabulario: z.literal("copiloto-executar"),
  wip_limite: z.literal(1),
  atualizado_em: z.string(),
  nos: z.array(NodeSchema),
  decisoes: z.array(DecisionSchema).default([]),
});
export type Estado = z.infer<typeof EstadoSchema>;

export const CHANGE_CONTROL_FIELDS = [
  "CURRENT",
  "EVIDENCE",
  "CONFLICT",
  "PROPOSED_CHANGE",
  "IMPACT",
  "REVIEW_REQUIRED",
  "STATUS",
] as const;
