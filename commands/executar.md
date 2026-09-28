---
description: "Executa o próximo nó elegível do Maestro, um nó específico (E#, F#, ING-NNNN) ou uma intenção roteada para lane → skill, pelo adaptador C-01 (WIP=1, saída em arquivo, VERIFY antes de DONE)."
argument-hint: "[nó | intenção]  — vazio = próximo elegível"
allowed-tools: Skill, mcp__plugin_maestro_estado__state_summary, mcp__plugin_maestro_estado__node_next, mcp__plugin_maestro_estado__node_get, mcp__plugin_maestro_estado__node_list, mcp__plugin_maestro_registry__routing_lookup, mcp__plugin_maestro_estado__node_update, mcp__plugin_maestro_estado__evidence_add
---

Argumento: $ARGUMENTS

1. Carregue a skill `maestro-operacao` (ferramenta Skill) e siga-a.
2. Resolva o alvo:
   - vazio → `node_next` (se houver nó em DOING, continue nele);
   - id de nó existente → `node_get`;
   - texto livre → `routing_lookup` com a intenção; proponha o nó (id, trilha, lane, skill, dod) e **peça confirmação** antes de `node_create`.
3. Se o nó tiver `playbook` (estágio E# ou fase F#), carregue a skill `estagios-bpm` e siga o playbook.
4. Aplique o adaptador: DOING → executar skill com entradas explícitas → saída em arquivo (`node_update(output)`) → VERIFY → verificação → evidência → DONE só se o dod foi satisfeito.
5. Insumo ausente → `A DEFINIR` + BLOCKED com o código certo. Ação externa → só com `authorization_grant` após aprovação explícita.
6. Feche com o bloco Estado / Pendências do usuário / Próxima ação.
