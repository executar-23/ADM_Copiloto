import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { resolveWorkspace } from "../../src/lib/workspace.ts";
import { makeWorkspace, tmpDir } from "../helpers.ts";

test("resolve o workspace subindo diretórios a partir do cwd", () => {
  const root = makeWorkspace();
  mkdirSync(join(root, "docs/sub"), { recursive: true });
  const ws = resolveWorkspace({ cwd: join(root, "docs/sub"), env: {} });
  assert.equal(ws.root, root);
  assert.equal(ws.hasEstado, true);
});

test("I-06: o ledger não cai para a raiz do plugin num projeto sem ledger", () => {
  const plugin = makeWorkspace();
  const projeto = tmpDir();
  const env = { CLAUDE_PLUGIN_ROOT: plugin };
  const catalogo = resolveWorkspace({ cwd: projeto, env });
  assert.equal(catalogo.source, "plugin-root");
  assert.equal(catalogo.readOnly, true);
  const ledger = resolveWorkspace({ cwd: projeto, env, allowPluginRoot: false });
  assert.equal(ledger.source, "cwd-uninitialized");
  assert.equal(ledger.root, projeto);
  assert.equal(ledger.hasEstado, false);
});
