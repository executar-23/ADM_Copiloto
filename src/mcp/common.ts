// Utilidades compartilhadas pelos servidores MCP do Maestro.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape } from "zod";
import { toolMeta, type ToolMeta } from "./manifest.ts";

/** Raiz do plugin a partir do bundle (dist/mcp/<server>.js → ../..). */
export function pluginRootFromBundle(metaUrl: string): string {
  return process.env.CLAUDE_PLUGIN_ROOT ?? resolve(dirname(fileURLToPath(metaUrl)), "..", "..");
}

export function ok(data: unknown, summary?: string): CallToolResult {
  const structured = (data && typeof data === "object" && !Array.isArray(data) ? data : { result: data }) as Record<string, unknown>;
  const text = `${summary ? `${summary}\n\n` : ""}${JSON.stringify(data, null, 2)}`;
  return { content: [{ type: "text", text }], structuredContent: structured };
}

export function fail(message: string, extra?: Record<string, unknown>): CallToolResult {
  const payload = { erro: message, ...(extra ?? {}) };
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload, isError: true };
}

/** Registra uma ferramenta usando o manifesto (título + anotações) e captura exceções como erro de ferramenta. */
export function tool<S extends ZodRawShape>(
  server: McpServer,
  srv: ToolMeta["server"],
  name: string,
  description: string,
  inputSchema: S,
  handler: (args: { [K in keyof S]: import("zod").infer<S[K]> }) => CallToolResult | Promise<CallToolResult>,
): void {
  const meta = toolMeta(srv, name);
  server.registerTool(
    name,
    {
      title: meta.title,
      description,
      inputSchema,
      annotations: {
        title: meta.title,
        readOnlyHint: meta.readOnly,
        destructiveHint: meta.destructive,
        idempotentHint: meta.readOnly,
        openWorldHint: false,
      },
    },
    (async (args: never) => {
      try {
        return await handler(args);
      } catch (e) {
        const err = e as Error & { code?: string };
        return fail(err.message, err.code ? { codigo: err.code } : undefined);
      }
    }) as never,
  );
}
