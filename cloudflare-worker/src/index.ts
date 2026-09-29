// Rota MCP remota do Maestro — duas superfícies no mesmo Worker.
//
// 1) /mcp — espelho público SOMENTE LEITURA (DE-012), inalterado por este arquivo desde a sessão
//    anterior: busca `07-execucao/estado.json`/`mapa/roteamento.json` via raw.githubusercontent.com
//    e reaplica as MESMAS funções puras de `src/lib` que os servidores locais usam. Sem autenticação,
//    de propósito — continua assim.
//
// 2) /mcp/auth — gateway MCP autenticado (Fase 1 da ADR-MCP-REMOTE-001 / CC-003, EXPERIMENTAL):
//    OAuth 2.1 + Streamable HTTP + CIMD via @cloudflare/workers-oauth-provider, identidade via
//    Cloudflare Access (D15, src/auth/identity.ts). Uma única ferramenta por enquanto (whoami,
//    src/mcp-auth-agent.ts) — só para provar o fluxo ponta a ponta. Fases 2/3 (Blog/CMS) ainda não
//    aprovadas: ver CC-003 em 07-execucao/estado.json antes de estender isto.
//
// Nem toda infraestrutura de Fase 1 está pronta para produção sozinha: falta o usuário configurar a
// Access application real que protege /authorize (dashboard) — ver cloudflare-worker/README.md.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { z } from "zod";

import { EstadoSchema, type Estado } from "../../src/lib/estado/schema.ts";
import { findNode, nextEligible, progress } from "../../src/lib/estado/machine.ts";
import { RoutingSchema, lookupRouting, type Routing } from "../../src/lib/routing/routing.ts";
import { TOOLS, toolMeta } from "../../src/mcp/manifest.ts";
import { handleAuthorize } from "./auth/consent.ts";
import type { AccessEnv } from "./auth/identity.ts";
import { MaestroRemoteAuth } from "./mcp-auth-agent.ts";

export { MaestroRemoteAuth };

const REPO = "executar-23/ADM_Copiloto";
const BRANCH = "main";
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const REVALIDATE_SECONDS = 60; // ledger/roteamento mudam por commit, não por segundo — cache curto evita martelar o GitHub

async function fetchRaw(path: string): Promise<string> {
  const r = await fetch(`${RAW}/${path}`, { cf: { cacheTtl: REVALIDATE_SECONDS, cacheEverything: true } });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status} ao buscar de ${REPO}@${BRANCH} — repo público? branch existe?`);
  return r.text();
}

async function loadEstado(): Promise<Estado> {
  const parsed = EstadoSchema.safeParse(JSON.parse(await fetchRaw("07-execucao/estado.json")));
  if (!parsed.success) throw new Error(`estado.json remoto inválido: ${parsed.error.issues.map((i) => i.message).join("; ")}`);
  return parsed.data;
}

async function loadRoutingRemote(): Promise<Routing> {
  return RoutingSchema.parse(JSON.parse(await fetchRaw("mapa/roteamento.json")));
}

function ok(data: unknown, summary?: string) {
  return { content: [{ type: "text" as const, text: `${summary ? `${summary}\n\n` : ""}${JSON.stringify(data, null, 2)}` }], structuredContent: data as Record<string, unknown> };
}
function fail(message: string) {
  return { content: [{ type: "text" as const, text: JSON.stringify({ erro: message }, null, 2) }], isError: true };
}

export class MaestroRemote extends McpAgent {
  server = new McpServer(
    { name: "maestro-remote", version: "0.1.0" },
    {
      instructions:
        "Espelho público somente leitura do plugin Maestro (executar-23/ADM_Copiloto). Mostra o ledger " +
        "(estado.json) e o roteamento (mapa/roteamento.json) da branch main. Não escreve nada — para operar " +
        "o Maestro de verdade (criar/transicionar nós, ingerir componentes), use o plugin local via Claude Code.",
    },
  );

  async init() {
    const annotations = (name: string) => {
      const m = toolMeta("remote", name);
      return { title: m.title, readOnlyHint: m.readOnly, destructiveHint: m.destructive, idempotentHint: m.readOnly, openWorldHint: false };
    };

    this.server.registerTool(
      "state_summary",
      {
        title: toolMeta("remote", "state_summary").title,
        description:
          "Resumo do ledger público do Maestro: nó ativo (WIP), próximo elegível, nós aguardando verificação, " +
          "bloqueios (inclui USER_ACTION_REQUIRED), decisões abertas e progresso derivado por trilha. Somente leitura; " +
          "para detalhe de um nó use node_get; para decisões use decision_list.",
        inputSchema: {},
        annotations: annotations("state_summary"),
      },
      async () => {
        try {
          const e = await loadEstado();
          const nx = nextEligible(e);
          const abertas = e.decisoes.filter((d) => d.tipo === "decisao" && (d.status === "ABERTA" || d.status === "PARCIAL"));
          const data = {
            repositorio: `${REPO}@${BRANCH}`,
            projeto: e.projeto,
            atualizado_em: e.atualizado_em,
            wip: nx.active ? { id: nx.active.id, titulo: nx.active.titulo, status: nx.active.status } : null,
            proximo_elegivel: nx.next ? { id: nx.next.id, titulo: nx.next.titulo, dod: nx.next.dod } : null,
            aguardando_verificacao: nx.awaitingVerify.map((n) => n.id),
            acao_do_usuario: nx.userAction.map((n) => ({ id: n.id, detalhe: n.motivo_bloqueio?.detalhe })),
            decisoes_abertas: abertas.map((d) => ({ id: d.id, titulo: d.titulo, status: d.status })),
            progresso: progress(e),
          };
          return ok(data, `[espelho público] WIP: ${nx.active?.id ?? "nenhum"} · próximo: ${nx.next?.id ?? "nenhum"}`);
        } catch (err) {
          return fail((err as Error).message);
        }
      },
    );

    this.server.registerTool(
      "node_get",
      {
        title: toolMeta("remote", "node_get").title,
        description: "Retorna um nó completo do ledger público pelo id (ex.: E0, F1, ING-0002). Somente leitura.",
        inputSchema: { id: z.string().min(1) },
        annotations: annotations("node_get"),
      },
      async ({ id }) => {
        try {
          const e = await loadEstado();
          return ok(findNode(e, id));
        } catch (err) {
          return fail((err as Error).message);
        }
      },
    );

    this.server.registerTool(
      "decision_list",
      {
        title: toolMeta("remote", "decision_list").title,
        description: "Lista decisões (D#), divergências (DIV-###) e mudanças de contrato (CC-###) do ledger público, com filtro opcional por status.",
        inputSchema: { status: z.enum(["ABERTA", "PARCIAL", "RESPONDIDA", "SUPERADA", "REGISTRADA"]).optional() },
        annotations: annotations("decision_list"),
      },
      async ({ status }) => {
        try {
          const e = await loadEstado();
          const list = e.decisoes.filter((d) => !status || d.status === status);
          return ok({ total: list.length, decisoes: list });
        } catch (err) {
          return fail((err as Error).message);
        }
      },
    );

    this.server.registerTool(
      "routing_lookup",
      {
        title: toolMeta("remote", "routing_lookup").title,
        description:
          "Consulta a tabela pública de roteamento (mapa/roteamento.json): dada uma entrega/intenção, retorna lane, " +
          "skill primária e disponibilidade, apoio, lacuna declarada, sobreposições e fallbacks. Somente leitura.",
        inputSchema: { query: z.string().default(""), lane: z.string().optional() },
        annotations: annotations("routing_lookup"),
      },
      async ({ query, lane }) => {
        try {
          const r = await loadRoutingRemote();
          return ok(lookupRouting(r, query, lane));
        } catch (err) {
          return fail((err as Error).message);
        }
      },
    );
  }
}

const INFO = `Maestro — rota MCP remota

