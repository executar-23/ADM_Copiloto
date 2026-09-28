---
name: component-authoring
description: Convenções para escrever ou adaptar componentes do plugin Maestro — agents (frontmatter, <example>, menor privilégio), skills (Agent Skills, progressive disclosure), commands (entrada fina), hooks (hooks.json no formato wrapper, exit 2/ask) e ferramentas MCP (registerTool, zod estrito, anotações readOnly/destructive, leitura e escrita separadas) — com as 4 perguntas anti-overkill. Adaptado de plugin-dev e mcp-server-dev (Anthropic). Use no estágio ADAPT da ingestão, ao "criar agent/skill/command/hook", "adicionar ferramenta MCP", "novo servidor MCP", ou ao revisar se um componente segue o padrão. Also triggers on "write a skill", "create a subagent", "add an MCP tool".
---

# Autoria de componentes do Maestro

Todo componente novo passa antes pelas **4 perguntas anti-overkill** (Reuso · Necessidade · Custo · Reversão — `contratos/C-02-agent-spec.md`). Sem as quatro, não crie. Depois, siga a convenção da camada:

| Camada | Onde | Convenção | Detalhe |
|---|---|---|---|
| Agent | `agents/<nome>.md` | `name` = arquivo (kebab 3–50), `description` com 2–3 `<example>`, `model: inherit`, `color`, `tools` mínimo; **sem** `hooks`/`mcpServers`/`permissionMode` (ignorados em plugin) | `references/agent.md` |
| Skill | `skills/<nome>/SKILL.md` | `name` = diretório (kebab ≤ 64), `description` ≤ 1024 com gatilhos PT/EN em 3ª pessoa, corpo ≤ 500 linhas no imperativo, detalhe em `references/` | `references/skill.md` |
| Command | `commands/<nome>.md` | `description`, `argument-hint`, `allowed-tools`; corpo curto que delega (skill/agent/MCP); `$ARGUMENTS` | `references/command.md` |
| Hook | `src/hooks/<nome>.ts` → `dist/hooks/<nome>.js` + `hooks/hooks.json` | formato wrapper `{"hooks":{…}}`, `node "${CLAUDE_PLUGIN_ROOT}/dist/hooks/…"`, bloqueio = exit 2 + stderr; confirmação = `permissionDecision: "ask"` | `references/hook.md` |
| MCP Tool | `src/mcp/<servidor>.ts` + `src/mcp/manifest.ts` | nome snake_case ≤ 64, `title`, `readOnlyHint`/`destructiveHint`, zod estrito, descrição "faz / retorna / não faz", `structuredContent` + texto; leitura e escrita em ferramentas separadas | `references/mcp-tool.md` |

## Regras transversais

- **Nada de README.md dentro de `agents/` ou `commands/`** — o Claude Code carrega como componente (verificado). Documentação vai para `docs/`.
- Caminhos internos sempre com `${CLAUDE_PLUGIN_ROOT}`; nunca absolutos.
- Invariantes (WIP, evidência, aprovação externa, escopo) são impostas por **hook ou servidor MCP**, não por pedido no prompt.
- Menor privilégio: dê a cada agent só as ferramentas da sua linha na Tool/Permission Matrix (`07-execucao/E4-tool-permission-matrix.md`).
- Descrições curtas: o Claude Code avisa quando as descrições somadas de agents passam de ~15.000 tokens.
- Após criar: `npm run build` (se mexeu em `src/`), `npm run render`, `npm run check`; registre no catálogo (`catalog_register`).

## Referência upstream (somente leitura)

Para profundidade, consulte os originais fixados em `vendor/upstream/claude-plugins-official/plugins/plugin-dev/skills/` (agent-development, skill-development, command-development, hook-development, mcp-integration, plugin-structure) e `…/plugins/mcp-server-dev/skills/build-mcp-server/`. Se o submodule não estiver inicializado: `npm run upstream:sync`. É referência — adapte, não copie.
