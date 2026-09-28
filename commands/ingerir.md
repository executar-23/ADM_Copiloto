---
description: "Ingere componentes novos (skills, agents, commands, hooks, MCP tools, plugins, referências) pelo pipeline RECEIVE → ANALYZE → CLASSIFY → COMPARE → CHECK_CONFLICTS → ADAPT → VALIDATE → TEST → DOCUMENT → INTEGRATE → REGISTER."
argument-hint: "<caminho em ingestion/inbox/ ou arquivo .zip/.skill> [origem]"
allowed-tools: Skill, Agent, mcp__plugin_maestro_registry__ingestion_start, mcp__plugin_maestro_registry__ingestion_list, mcp__plugin_maestro_registry__component_inspect, mcp__plugin_maestro_registry__conflict_check, mcp__plugin_maestro_registry__upstream_search, mcp__plugin_maestro_registry__catalog_search, mcp__plugin_maestro_registry__catalog_get, mcp__plugin_maestro_registry__routing_lookup, mcp__plugin_maestro_registry__skill_fingerprint, mcp__plugin_maestro_registry__workspace_validate, mcp__plugin_maestro_estado__state_summary, mcp__plugin_maestro_estado__node_get
---

Material a ingerir: $ARGUMENTS

1. Carregue a skill `component-ingestion` e siga os 11 estágios; para lotes grandes use `${CLAUDE_PLUGIN_ROOT}/skills/component-ingestion/references/lote.md`.
2. Se o material não está em `ingestion/inbox/`, peça ao usuário para colocá-lo lá (ou copie, se ele indicou o caminho) — originais nunca são editados.
3. Crie/avance o nó `ING-NNNN` no ledger (WIP=1) e rode `ingestion_start`.
4. ANALYZE→CHECK_CONFLICTS: `component_inspect` + `conflict_check`; lote com mais de ~3 componentes → delegue ao `component-analyst` (C-04).
5. ADAPT com a skill `component-authoring`; decisões que dependem do usuário → `decision_record` + Regra do 3.
6. VALIDATE/TEST (`npm run check`, `qa-reviewer`), DOCUMENT, INTEGRATE (commit local; push = ação externa), REGISTER (`catalog_register` + registro ING fechado + nó VERIFY→DONE).
7. Feche com: componentes por decisão (adaptar/reutilizar/referenciar/rejeitar), pendências e próxima ação.
