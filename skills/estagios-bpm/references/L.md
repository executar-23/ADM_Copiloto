<!-- Playbook ingerido em ING-0002 de ING-0002:04-prompts-por-estagio/L-executar-fase-de-lancamento.md (sha256 ef4f9a15f921…). Texto original preservado abaixo; a seção final mapeia o estágio para as ferramentas do plugin. -->

# L — Executar uma fase do lançamento (parametrizado por F#)

> **Só abre com o gate de E6 verde e veredito do usuário.** É um prompt reutilizável: o Maestro
> o instancia para F0…F8, um nó por vez (WIP=1).

## OBJECTIVE
Levar a fase `F#` até seu DoD (`02-mapa/mapa-lancamento-F0-F8.md`) usando as lanes e skills roteadas.

## INPUT
`F#`, `mapa-lancamento-F0-F8.md`, `roteamento.md`, ledger, insumos da fase.

## CONSTRAINTS
- Dependência vence ordem numérica; nó só inicia com `DEPENDS_ON` = `CONCLUÍDO`.
- **F0 = subárvore do handoff v1** (não refazer; suas decisões `D1-v1…D6-v1` seguem abertas).
- **F1:** só depois de D9 (fórmula de lançamento) respondida.
- Trilha L: estado canônico no Control Center; o Maestro **projeta**, não duplica (D1).
- Ação externa (publicar/agendar/enviar) = `USER_ACTION_REQUIRED` (I-05).

## EXECUTION
1. Decompor `F#` em nós por lane (`<PEM-D16.F#.lane.seq>`), cada um com `dod` de uma frase.
2. Para cada nó: delegar por C-04 → skill → `VERIFICAR` → verificar evidência → `CONCLUÍDO`.
3. Pack editorial: motor **SOP-KP-001** (D5/D2); claims via `rc`; `[FW]` nunca vira `[E1]`.
4. Ao fechar a fase: atualizar Ficha e ledger; reportar.

## OUTPUT CONTRACT
Artefatos da fase em `OUTPUT`; `07-execucao/F#-relatorio.md`; ledger atualizado.

## VALIDATION
DoD da fase satisfeito com evidência; nenhum estado promovido sem verificação.

## STOP CONDITIONS
Insumo ausente → `A DEFINIR` + pergunta (Regra do 3). Conflito entre fontes → registrar, não escolher.

## Ferramentas do plugin Maestro (adaptação ING-0002)

- Decompor a fase em nós `PEM-D16.F#.<lane>.<seq>` com `node_create` (dono `control-center` na Trilha L = projeção; D1).
- Cada nó: delegação C-04 → skill roteada → `VERIFY` → evidência → `DONE`. Publicar/agendar/enviar → `efeito_externo=true` + `authorization_grant`.
- Pack editorial: motor SOP-KP-001 (`obsidian-editorial-pipeline`, D5); claims via `rc-cognitive-risk-expert`; `[FW]` nunca vira `[E1]`.
- Estado: `node_transition`/`evidence_add` no nó `F#`; artefatos sempre em arquivo; `ESTADO.md` é regenerado automaticamente.
