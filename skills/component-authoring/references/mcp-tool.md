# Ferramenta MCP / servidor MCP

## Ferramenta nova num servidor existente

1. Metadados em `src/mcp/manifest.ts` (`server`, `name`, `title`, `readOnly`, `destructive`). É a fonte única usada pelo servidor, pelo lint de `tools:` e pela consistência com o catálogo.
2. Implementação em `src/mcp/<servidor>.ts` com o helper `tool(server, "<servidor>", "<nome>", descrição, inputSchema, handler)`:
   - **Descrição = contrato:** o que faz, o que retorna, o que **não** faz (e qual ferramenta irmã usar). Não dê ordens de comportamento ao modelo.
   - **Schema estrito (zod):** enums em vez de string, limites em números, regex em ids.
   - **Leitura e escrita separadas** — nunca uma ferramenta que faz os dois.
   - Anotações: leitura → `readOnly: true`; sobrescrita/irreversível ou que exige humano → `destructive: true` (a UI pede confirmação).
   - Retorno com `ok(data, resumo)` (texto + `structuredContent`) ou `fail(mensagem)`; exceções viram erro de ferramenta.
   - Regras de negócio (invariantes) ficam na lib (`src/lib/…`), testáveis sem MCP.
3. Registro no catálogo: `mcp-tool:<servidor>.<nome>` com `parent: "mcp-server:<servidor>"`.
4. Teste de integração em `tests/integration/mcp-<servidor>.test.ts` (cliente SDK real via stdio).
5. `npm run build && npm run check`.

## Servidor novo

- **Próprio (local stdio):** `src/mcp/<nome>.ts` + entrada em `scripts/build.mjs` + `.mcp.json` (`"command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/dist/mcp/<nome>.js"]`). Adicione `server` no tipo de `ToolMeta`.
- **Conector externo (HTTP/OAuth):** entrada em `.mcp.json` (`"type": "http", "url": …`), documentada em `docs/architecture/mcp.md` (padrão `~~categoria` do Knowledge Work). Escritas em conector = ação externa (hook `guard-external` pede aprovação).
- Registre `mcp-server:<nome>` no catálogo com `anti_overkill`.

Nome visível ao Claude: `mcp__plugin_maestro_<servidor>__<ferramenta>`.
