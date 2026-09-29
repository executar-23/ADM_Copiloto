# TASK-SPACE

Área de coleta de tarefas operacionais para o Copiloto/Maestro transformar em GitHub Issues.

## O que é

`TASK-SPACE/` é o inbox de **dados de tarefa** (backlogs, planos operacionais, registros CSV) que chegam prontos de fora do pipeline de ingestão de componentes (`ingestion/inbox/`, que é para skills/agents/plugins). Aqui não entra código nem componente — entra **conteúdo de tarefa**: o que precisa virar Issue, com fonte, critério de aceite e evidência já anexados.

Isto não substitui o ledger canônico do Maestro (`07-execucao/estado.json`) nem o pipeline de ingestão de componentes (`docs/process/receiving-components.md`). É a etapa anterior: onde a tarefa pousa antes de virar nó no ledger ou Issue no GitHub.

## Estrutura

Cada lote de submissão vira uma subpasta, nomeada `AAAA-MM-DD_<origem-curta>/`, contendo os arquivos originais tal como produzidos (CSV + dicionário de dados, ou pacote de plano operacional com documento interno + roadmap + backlog + calendário).

```
TASK-SPACE/
├── README.md                                                    ← este arquivo
├── 2026-09-28_copiloto-ops-runbook-sop-pf24/
│   ├── tarefas-runbook-sop-ops-editorial.csv
│   └── tarefas-runbook-sop-ops-editorial-dicionario.md
├── 2026-09-28_plano-risco-cognitivo-hub-cms/
│   ├── plano-interno-executar-blog-risco-cognitivo-2026-10.md
│   ├── roadmap-executar-blog-risco-cognitivo-2026-10.md
│   ├── linear-import-executar-blog-risco-cognitivo-2026-10.md
│   └── calendario-executar-blog-risco-cognitivo-2026-10.html
├── 2026-09-28_plano-editorial-gtm-blog/
│   ├── plano-interno-editorial-blog-risco-cognitivo-2026-10.md
│   ├── roadmap-editorial-blog-risco-cognitivo-2026-10.md
│   ├── linear-import-editorial-blog-risco-cognitivo-2026-10.md
│   └── calendario-editorial-blog-risco-cognitivo-2026-10.html
└── 2026-09-29_plano-executarapp/
    ├── plano-interno-executarapp-2026-10.md
    ├── roadmap-executarapp-2026-10.md
    ├── linear-import-executarapp-2026-10.md
    └── calendario-executarapp-2026-10.html
```

## Como o Copiloto/Maestro deve tratar isto

1. Cada arquivo `linear-import-*.md` (ou CSV de tarefas equivalente) já traz uma linha = uma tarefa candidata a Issue, com `titulo`, `resultado_esperado`, `criterio_smart_*`, `prioridade`, `prazo` e um prompt de IA self-contained pronto — não precisa reformular, só decidir mapeamento para o schema de Issue do repositório.
2. Cada `plano-interno-*.md` é a fonte de rastreabilidade completa (FACT/DECISION/ASSUMPTION/GAP/CONFLICT) por trás das tarefas do `linear-import-*` correspondente — citar de lá o `fonte_id` ao criar a Issue, nunca inventar owner/prazo/gate que a fonte não define (mesma regra C-00.2 deste repositório: lacuna vira `A DEFINIR`).
3. Antes de criar Issues em massa: aplicar C-00.9 (checar overkill/duplicação) e C-00.8 (se dois lotes aqui descreverem a mesma tarefa de formas diferentes, registrar como `decision_record` tipo `divergencia`, nunca escolher em silêncio) — ver, por exemplo, os CONFLICTs já registrados dentro de `2026-09-28_plano-editorial-gtm-blog/plano-interno-...md` (§3.5) e de `2026-09-29_plano-executarapp/plano-interno-executarapp-2026-10.md` (§3.5, 5 conflitos entre as duas fontes originais do EXECUTAR APP).
4. O lote `2026-09-29_plano-executarapp/` traz o backlog **completo** de um produto (11 Epics/48 Issues/~403h estimadas), mas só 8 Issues (~74h) têm prazo em Outubro/2026 — as demais 40 estão registradas com `prazo="Backlog — ciclo seguinte"`. Não criar Issue de sprint/ciclo atual para essas 40 sem antes checar a coluna `prazo`.
5. Ação externa (criar Issue no GitHub) exige aprovação explícita do usuário, por C-00.5 — TASK-SPACE só junta o material, não autoriza a criação automática de Issues.

## Origem deste conteúdo

Os 3 primeiros lotes (28/09/2026) vieram de uma sessão de trabalho em `executar-23/Copiloto-ops` (auditoria do Runbook RUN-F1, procedimentos do plugin `executar-cop`, dependências do PF-24) e de dois planos operacionais gerados pela skill `plano-operacional-rastreavel` para o Blog Risco Cognitivo (um a partir do Hub Editorial CMS real; outro a partir do Foundation Doc GTM + cronograma real dos 3 pilares, escopo só editorial). O 4º lote (29/09/2026) veio da mesma skill aplicada à síntese de 2 mapas mentais (XMind) do produto EXECUTAR APP — arquitetura, jornada de 25 etapas do usuário, e visão sistêmica mestre.
