# Decisões, divergências, change control e autorizações

## Decisão (D#)

- Abrir: `decision_record(id="D14", tipo="decisao", status="ABERTA", titulo, onde, recomendacao, opcoes, bloqueia=[nós], nota)`.
- Perguntar ao usuário com a **Regra do 3**: no máximo 3 perguntas por rodada e 2 rodadas; ofereça a recomendação primeiro. O que ficar sem resposta continua `ABERTA` — é resultado válido.
- Resposta: `decision_record(status="RESPONDIDA", resposta, fonte="usuário, <data>: '<citação curta>'", nota)`. **Nunca** marque `RESPONDIDA` a partir de inferência sua.
- Resposta parcial: `status="PARCIAL"` com o que foi respondido e o que segue `A DEFINIR`.

## Divergência (DIV-###) — I-08

Duas fontes dizem coisas diferentes (ex.: cópia enviada × instalada de uma skill; Process Doc × SOP). Registre com `tipo="divergencia"`, `status="REGISTRADA"`, cite as duas fontes e aponte a decisão que resolve (`resposta="decisão via D3"`).

## Change control (CC-###) — contratos

Campos obrigatórios em `detalhes`: `CURRENT`, `EVIDENCE`, `CONFLICT`, `PROPOSED_CHANGE`, `IMPACT`, `REVIEW_REQUIRED`, `STATUS`. Registre **antes** de editar `contratos/` (o hook pede confirmação humana para qualquer edição ali).

## Autorização de efeito externo (I-05)

1. O nó deve ter `efeito_externo=true` (defina na criação ou via change de escopo).
2. Apresente ao usuário exatamente o que será feito (comando, destino, ambiente: preview × produção).
3. Só após "sim" explícito: `authorization_grant(id, escopo="<o que foi aprovado>", fonte="usuário, <data>: '<citação>'")`. A ferramenta pede confirmação humana.
4. Execute apenas o que está no escopo. Registre a evidência externa (URL do deploy, ID da publicação) — `PUBLISHED`/`RELEASED` exigem evidência própria, não se inferem de `DONE`.
