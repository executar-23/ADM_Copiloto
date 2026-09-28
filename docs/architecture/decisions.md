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

