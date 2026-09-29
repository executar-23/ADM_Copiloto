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
| `~~deploy` | Vercel, Railway, Supabase | esquemas não lidos |
| `~~cloudflare` | Cloudflare Developer Platform | presente em algumas sessões (`DIV-006`); lista/lê Workers e gerencia D1/KV/R2/Hyperdrive (inclusive criar namespace KV — usado para `OAUTH_KV`, CC-003) — **sem ferramenta de deploy nem de gestão de Access/Zero Trust**. Usado para a rota remota abaixo (verificação e provisionamento de infra, não publicação nem configuração de Access) |
| `executar` | conector proprietário | esquema não lido |

## Rota remota (Cloudflare Workers)

Além dos dois servidores locais, o repositório inclui um **terceiro servidor MCP, remoto e somente
leitura**: `cloudflare-worker/` — um espelho público de `07-execucao/estado.json` e
`mapa/roteamento.json`, pensado para ser adicionado como conector direto em `claude.ai` (ou qualquer
cliente MCP), sem clonar o repositório. Detalhe completo, deploy e o que já foi testado (mas não
publicado, por falta de credencial nesta sessão): `cloudflare-worker/README.md`. Registro no ledger:
nó `CF-ROUTE-0001` (`BLOCKED` · `USER_ACTION_REQUIRED`) e decisão `D14` (URL real, após o deploy).

Diferença de arquitetura: um Worker não tem filesystem — por isso este servidor **não** é uma cópia dos
locais. Ele busca o JSON via `raw.githubusercontent.com` a cada chamada e reaplica as mesmas funções
puras de `src/lib/estado/machine.ts`/`src/lib/routing/routing.ts`, sem duplicar regra de negócio.
Ferramentas de escrita (`registry`, `estado` write) continuam só locais — não fazem sentido sem
filesystem nem sem o mecanismo de aprovação (I-05) que os hooks locais impõem.

### Gateway autenticado (`/mcp/auth`) — Fase 1, experimental, CC-003

O mesmo Worker também hospeda um **quarto servidor MCP**, `remote-auth` (`/mcp/auth`): OAuth 2.1 +
Client ID Metadata Documents via `@cloudflare/workers-oauth-provider`, identidade via Cloudflare
Access (decisão `D15`). É a Fase 1 ("Foundation") de uma proposta de arquitetura maior — a
`ADR-MCP-REMOTE-001` (texto completo em
`07-execucao/evidencias/cc-003-adr-mcp-remote-001/adr-mcp-remote-001-proposta.md`, registrada como
`CC-003` no ledger) — que pede trocar o espelho público por um Custom Connector autenticado,
integrado a um Blog e um CMS do ecossistema EXECUTAR. Essa proposta está `PROPOSED`, não aprovada
por inteiro: só a Fase 1 foi explicitamente aprovada pelo usuário (`AskUserQuestion`, 2026-09-29).
As Fases 2/3 (integração real com Blog/CMS) continuam bloqueadas em `CC-003` até as APIs reais serem
inspecionadas — nada foi inferido (I-02).

A rota `/mcp` (DE-012) **não foi alterada**: continua pública, sem autenticação, mesmo comportamento
de antes. `/mcp/auth` é aditiva. Detalhe completo — identidade (`ctx.access` nativo + fallback manual
via `jose`/JWKS), o que falta para usar de verdade (Access application real, secrets), evidência de
teste local: `cloudflare-worker/README.md` e
`07-execucao/evidencias/cloudflare-worker/fase1-oauth-dev.txt`.
