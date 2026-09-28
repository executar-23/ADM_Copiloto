# E7 — Formalização  (BPM fase 6 · SOP + RACI + KPIs/SLAs + checklists)

## OBJECTIVE
Transformar o sistema validado em documentação oficial operável por uma pessoa sozinha.

## CONTEXT
SOP = procedimento oficial padronizado. Já existe o SOP-KP-001 (editorial): **referenciar, não duplicar**.

## INPUT
`E6-validacao.md`, ADRs, Agent Specs, `02-mapa/*`.

## CONSTRAINTS
Skills: `operations:process-doc`, `engineering:documentation`. Escrever para o leitor; começar pelo mais útil; mostrar comandos; **linkar em vez de duplicar**.

## EXECUTION
1. **SOP-MAESTRO** (como operar o sistema, passo a passo).
2. **RACI** (usuário, Maestro, folhas, skills externas).
3. **KPIs/SLAs** (as métricas de C-03 com alvos definidos em E4).
4. **Checklists** (pré-execução de nó, pré-ação externa, fechamento de estágio).
5. **PRD checklist**: só se o usuário fornecer o template ou aprovar a derivação proposta (D9).

## OUTPUT CONTRACT
`docs/sop-maestro.md`, `docs/raci.md`, `docs/kpis-slas.md`, `docs/checklists.md`.

## VALIDATION
Um iniciante executa 1 nó seguindo só o SOP; todo comando foi executado ao menos uma vez.

## STOP CONDITIONS
Documento sem comando testado não fecha.
