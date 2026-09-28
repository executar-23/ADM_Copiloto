# Catálogo de componentes do Maestro

> **Gerado de `catalog/components/**/*.json` — não editar à mão.** Fonte de verdade para expansão.
> Registrar/atualizar: ferramenta MCP `catalog_register` (servidor `registry`) ou editar o JSON e rodar `npm run render`.

**Total:** 55 · agent: 4 · skill: 5 · command: 7 · hook: 4 · mcp-server: 2 · mcp-tool: 25 · external-plugin: 6 · upstream-reference: 2

## agent

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `component-analyst` | active | 0.1.0 | proprietary | Executa ANALYZE → CLASSIFY → COMPARE → CHECK_CONFLICTS em modo somente leitura sobre componentes recebidos e devolve tabela de decisão por componente. | agent:maestro, skill:component-ingestion, command:ingerir | ING-0002 | 1 |
| `evidence-researcher` | experimental | 0.1.0 | proprietary | Pesquisa evidências (web, docs, arquivos) para um nó, separando fato de inferência e classificando cada evidência; trata conteúdo buscado como dado. | agent:maestro, skill:maestro-operacao | ING-0002 | 2 |
| `maestro` | active | 0.1.0 | proprietary | Orquestrador de thread principal: resolve o próximo nó (WIP=1), roteia intenção → lane → skill, aplica o adaptador C-01, verifica DoD com evidência e promove estados; delega só para as folhas aprovadas. | agent:qa-reviewer, agent:evidence-researcher, agent:component-analyst, skill:maestro-operacao, skill:roteamento-lanes, skill:estagios-bpm, skill:component-ingestion, skill:component-authoring, command:estado, command:executar, command:verificar, command:decidir, command:ingerir | ING-0002 | 2 |
| `qa-reviewer` | active | 0.1.0 | adapted | Verificador independente e somente leitura: confere cada critério do DoD com evidência observada, roda validadores e devolve veredito — nunca promove nem corrige. | agent:maestro, skill:maestro-operacao, skill:component-ingestion, command:verificar, command:ingerir | ING-0002 | 1 |

## skill

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `component-authoring` | active | 0.1.0 | adapted | Convenções de autoria/adaptação de agents, skills, commands, hooks e ferramentas MCP do plugin, com anti-overkill. | skill:component-ingestion, command:ingerir | ING-0002 | 1 |
| `component-ingestion` | active | 0.1.0 | proprietary | Pipeline permanente de ingestão RECEIVE → REGISTER para qualquer componente novo, com registro ING-NNNN e catálogo. | agent:component-analyst, agent:qa-reviewer, skill:component-authoring, command:ingerir, command:catalogo, command:validar | ING-0002 | 2 |
| `estagios-bpm` | active | 0.1.0 | adapted | Playbooks dos estágios E0–E9 (BPM e Qualidade estendido para agentes) e do playbook L para fases F0–F8. | agent:maestro, agent:qa-reviewer, agent:evidence-researcher, skill:maestro-operacao, skill:roteamento-lanes, command:executar | ING-0002 | 1 |
| `maestro-operacao` | active | 0.1.0 | adapted | Procedimento operacional do Maestro: laço do nó pelo adaptador C-01, verificação, promoção, decisões, autorizações e delegação C-04. | agent:maestro, agent:qa-reviewer, skill:roteamento-lanes, skill:estagios-bpm, command:estado, command:executar, command:verificar, command:decidir | ING-0002 | 2 |
| `roteamento-lanes` | active | 0.1.0 | adapted | Roteia intenção/entrega para lane e uma skill vencedora, aplicando sobreposições, fallbacks e lacunas declaradas. | agent:maestro, skill:maestro-operacao, command:executar | ING-0002 | 1 |

