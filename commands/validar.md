---
description: "Valida o workspace do Maestro — ledger (WIP, evidência, projeção), catálogo ↔ disco, convenções de componentes, roteamento e registros de ingestão; no repositório do plugin, também o check completo."
argument-hint: "[--completo]"
allowed-tools: mcp__plugin_maestro_registry__workspace_validate, mcp__plugin_maestro_estado__state_validate, Bash(npm run check), Bash(npm run validate), Bash(claude plugin validate:*)
---

1. Chame `workspace_validate` e `state_validate`.
2. Se $ARGUMENTS contiver `--completo` e o workspace for o repositório do plugin (tem `package.json` e `.claude-plugin/plugin.json` com name maestro), rode `npm run check`.
3. Liste os **erros** agrupados por código, com o arquivo e a correção objetiva de cada um; depois os avisos em uma linha cada.
4. Não corrija nada automaticamente sem o usuário pedir; arquivos gerados (`ESTADO.md`, `CATALOG.md`, `mapa/roteamento.md`) se corrigem com `npm run render`.
