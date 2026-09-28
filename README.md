# Maestro — plugin do Claude Code para o ecossistema EXECUTAR

O **Maestro** é um orquestrador multiagente distribuído como Claude Code Plugin. Ele integra as skills oficiais Anthropic
(Engineering, Operations, Design, Marketing, Product Management) e as skills proprietárias EXECUTAR sob **um único
vocabulário de estado**, com:

- **Ledger único** (`07-execucao/estado.json`) com máquina de estados: WIP=1, `DONE` só com evidência e critério de pronto, ação externa só com autorização explícita — impostos por código, não por pedido.
- **Roteamento** intenção → lane (Produto, Engenharia, Design, QA, DevOps, Stakeholders, Operações, Editorial) → uma skill vencedora, com lacunas declaradas em vez de inventadas.
- **Pipeline permanente de ingestão** (RECEIVE → ANALYZE → CLASSIFY → COMPARE → CHECK_CONFLICTS → ADAPT → VALIDATE → TEST → DOCUMENT → INTEGRATE → REGISTER) e **catálogo** de componentes como fonte de verdade.
- **Servidores MCP** próprios (`estado`, `registry`) e **hooks** de guardrail que valem inclusive dentro de subagentes.

## Instalação

**A partir deste repositório (desenvolvimento):**

```bash
git clone --recurse-submodules https://github.com/executar-23/ADM_Copiloto && cd ADM_Copiloto
claude --plugin-dir .                         # sessão com o plugin
claude --plugin-dir . --agent maestro:maestro # Maestro como thread principal
```

**Como marketplace (outro projeto/máquina):**

```
/plugin marketplace add executar-23/ADM_Copiloto
/plugin install maestro@maestro-marketplace
```

Requisitos: Claude Code (testado em 2.1.283) e Node ≥ 20. Nada a instalar via npm para **usar** o plugin (`dist/` é autocontido).

## Uso rápido

| Comando | O que faz |
|---|---|
| `/maestro:estado` | nó ativo, próximo elegível, pendências do usuário, decisões abertas, progresso derivado |
| `/maestro:executar [nó \| intenção]` | executa o próximo nó (ou o indicado) pelo adaptador: skill → saída em arquivo → VERIFY → evidência → DONE |
| `/maestro:verificar <nó>` | verificação independente (subagente `qa-reviewer`, somente leitura) e promoção só com evidência |
| `/maestro:decidir <D#>` | apresenta e registra decisões pendentes com a fonte do usuário |
| `/maestro:ingerir <caminho>` | ingere componentes novos pelo pipeline de 11 estágios |
| `/maestro:validar` | valida ledger, catálogo, convenções, roteamento e ingestões |
| `/maestro:catalogo [busca]` | consulta o catálogo de componentes |

Em outro projeto, o Maestro cria o ledger local com a ferramenta `state_init` quando você pedir.

## Componentes (v0.1.0)

| Camada | Componentes |
|---|---|
| Agents | `maestro` (thread principal), `qa-reviewer`, `evidence-researcher`, `component-analyst` |
| Skills | `maestro-operacao`, `roteamento-lanes`, `estagios-bpm`, `component-ingestion`, `component-authoring` |
| Commands | `estado`, `executar`, `verificar`, `decidir`, `ingerir`, `validar`, `catalogo` |
| MCP (local) | `estado` (13 ferramentas: ledger/máquina de estados), `registry` (12: catálogo, ingestão, roteamento, upstream, fingerprint, validação) |
| MCP (remoto) | `remote` — 4 ferramentas somente leitura, hospedadas em Cloudflare Workers, espelho público do ledger/roteamento. Código testado; **publicação pendente** (`D14`) — ver [`cloudflare-worker/README.md`](cloudflare-worker/README.md) |
| Hooks | `session-context` (SessionStart), `guard-write` e `guard-external` (PreToolUse), `validate-on-write` (PostToolUse) |

Catálogo completo (60 registros, incluindo plugins externos, upstreams e a rota remota): [`catalog/CATALOG.md`](catalog/CATALOG.md).

## Estado do projeto

O ledger segue o ciclo BPM e Qualidade estendido para agentes (E0–E9, Trilha S) e o lançamento PEM-D16 (F0–F8, Trilha L).
Veja [`07-execucao/ESTADO.md`](07-execucao/ESTADO.md): decisões abertas (D1–D11), bloqueios que dependem de você e o que já tem evidência.

## Submissão e rota — TASK-SPACE

Além do plugin Maestro em si, este repositório guarda uma **área de coleta de tarefas** para o Copiloto/Maestro processar em Issues: [`TASK-SPACE/`](TASK-SPACE/README.md). É o inbox de dados de tarefa (backlogs, CSV, planos operacionais) que chegam prontos de fora do pipeline de ingestão de componentes — aqui não entra código, entra conteúdo de tarefa já pronto para virar Issue.

Primeira submissão (sessão de 28/09/2026), 3 lotes:

| Lote | Origem | Conteúdo |
|---|---|---|
| [`2026-09-28_copiloto-ops-runbook-sop-pf24/`](TASK-SPACE/2026-09-28_copiloto-ops-runbook-sop-pf24/) | Auditoria de `executar-23/Copiloto-ops` (Runbook RUN-F1, procedimentos do plugin `executar-cop`, dependências do PF-24) | CSV de 68 linhas (granularidade de passo atômico) + dicionário de dados |
| [`2026-09-28_plano-risco-cognitivo-hub-cms/`](TASK-SPACE/2026-09-28_plano-risco-cognitivo-hub-cms/) | Skill `plano-operacional-rastreavel` sobre o Hub Editorial CMS real (Risco Cognitivo, `CNT-RC-0001`) | Pacote de 4 entregáveis: plano interno, roadmap, backlog para import, calendário |
| [`2026-09-28_plano-editorial-gtm-blog/`](TASK-SPACE/2026-09-28_plano-editorial-gtm-blog/) | Skill `plano-operacional-rastreavel` sobre o Foundation Doc GTM + cronograma real dos 3 pilares (escopo só editorial — engenharia do blog full stack é outra sessão) | Pacote de 4 entregáveis: plano interno, roadmap, backlog para import, calendário |

Ver [`TASK-SPACE/README.md`](TASK-SPACE/README.md) para como o Copiloto/Maestro deve tratar esse material (C-00.2, C-00.5, C-00.8, C-00.9 abaixo se aplicam).

## Desenvolvimento

```bash
npm ci && npm run upstream:sync
npm run check        # gate completo (igual à CI)
npm run test:e2e     # E2E real com claude -p (consome tokens)
```

Documentação: [`docs/`](docs/README.md) · Contratos: [`contratos/`](contratos/README.md) · Regras do repositório: [`CLAUDE.md`](CLAUDE.md) ·
Receber novos componentes: [`docs/process/receiving-components.md`](docs/process/receiving-components.md).

## Referências upstream

`vendor/upstream/` contém, como submodules fixados e somente leitura, [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
(plugin-dev, mcp-server-dev, agent-sdk-dev) e [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) — Apache-2.0.
Nada de lá é carregado pelo plugin; os padrões foram adaptados (registro ING-0001).

## Licença

A DEFINIR pelo dono do repositório.