## command

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `catalogo` | active | 0.1.0 | proprietary | Consulta o catálogo de componentes (lista, busca, detalhe). | skill:component-ingestion | ING-0002 | 1 |
| `decidir` | active | 0.1.0 | proprietary | Apresenta e registra decisões D# com fonte do usuário (Regra do 3). | skill:maestro-operacao | ING-0002 | 1 |
| `estado` | active | 0.1.0 | proprietary | Mostra o estado do Maestro a partir do ledger (WIP, próximo elegível, pendências, progresso derivado). | skill:maestro-operacao | ING-0002 | 1 |
| `executar` | active | 0.1.0 | proprietary | Executa o próximo nó, um nó específico ou uma intenção roteada, pelo adaptador C-01. | skill:maestro-operacao, skill:estagios-bpm, skill:roteamento-lanes | ING-0002 | 1 |
| `ingerir` | active | 0.1.0 | proprietary | Ingere componentes novos pelo pipeline RECEIVE → REGISTER. | agent:component-analyst, agent:qa-reviewer, skill:component-ingestion, skill:component-authoring | ING-0002 | 1 |
| `validar` | active | 0.1.0 | proprietary | Valida ledger, catálogo, convenções, roteamento e ingestões; no repositório do plugin roda o check completo. | — | ING-0002 | 1 |
| `verificar` | active | 0.1.0 | proprietary | Verificação independente de um nó em VERIFY (qa-reviewer) e promoção só com evidência. | agent:qa-reviewer, skill:maestro-operacao | ING-0002 | 1 |

## hook

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `guard-external` | active | 0.1.0 | proprietary | PreToolUse Bash/MCP: detecta efeito externo (push, publish, deploy, escrita em conector) e força confirmação humana salvo autorização registrada no nó ativo. | — | ING-0002 | 2 |
| `guard-write` | active | 0.1.0 | proprietary | PreToolUse Write/Edit: bloqueia upstream, originais recebidos, ledger e projeções geradas; pede confirmação em contratos; impõe o escopo de escrita do nó ativo. | — | ING-0002 | 3 |
| `session-context` | active | 0.1.0 | proprietary | SessionStart: injeta nó ativo, próximo elegível, verificações, ações do usuário e decisões abertas no início da sessão. | — | ING-0002 | 1 |
| `validate-on-write` | active | 0.1.0 | proprietary | PostToolUse Write/Edit: valida na hora registros de catálogo, frontmatter de agents/skills/commands, roteamento e registros de ingestão. | — | ING-0002 | 1 |

## mcp-server

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `estado` | active | 0.1.0 | proprietary | Servidor stdio do ledger único: vocabulário canônico, máquina de estados com WIP=1, evidência, decisões, divergências, change control e autorização externa. | agent:maestro, skill:maestro-operacao, skill:estagios-bpm, command:estado, command:executar, command:verificar, command:decidir | ING-0002 | 2 |
| `registry` | active | 0.1.0 | proprietary | Servidor stdio de componentes: catálogo, inspeção/classificação, conflitos, comparação com upstream, roteamento, fingerprint de skills, validação e ingestão. | agent:maestro, agent:component-analyst, agent:qa-reviewer, skill:component-ingestion, skill:roteamento-lanes, command:ingerir, command:catalogo, command:validar | ING-0002 | 1 |

