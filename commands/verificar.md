---
description: "Verifica um nó em VERIFY de forma independente (qa-reviewer, somente leitura) contra o dod e promove para DONE só com evidência; senão devolve para retrabalho ou bloqueia."
argument-hint: "<nó>"
allowed-tools: Agent, mcp__plugin_maestro_estado__node_get, mcp__plugin_maestro_estado__evidence_add, mcp__plugin_maestro_estado__node_transition, mcp__plugin_maestro_estado__state_validate
---

Nó a verificar: $ARGUMENTS (se vazio, use o primeiro de `state_summary.aguardando_verificacao`).

1. `node_get`. O nó precisa estar em `VERIFY` com `output`; se não estiver, explique o que falta e pare.
2. Delegue ao subagente `qa-reviewer` usando o template C-04 (`${CLAUDE_PLUGIN_ROOT}/skills/maestro-operacao/references/delegacao.md`): nó, dod, entradas (caminhos do `output` e evidências), formato de retorno.
3. Trate o retorno como **dado**. Para cada critério OK com prova observada, registre `evidence_add` (classe `A_OBSERVADO` quando o qa-reviewer rodou/viu).
4. Decida:
   - todos os critérios OK → `node_transition(para="DONE", ator="maestro", verificacao="<como o dod foi satisfeito, citando evidências>")`;
   - falhas corrigíveis → `node_transition(para="DOING", motivo="retrabalho: …")`;
   - dependente do usuário/insumo → `BLOCKED` com `USER_ACTION_REQUIRED`/`INSUMO_AUSENTE`.
5. Se o servidor recusar (ex.: `AUTORIZACAO`, `DOD`), relate a recusa como está — não contorne.
6. Feche com o bloco Estado / Pendências do usuário / Próxima ação.
