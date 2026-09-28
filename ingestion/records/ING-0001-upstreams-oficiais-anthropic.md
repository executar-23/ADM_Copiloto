---
id: ING-0001
titulo: "Upstreams oficiais Anthropic (claude-plugins-official, knowledge-work-plugins)"
status: integrada
estagio_atual: REGISTER
recebido_em: 2026-09-28
origem: "usuário, handoff da sessão de 2026-09-28 (FASE 1: 'clone os repositórios oficiais em vendor/upstream'); decisão D13 (submodules)"
received_dir: null
componentes:
  - { nome: claude-plugins-official, tipo: upstream-reference, decisao: referenciar, destino: vendor/upstream/claude-plugins-official, catalog_id: "upstream-reference:claude-plugins-official" }
  - { nome: knowledge-work-plugins, tipo: upstream-reference, decisao: referenciar, destino: vendor/upstream/knowledge-work-plugins, catalog_id: "upstream-reference:knowledge-work-plugins" }
  - { nome: plugin-dev, tipo: external-plugin, decisao: reutilizar, destino: ".claude/settings.json (enabledPlugins)", catalog_id: "external-plugin:plugin-dev@claude-plugins-official" }
  - { nome: mcp-server-dev, tipo: external-plugin, decisao: referenciar, destino: vendor/upstream/claude-plugins-official/plugins/mcp-server-dev, catalog_id: "external-plugin:mcp-server-dev@claude-plugins-official" }
  - { nome: agent-sdk-dev, tipo: external-plugin, decisao: referenciar, destino: vendor/upstream/claude-plugins-official/plugins/agent-sdk-dev, catalog_id: "external-plugin:agent-sdk-dev@claude-plugins-official" }
  - { nome: engineering, tipo: external-plugin, decisao: referenciar, destino: vendor/upstream/knowledge-work-plugins/engineering, catalog_id: "external-plugin:engineering@knowledge-work-plugins" }
  - { nome: product-management, tipo: external-plugin, decisao: referenciar, destino: vendor/upstream/knowledge-work-plugins/product-management, catalog_id: "external-plugin:product-management@knowledge-work-plugins" }
  - { nome: operations, tipo: external-plugin, decisao: referenciar, destino: vendor/upstream/knowledge-work-plugins/operations, catalog_id: "external-plugin:operations@knowledge-work-plugins" }
  - { nome: "cópia das skills do plugin-dev para skills/", tipo: skill, decisao: rejeitar, destino: null, catalog_id: null }
  - { nome: cowork-plugin-management, tipo: external-plugin, decisao: rejeitar, destino: null, catalog_id: null }
---

# ING-0001 — Upstreams oficiais Anthropic

> Registro permanente do pipeline de ingestão (`docs/process/ingestion-pipeline.md`).

## 1. RECEIVE

- **Origem:** handoff do usuário (2026-09-28) — referências upstream obrigatórias: `anthropics/claude-plugins-official` (plugin-dev, agent-sdk-dev) e `anthropics/knowledge-work-plugins` (engineering e padrões de skills/commands/agents/MCP).
- **Forma de recebimento:** git submodules `shallow`, fixados (D13): `claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2` (commit de 2026-09-25) e `knowledge-work-plugins@da38ec1ee89d41e5380e652a97382695003396e7` (2026-09-24). Licença de ambos: Apache-2.0.
- **Originais imutáveis:** o próprio submodule (SHA no `.gitmodules`/gitlink); `received_dir` não se aplica — o pino é o SHA, conferido pelo validador (`UPSTREAM_PIN`).

## 2. ANALYZE

| Item | Propósito | Conteúdo relevante lido |
|---|---|---|
| `plugin-dev` | toolkit de desenvolvimento de plugins | 7 skills (plugin-structure, agent-/skill-/command-/hook-development, mcp-integration, plugin-settings), agents `agent-creator`, `plugin-validator`, `skill-reviewer`, comando `/plugin-dev:create-plugin` (8 fases), scripts `validate-agent.sh`, `validate-hook-schema.sh`, `test-hook.sh`, `hook-linter.sh` (bash + jq) |
| `mcp-server-dev` | guia de servidores MCP | `build-mcp-server/references/tool-design.md` (anotações obrigatórias, leitura/escrita separadas, `structuredContent`), `versions.md` |
| `agent-sdk-dev` | aplicações com Claude Agent SDK | `/new-sdk-app`, `agent-sdk-verifier-py/ts` |
| KW `engineering`, `product-management`, `operations` | skills por função | 10 + 8 (+ comando) + 9 skills; `.mcp.json` com conectores HTTP; `CONNECTORS.md` com placeholders `~~categoria` |
| KW `cowork-plugin-management` | criar/customizar plugins no Cowork | `create-cowork-plugin`, `cowork-plugin-customizer` |

## 3. CLASSIFY

| Item | Tipo | Camada no Maestro | Confiança |
|---|---|---|---|
| repositórios | upstream-reference | referência (não carregada) | alta |
| plugin-dev | external-plugin | ferramenta de **desenvolvimento** do Maestro | alta |
| mcp-server-dev, agent-sdk-dev | external-plugin | referência normativa | alta |
| KW engineering/PM/operations | external-plugin | skills **roteadas** pelas lanes (instaladas no ambiente do usuário, não copiadas) | alta |

