import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { fingerprint, locateSkill } from "../../src/lib/components/fingerprint.ts";
import { tmpDir, write } from "../helpers.ts";

const copy = (root: string, where: string) => {
  write(root, `${where}/quick-frameworks/SKILL.md`, "---\nname: quick-frameworks\ndescription: teste\nversion: 1.0.0\n---\ncorpo\n");
  write(root, `${where}/quick-frameworks/references/a.md`, "ref\n");
  return join(root, where, "quick-frameworks");
};

test("EV-008: cópias idênticas → sem drift; cópia alterada → drift", () => {
  const root = tmpDir();
  const a = copy(root, "instalada");
  const b = copy(root, "enviada");
  const same = fingerprint({ paths: [a, b], roots: [] });
  assert.equal(same.drift, false);
  assert.match(same.skill_version!, /^sha256:[0-9a-f]{16}$/);
  appendFileSync(join(b, "SKILL.md"), "linha nova\n");
  const diff = fingerprint({ paths: [a, b], roots: [] });
  assert.equal(diff.drift, true);
  assert.equal(diff.distinct_versions, 2);
  assert.equal(diff.skill_version, null);
});

test("localiza cópias por nome nas raízes e diz quando não encontra", () => {
  const root = tmpDir();
  copy(root, "r1/plugins/x/skills");
  copy(root, "r2");
  assert.equal(locateSkill("quick-frameworks", [join(root, "r1"), join(root, "r2")]).length, 2);
  const none = fingerprint({ name: "nao-existe", roots: [root] });
  assert.equal(none.copies.length, 0);
  assert.match(none.note, /não existe/);
});
