# E3 — Análise de riscos  (BPM fase 4 · FMEA + registro de riscos + controles)

## OBJECTIVE
Identificar modos de falha **antes** de construir, incluindo os específicos de agentes.

## CONTEXT
O BPM e Qualidade pede FMEA (severidade, ocorrência, detecção). Ficha ponto 19 traz só categorias (overkill, ineficiência, retrabalho, não aplicabilidade).

## INPUT
`E2-*`, ADRs, `02-mapa/divergencias-e-lacunas.md`, `C-03-eval-suite.md`.

## CONSTRAINTS
- Skill: `operations:risk-assessment`. **Um** registro de riscos (não criar segundo).
- Riscos de agente **obrigatórios**: agência excessiva (permissões), contaminação de memória, injeção de prompt via conteúdo buscado, divergência entre ledgers, drift de skill, dependência de spawn aninhado, guardrail no lugar errado (plugin), **overkill (R1)**.
- Não atribuir probabilidade/impacto sem base: usar escala qualitativa justificada.

## EXECUTION
1. FMEA: modo de falha · efeito · S · O · D · RPN · controle · dono (`A DEFINIR` se ausente).
2. Ligar cada risco P0/P1 a **um eval** (novo ou de C-03) — sem eval, sem fechar.
3. Preencher o ponto 19 da Ficha a partir do FMEA.

## OUTPUT CONTRACT
`07-execucao/E3-fmea.md` (tabela + top-N por RPN + mapa risco→controle→eval).

## VALIDATION
Cada risco top-N tem controle, dono (ou `A DEFINIR`) e eval. Os 8 riscos obrigatórios estão presentes.

## STOP CONDITIONS
Risco P0 sem controle possível → escalar ao usuário; não seguir para E5.
