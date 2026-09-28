# Camada MCP

> MCP é a camada de **capacidade executável** dos agents: regras de negócio (invariantes, validação, hashing, inspeção)
> vivem em código testável (`src/lib/`) e são expostas como ferramentas. Padrão aplicado: `mcp-server-dev` (Anthropic) —
> `registerTool`, schemas zod estritos, anotações `title`/`readOnlyHint`/`destructiveHint`, leitura e escrita em ferramentas
> separadas, `structuredContent` + texto.

## Servidores

| Servidor | Arquivo | Transporte | Papel |
|---|---|---|---|
| `estado` | `src/mcp/estado.ts` → `dist/mcp/estado.js` | stdio local (Node ≥ 20) | ledger único + máquina de estados (C-01) |
| `registry` | `src/mcp/registry.ts` → `dist/mcp/registry.js` | stdio local (Node ≥ 20) | catálogo, ingestão, roteamento, upstream, fingerprint, validação |

Declarados em `.mcp.json` com `${CLAUDE_PLUGIN_ROOT}`. Os bundles são autocontidos (esbuild): o plugin instalado não precisa de `npm install`.
Nome visível ao Claude: `mcp__plugin_maestro_<servidor>__<ferramenta>` (verificado em `claude -p --plugin-dir .`; as ferramentas chegam como *deferred* e são carregadas via ToolSearch).

## Ferramentas

| Servidor | Ferramenta | Título | Efeito |
|---|---|---|---|
| `estado` | `state_summary` | Resumo do estado | leitura |
| `estado` | `node_list` | Listar nós | leitura |
| `estado` | `node_get` | Obter nó | leitura |
| `estado` | `node_next` | Próximo nó elegível | leitura |
| `estado` | `decision_list` | Listar decisões | leitura |
| `estado` | `state_validate` | Validar ledger | leitura |
| `estado` | `state_init` | Inicializar ledger | escrita (workspace) |
| `estado` | `node_create` | Criar nó | escrita (workspace) |
| `estado` | `node_update` | Atualizar campos do nó | escrita (workspace) |
| `estado` | `node_transition` | Transicionar nó | escrita (workspace) |
| `estado` | `evidence_add` | Registrar evidência | escrita (workspace) |
| `estado` | `decision_record` | Registrar decisão/divergência/change control | escrita (workspace) |
| `estado` | `authorization_grant` | Conceder autorização externa (humano) | escrita · **confirmação humana** |
| `registry` | `catalog_list` | Listar catálogo | leitura |
| `registry` | `catalog_get` | Obter componente | leitura |
| `registry` | `catalog_search` | Buscar no catálogo | leitura |
| `registry` | `component_inspect` | Inspecionar componente recebido | leitura |
| `registry` | `conflict_check` | Checar conflitos e duplicações | leitura |
| `registry` | `upstream_search` | Buscar nos upstreams oficiais | leitura |
| `registry` | `routing_lookup` | Consultar roteamento de lanes | leitura |
| `registry` | `skill_fingerprint` | Localizar skill e medir drift | leitura |
| `registry` | `workspace_validate` | Validar workspace | leitura |
| `registry` | `ingestion_list` | Listar ingestões | leitura |
| `registry` | `ingestion_start` | Abrir ingestão (RECEIVE) | escrita (workspace) |
| `registry` | `catalog_register` | Registrar componente no catálogo | escrita (workspace) |

Fonte única dos metadados: `src/mcp/manifest.ts`. O validador confere que `tools:` de agents/commands só citam ferramentas existentes e que cada ferramenta tem registro `mcp-tool:<servidor>.<nome>` no catálogo.

## Quem pode usar o quê (menor privilégio)

| Agent | estado | registry |
|---|---|---|
| `maestro` | todas | todas |
| `qa-reviewer` | `node_get`, `state_summary`, `state_validate` | `workspace_validate`, `catalog_get`, `component_inspect`, `conflict_check` |
| `evidence-researcher` | `node_get` | — |
| `component-analyst` | — | `component_inspect`, `conflict_check`, `upstream_search`, `catalog_search`, `catalog_get`, `catalog_list`, `skill_fingerprint`, `routing_lookup` |

Nenhuma folha recebe `node_transition` ou `authorization_grant` (C-04: só o Maestro promove; só o humano autoriza).

## Guardrails sobre MCP

- `authorization_grant` é `destructiveHint: true` **e** o hook `guard-external` força `ask` — a autorização sempre passa por um humano.
- Ferramentas MCP de **outros** servidores cujo nome indica escrita (`create`, `update`, `delete`, `send`, `publish`, `deploy`, …) disparam `ask` no hook `guard-external` quando o workspace é do Maestro, salvo nó ativo com `efeito_externo` + autorização (I-05).
- Escrita direta em `07-execucao/estado.json` é bloqueada: o ledger só muda pelas ferramentas do servidor `estado`.

## Expansão

### Nova ferramenta num servidor existente
Siga `skills/component-authoring/references/mcp-tool.md`: manifesto → implementação com `tool(...)` → regra na lib → teste de integração → registro no catálogo → `npm run build && npm run check`.

### Novo servidor próprio
`src/mcp/<nome>.ts` + entrada em `scripts/build.mjs` + `.mcp.json` + registro `mcp-server:<nome>` (com anti-overkill) + adicionar o servidor em `disabledMcpjsonServers` de `.claude/settings.json` (raiz = projeto).

### Conectores externos (padrão Knowledge Work)
Skills descrevem categorias, não produtos: `~~tracker`, `~~knowledge base`, `~~deploy`, `~~chat`. O conector concreto entra em `.mcp.json` (`"type": "http", "url": …`) **via ingestão** (ING-NNNN), com esquema lido e registrado. Enquanto o esquema não for lido: `USER_ACTION_REQUIRED` (nunca estimar).

| Categoria | Candidatos citados no pacote | Situação |
|---|---|---|
| `~~knowledge base` | Notion; Drive (EXECUTAR_CONTROL_CENTER) | esquemas não lidos — pendente |
| `~~tracker` | Linear (Executar-Rotina / EXE) | conflito CONF-01 aberto — reverificar antes de escrever |
| `~~deploy` | Vercel, Railway, Supabase | esquemas não lidos; Cloudflare **sem conector** |
| `executar` | conector proprietário | esquema não lido |
