import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { validateEstadoData, validateEstadoWorkspace } from "../../src/lib/estado/validate.ts";
import { estadoWith, makeWorkspace, node, write } from "../helpers.ts";

const codes = (f: { code: string; level: string }[]) => f.filter((x) => x.level === "error").map((x) => x.code);

test("ledger coerente não tem erros", () => {
  assert.deepEqual(codes(validateEstadoData(estadoWith([node({ id: "A", status: "READY" }), node({ id: "B", depends_on: ["A"] })]))), []);
});

test("auditoria detecta WIP, DONE sem evidência, dependência inexistente e ciclo", () => {
  const e = estadoWith([
    node({ id: "A", status: "DOING" }),
    node({ id: "B", status: "DOING" }),
    node({ id: "C", status: "DONE", evidencias: [] }),
    node({ id: "D", depends_on: ["ZZ"] }),
    node({ id: "E", depends_on: ["F"] }),
    node({ id: "F", depends_on: ["E"] }),
  ]);
  const c = codes(validateEstadoData(e));
  for (const expected of ["WIP", "DONE_NO_EVIDENCE", "DEP_UNKNOWN", "CYCLE"]) assert.ok(c.includes(expected), `${expected} ∉ ${c.join(",")}`);
});

test("decisão RESPONDIDA sem fonte é erro (I-02)", () => {
  const e = estadoWith([]);
  e.decisoes.push({ id: "D1", tipo: "decisao", titulo: "x y z", status: "RESPONDIDA", resposta: "sim", bloqueia: [], historico: [] });
  assert.ok(codes(validateEstadoData(e)).includes("DECISION_NO_SOURCE"));
});

test("EV-012: projeção ESTADO.md editada à mão é detectada", () => {
  const root = makeWorkspace();
  assert.deepEqual(codes(validateEstadoWorkspace(root)), []);
  appendFileSync(join(root, "07-execucao/ESTADO.md"), "\n| X | editado à mão |\n");
  assert.ok(codes(validateEstadoWorkspace(root)).includes("PROJECTION_DIVERGENT"));
});

test("EV-012: segundo ledger no workspace é detectado; arquivos homônimos sem conteúdo de ledger não", () => {
  const root = makeWorkspace();
  write(root, "docs/ESTADO.md", "# ESTADO paralelo\n\nWIP: nó X\n");
  write(root, "catalog/components/mcp-server/estado.json", JSON.stringify({ id: "mcp-server:estado" }));
  const f = validateEstadoWorkspace(root).filter((x) => x.code === "PARALLEL_LEDGER");
  assert.deepEqual(f.map((x) => x.ref), ["docs/ESTADO.md"]);
});
