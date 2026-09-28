import { test } from "node:test";
import assert from "node:assert/strict";
import { ComponentSchema } from "../../src/lib/catalog/schema.ts";
import { catalogMdInSync, loadCatalog, saveComponent, writeCatalogMd } from "../../src/lib/catalog/store.ts";
import { skillRecord, tmpDir, write } from "../helpers.ts";

const issues = (r: unknown) => {
  const p = ComponentSchema.safeParse(r);
  return p.success ? [] : p.error.issues.map((i) => i.path.join("."));
};

test("registro válido passa", () => assert.deepEqual(issues(skillRecord()), []));

test("EV-013: componente próprio/adaptado sem anti-overkill é recusado", () => {
  assert.deepEqual(issues(skillRecord({ anti_overkill: undefined })), ["anti_overkill"]);
});

test("upstream e third-party não exigem anti-overkill; id deve bater com tipo:nome", () => {
  assert.deepEqual(issues(skillRecord({ anti_overkill: undefined, origin: { kind: "upstream", source: "anthropics/x", sha: "abc" } })), []);
  assert.deepEqual(issues(skillRecord({ id: "skill:outro" })), ["id"]);
});

test("mcp-tool exige parent; upstream-reference exige SHA", () => {
  assert.ok(issues({ ...skillRecord(), id: "mcp-tool:s.t", name: "s.t", type: "mcp-tool" }).includes("parent"));
  assert.ok(issues({ ...skillRecord({ anti_overkill: undefined }), id: "upstream-reference:x", name: "x", type: "upstream-reference", origin: { kind: "upstream", source: "u" } }).includes("origin.sha"));
});

test("catálogo em disco: localização, duplicidade, referências e projeção", () => {
  const root = tmpDir();
  saveComponent(root, ComponentSchema.parse(skillRecord({ related: { skills: [], agents: ["fantasma"], commands: [] } })));
  write(root, "catalog/components/agent/errado.json", JSON.stringify({ ...skillRecord() }));
  const { entries, findings } = loadCatalog(root);
  const codes = findings.map((f) => f.code).sort();
  assert.equal(entries.length, 2);
  assert.ok(codes.includes("CATALOG_LOCATION"));
  assert.ok(codes.includes("CATALOG_DUP"));
  assert.ok(codes.includes("CATALOG_REF"));
  assert.equal(catalogMdInSync(root), false);
  writeCatalogMd(root);
  assert.equal(catalogMdInSync(root), true);
});
