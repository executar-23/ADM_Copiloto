// Empacota servidores MCP, hooks e CLI em arquivos autocontidos em dist/.
// O plugin instalado roda só com Node — sem npm install.
import { build } from "esbuild";
import { rmSync } from "node:fs";

const entryPoints = {
  "mcp/estado": "src/mcp/estado.ts",
  "mcp/registry": "src/mcp/registry.ts",
  "hooks/session-context": "src/hooks/session-context.ts",
  "hooks/guard-write": "src/hooks/guard-write.ts",
  "hooks/guard-external": "src/hooks/guard-external.ts",
  "hooks/validate-on-write": "src/hooks/validate-on-write.ts",
  "cli/maestro": "src/cli/maestro.ts",
};

rmSync("dist", { recursive: true, force: true });
await build({
  entryPoints,
  outdir: "dist",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outExtension: { ".js": ".js" },
  legalComments: "none",
  logLevel: "warning",
  banner: {
    js: "// Gerado por scripts/build.mjs — não editar. Fonte: src/\nimport { createRequire as __mcr } from 'node:module'; const require = __mcr(import.meta.url);",
  },
});
console.log(`dist/ gerado: ${Object.keys(entryPoints).length} entradas`);
