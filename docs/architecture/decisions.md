# Log de decisões de engenharia

> Formato **provisório** (Contexto · Decisão · Alternativas · Consequências · Fonte). O formato único de ADR é a
> **D10** (oficial `engineering:architecture` × RC `templates/adr.md`), ainda aberta — quando decidida, estas entradas migram.
> Decisões de produto/escopo (D1–D13) vivem no ledger (`07-execucao/ESTADO.md` § Decisões).

## DE-001 — Raiz do repositório = raiz do plugin (+ marketplace na raiz)
- **Contexto:** o handoff pediu a estrutura oficial de plugin na raiz; o pacote Maestro previa Modo A (projeto) na v0.
- **Decisão:** raiz = plugin `maestro`; `.claude-plugin/marketplace.json` com `source: "./"` torna o repo instalável (`/plugin marketplace add executar-23/ADM_Copiloto`).
- **Alternativas:** plugin em `plugins/maestro/` com marketplace na raiz (padrão dos upstreams) — mais isolado, mas afasta docs/tests do plugin e diverge do pedido.
- **Consequências:** raiz também é projeto → `.mcp.json` carregado duas vezes; mitigado com `disabledMcpjsonServers` (verificado). O validador oficial só inspeciona componentes sem `marketplace.json` → `scripts/validate-official.mjs` valida uma cópia sem ele. O validador avisa que `CLAUDE.md` na raiz não é contexto do plugin — aceito por política (é memória do projeto de desenvolvimento), único aviso na lista de aceitos.
- **Fonte:** handoff do usuário (2026-09-28); CC-002; D6 (parcial).

## DE-002 — Upstreams como submodules fixados, somente leitura
- **Decisão:** `vendor/upstream/{claude-plugins-official,knowledge-work-plugins}` como submodules `shallow`, SHA registrado no catálogo; hook bloqueia escrita.
- **Alternativas:** snapshot parcial versionado; clone ignorado.
- **Consequências:** sessões novas rodam `npm run upstream:sync`; atualização = diff de SHA + COMPARE. Conteúdo do vendor não é carregado como componente (verificado).
- **Fonte:** D13 (usuário).

## DE-003 — `commands/` como camada de entrada, apesar de "legado" no plugin-dev
- **Contexto:** o plugin-dev recomenda comandos como skills; o usuário pediu Command ≠ Skill.
- **Decisão:** `commands/*.md` finos que delegam para skills/agents/MCP; procedimento mora nas skills.
- **Consequências:** skills e commands compartilham o namespace `/maestro:` → `conflict_check` acusa colisão.

## DE-004 — TypeScript + esbuild com `dist/` versionado
- **Decisão:** lógica em `src/` (TS estrito), bundles ESM minificados e divididos em chunks em `dist/` (~1 MB), commitados.
- **Alternativas:** servidor MCP sem dependências (protocolo à mão — frágil); `npx` na instalação (exige rede/npm no usuário; desaconselhado pelo mcp-server-dev para distribuição).
- **Consequências:** CI checa que `dist/` corresponde ao código (`git diff --exit-code dist`); hooks rodam em ~0,1 s.

## DE-005 — Ledger estruturado (`estado.json`) + projeção (`ESTADO.md`)
- **Decisão:** CC-001. Invariantes impostas no servidor `estado`; `ESTADO.md` gerado e bloqueado para edição.

## DE-006 — Catálogo com um JSON por componente
- **Decisão:** `catalog/components/<tipo>/<nome>.json` validado por zod (schema exportado em `catalog/schema/`); `CATALOG.md` gerado.
- **Alternativas:** arquivo único (conflitos de merge em lotes); YAML (menos estrito).
- **Consequências:** lotes grandes geram arquivos independentes; o validador cruza catálogo × disco × manifesto MCP.

## DE-007 — Maestro na thread principal; folhas sem aninhamento
- **Decisão:** `claude --agent maestro:maestro` com `tools: Agent(qa-reviewer, evidence-researcher, component-analyst)`; commands funcionam também sem `--agent`.
- **Alternativas:** Maestro como subagente (perde a conversa; depende de spawn aninhado, que varia por versão).
- **Consequências:** EV-009 (profundidade 1) coberto pelo E2E.

