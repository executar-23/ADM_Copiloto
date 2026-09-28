import { test } from "node:test";
import assert from "node:assert/strict";
import { loadRouting, lookupRouting, validateRouting } from "../../src/lib/routing/routing.ts";
import { REPO } from "../helpers.ts";

const r = loadRouting(REPO)!;

test("tabela real é válida: toda entrega tem skill primária ou lacuna declarada; projeção em dia", () => {
  assert.ok(r);
  assert.equal(r.status_global, "HIPOTESE");
  assert.equal(r.lanes.length, 8);
  assert.deepEqual(validateRouting(REPO), []);
});

test("PRD roteia para produto com fallback RC (PM não instalado — D4)", () => {
  const res = lookupRouting(r, "PRD");
  const prd = res.entregas.find((e) => e.entrega === "PRD")!;
  assert.equal(prd.lane, "produto");
  assert.equal(prd.primaria.disponivel, "nao");
  assert.ok(prd.decisao_ref.includes("D4"));
  assert.ok(res.fallbacks.some((f) => f.usar.includes("templates/prd.md")));
});

test("filtro por lane e sobreposições relevantes", () => {
  const res = lookupRouting(r, "", "engenharia");
  assert.ok(res.entregas.length > 0);
  assert.ok(res.entregas.every((e) => e.lane === "engenharia"));
  const comp = lookupRouting(r, "análise competitiva");
  assert.ok(comp.sobreposicoes.some((s) => s.proposta === "marketing:competitive-brief"));
});
