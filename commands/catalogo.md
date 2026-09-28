---
description: "Consulta o catálogo de componentes do Maestro (fonte de verdade): lista por tipo/status, busca textual ou detalhe de um componente."
argument-hint: "[busca | tipo | id <tipo>:<nome>]"
allowed-tools: mcp__plugin_maestro_registry__catalog_list, mcp__plugin_maestro_registry__catalog_search, mcp__plugin_maestro_registry__catalog_get
---

Argumento: $ARGUMENTS

- vazio → `catalog_list` e resuma por tipo (contagem + nomes);
- um tipo (`agent`, `skill`, `command`, `hook`, `mcp-server`, `mcp-tool`, `external-plugin`, `upstream-reference`) → `catalog_list(type=…)`;
- formato `<tipo>:<nome>` → `catalog_get` e mostre responsabilidade, origem, dependências, ferramentas, relacionados, status, versão, integração (ING) e testes;
- texto livre → `catalog_search`.

Tabela compacta; aponte `catalog/CATALOG.md` para a visão completa.
