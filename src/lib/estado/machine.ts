// Máquina de estados do Maestro. Invariantes aplicadas aqui, não pedidas por prompt:
// I-01 WIP=1 · I-04 DONE exige evidência + DoD · I-05 efeito externo exige autorização ·
// I-10 histórico só cresce · C-04 só Maestro/usuário promovem.
import { A_DEFINIR, BLOCK_CODES, type Estado, type Node, type Status } from "./schema.ts";
import { nowIso } from "../util.ts";

export const ALLOWED: Record<Status, readonly Status[]> = {
  BACKLOG_VALIDATED: ["READY", "BLOCKED"],
  READY: ["DOING", "BLOCKED", "BACKLOG_VALIDATED"],
  DOING: ["VERIFY", "BLOCKED", "READY"],
  VERIFY: ["DONE", "DOING", "BLOCKED"],
  DONE: ["VERIFY"],
  BLOCKED: ["READY", "BACKLOG_VALIDATED", "DOING", "VERIFY"],
};

/** Atores que podem promover para DONE (C-04 regra 1). */
export const PROMOTERS = new Set(["maestro", "usuario"]);

export class TransitionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly appliedBlock?: Node,
  ) {
    super(message);
  }
}

export function findNode(estado: Estado, id: string): Node {
  const n = estado.nos.find((x) => x.id === id);
  if (!n) throw new TransitionError(`nó inexistente: ${id}`, "NOT_FOUND");
  return n;
}

export function activeNode(estado: Estado): Node | undefined {
  return estado.nos.find((n) => n.status === "DOING");
}

export function openDeps(estado: Estado, node: Node): string[] {
  return node.depends_on.filter((d) => estado.nos.find((x) => x.id === d)?.status !== "DONE");
}

export function isADefinir(s: string | null | undefined): boolean {
  return !s || s.trim() === "" || s.trim().toUpperCase() === A_DEFINIR;
}

export interface TransitionInput {
  id: string;
  para: Status;
  motivo: string;
  ator: string;
  bloqueio?: { codigo: (typeof BLOCK_CODES)[number]; detalhe: string };
  verificacao?: string;
}

function push(node: Node, para: Status, motivo: string, ator: string) {
  const em = nowIso();
  node.historico.push({ em, de: node.status, para, motivo, ator });
  node.status = para;
  node.atualizado_em = em;
}

/**
 * Aplica uma transição validando todas as guardas. Muta `estado`.
 * Em caso de EV-003 (externo sem autorização) o nó é movido para BLOCKED +
 * USER_ACTION_REQUIRED e um TransitionError é lançado com `appliedBlock`.
 */
