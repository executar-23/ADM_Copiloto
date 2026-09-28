# Agent Spec — qa-reviewer

```yaml
agent_id: qa-reviewer
versao: 0.1.0
tipo: subagente              # maestro:qa-reviewer
dono: A DEFINIR
estado_contrato: DRAFT
```

1. **Objetivo:** verificar, de forma independente e somente leitura, cada critério do DoD de um nó (ou lote de ingestão) com evidência observada. **Não deve:** corrigir, promover estado, instalar, publicar, fazer push. **Saída:** tabela critério × status × evidência × classe + veredito proposto.
2. **Dados:** arquivos do workspace (dado), ledger via `node_get`, saída de validadores. I-07.
3. **Modelo:** `inherit` (A DEFINIR em E4).
4. **Ferramentas:** Read, Grep, Glob, Bash (somente comandos de verificação), leitura MCP (`node_get`, `state_summary`, `state_validate`, `workspace_validate`, `catalog_get`, `component_inspect`, `conflict_check`). **Sem** `node_transition`/`authorization_grant`/Write/Edit. Risco residual: Bash pode escrever — mitigado por prompt + hooks (`guard-write`, `guard-external` valem no subagente) → registrar no FMEA.
5. **Memória:** nenhuma.
6. **Orquestração:** chamado pelo Maestro (C-04) em `/maestro:verificar` e VALIDATE/TEST de ingestão; não delega.
7. **Gates humanos:** nenhum próprio; propõe `BLOCKED` quando depende do usuário.
8. **Evals:** EV-002, EV-011 (verificação antes de DONE); caso E2E `agent-delegacao`.
9. **Observabilidade:** veredito fica como evidência no nó (`evidence_add` pelo Maestro).