## DE-008 — Guardrails em hooks do plugin, nunca no frontmatter de agents
- **Contexto:** subagente de plugin ignora `hooks`, `mcpServers`, `permissionMode` no frontmatter.
- **Decisão:** `hooks/hooks.json` (nível do plugin); lint `IGNORED_IN_PLUGIN` recusa esses campos em `agents/*.md`.
- **Consequências:** EV-010 testado (hooks via stdin + E2E com subagente).

## DE-009 — Sem `agent` padrão no `settings.json` do plugin
- **Decisão:** o plugin não força o Maestro como thread principal em toda sessão onde estiver habilitado; o usuário escolhe `claude --agent maestro:maestro`.
- **Motivo:** evitar sequestrar sessões de outros projetos; os hooks só agem em workspace do Maestro pelo mesmo motivo.

## DE-010 — Hook de efeito externo usa `ask`, não bloqueio
- **Decisão:** `guard-external` devolve `permissionDecision: "ask"` (confirmação humana) em vez de `exit 2`, salvo nó ativo com autorização registrada. `MAESTRO_EXTERNAL_GUARD=off` desliga (decisão explícita do usuário no ambiente, ex.: CI).
- **Motivo:** I-05 exige aprovação, não proibição; bloqueio total impediria o próprio fluxo de publicação autorizada.

## DE-011 — Ledger nunca cai para a raiz do plugin
- **Contexto:** eval EV-014 (rodada 4) mostrou que, num projeto sem ledger, o servidor `estado` lia `07-execucao/estado.json` da cópia do plugin — o usuário veria o estado do repositório do plugin como se fosse o do projeto (I-06).
- **Decisão:** `resolveWorkspace({ allowPluginRoot: false })` no servidor `estado`; o catálogo continua podendo ser lido da raiz do plugin (somente leitura) para `/maestro:catalogo` funcionar em qualquer projeto.
- **Consequências:** projeto novo → `NOT_INITIALIZED` → `state_init` com confirmação; teste `tests/unit/workspace.test.ts`.


## DE-012 — Rota MCP remota como espelho público somente leitura (Cloudflare Workers), não uma cópia dos servidores locais
- **Contexto:** pedido do usuário para usar o conector Cloudflare e criar uma rota MCP incluída no plugin. Um Worker não tem filesystem; os servidores `estado`/`registry` são construídos em cima de `node:fs`.
- **Decisão:** novo subprojeto `cloudflare-worker/` (`McpAgent` do pacote `agents`, padrão oficial `mcp-server-dev`), com só 4 ferramentas somente leitura (`state_summary`, `node_get`, `decision_list`, `routing_lookup`), buscando `07-execucao/estado.json`/`mapa/roteamento.json` via `raw.githubusercontent.com` a cada chamada e reaplicando as mesmas funções puras de `src/lib/estado/machine.ts`/`src/lib/routing/routing.ts` — nunca reimplementando a regra.
- **Alternativas:** (a) portar `estado`/`registry` inteiros para o Worker com D1/KV como backing store — muito maior, réplica de estado a manter, viola anti-overkill para o que foi pedido; (b) bundlar o catálogo estaticamente no deploy — descartado por enquanto (só 2 arquivos pequenos são buscados; sem necessidade de build step extra).
- **Consequências:** ferramentas de escrita continuam só locais (fazem sentido com os hooks de aprovação, I-05, que um Worker sem sessão do usuário não tem como impor). `discoverPluginComponents` passou a reconhecer `cloudflare-worker/src/index.ts` como "no disco" para os componentes `mcp-server:remote`/`mcp-tool:remote.*`, sem pretender que `.mcp.json` os carregue localmente (são dois mecanismos de distribuição diferentes: plugin local via stdio, conector remoto via HTTP).
- **Não publicado por esta sessão:** o conector Cloudflare disponível (`Cloudflare Developer Platform`) só lista/lê Workers e gerencia D1/KV/R2/Hyperdrive — sem ferramenta de deploy — e o `wrangler` local não tem `CLOUDFLARE_API_TOKEN` neste ambiente. Código verificado (typecheck limpo, `wrangler deploy --dry-run` empacota, handshake MCP completo com dados reais via `wrangler dev`) mas nunca "promovido" a publicado sem evidência de publicação real (I-03/I-04) — ver `D14`, `07-execucao/evidencias/cloudflare-worker/`.

