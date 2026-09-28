import { test } from "node:test";
import assert from "node:assert/strict";
import { checkConflicts } from "../../src/lib/components/conflicts.ts";
import { loadCatalog } from "../../src/lib/catalog/store.ts";
import { REPO } from "../helpers.ts";

const catalog = loadCatalog(REPO).entries.map((e) => e.record);

test("colisão de id e do namespace /maestro: compartilhado por skills e commands", () => {
  const [a, b] = checkConflicts(
    [
      { type: "skill", name: "maestro-operacao" },
      { type: "skill", name: "estado", description: "mostra estado" },
    ],
    catalog,
  );
  assert.equal(a!.verdict, "conflito");
  assert.equal(a!.collisions[0]!.kind, "mesmo-id");
  assert.equal(b!.verdict, "conflito");
  assert.equal(b!.collisions[0]!.kind, "namespace-slash");
});

test("nome repetido dentro do lote e provável duplicação por similaridade", () => {
  const reps = checkConflicts(
    [
      { type: "agent", name: "revisor", description: "x" },
      { type: "agent", name: "revisor", description: "y" },
      { type: "skill", name: "roteador-de-lanes", description: "Roteia intenção ou entrega para lane e uma skill vencedora, com sobreposições e fallbacks." },
    ],
    catalog,
  );
  assert.equal(reps[1]!.verdict, "conflito");
  assert.equal(reps[2]!.duplicates[0]?.id, "skill:roteamento-lanes");
  assert.equal(reps[2]!.verdict, "revisar");
});

test("componente sem sobreposição passa", () => {
  const [r] = checkConflicts([{ type: "skill", name: "gerar-orcamento-grafica", description: "calcula orçamento de impressão offset" }], catalog);
  assert.equal(r!.verdict, "sem-conflito");
});
