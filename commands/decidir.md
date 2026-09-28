---
description: "Apresenta uma decisão pendente (D#) com opções e recomendação, coleta a resposta do usuário (Regra do 3) e registra com fonte — nunca por inferência."
argument-hint: "<D#> [resposta]"
allowed-tools: mcp__plugin_maestro_estado__decision_list, mcp__plugin_maestro_estado__decision_record, mcp__plugin_maestro_estado__state_summary
---

Argumentos: $ARGUMENTS

1. Sem argumento: `decision_list(status="ABERTA")` e mostre as 3 decisões que mais bloqueiam (campo `bloqueia`). Pergunte qual decidir.
2. Com D#: mostre título, onde é decidida, opções, recomendação e o que ela bloqueia.
3. Se a resposta veio nos argumentos ou na conversa, confirme o entendimento em uma frase e registre: `decision_record(id, tipo="decisao", status="RESPONDIDA" | "PARCIAL", resposta, fonte="usuário, <data>: '<citação curta>'", nota)`.
4. Se não veio: faça no máximo 3 perguntas objetivas (Regra do 3), com a recomendação primeiro. Sem resposta → mantenha `ABERTA` (resultado válido).
5. Se a decisão desbloqueia nós, diga quais e sugira `/maestro:executar`.
