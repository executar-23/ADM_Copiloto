# E8 — Implantação e operação  (BPM fase 7 · Runbook + processo em produção)

## OBJECTIVE
Colocar o Maestro em uso real, com Runbook e gates humanos.

## CONTEXT
Distribuição: modo A já vale. Modo B (plugin) só se D6 confirmar e EV-010 passar.

## INPUT
`E7-*`, repositório validado.

## CONSTRAINTS
- Skills: `operations:runbook`, `engineering:deploy-checklist`, `operations:change-request` (se houver mudança em ambiente).
- **Ação externa = aprovação explícita** (I-05). Preview antes de produção.
- Definir **gatilhos de rollback antes** do primeiro uso.

## EXECUTION
1. **Runbook**: quando usar, pré-requisitos, procedimento, exceções, recuperação, escalonamento — incluindo atualização de skill (`skill_version`, drift).
2. Treino do usuário = **uma sessão guiada** (meta: perguntas ≤ 3 por rodada).
3. (Opcional, D6) empacotar como plugin: `.claude-plugin/plugin.json` + guardrails em `hooks/hooks.json` do plugin; reexecutar EV-010.
4. Habilitar o estágio L.

## OUTPUT CONTRACT
`docs/runbook.md`, `05-deploy/checklist.md` (se houver deploy), `07-execucao/E8-implantacao.md`.

## VALIDATION
Runbook executado uma vez do zero por quem não o escreveu; rollback definido com limiares.

## STOP CONDITIONS
Sem aprovação do usuário, não promover a produção.