## DE-013 — Gateway OAuth (`/mcp/auth`) aditivo ao espelho público; McpAgent em vez do handler stateless; identidade Cloudflare Access com fallback JWKS
- **Contexto:** o usuário propôs a `ADR-MCP-REMOTE-001` (texto completo em `07-execucao/evidencias/cc-003-adr-mcp-remote-001/`, registrada como `CC-003`, status `PROPOSED`): trocar a rota Cloudflare por um Custom Connector autenticado (OAuth 2.1 + CIMD) integrado a um Blog e um CMS do ecossistema EXECUTAR. Aprovou explicitamente só a Fase 1 ("Foundation": OAuth discovery + CIMD + PKCE + uma tool `whoami`), com `executar-blogg` confirmado como o Blog e Cloudflare Access (`D15`) como Identity Provider.
- **Decisão:** nova rota `/mcp/auth` no MESMO Worker, usando `@cloudflare/workers-oauth-provider` (biblioteca oficial), com `resourceMetadata.resource`/`authorization_servers` calculados a partir do `origin` da primeira requisição (memoizado) em vez de hardcoded — o hostname real (`workers.dev` do subdomínio da conta, hoje desconhecido; ou um domínio próprio depois) não pode ser adivinhado na construção do `OAuthProvider` (I-02). Identidade via Cloudflare Access: primário `ctx.access` (integração nativa do runtime), fallback validação manual do header `Cf-Access-Jwt-Assertion` via JWKS (`jose`) para quando a Access application é "self-hosted" (hostname/path) em vez do toggle nativo — cobre os dois jeitos documentados de proteger um Worker sem eu poder testar qual o usuário vai escolher. A rota `/mcp` (DE-012) não foi tocada.
- **Alternativas:** (a) usar `createMcpHandler` stateless do pacote `agents` (a própria biblioteca `agents@0.24.0` marca `McpAgent` como `@deprecated`/"feature-frozen", recomendando esse handler, e a própria ADR também prefere stateless quando não há necessidade real de estado, §6/§23) — rejeitada nesta etapa porque exige um "SDK v2" (`@modelcontextprotocol/server`, pacote distinto do `@modelcontextprotocol/sdk` já usado no projeto) sem compatibilidade verificada nesta sessão; reusar o padrão `McpAgent` já testado (mesmo usado por `MaestroRemote`) é o escopo mínimo para provar a Fase 1 — migrar fica para depois, com avaliação própria do SDK v2. (b) hardcodear a URL de produção assumindo um subdomínio — rejeitada (I-02: não há como saber o `workers.dev` da conta sem consultá-la, e a conta ainda não tem deploy real).
- **Consequências:** novo Durable Object (`MaestroRemoteAuth`, migração `v2` separada da `v1` existente) e namespace KV real (`OAUTH_KV`, criado nesta sessão via `kv_namespace_create` — não inventado). Compat flag `global_fetch_strictly_public` adicionada (exigida para CIMD). `wrangler.jsonc` ganhou um bloco `access.dev` (só afeta `wrangler dev` local, nunca produção) para testar com e sem identidade simulada. Testado localmente (discovery, challenge `401` em `/mcp/auth`, `/authorize` falha fechado sem identidade e passa da checagem de identidade com ela simulada) — não exercitado ponta a ponta com um cliente OAuth real nem com a Access application real (ainda não configurada pelo usuário). Fases 2/3 (Blog/CMS) continuam bloqueadas em `CC-003`.
- **Fonte:** usuário, via `/mcp__Cloudflare_Developer_Platform__workers-prompt-full` (ADR-MCP-REMOTE-001, 2026-09-29) + respostas em `AskUserQuestion` (Fase 1 aprovada; `executar-blogg`; Cloudflare Access).
