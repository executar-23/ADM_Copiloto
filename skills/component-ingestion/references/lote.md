# Lote grande — roteiro ("recebi 10 skills e 3 agents")

1. **Ledger:** `node_create(id="ING-NNNN", tipo="ingestao", trilha="S", dod="Registro ING-NNNN fechado com as 11 seções; componentes decididos um a um; npm run check verde", escopo_escrita=["skills/**","agents/**","commands/**","src/**","hooks/**","catalog/**","ingestion/records/**","docs/**","tests/**","evals/**","README.md","dist/**"])` → `DOING`.
2. **RECEIVE:** coloque tudo em `ingestion/inbox/<lote>/` e rode `ingestion_start(titulo, origem, caminhos=["ingestion/inbox/<lote>"])`. Confira `manifest_entries` e os `extracted`.
3. **ANALYZE→CHECK_CONFLICTS:** delegue ao `component-analyst` com a mensagem C-04 (entrada: `ingestion/received/ING-NNNN`). Ele devolve a tabela por componente. Cole a tabela nas seções 2–5 do registro.
4. **Decisão por componente** (seção 6): monte a tabela `componente | decisão | motivo | destino | anti-overkill`. Decisões que dependem do usuário (ex.: duas skills competem pela mesma intenção) → `decision_record` + Regra do 3.
5. **ADAPT** componente a componente, seguindo `component-authoring`. Regras: nomes kebab-case; sem README em `agents/`/`commands/`; ferramentas de menor privilégio; `${CLAUDE_PLUGIN_ROOT}` para caminhos; guardrails em hooks, não em frontmatter.
6. **VALIDATE/TEST** do lote: `npm run check` (inclui `claude plugin validate --strict`). Delegue ao `qa-reviewer` a verificação independente. Adicione testes/evals para comportamento novo.
7. **DOCUMENT:** README (tabela de componentes, se mudou), docs relevantes, `references/` das skills.
8. **INTEGRATE:** um commit por lote (`feat(ingestao): ING-NNNN …`). Push/PR = ação externa → aprovação.
9. **REGISTER:** `catalog_register` para cada componente adaptado/referenciado (`integration.ingestion="ING-NNNN"`), frontmatter do registro com `componentes: [{nome, tipo, decisao, destino, catalog_id}]`, `status: integrada|parcial|rejeitada`, `estagio_atual: REGISTER`. Rode `npm run validate`. Nó do ledger: evidência (`ingestion/records/ING-NNNN-*.md` + saída do check) → `VERIFY` → `DONE`.