## 4. COMPARE

Padrões Anthropic adotados (com o que mudou para o Maestro):

- **Estrutura de plugin** (plugin-structure): manifesto em `.claude-plugin/`, componentes na raiz, `${CLAUDE_PLUGIN_ROOT}`, kebab-case. Adotado integralmente.
- **Commands como legado** (create-plugin, fase 2): o plugin-dev prefere skills; o usuário pediu Command ≠ Skill → mantido `commands/` como camada fina (DE-003).
- **Agents** (agent-development): frontmatter `name/description/model/color/tools`, `<example>` na descrição. Adotado; somado o lint `IGNORED_IN_PLUGIN`.
- **plugin-validator → qa-reviewer**: mesma ideia (revisor somente leitura), adaptada para verificar DoD de nó do ledger.
- **Hooks** (hook-development): formato wrapper de plugin, `exit 2` bloqueia, prompt/command hooks. Adotado; scripts em Node (não bash+jq) para portabilidade e testes.
- **MCP** (mcp-integration + mcp-server-dev/tool-design): nomes `mcp__plugin_<plugin>_<server>__<tool>`, anotações, leitura/escrita separadas, `structuredContent`. Adotado nos servidores `estado` e `registry`.
- **CONNECTORS `~~categoria`** (Knowledge Work): adotado em `docs/architecture/mcp.md` para conectores futuros.

## 5. CHECK_CONFLICTS

- Conflito: plugin-dev recomenda skills no lugar de commands × pedido do usuário → resolvido por DE-003 (registrado).
- Conflito: scripts de validação do plugin-dev (`validate-hook-schema.sh`) esperam o formato de *settings* (eventos no topo), não o wrapper de plugin → não reutilizados diretamente; validação coberta por `claude plugin validate` + testes próprios.
- Risco: conteúdo do vendor ser carregado como componente → **verificado que não** (`claude --plugin-dir . plugin details`: vendor não entra no inventário).
- Risco: `CLAUDE.md` aninhado em `knowledge-work-plugins/partner-built/slack/` pode ser lido sob demanda se o Claude abrir arquivos ali — aceito (somente leitura; conteúdo é dado, I-07).

## 6. ADAPT

| Item | Decisão | Motivo |
|---|---|---|
| repositórios | **referenciar** | fonte normativa fixada; nunca editada (hook `guard-write`) |
| plugin-dev | **reutilizar** | habilitado em `.claude/settings.json` para desenvolver o Maestro; não copiado |
| mcp-server-dev, agent-sdk-dev | **referenciar** | padrões aplicados; agent-sdk-dev reservado para F2 (Vera) se virar aplicação |
| KW engineering/PM/operations | **referenciar** | skills oficiais roteadas por lane; instalação é ação do usuário (PM ausente — D4) |
| copiar skills do plugin-dev para `skills/` | **rejeitar** | duplicação sem ganho (R1); `component-authoring` condensa só as regras extras do Maestro |
| cowork-plugin-management | **rejeitar** | voltado ao Cowork; o pipeline do Maestro cobre ingestão/customização neste repositório |

Padrões adaptados em componentes próprios (integrados em ING-0002): `qa-reviewer` (plugin-validator), `component-authoring` (plugin-dev + mcp-server-dev), servidores MCP (tool-design).

## 7. VALIDATE

- `claude plugin validate --strict` (manifesto, marketplace e conteúdo sem `marketplace.json`) — verde.
- `node dist/cli/maestro.js validate` — confere `origin.sha` dos `upstream-reference` contra o gitlink (`git ls-files -s`) — verde.

## 8. TEST

- `tests/integration/mcp-registry.test.ts` — `upstream_search` no repositório real encontra `plugin-structure` com SHA de 40 caracteres; sem vendor retorna `UPSTREAM_NOT_INITIALIZED`.
- Verificação manual registrada: plugin com cópia completa de um plugin KW em `vendor/upstream/` → inventário com 0 skills/0 agents.

## 9. DOCUMENT

`README.md` (§Referências upstream), `docs/architecture/decisions.md` (DE-002, DE-003), `docs/maintenance.md` (§Upstream: atualização + COMPARE), `skills/component-authoring/SKILL.md` (§Referência upstream).

## 10. INTEGRATE

`vendor/upstream/` (submodules) + `.gitmodules`; `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins: plugin-dev@claude-plugins-official`); `scripts/upstream-sync.sh`.

## 11. REGISTER

Catálogo: `upstream-reference:claude-plugins-official`, `upstream-reference:knowledge-work-plugins`, `external-plugin:plugin-dev@claude-plugins-official` (active), `external-plugin:mcp-server-dev@claude-plugins-official`, `external-plugin:agent-sdk-dev@claude-plugins-official`, `external-plugin:engineering@knowledge-work-plugins`, `external-plugin:product-management@knowledge-work-plugins`, `external-plugin:operations@knowledge-work-plugins` (reference). Nó `ING-0001` no ledger com evidência deste registro. Status: **integrada**.