export function transition(estado: Estado, input: TransitionInput): Node {
  const node = findNode(estado, input.id);
  const { para, ator } = input;
  const motivo = input.motivo?.trim();
  if (!motivo) throw new TransitionError("motivo é obrigatório em toda transição (I-10)", "MOTIVO");
  if (node.status === para) throw new TransitionError(`nó ${node.id} já está em ${para}`, "NOOP");
  if (!ALLOWED[node.status].includes(para)) {
    throw new TransitionError(
      `transição não permitida: ${node.status} → ${para}. Permitidas: ${ALLOWED[node.status].join(", ")}`,
      "NOT_ALLOWED",
    );
  }

  if (para === "DOING") {
    const active = activeNode(estado);
    if (active && active.id !== node.id) {
      throw new TransitionError(
        `WIP=1: o nó ${active.id} já está em DOING. Conclua, bloqueie ou devolva-o antes (I-01).`,
        "WIP",
      );
    }
    const deps = openDeps(estado, node);
    if (deps.length) throw new TransitionError(`dependências não concluídas: ${deps.join(", ")}`, "DEPS");
  }

  if (para === "READY") {
    const deps = openDeps(estado, node);
    if (deps.length) throw new TransitionError(`READY exige dependências DONE; abertas: ${deps.join(", ")}`, "DEPS");
  }

  if (para === "VERIFY" && node.status === "DOING" && node.output.length === 0 && node.evidencias.length === 0) {
    throw new TransitionError(
      "VERIFY exige saída registrada (output) — resultado nunca fica só no chat (adaptador C-01, passo 3).",
      "OUTPUT",
    );
  }

  if (para === "BLOCKED") {
    if (!input.bloqueio) throw new TransitionError("BLOCKED exige bloqueio {codigo, detalhe}", "BLOQUEIO");
    node.motivo_bloqueio = { codigo: input.bloqueio.codigo, detalhe: input.bloqueio.detalhe };
  }

  if (para === "DONE") {
    if (!PROMOTERS.has(ator)) {
      throw new TransitionError(
        `somente o Maestro ou o usuário promovem para DONE; '${ator}' deve propor VERIFY (C-04 regra 1)`,
        "PROMOTER",
      );
    }
    if (node.evidencias.length === 0) {
      throw new TransitionError("DONE exige evidência registrada (I-04). Use evidence_add antes.", "EVIDENCE");
    }
    if (isADefinir(node.dod)) {
      throw new TransitionError("DONE exige critério de pronto (dod) definido; está 'A DEFINIR' (I-04).", "DOD");
    }
    if (!input.verificacao || input.verificacao.trim().length < 5) {
      throw new TransitionError("DONE exige `verificacao`: como o dod foi satisfeito (I-04).", "VERIFICACAO");
    }
    const deps = openDeps(estado, node);
    if (deps.length) throw new TransitionError(`dependências não concluídas: ${deps.join(", ")}`, "DEPS");
    if (node.efeito_externo && !node.autorizacao) {
      node.motivo_bloqueio = {
        codigo: "USER_ACTION_REQUIRED",
        detalhe: "efeito externo sem autorização explícita do usuário (I-05). Use authorization_grant após aprovação.",
      };
      push(node, "BLOCKED", `tentativa de DONE sem autorização: ${motivo}`, ator);
      throw new TransitionError(
        `nó ${node.id} tem efeito externo e não tem autorização: movido para BLOCKED + USER_ACTION_REQUIRED (I-05)`,
        "AUTORIZACAO",
        node,
      );
    }
  }

  const fullMotivo = para === "DONE" ? `${motivo} | verificação: ${input.verificacao}` : motivo;
  if (para !== "BLOCKED" && node.status === "BLOCKED") node.motivo_bloqueio = null;
  push(node, para, fullMotivo, ator);
  return node;
}

/** Próximo nó elegível: respeita WIP e dependências; ordem do ledger desempata (dependência vence numeração). */
export function nextEligible(estado: Estado) {
  const active = activeNode(estado);
  const eligible = estado.nos.filter(
    (n) =>
      (n.status === "READY" || n.status === "BACKLOG_VALIDATED") &&
      n.decisao === null &&
      openDeps(estado, n).length === 0,
  );
  const awaitingVerify = estado.nos.filter((n) => n.status === "VERIFY");
  const userAction = estado.nos.filter(
    (n) => n.status === "BLOCKED" && n.motivo_bloqueio?.codigo === "USER_ACTION_REQUIRED",
  );
  return { active: active ?? null, next: eligible[0] ?? null, eligible, awaitingVerify, userAction };
}

/** Progresso derivado (I-09): concluídos ÷ habilitados (exclui SKIPPED/DEPRECATED). */
export function progress(estado: Estado) {
  const out: Record<string, { concluidos: number; habilitados: number; percentual: number }> = {};
  for (const trilha of ["S", "L"] as const) {
    const hab = estado.nos.filter((n) => n.trilha === trilha && n.decisao === null);
    const done = hab.filter((n) => n.status === "DONE").length;
    out[trilha] = {
      concluidos: done,
      habilitados: hab.length,
      percentual: hab.length ? Math.round((done / hab.length) * 100) : 0,
    };
  }
  return out;
}
