// Consistência da rota MCP remota: ela existe, é rastreada no catálogo/ledger e (quando node_modules
// está instalado) o bundle real do Worker continua fechando — a mesma verificação que
// `npm run cloudflare:check` roda, só que sob `node --test` para entrar no gate padrão.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog } from "../../src/lib/catalog/store.ts";
import { loadEstado } from "../../src/lib/estado/store.ts";
import { TOOLS } from "../../src/mcp/manifest.ts";
import { REPO } from "../helpers.ts";

const WORKER_DIR = join(REPO, "cloudflare-worker");

test("cloudflare-worker/ existe com o manifesto e o código-fonte esperados", () => {
  for (const f of ["package.json", "tsconfig.json", "wrangler.jsonc", "src/index.ts", "README.md", "src/auth/identity.ts", "src/auth/consent.ts", "src/mcp-auth-agent.ts"]) {
    assert.ok(existsSync(join(WORKER_DIR, f)), f);
  }
  const src = readFileSync(join(WORKER_DIR, "src/index.ts"), "utf8");
  for (const tool of TOOLS.filter((t) => t.server === "remote")) {
    assert.match(src, new RegExp(`"${tool.name}"`), `${tool.name} registrado no Worker`);
  }
  const authSrc = readFileSync(join(WORKER_DIR, "src/mcp-auth-agent.ts"), "utf8");
  for (const tool of TOOLS.filter((t) => t.server === "remote-auth")) {
    assert.match(authSrc, new RegExp(`"${tool.name}"`), `${tool.name} registrado no MaestroRemoteAuth`);
  }
});

test("catálogo tem os servidores remote/remote-auth e suas ferramentas, status coerente com 'não publicado ainda'", () => {
  const entries = loadCatalog(REPO).entries.map((e) => e.record);
  for (const serverName of ["remote", "remote-auth"] as const) {
    const server = entries.find((r) => r.id === `mcp-server:${serverName}`);
    assert.ok(server, `mcp-server:${serverName} registrado`);
    assert.equal(server!.status, "experimental");
    for (const tool of TOOLS.filter((t) => t.server === serverName)) {
      assert.ok(entries.some((r) => r.id === `mcp-tool:${serverName}.${tool.name}`), tool.name);
    }
  }
});

test("rota /mcp (público, DE-012) não foi alterada pela adição do gateway OAuth", () => {
  const src = readFileSync(join(WORKER_DIR, "src/index.ts"), "utf8");
  assert.match(src, /pathname === "\/mcp"/, "rota /mcp continua explicitamente roteada");
  assert.match(src, /MaestroRemote\.serve\("\/mcp"\)/, "handler público inalterado");
  assert.doesNotMatch(src, /apiRoute:\s*["']\/mcp["']/, "/mcp não deve virar apiRoute do OAuthProvider (ficaria protegido por engano)");
});

test("resourceMetadata do gateway OAuth é calculado a partir do origin da requisição, nunca um hostname fixo adivinhado (I-02)", () => {
  const src = readFileSync(join(WORKER_DIR, "src/index.ts"), "utf8");
  assert.doesNotMatch(src, /["'`]https?:\/\/[^"'`]*\.workers\.dev/, "sem URL workers.dev hardcoded em string literal — a conta real ainda não tem deploy");
  assert.match(src, /resource:\s*`\$\{origin\}/, "resourceMetadata.resource derivado do origin em runtime, não de string fixa");
  assert.match(src, /authorization_servers:\s*\[origin\]/, "authorization_servers derivado do origin em runtime, não de string fixa");
});

test("ledger: D14 (URL real) e CF-ROUTE-0001 registrados; nenhuma URL foi inventada", () => {
  const e = loadEstado(REPO);
  const d14 = e.decisoes.find((d) => d.id === "D14")!;
  assert.ok(d14, "D14 existe");
  if (d14.status !== "RESPONDIDA") {
    assert.equal(d14.resposta, undefined, "sem deploy real, D14 não tem URL (I-02: nunca inventar)");
  } else {
    assert.match(d14.resposta ?? "", /^https:\/\//, "quando respondida, a URL é real (https)");
  }
  const node = e.nos.find((n) => n.id === "CF-ROUTE-0001")!;
  assert.ok(node, "CF-ROUTE-0001 existe");
  assert.equal(node.efeito_externo, true);
});

test("bundle real do Worker fecha (wrangler deploy --dry-run) — pulado se cloudflare-worker/node_modules não estiver instalado", (t) => {
  if (!existsSync(join(WORKER_DIR, "node_modules"))) return t.skip("cloudflare-worker/node_modules ausente — rode npm install lá para incluir este teste");
  try {
    const out = execFileSync("npx", ["wrangler", "deploy", "--dry-run", "--outdir", ".wrangler-check-out"], { cwd: WORKER_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.match(out, /Total Upload:/);
    assert.match(out, /--dry-run: exiting now/);
  } finally {
    rmSync(join(WORKER_DIR, ".wrangler-check-out"), { recursive: true, force: true });
  }
});
