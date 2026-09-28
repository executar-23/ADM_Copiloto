# Dicionário de dados — tarefas-runbook-sop-ops-editorial.csv

Escopo: `executar-23/Copiloto-ops` (só este repo). 68 linhas, granularidade de passo atômico. Nenhuma alteração foi feita no repositório original — arquivo foi produzido em scratchpad de sessão e agora arquivado aqui, em ADM_Copiloto/TASK-SPACE, como registro de tarefas.

## Colunas

| Coluna | Significado |
|---|---|
| `row_id` | ID sequencial só deste CSV (R001…R068), não é ID do Notion/GitHub. |
| `source_type` | `runbook_step` (22), `runbook_gate` (4), `sop_procedimento` (5), `pf24_dependency` (37). |
| `source_file` | Caminho do arquivo-fonte real no repo `executar-23/Copiloto-ops`. |
| `source_ref` | Referência exata dentro da fonte (nº do step, dia do gate, ID do comando/skill, `artifact_id` do PF-24). |
| `epic_id` | `F1-3X (#2)` quando a linha vem do Runbook/gate; vazio quando a fonte não liga a esse Epic (SOP do plugin e PF-24 seguem a Issue #24, não o Epic #2). |
| `issue_id` | Issue do GitHub à qual a linha pertence, só quando isso está escrito na própria fonte (nunca inferido). |
| `title` | Nome da tarefa/artefato. |
| `owner` | Normalizado a partir do campo original (`who` no Runbook) → `owner`. `A_DEFINIR` quando a fonte não define. |
| `approval` | `pendente`/`aprovado` só faz sentido a nível Issue (AGENTS.md regra 5); marcado `N/A` nas linhas de passo/gate porque a fonte não tem esse conceito por passo. |
| `gate_id` | Gate nomeado (`G-PILAR1/2/3`, `G-SCAFFOLD`) quando a fonte liga a linha a um ciclo; senão `gate:tbd` (default da regra 4 do AGENTS.md). |
| `state` | Estado no modelo PLANNED→STRUCTURED→IMPLEMENTED→PRODUCED→VERIFIED; a maioria fica `PLANNED` porque a fonte não registra progresso por passo. |
| `depends_on` / `blocks` | Só preenchidos quando a fonte já expressa isso como lista (as 37 linhas do PF-24, vindas de `14_REG_depends_on_blocks.csv`, separadas por `;`). Nas linhas do Runbook, a ordem sequencial é só textual ("Após a validação do tema…") e **não** foi convertida em ID de dependência — ficou em branco para não inventar. |
| `evidence` | Texto de evidência exigido pela própria fonte. |
| `notion_source` | Deixado em branco em todas as linhas: nem o Runbook nem o PF-24 citam URL/ID de página Notion — só `docs/NOTION-ROTA.md` e as Issues do GitHub têm esse vínculo, e não foi lido linha a linha aqui. |
| `notes` | Toda normalização feita (nome de campo original → coluna do CSV) e toda lacuna deixada em branco por falta de fonte. |

## Principais decisões de normalização (rastreáveis por linha, coluna `notes`)

1. **`who` (Runbook) → `owner`**: mesmo campo, coluna renomeada para bater com `docs/SCHEMA-TRABALHO.md`/templates.
2. **Passos 1–7 do Runbook não têm Issue/ciclo mapeado**: `Runbooks/...operational.yaml` só mapeia unidades `#8–#22` aos 3 ciclos (Issues #3/#4/#5). Os passos 1–7 (validação de tema, pesquisa, Topic Pack, outline, redação, revisão, GEO/SEO) ficaram com `issue_id` em branco — **não assumi** que pertencem à preparação (Issue #6) só por proximidade de conteúdo, porque isso não está escrito na fonte.
3. **`gate_id` dos passos 8–22** é o `final_gate` do ciclo inteiro (`G-PILAR1/2/3`), não um gate por passo — a fonte não define gate individual por passo, só por ciclo.
4. **SOP/procedimentos do plugin (`sop_procedimento`)** recebem `issue_id=24` porque é isso que `docs/ESTADO.md` (Copiloto-ops) registra como rastreio do plugin `executar-cop` — não são "tarefas de produção editorial" propriamente ditas, são a ferramenta que o operador usa para consultar/gerar Runbook e SOP.
5. **PF-24 (`pf24_dependency`)** também herda `issue_id=24`, `gate_id=gate:tbd`, `owner=A_DEFINIR` e `approval=pendente` diretamente do texto de `docs/ESTADO.md` ("Aprovação da Issue #24, Gate (gate:tbd) e owner (A_DEFINIR) dependem de decisão humana"). O `state` fica anotado como `PROPOSED (nível agregado)` porque o status `PROPOSED` documentado é do resultado geral do PF-24 (arquivo `16_REG`), não de cada `artifact_id` individualmente — evitei aplicar esse status linha a linha sem confirmação.
6. **Conflito de cadência (15 dias/ciclo vs 17 dias/pack)**, já registrado em auditoria anterior desta série de sessões, não foi resolvido aqui — nenhuma linha assume um valor sobre o outro.

## O que NÃO está neste CSV
- Workbook (fora do escopo combinado desta extração).
- Epics/Issues/Sub-issues como linhas próprias (granularidade escolhida foi passo atômico, não nível Issue).
- Qualquer dependência inferida a partir de texto livre ("Após X…") quando a fonte não a formaliza como lista de IDs.
- Qualquer valor de aprovação, gate ou owner inventado — sempre `A_DEFINIR`/`gate:tbd`/`N/A` quando a fonte não define.
