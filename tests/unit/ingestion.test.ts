import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { nextIngestionId, startIngestion, validateRecords } from "../../src/lib/ingestion/ingestion.ts";
import { saveComponent } from "../../src/lib/catalog/store.ts";
import { ComponentSchema } from "../../src/lib/catalog/schema.ts";
import { REPO, skillRecord, tmpDir, write } from "../helpers.ts";

const TEMPLATE = join(REPO, "ingestion/TEMPLATE.md");

function lote(root: string) {
  write(root, "ingestion/inbox/lote/skill-a/SKILL.md", "---\nname: skill-a\ndescription: faz a\n---\ncorpo\n");
  write(root, "ingestion/inbox/lote/agents/ag.md", "---\nname: ag\ndescription: agente\n---\nx\n");
  // compactado aninhado: externo.zip ⊃ interno.zip ⊃ skill-b/SKILL.md
  const tmp = tmpDir();
  write(tmp, "skill-b/SKILL.md", "---\nname: skill-b\ndescription: b\n---\n");
  execFileSync("zip", ["-qr", "interno.zip", "skill-b"], { cwd: tmp });
  execFileSync("zip", ["-q", join(root, "ingestion/inbox/externo.zip"), "interno.zip"], { cwd: tmp });
}

test("RECEIVE: copia para received/ING-NNNN, extrai compactados aninhados, gera manifesto e registro, esvazia o inbox", () => {
  const root = tmpDir();
  lote(root);
  assert.equal(nextIngestionId(root), "ING-0001");
  const r = startIngestion(root, { titulo: "Lote de teste", origem: "teste automatizado", caminhos: ["ingestion/inbox/lote", "ingestion/inbox/externo.zip"], templatePath: TEMPLATE });
  assert.equal(r.id, "ING-0001");
  assert.ok(existsSync(join(root, "ingestion/received/ING-0001/lote/skill-a/SKILL.md")));
  assert.ok(existsSync(join(root, "ingestion/received/ING-0001/externo.extraido/interno.extraido/skill-b/SKILL.md")));
  assert.equal(r.extracted.length, 2);
  assert.ok(!existsSync(join(root, "ingestion/inbox/lote")));
  const manifest = readFileSync(join(root, "ingestion/received/ING-0001/MANIFEST.sha256"), "utf8");
  assert.match(manifest, /^[0-9a-f]{64} {2}lote\/skill-a\/SKILL\.md$/m);
  assert.equal(nextIngestionId(root), "ING-0002");
  // registro aberto com as 11 seções é válido
  assert.deepEqual(validateRecords(root).filter((f) => f.level === "error"), []);
});

test("REGISTER: registro fechado com PENDENTE ou sem vínculo no catálogo é recusado; completo passa", () => {
  const root = tmpDir();
  lote(root);
  const r = startIngestion(root, { titulo: "Lote", origem: "teste", caminhos: ["ingestion/inbox/lote"], templatePath: TEMPLATE });
  const file = join(root, r.record);
  const close = (body: string, catalogId: string) =>
    body
      .replace("status: aberta ", "status: integrada")
      .replace("estagio_atual: RECEIVE ", "estagio_atual: REGISTER")
      .replace(/^componentes: \[\].*$/m, `componentes:\n  - { nome: exemplo, tipo: skill, decisao: adaptar, destino: skills/exemplo, catalog_id: "${catalogId}" }`);
  writeFileSync(file, close(readFileSync(file, "utf8"), "skill:exemplo"));
  const codes = () => validateRecords(root).filter((f) => f.level === "error").map((f) => f.code);
  assert.ok(codes().includes("INGESTION_PENDING"));
  assert.ok(codes().includes("INGESTION_CATALOG"));
  writeFileSync(file, readFileSync(file, "utf8").replace(/PENDENTE/g, "feito"));
  saveComponent(root, ComponentSchema.parse(skillRecord({ integration: { date: "2026-09-28", reason: "teste", ingestion: "ING-0001" } })));
  assert.deepEqual(codes(), []);
});
