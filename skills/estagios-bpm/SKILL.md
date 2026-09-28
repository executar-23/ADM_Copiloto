---
name: estagios-bpm
description: Playbooks dos estágios do ciclo BPM e Qualidade estendido para agentes — E0 Verificação/Inventário, E1 Descoberta (Charter, SIPOC, Ficha 22 pontos), E2 Desenho (topologia, roteamento, ADRs), E3 Riscos (FMEA), E4 Agent Spec/Permissões/Evals, E5 Walking skeleton, E6 Teste e validação, E7 Formalização (SOP/RACI/KPIs), E8 Implantação (Runbook), E9 Monitoramento — e o playbook L para executar uma fase F0–F8 do lançamento PEM-D16. Use quando o nó ativo for um estágio E# ou fase F#, ou quando o usuário pedir "rodar E0", "executar estágio", "fase F1", "FMEA", "charter", "SIPOC", "ficha de 22 pontos", "gate de E6".
---

# Estágios BPM (Trilha S) e fases do lançamento (Trilha L)

Cada estágio é um **nó** do ledger com `playbook` apontando para um arquivo em `references/`. O ciclo:

```
E0 → E1 → E2 → E3 → E4 → E5 → E6 → E7 → E8 → E9      (Trilha S — construir o Maestro)
L(F#) só abre depois do gate de E6 verde + veredito do usuário      (Trilha L — lançamento)
```

## Como executar um estágio

1. `node_get(<E#>)` → `dod`, dependências, `playbook`, gaps. Confirme WIP livre e `node_transition(para=DOING)`.
2. Leia o playbook (`references/E#.md`): OBJECTIVE, INPUT, CONSTRAINTS, EXECUTION, OUTPUT CONTRACT, VALIDATION, STOP CONDITIONS.
3. Execute com as skills indicadas (via roteamento) e as ferramentas MCP; salve o artefato em `07-execucao/E#-*.md` (nunca só no chat).
4. `node_update(output=[…])` → `VERIFY` → verificação (preferencialmente `qa-reviewer`) → `evidence_add` → `DONE` somente se a VALIDATION do playbook foi satisfeita.
5. STOP CONDITION atingida → `BLOCKED` com o código certo (`USER_ACTION_REQUIRED`, `DECISAO_PENDENTE`, `INSUMO_AUSENTE`, `FALHA_GATE`) e reporte: o que travou, por quê, menor ação para destravar.
6. Mesmo gate falhando 2× seguidas → causa-raiz (skill `engineering:debug`), não sintoma.

## Estágios

| Nó | Playbook | Artefato | Decisões que resolve |
|---|---|---|---|
| E0 | `references/E0.md` | `07-execucao/E0-verificacao.md` | D4, D5, D6, D7, D8 (+ F7-delta) |
| E1 | `references/E1.md` | `07-execucao/E1-charter-sipoc.md`, nó `FICHA` | D2, D9 |
| E2 | `references/E2.md` | `07-execucao/E2-desenho.md`, ADRs, `mapa/roteamento.json` validado | D1, D2, D3, D10, D11 |
| E3 | `references/E3.md` | `07-execucao/E3-fmea.md` | — |
| E4 | `references/E4.md` | `07-execucao/E4-agent-specs/`, `E4-tool-permission-matrix.md`, `E4-eval-suite.md`, `evals/` | — |
| E5 | `references/E5.md` | `07-execucao/E5-relatorio.md` | — |
| E6 | `references/E6.md` | `07-execucao/E6-validacao.md` (veredito) | gate da Trilha L |
| E7 | `references/E7.md` | `docs/sop-maestro.md`, `docs/raci.md`, `docs/kpis-slas.md`, `docs/checklists.md` | — |
| E8 | `references/E8.md` | `docs/runbook.md`, `07-execucao/E8-implantacao.md` | — |
| E9 | `references/E9.md` | `07-execucao/E9-monitoramento.md` | — |
| F0–F8 | `references/L.md` | `07-execucao/F#-relatorio.md` | por fase |

## Nota de versão (CC-002)

O plugin v0.1.0 foi construído antes de E0–E4 por decisão explícita do usuário. Os artefatos de E4/E5 já existem (campo `output` dos nós) e **serão re-verificados** quando os estágios rodarem — existir ≠ aprovado (I-03).
