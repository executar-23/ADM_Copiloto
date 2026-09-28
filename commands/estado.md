---
description: "Mostra o estado do Maestro — nó ativo (WIP), próximo elegível, verificações e ações pendentes do usuário, decisões abertas e progresso derivado."
argument-hint: "[nó opcional para detalhar]"
allowed-tools: mcp__plugin_maestro_estado__state_summary, mcp__plugin_maestro_estado__node_get, mcp__plugin_maestro_estado__decision_list
---

Mostre o estado do Maestro a partir do ledger — nunca de memória.

1. Chame `state_summary`. Se $ARGUMENTS indicar um nó (ex.: `E0`, `F1`, `ING-0002`), chame também `node_get` para ele.
2. Se o ledger não existir, diga isso e ofereça `/maestro:executar` após `state_init` (não crie sem confirmação).
3. Responda em no máximo ~15 linhas: nó ativo; próximo elegível (com o `dod`); o que aguarda verificação; o que aguarda o usuário (ações e decisões abertas, no máximo 3 em destaque); progresso por trilha (derivado).
4. Feche com:

```
Estado: …   Evidência: …
Pendências do usuário: …
Próxima ação: …
```
