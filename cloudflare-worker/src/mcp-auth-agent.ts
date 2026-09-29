// Servidor MCP autenticado (Fase 1 da ADR-MCP-REMOTE-001 / CC-003): rota separada (/mcp/auth) do
// espelho público (DE-012, MaestroRemote em src/index.ts) — não muda o comportamento existente.
// Uma única ferramenta (whoami), só para provar a mecânica OAuth ponta a ponta antes de qualquer
// integração real com Blog/CMS (Fases 2/3, ainda não aprovadas — ver CC-003).
//
// Usa o mesmo padrão (McpAgent, Durable Object) do MaestroRemote, não o `createMcpHandler`
// stateless mais novo do pacote `agents` que a própria ADR prefere (§6, §23): esse handler
// stateless espera um "SDK v2" (pacote `@modelcontextprotocol/server`, distinto do
// `@modelcontextprotocol/sdk` já usado neste projeto) que não foi verificado nesta sessão. Reusar
// o padrão McpAgent já testado (ver 07-execucao/evidencias/cloudflare-worker/) é o escopo mínimo
// para a Fase 1; migrar para o handler stateless fica para quando o SDK v2 for avaliado à parte.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { toolMeta } from "../../src/mcp/manifest.ts";

export interface AuthProps extends Record<string, unknown> {
  userId: string;
  email: string | null;
  name: string | null;
}

function ok(data: unknown, summary?: string) {
  return { content: [{ type: "text" as const, text: `${summary ? `${summary}\n\n` : ""}${JSON.stringify(data, null, 2)}` }], structuredContent: data as Record<string, unknown> };
}

export class MaestroRemoteAuth extends McpAgent<Cloudflare.Env, unknown, AuthProps> {
  server = new McpServer(
    { name: "maestro-remote-auth", version: "0.1.0" },
    {
      instructions:
        "Gateway MCP autenticado do Maestro (Fase 1, experimental — ADR-MCP-REMOTE-001/CC-003). Prova que o fluxo " +
        "OAuth 2.1 + Cloudflare Access funciona ponta a ponta. Sem ferramentas de Blog/CMS ainda (Fases 2/3, não " +
        "aprovadas). Para o espelho público somente leitura do ledger, use a rota /mcp (sem autenticação).",
    },
  );

  async init() {
    const meta = toolMeta("remote-auth", "whoami");
    this.server.registerTool(
      "whoami",
      {
        title: meta.title,
        description:
          "Identidade autenticada nesta sessão OAuth: quem fez login via Cloudflare Access quando o cliente MCP " +
          "obteve o token (userId, email, name). Prova que a Fase 1 da ADR-MCP-REMOTE-001 funciona; não expõe " +
          "dados do Blog/CMS (ainda não integrados).",
        inputSchema: {},
        annotations: { title: meta.title, readOnlyHint: meta.readOnly, destructiveHint: meta.destructive, idempotentHint: meta.readOnly, openWorldHint: false },
      },
      async () => ok(this.props, `[Fase 1 OAuth] autenticado como ${this.props?.email ?? this.props?.userId ?? "desconhecido"}`),
    );
  }
}