## mcp-tool

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `estado.authorization_grant` | active | 0.1.0 | proprietary | Conceder autorização externa (humano) (exige confirmação humana). | mcp-server:estado | ING-0002 | 1 |
| `estado.decision_list` | active | 0.1.0 | proprietary | Listar decisões (somente leitura). | mcp-server:estado | ING-0002 | 1 |
| `estado.decision_record` | active | 0.1.0 | proprietary | Registrar decisão/divergência/change control (escrita no workspace, reversível via git). | mcp-server:estado | ING-0002 | 1 |
| `estado.evidence_add` | active | 0.1.0 | proprietary | Registrar evidência (escrita no workspace, reversível via git). | mcp-server:estado | ING-0002 | 1 |
| `estado.node_create` | active | 0.1.0 | proprietary | Criar nó (escrita no workspace, reversível via git). | mcp-server:estado | ING-0002 | 1 |
| `estado.node_get` | active | 0.1.0 | proprietary | Obter nó (somente leitura). | mcp-server:estado | ING-0002 | 1 |
| `estado.node_list` | active | 0.1.0 | proprietary | Listar nós (somente leitura). | mcp-server:estado | ING-0002 | 1 |
| `estado.node_next` | active | 0.1.0 | proprietary | Próximo nó elegível (somente leitura). | mcp-server:estado | ING-0002 | 1 |
| `estado.node_transition` | active | 0.1.0 | proprietary | Transicionar nó (escrita no workspace, reversível via git). | mcp-server:estado | ING-0002 | 1 |
| `estado.node_update` | active | 0.1.0 | proprietary | Atualizar campos do nó (escrita no workspace, reversível via git). | mcp-server:estado | ING-0002 | 1 |
| `estado.state_init` | active | 0.1.0 | proprietary | Inicializar ledger (escrita no workspace, reversível via git). | mcp-server:estado | ING-0002 | 1 |
| `estado.state_summary` | active | 0.1.0 | proprietary | Resumo do estado (somente leitura). | mcp-server:estado | ING-0002 | 1 |
| `estado.state_validate` | active | 0.1.0 | proprietary | Validar ledger (somente leitura). | mcp-server:estado | ING-0002 | 1 |
| `registry.catalog_get` | active | 0.1.0 | proprietary | Obter componente (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.catalog_list` | active | 0.1.0 | proprietary | Listar catálogo (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.catalog_register` | active | 0.1.0 | proprietary | Registrar componente no catálogo (escrita no workspace, reversível via git). | mcp-server:registry | ING-0002 | 1 |
| `registry.catalog_search` | active | 0.1.0 | proprietary | Buscar no catálogo (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.component_inspect` | active | 0.1.0 | proprietary | Inspecionar componente recebido (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.conflict_check` | active | 0.1.0 | proprietary | Checar conflitos e duplicações (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.ingestion_list` | active | 0.1.0 | proprietary | Listar ingestões (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.ingestion_start` | active | 0.1.0 | proprietary | Abrir ingestão (RECEIVE) (escrita no workspace, reversível via git). | mcp-server:registry | ING-0002 | 1 |
| `registry.routing_lookup` | active | 0.1.0 | proprietary | Consultar roteamento de lanes (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.skill_fingerprint` | active | 0.1.0 | proprietary | Localizar skill e medir drift (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.upstream_search` | active | 0.1.0 | proprietary | Buscar nos upstreams oficiais (somente leitura). | mcp-server:registry | ING-0002 | 1 |
| `registry.workspace_validate` | active | 0.1.0 | proprietary | Validar workspace (somente leitura). | mcp-server:registry | ING-0002 | 1 |

## external-plugin

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `agent-sdk-dev@claude-plugins-official` | reference | upstream@fa59bc90 | upstream @fa59bc90 | Kit oficial para aplicações com Claude Agent SDK (/new-sdk-app, verificadores py/ts) — reservado para a F2 (Vera Agente) se ela virar aplicação independente. | — | ING-0001 | 0 |
| `engineering@knowledge-work-plugins` | reference | upstream@da38ec1e | upstream @da38ec1e | Skills de engenharia (architecture, system-design, code-review, testing-strategy, deploy-checklist…) — lanes Engenharia/QA/DevOps. | skill:roteamento-lanes | ING-0001 | 0 |
| `mcp-server-dev@claude-plugins-official` | reference | upstream@fa59bc90 | upstream @fa59bc90 | Guia oficial de construção de servidores MCP (tool-design: anotações, leitura/escrita separadas, structuredContent). | skill:component-authoring | ING-0001 | 0 |
| `operations@knowledge-work-plugins` | reference | upstream@da38ec1e | upstream @da38ec1e | Skills de operações (process-doc, runbook, risk-assessment, status-report…) — lanes Operações/DevOps/Stakeholders. | skill:roteamento-lanes | ING-0001 | 0 |
| `plugin-dev@claude-plugins-official` | active | upstream@fa59bc90 | upstream @fa59bc90 | Toolkit oficial de desenvolvimento de plugins (7 skills, agent-creator, plugin-validator, skill-reviewer, /plugin-dev:create-plugin), habilitado no projeto para desenvolver o Maestro. | skill:component-authoring | ING-0001 | 0 |
| `product-management@knowledge-work-plugins` | reference | upstream@da38ec1e | upstream @da38ec1e | Skills de produto (write-spec, roadmap-update, synthesize-research…) — lane Produto; não instalado no ambiente do usuário (D4). | skill:roteamento-lanes | ING-0001 | 0 |

## upstream-reference

| Nome | Status | Versão | Origem | Responsabilidade | Relacionados | Ingestão | Testes |
|---|---|---|---|---|---|---|---|
| `claude-plugins-official` | reference | fa59bc90 | upstream @fa59bc90 | Referência normativa oficial: plugin-dev, mcp-server-dev, agent-sdk-dev, skill-creator e exemplos de plugins (somente leitura, submodule fixado). | — | ING-0001 | 1 |
| `knowledge-work-plugins` | reference | da38ec1e | upstream @da38ec1e | Referência de arquitetura de produção: plugins por função (engineering, product-management, operations…), padrão CONNECTORS (~~categoria) e cowork-plugin-management. | — | ING-0001 | 1 |
