#!/usr/bin/env node
// Preenche a URL REAL da rota MCP remota (Cloudflare Workers) em .mcp.json e fecha a decisão D14
// no ledger — só depois de confirmar (por uma chamada de verdade) que o Worker responde. Nunca
// escreve uma URL adivinhada (I-02): sem o argumento, ou se o probe falhar, o script para e explica.
//
// Uso: node scripts/configure-cloudflare-route.mjs <URL impressa por `wrangler deploy`>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const raw = process.argv[2];

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

if (!raw) {
  fail(
    "faltou a URL. Rode primeiro `cd cloudflare-worker && npm run deploy`, copie a URL impressa " +
      "(https://maestro-mcp-remote.<subdomínio>.workers.dev) e passe aqui como argumento.",
  );
}

let base;
try {
  base = new URL(raw);
} catch {
  fail(`'${raw}' não é uma URL válida.`);
}
if (base.protocol !== "https:") fail("a URL precisa ser https:// (Cloudflare Workers não serve http:// em produção).");
base.pathname = base.pathname.replace(/\/mcp\/?$/, "").replace(/\/$/, "");
const mcpUrl = `${base.toString()}/mcp`;

console.log(`Verificando ${base}… (chamada real, não é suposição)`);
let infoText;
try {
  const r = await fetch(base.toString(), { signal: AbortSignal.timeout(10_000) });
  if (!r.ok) fail(`${base} respondeu HTTP ${r.status} — confirme que o deploy terminou e a URL está correta.`);
  infoText = await r.text();
} catch (e) {
  fail(`não consegui alcançar ${base}: ${e.message}. Confirme a URL (copie exatamente o que 'wrangler deploy' imprimiu) e a conectividade.`);
}
if (!infoText.includes("Maestro — rota MCP remota")) {
  fail(`${base} respondeu, mas não parece ser a rota do Maestro (página de outro Worker?). Corpo recebido:\n${infoText.slice(0, 300)}`);
}
console.log("✔ Worker respondeu e é a rota do Maestro.");

// .mcp.json — servidor remoto além dos dois locais (estado/registry seguem stdio; este é http).
const mcpJsonPath = join(ROOT, ".mcp.json");
const mcpJson = JSON.parse(readFileSync(mcpJsonPath, "utf8"));
mcpJson.mcpServers.remote = { type: "http", url: mcpUrl };
writeFileSync(mcpJsonPath, `${JSON.stringify(mcpJson, null, 2)}\n`);
console.log(`✔ .mcp.json atualizado: mcpServers.remote → ${mcpUrl}`);

// Ledger: fecha D14 com a URL como evidência de fato (não se infere de "deploy rodou" — I-03).
console.log("Registrando no ledger (D14)…");
const transport = new StdioClientTransport({ command: process.execPath, args: [join(ROOT, "dist/mcp/estado.js")], env: { ...process.env, MAESTRO_WORKSPACE: ROOT } });
const client = new Client({ name: "configure-cloudflare-route", version: "0.0.0" });
await client.connect(transport);
const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) fail(`${name} falhou: ${r.content.map((c) => c.text ?? "").join(" ")}`);
  return r;
};
await call("decision_record", {
  id: "D14",
  tipo: "decisao",
  titulo: "URL real da rota MCP remota (Cloudflare Workers)",
  status: "RESPONDIDA",
  resposta: mcpUrl,
  fonte: `deploy confirmado por esta ferramenta (probe HTTP real em ${new Date().toISOString()})`,
  nota: "Registrado por scripts/configure-cloudflare-route.mjs após publicação real — nunca uma URL adivinhada.",
});
await client.close();
console.log("✔ D14 fechada no ledger.\n\nPróximo passo: npm run check && git add -A && git commit -m 'chore: rota MCP remota publicada (D14)'");
