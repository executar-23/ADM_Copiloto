import { test } from "node:test";
import assert from "node:assert/strict";
import { nextEligible, progress, transition, TransitionError } from "../../src/lib/estado/machine.ts";
import { estadoWith, node } from "../helpers.ts";

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof TransitionError) return e.code;
    throw e;
  }
  return "OK";
};

test("EV-001: WIP=1 — segundo nó em DOING é recusado", () => {
  const e = estadoWith([node({ id: "A", status: "DOING" }), node({ id: "B", status: "READY" })]);
  assert.equal(code(() => transition(e, { id: "B", para: "DOING", motivo: "iniciar", ator: "maestro" })), "WIP");
});

test("EV-002: DONE sem evidência é recusado", () => {
  const e = estadoWith([node({ id: "A", status: "VERIFY", output: ["x.md"] })]);
  assert.equal(code(() => transition(e, { id: "A", para: "DONE", motivo: "fim", ator: "maestro", verificacao: "dod ok" })), "EVIDENCE");
});

test("EV-011: saída de skill não vai direto para DONE (DONE só a partir de VERIFY)", () => {
  const e = estadoWith([node({ id: "A", status: "DOING", output: ["x.md"] })]);
  assert.equal(code(() => transition(e, { id: "A", para: "DONE", motivo: "fim", ator: "maestro", verificacao: "ok" })), "NOT_ALLOWED");
});

const withEvidence = (extra: Partial<Parameters<typeof node>[0]> = {}) =>
  node({
    id: "A",
    status: "VERIFY",
    output: ["x.md"],
    evidencias: [{ id: "EVD-A-1", caminho: "x.md", criterio: "existe", classe: "A_OBSERVADO", registrada_em: "2026-09-28T00:00:00Z", ator: "maestro" }],
    ...extra,
  });

test("EV-005/I-02: dod 'A DEFINIR' impede DONE", () => {
  const e = estadoWith([withEvidence({ dod: "A DEFINIR" })]);
  assert.equal(code(() => transition(e, { id: "A", para: "DONE", motivo: "fim", ator: "maestro", verificacao: "ok ok" })), "DOD");
});

test("EV-003: efeito externo sem autorização → BLOCKED + USER_ACTION_REQUIRED", () => {
  const e = estadoWith([withEvidence({ efeito_externo: true })]);
  assert.equal(code(() => transition(e, { id: "A", para: "DONE", motivo: "publicar", ator: "maestro", verificacao: "publicado" })), "AUTORIZACAO");
  const n = e.nos[0]!;
  assert.equal(n.status, "BLOCKED");
  assert.equal(n.motivo_bloqueio?.codigo, "USER_ACTION_REQUIRED");
});

test("efeito externo com autorização registrada chega a DONE", () => {
  const e = estadoWith([withEvidence({ efeito_externo: true, autorizacao: { escopo: "deploy preview", concedida_em: "2026-09-28", fonte: "usuário: 'pode'" } })]);
  const n = transition(e, { id: "A", para: "DONE", motivo: "fim", ator: "maestro", verificacao: "URL do preview registrada" });
  assert.equal(n.status, "DONE");
});

test("C-04: só maestro/usuario promovem para DONE", () => {
  const e = estadoWith([withEvidence()]);
  assert.equal(code(() => transition(e, { id: "A", para: "DONE", motivo: "fim", ator: "qa-reviewer", verificacao: "ok ok" })), "PROMOTER");
});

test("DONE exige verificação descrita", () => {
  const e = estadoWith([withEvidence()]);
  assert.equal(code(() => transition(e, { id: "A", para: "DONE", motivo: "fim", ator: "maestro" })), "VERIFICACAO");
});

test("DOING exige dependências DONE", () => {
  const e = estadoWith([node({ id: "A", status: "READY" }), node({ id: "B", status: "BLOCKED", depends_on: ["A"], motivo_bloqueio: { codigo: "OUTRO", detalhe: "x x x" } })]);
  assert.equal(code(() => transition(e, { id: "B", para: "DOING", motivo: "tentar", ator: "maestro" })), "DEPS");
});

test("VERIFY exige saída registrada", () => {
  const e = estadoWith([node({ id: "A", status: "DOING" })]);
  assert.equal(code(() => transition(e, { id: "A", para: "VERIFY", motivo: "pronto", ator: "maestro" })), "OUTPUT");
});

test("BLOCKED exige bloqueio e limpa ao sair; histórico só cresce (I-10)", () => {
  const e = estadoWith([node({ id: "A", status: "READY" })]);
  transition(e, { id: "A", para: "BLOCKED", motivo: "falta insumo", ator: "maestro", bloqueio: { codigo: "INSUMO_AUSENTE", detalhe: "README do ecossistema" } });
  const before = e.nos[0]!.historico.map((h) => ({ ...h }));
  transition(e, { id: "A", para: "READY", motivo: "insumo chegou", ator: "maestro" });
  const n = e.nos[0]!;
  assert.equal(n.motivo_bloqueio, null);
  assert.deepEqual(n.historico.slice(0, before.length), before);
  assert.equal(n.historico.length, before.length + 1);
});

test("transição fora da máquina é recusada e motivo é obrigatório", () => {
  const e = estadoWith([node({ id: "A", status: "BACKLOG_VALIDATED" })]);
  assert.equal(code(() => transition(e, { id: "A", para: "DONE", motivo: "x", ator: "maestro" })), "NOT_ALLOWED");
  assert.equal(code(() => transition(e, { id: "A", para: "READY", motivo: " ", ator: "maestro" })), "MOTIVO");
});

test("próximo elegível respeita dependências e WIP; progresso é derivado (I-09)", () => {
  const e = estadoWith([
    node({ id: "A", status: "DONE", evidencias: [] }),
    node({ id: "B", status: "READY", depends_on: ["A"] }),
    node({ id: "C", depends_on: ["B"] }),
    node({ id: "D", trilha: "L", decisao: "SKIPPED" }),
  ]);
  const nx = nextEligible(e);
  assert.equal(nx.active, null);
  assert.equal(nx.next?.id, "B");
  assert.deepEqual(nx.eligible.map((n) => n.id), ["B"]);
  assert.deepEqual(progress(e).S, { concluidos: 1, habilitados: 3, percentual: 33 });
  assert.deepEqual(progress(e).L, { concluidos: 0, habilitados: 0, percentual: 0 });
});

test("DONE promove dependentes com todas as dependências concluídas para READY", () => {
  const e = estadoWith([withEvidence(), node({ id: "B", depends_on: ["A"] }), node({ id: "C", depends_on: ["A", "Z"] }), node({ id: "Z", status: "READY" })]);
  transition(e, { id: "A", para: "DONE", motivo: "fim", ator: "maestro", verificacao: "dod conferido" });
  assert.equal(e.nos.find((n) => n.id === "B")!.status, "READY");
  assert.equal(e.nos.find((n) => n.id === "C")!.status, "BACKLOG_VALIDATED", "C ainda depende de Z");
  assert.match(e.nos.find((n) => n.id === "B")!.historico.at(-1)!.motivo, /última: A/);
});