Espelho público somente leitura (DE-012): ${TOOLS.filter((t) => t.server === "remote")
  .map((t) => t.name)
  .join(", ")}.
Endpoint: POST /mcp (streamable HTTP, sem autenticação)

Gateway autenticado — Fase 1, EXPERIMENTAL (ADR-MCP-REMOTE-001 / CC-003): ${TOOLS.filter((t) => t.server === "remote-auth")
  .map((t) => t.name)
  .join(", ")}.
Endpoint: POST /mcp/auth (streamable HTTP, OAuth 2.1 + CIMD)
Login: GET/POST /authorize (exige Cloudflare Access configurado — ver README.md deste diretório)

Repositório e instalação local: https://github.com/${REPO}
`;

interface Env extends AccessEnv {
  MCP_OBJECT: DurableObjectNamespace<MaestroRemote>;
  MCP_AUTH_OBJECT: DurableObjectNamespace<MaestroRemoteAuth>;
  OAUTH_KV: KVNamespace;
  // Não é um binding real do wrangler.jsonc — @cloudflare/workers-oauth-provider injeta isto em
  // env antes de chamar defaultHandler/apiHandler (ver docs/authorization-server.md "OAuth helpers").
  // Declarado aqui só para o TypeScript refletir o que a biblioteca faz em runtime.
  OAUTH_PROVIDER: OAuthHelpers;
}

// resourceMetadata.resource/authorization_servers precisam ser URLs absolutas conhecidas na
// construção do OAuthProvider — mas o hostname real (workers.dev do subdomínio da conta, ou um
// domínio próprio depois) não é conhecido até a primeira requisição chegar. Em vez de adivinhar
// (I-02), o provider é construído sob demanda, na primeira requisição, a partir do origin real
// dela, e reaproveitado depois (memoização simples; reconstruir ocasionalmente após um cold start
// é inofensivo, o estado de verdade mora todo em OAUTH_KV/Durable Objects).
let cachedProvider: { origin: string; provider: OAuthProvider<Env> } | undefined;

function providerFor(origin: string): OAuthProvider<Env> {
  if (cachedProvider?.origin === origin) return cachedProvider.provider;
  const provider = new OAuthProvider<Env>({
    apiRoute: "/mcp/auth",
    apiHandler: MaestroRemoteAuth.serve("/mcp/auth"),
    defaultHandler,
    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/oauth/token",
    scopesSupported: ["mcp:read"],
    requiredScopes: ["mcp:read"],
    resourceMetadata: {
      resource: `${origin}/mcp/auth`,
      authorization_servers: [origin],
    },
    clientIdMetadataDocumentEnabled: true,
  });
  cachedProvider = { origin, provider };
  return provider;
}

const defaultHandler: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
      // Espelho público (DE-012) — deliberadamente fora do gateway OAuth, sem mudança de comportamento.
      return MaestroRemote.serve("/mcp").fetch(request, env, ctx);
    }
    if (url.pathname === "/authorize") {
      return handleAuthorize(request, env, ctx);
    }
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(INFO, { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return new Response("Not found — use /mcp ou /mcp/auth", { status: 404 });
  },
};

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return providerFor(new URL(request.url).origin).fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
