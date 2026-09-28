Titular: EXECUTAR / Blog Risco Cognitivo (mantido da decisão já registrada nesta mesma conversa — não repetido ao usuário)
Período coberto: 28/09/2026 a 31/10/2026 (rotulado "Outubro/2026" por decisão do usuário; o cronograma real já em execução começa em 28/09/2026 — ver nota em §2)
Data de emissão: 28/09/2026
Fuso horário: America/Sao_Paulo (BRT/GMT-3)
Versão: 1.0 — emissão inicial
Metodologia de produção: motor de evidência com hierarquia de fontes e classificação rastreável (skill `plano-operacional-rastreavel`)
Natureza deste documento: planejamento operacional executável. Não é auditoria, certificação,
opinião legal, aprovação regulatória, nem declaração formal de conformidade normativa.

**Escopo desta rodada:** só a **parte editorial** do lançamento do Blog Risco Cognitivo — instrução explícita do usuário nesta conversa ("a outra sessão está gerando a parte de engenharia, você aqui gera a parte editorial"). Ficam fora deste backlog: AR-01 (Blog e infraestrutura full stack), AR-03 (Agentes e operação), AR-04 (Solution Store), AR-05 (Mapa Cognitivo), AR-06 (Schema e conhecimento) — tratadas como dependências externas, não como tarefas deste plano.

---

## 1. Resumo Executivo

- **Objetivo operacional central do período:** produzir e preparar para publicação os três pilares editoriais do Blog Risco Cognitivo (Problema → Método → Aplicação) já agendados no cronograma real (28/09 a 16/10/2026), mais a governança editorial de base (pilares aprovados, PEM consolidado, pipeline definido) e o início da priorização de canais de distribuição.
- **Resultado mais importante esperado:** os 3 pilares publicados com gate aprovado (G-PILAR1/2/3) — ver KR-01 a KR-03 em §6.
- **Capacidade realista total planejada:** 82,5h no período (ver §7).
- **Frentes ativas simultâneas:** 1 — Editorial do Blog Risco Cognitivo (Pilares + PEM + priorização de canais). Engenharia (blog full stack, schema, agentes, Store, Mapa) é frente paralela, fora deste plano.
- **Restrição principal:** nenhuma das 211 tarefas do Foundation Doc nem das 15 tarefas já agendadas tem responsável (owner) confirmado (GAP-02).
- **Risco principal:** duas nomenclaturas de tarefa paralelas e não reconciliadas descrevem a mesma produção editorial de 3 ciclos (CONF-01), com risco de duplicar ou perder trabalho se ambas forem executadas sem reconciliação.
- **Próxima ação imediata:** ver §17.

## 2. Inventário de Fontes e Evidências

| ID | Fonte | Tipo | Data/versão | Papel na análise | Confiabilidade/limitação |
|---|---|---|---|---|---|
| SRC-01 | Instruções do usuário nesta conversa (escopo = parte editorial; reaproveitamento de titular/período/capacidade já decididos antes nesta sessão) | Instrução explícita | 28/09/2026 | Fonte tier 1 — define escopo desta rodada | Capacidade (20h/semana) foi decidida para um plano anterior nesta mesma conversa (Hub Editorial CMS), reaproveitada aqui por continuidade de titular/período — não foi uma nova pergunta de intake |
| SRC-02 | `EXECUTAR_Foundation_Doc_GTM_Blog.md` v1.1 (94 campos, 211 tarefas em 9 áreas, 12 decisões abertas, Anexos A–G) | Documento de projeto do cliente — consolidação declarada como "plano consolidado; execução não verificada" | 28/09/2026 | Fonte primária da estrutura de tarefas editoriais (EDT-01–03, PACK-01/02/03, DST-01–08) e das decisões abertas (DEC-01 a DEC-12) | O próprio documento avisa: "documentado" = afirmação do GTM original, não comprovação de implementação; nenhum status foi inferido além do que a fonte declara |
| SRC-03 | `EXECUTAR_projetosaasentrypoint_EXPANDIDO.schema.json` v2.0 (94 IDs canônicos 1.1–17.3) | Documento normativo/contrato de formulário anexado pelo cliente | 28/09/2026 | Schema do formulário que sustenta os 94 campos citados por SRC-02 | Só a estrutura foi inspecionada; os valores já estão consolidados em SRC-02 (Anexo B), não duplicados aqui |
| SRC-04 | `README_D16_MIDIAS_SOCIAIS_E_DISTRIBUICAO_DIGITAL.md` + `D16_TAXONOMIA.csv` (10 tópicos, 50 subtópicos/ideias, status ATIVO v2.0) | Documento de projeto do cliente — pacote de domínio D16 | v2.0 | Estrutura de referência para a tarefa EDT-02 (consolidar PEM) e para DST-01 (priorizar canais) | Só a taxonomia (estrutura de tópicos) foi fornecida — os 6 documentos imprimíveis do workbook (PEM, PGM, PCP, PEL, PDM, RDS) em si não foram anexados, só referenciados pelo README |
| SRC-05 | `files.zip` → `blog-riscos-cognitivos-tres-pilares_ARVOREKIT.zip` (`..._DADOS.csv`, `..._ARVORE.txt`, `relatorio_validacao.txt`) | Documento de projeto do cliente — roadmap já operacionalizado, com validação automática (0 erros, 0 avisos) | 26/09/2026 | Fonte primária das 15 tarefas já agendadas (P1-001…P3-005), com datas reais 28/09–16/10/2026, gates G-PILAR1/2/3 e pesos | Datas e IDs batem exatamente com `Runbooks/RUN-F1-...operational.yaml` do repositório `executar-23/Copiloto-ops` já auditado nesta conversa — confirmação cruzada entre duas fontes independentes |
| SRC-06 | `files.zip` → `creator-led-platform-setup_DADOS.csv` + `creator-led-platform-setup_OBSIDIAN.zip` (vault) | Documento de projeto do cliente — registro do marco SETUP-001 | 27/09/2026 | Confirma que o scaffold do monorepo `creator-led-platform` foi concluído (marco 100%, porta G-SCAFFOLD) | Consistente com `docs/ESTADO.md` do Copiloto-ops, já lido nesta conversa ("scaffold creator-led materializado... 143 caminhos `.gitkeep`") |
| SRC-07 | `files.zip` → `creator-led-platform_ARVORE-ZIP.zip` (listagem de diretórios do scaffold) | Documento de projeto do cliente — estrutura real de pastas | 26/09/2026 | Confirma os caminhos reais onde o conteúdo editorial deve ser versionado (`editorial/pilares/p1-riscos-cognitivos`, `p2-processos-neuroadaptativos`, `p3-ferramentas-solucoes`, `editorial/briefs`, `consciencia/c1-c3`, `content/articles`, etc.) | Só listagem (nomes de pasta), sem conteúdo — pastas contêm apenas `.gitkeep` |
| SRC-08 | `Runbooks/RUN-F1-PRODUCAO-EDITORIAL-MULTIPLATAFORMA.yaml`/`.operational.yaml` (repositório `executar-23/Copiloto-ops`, já lido nesta conversa) | Registro operacional recente | commit já auditado | Contrato de peças por ciclo (1 artigo, 1 vídeo, 4 verticais, 6 carrosséis, 6 imagens, 3 infográficos, 10–12 stories, 3 newsletters, 3 ebooks, 6 CTAs) — idêntico ao Anexo D de SRC-02 | Usado só para confirmar consistência entre fontes, não como fonte nova |

**Nota sobre o período coberto:** o usuário decidiu rotular este ciclo como "Outubro/2026" numa rodada anterior desta conversa, mas a fonte primária do cronograma real (SRC-05) já começa em 28/09/2026 (Pilar 1) e termina em 16/10/2026 (Pilar 3, gate G-PILAR3). O período coberto deste documento foi ajustado para 28/09/2026–31/10/2026 para não excluir trabalho já agendado e em andamento — registrado aqui, não decidido silenciosamente.

**Fontes NÃO consultadas nesta rodada (por escolha justificada):** Anexo C (catálogo de evidências) e Anexo G (GTM integral) de SRC-02 não foram lidos linha a linha — são catálogos de referência cruzada já resumidos nas seções 00–11 e no Anexo F, que é a fonte direta das tarefas deste plano. `D16_DOCUMENTOS.csv` e os 6 documentos do workbook D16 (PEM, PGM, PCP, PEL, PDM, RDS) citados pelo README (SRC-04) não foram anexados — só a taxonomia de tópicos está disponível.

## 3. Fatos, Decisões, Suposições, Lacunas e Conflitos

### 3.1 Fatos observáveis (FACT)

| ID | Fato | Fonte | Citação literal/localização |
|---|---|---|---|
| FACT-01 | O Foundation Doc registra 211 tarefas em 9 áreas (AR-00 a AR-08); a área editorial (AR-02) contém EDT-01–03 mais os packs; a área de distribuição (AR-08) contém DST-01–08 | SRC-02 | Seção 08 — "Tasks and Issues"; Anexo F |
| FACT-02 | 15 tarefas (P1-001 a P3-005) já estão agendadas com datas reais entre 28/09/2026 e 16/10/2026, status "aberta" (12) ou "marco" (3: P1-005, P2-005, P3-005), gates G-PILAR1/G-PILAR2/G-PILAR3 | SRC-05 | `blog-riscos-cognitivos-tres-pilares_DADOS.csv` |
| FACT-03 | O relatório de validação do cronograma (SRC-05) reporta 0 erros, 0 avisos, 0 links quebrados, peso total 100,004% (declarado 100,0%) | SRC-05 | `relatorio_validacao.txt` |
| FACT-04 | O marco SETUP-001 ("criar estrutura completa de pastas do monorepo creator-led-platform") está registrado como concluído, peso 100,0, porta G-SCAFFOLD, em 27/09/2026 | SRC-06 | `creator-led-platform-setup_DADOS.csv`; nota Obsidian `SETUP-001.md` |
| FACT-05 | O scaffold real do monorepo já contém a árvore `editorial/` com as subpastas `briefs`, `consciencia/{c1-descoberta,c2-compreensao,c3-decisao}`, `distribution`, `drafts`, `fact-check`, `outlines`, `pilares/{p1-riscos-cognitivos,p2-processos-neuroadaptativos,p3-ferramentas-solucoes}`, `published`, `research`, `reviews`, `topic-packs`, e `content/{articles,authors,campaigns,landing-pages,resources,series,topics}` | SRC-07 | listagem de `creator-led-platform_ARVORE-ZIP.zip` |
| FACT-06 | O contrato de produção por pack exige no mínimo: 1 artigo-mãe, 1 vídeo-mãe, 4 vídeos verticais, 6 carrosséis, 6 imagens, 3 infográficos, 10 stories (12 no máximo, 2 opcionais), 3 newsletters, 3 ebooks, 6 CTAs — 43 peças mínimas, 45 máximas, 129 mínimas em 3 packs | SRC-02 | Anexo D — Contrato de produção e formatos |
| FACT-07 | O domínio D16 (Mídias Sociais e Distribuição Digital) tem 10 tópicos e 50 subtópicos/ideias, todos status "ATIVO", versão "2.0", todos marcados `printable=SIM` | SRC-04 | `D16_TAXONOMIA.csv` |
| FACT-08 | O Foundation Doc lista 12 decisões abertas (DEC-01 a DEC-12); nenhuma tem status de resolvida | SRC-02 | Anexo A |
| FACT-09 | EDT-01 (aprovar pilares e consciência), EDT-02 (consolidar PEM) e EDT-03 (definir pipeline editorial) não têm evidência de conclusão, responsável ou data no Foundation Doc | SRC-02 | Anexo F, linhas EDT-01 a EDT-03 |
| FACT-10 | DST-01 (priorizar canais) depende de EDT-02; DST-02 (definir KPIs) depende só de GOV-01 (consolidar escopo do lançamento) | SRC-02 | Anexo F, linhas DST-01/DST-02 |

### 3.2 Decisões aprovadas (DECISION)

| ID | Decisão | Fonte | Nota |
|---|---|---|---|
| DEC-01(sessão) | Escopo desta rodada = só a parte editorial (AR-02 + AR-08 + D16); a parte de engenharia (AR-01, AR-03, AR-04, AR-05, AR-06) fica para outra sessão | SRC-01 | Instrução explícita do usuário nesta conversa |
| DEC-02(sessão) | Titular, período (rotulado "Outubro/2026") e capacidade semanal (20h) reaproveitados da decisão já tomada nesta mesma conversa para o plano anterior (Hub Editorial CMS) | SRC-01 | Não foi uma nova pergunta — continuidade de contexto já estabelecido |
| DEC-03(sessão) | Reserva de contingência = 15% da capacidade de execução planejada (padrão fixo da metodologia) | `motor-evidencia-fontes.md` | Nenhum pedido do usuário para outro percentual |
| DEC-04(sessão) | O backlog de outubro usa as 15 tarefas já agendadas (P1-001…P3-005, SRC-05) como backbone de cronograma, não as ~129 peças do Anexo F/SRC-02 (PACK-01/02/03) — ver CONF-01 para a justificativa de precedência | SRC-05 vs SRC-02 | Decisão de modelagem desta rodada, não uma escolha do cliente; registrada para rastreabilidade |

### 3.3 Suposições (ASSUMPTION)

| ID | Suposição | Por que foi necessária | Risco se errada |
|---|---|---|---|
| ASM-01 | A capacidade de 20h/semana decidida para o plano da Hub Editorial CMS (rodada anterior desta conversa) também se aplica a este backlog editorial mais amplo do GTM Blog | O usuário não foi reperguntado nesta rodada; a suposição evita redundância, mas as duas frentes podem competir pela mesma capacidade | Se as duas frentes rodarem em paralelo na prática, a capacidade real disponível para cada uma é menor que os 82,5h calculados aqui — recomenda-se ao titular declarar se há capacidade adicional dedicada a esta frente |
| ASM-02 | Nenhum compromisso fixo ou overhead operacional consome a capacidade do período além do que está neste plano (mesma suposição do plano anterior, não reconfirmada) | Não informado no intake | Capacidade de execução planejada em §7 pode estar superestimada |

### 3.4 Lacunas (GAP)

| ID | Lacuna | Fonte que deveria cobrir | Impacto | Ação recomendada |
|---|---|---|---|---|
| GAP-01 | EDT-01, EDT-02 e EDT-03 (governança editorial de base) não têm evidência de conclusão | SRC-02 | Sem pilares formalmente aprovados nem pipeline definido, a produção dos 3 packs corre sem base de governança fechada | TSK-0001 a TSK-0003 neste plano |
| GAP-02 | Nenhuma das 211 tarefas do Foundation Doc nem das 15 tarefas do ARVOREKIT tem responsável (owner) confirmado | SRC-02, SRC-05 | Nenhuma tarefa deste plano pode ter responsável definido com confiança | Titular deve confirmar responsável antes ou durante a execução (ver §12) |
| GAP-03 | O mapeamento entre os 3 packs do Foundation Doc e os 3 pilares editoriais não está confirmado — DEC-10 do próprio Foundation Doc proíbe explicitamente assumir essa correspondência 1:1 | SRC-02 | Risco de o detalhamento de peças (43–45 por pack) não corresponder exatamente ao que está sendo produzido pilar a pilar no cronograma real | Ver CONF-01; recomenda-se ao titular resolver DEC-10 formalmente |
| GAP-04 | O PEM (D16-DOC-PEM-001) ainda não está preenchido — só a taxonomia de tópicos/subtópicos (D16_TAXONOMIA.csv) foi fornecida, não o conteúdo do documento | SRC-04 | EDT-02 não pode ser declarada concluída sem o PEM real | TSK-0002 |
| GAP-05 | 8 candidatos a Quick Framework são citados no Foundation Doc (DEC-09) mas não têm lista nominal | SRC-02 | Fora do escopo editorial desta rodada (depende de SCH-06, schema — engenharia); citado só como fronteira, não como tarefa deste plano | Nenhuma — cabe à frente de engenharia/schema |
| GAP-06 | Nenhum dos 6 documentos imprimíveis do workbook D16 (PGM, PCP, PEL, PDM, RDS, além do PEM) foi anexado — só referenciados pelo README | SRC-04 | DST-01 (priorizar canais) e EDT-02 (PEM) ficam limitados à taxonomia, sem o conteúdo já elaborado desses documentos, se existir | Confirmar com o titular se esses documentos já existem em algum lugar antes de recriá-los do zero |

### 3.5 Conflitos (CONFLICT)

| ID | Fonte A | Fonte B | Fonte priorizada | Regra de precedência usada |
|---|---|---|---|---|
| CONF-01 | SRC-02 (Foundation Doc, Anexo F): produção editorial de 3 ciclos modelada como PACK-01/02/03, cada um com ~43–45 peças em IDs por formato (ART/VID/VRT/CRS/IMG/INF/STR/NWL/EBK/CTA) | SRC-05 (ARVOREKIT): a mesma produção de 3 ciclos modelada como P1-001…P3-005 (5 tarefas por pilar), já com datas reais atribuídas (28/09–16/10/2026) e gates G-PILAR1/2/3 | SRC-05 para o **cronograma** deste backlog (datas, dependências, gates) | SRC-05 já tem datas comprometidas e validação automática (FACT-03), enquanto SRC-02 explicitamente não fecha o mapeamento pack↔pilar (DEC-10, GAP-03) nem a duração do ciclo (DEC-01, ver CONF-02). O detalhamento de peças de SRC-02 (Anexo D/F) é preservado como **especificação de conteúdo** de cada ciclo (quantas peças, quais formatos — FACT-06), não como cronograma alternativo. Nenhuma das duas fontes foi descartada. |
| CONF-02 | SRC-02 (Foundation Doc, DEC-01): duração do ciclo/pack formalmente **em aberto** — 15 dias/ciclo (tabelas de operação) versus 17 dias/pack (uma passagem do GTM), sem equivalência definida | SRC-05 + `Runbooks/RUN-F1-...operational.yaml` (Copiloto-ops, já auditado nesta conversa): execução real já adota **15 dias/ciclo**, com datas comprometidas para os 3 pilares | SRC-05 / operational.yaml, na prática | Mesmo conflito já registrado nas Tarefas 2 e 3 anteriores desta conversa — a prática operacional (datas já publicadas e em execução) resolveu de fato a cadência para 15 dias, mas a decisão formal (DEC-01) permanece aberta no Foundation Doc. Registrado aqui de novo para manter rastreabilidade entre os três documentos que tocam o mesmo conflito. |

## 4. Limite Normativo e Disclaimer

Este documento **não é** auditoria, certificação, opinião legal, aprovação regulatória, nem declaração formal de conformidade normativa.

Conjunto normativo fixo desta metodologia: ISO 9001:2015/Amd 1:2024 (única norma do conjunto com requisitos de sistema de gestão), ISO 10005, ISO 10006, ISO 21502, ISO 31000 e ISO 10075-2 (orientações, não requisitos obrigatórios). A checagem de edição vigente (§0 da skill) já foi feita nesta mesma sessão de trabalho (ver plano interno anterior desta conversa, que registrou SRC-EXT-01: ISO 9001:2026 lançada em 16/09/2026, substituindo 2015/Amd1:2024) — não repetida aqui por já ter sido verificada nesta sessão.

Frameworks operacionais próprios (ex.: contingência de 15%, WIP de 1 frente editorial) são decisão de desenho operacional, não requisito ISO. Toda afirmação normativa é rastreável a uma norma e cláusula específica; ausência de cláusula ou evidência impede conclusão.

## 5. Evidência Organizada pela Estrutura Harmonizada

| Cabeçalho | Norma aplicável | Cláusula | Requisito | Evidência observável | Status | Lacuna/ação |
|---|---|---|---|---|---|---|
| 6. Planejamento | ISO 9001:2015/Amd1:2024 | 6.2 (Objetivos da qualidade e planejamento) | Objetivo mensurável com método de acompanhamento | Objetivos do mês em §6, com fonte e resultado mensurável | PARCIALMENTE EVIDENCIADO | Falta North Star e metas confirmadas (DEC-04 do Foundation Doc, GAP correspondente fora do escopo editorial desta rodada — pertence a DST-02) |
| 8. Operação | — (orientação ISO 21502) | — | Planejamento operacional de tarefas com responsável e critério de aceite | Registro de tarefas em §10, com `fonte_id` rastreável ao Anexo F/ARVOREKIT | PARCIALMENTE EVIDENCIADO | Responsável não confirmado para nenhuma tarefa (GAP-02) |
| 9. Avaliação de Desempenho | ISO 9001:2015/Amd1:2024 | 9.1 (Monitoramento, medição, análise e avaliação) | Métricas de desempenho com meta e frequência | DST-02 (definir KPIs) está no backlog, mas ainda não executada | NÃO EVIDENCIADO | Nenhum KPI de distribuição confirmado ainda para esta frente |

As demais subseções (Contexto, Liderança, Suporte, Melhoria) não têm evidência material específica deste backlog editorial além do já registrado em §2–§3 — classificadas como NÃO AVALIADO neste ciclo.

## 6. Objetivos do Mês e Resultados Mensuráveis

| ID Objetivo | Objetivo do mês | Fonte | Resultado mensurável | Baseline | Meta do mês | Método de validação |
|---|---|---|---|---|---|---|
| OBJ-01(sessão) | Publicar o Pilar 1 (Riscos Cognitivos) com gate G-PILAR1 aprovado | FACT-02 | KR-01: P1-005 concluída com evidência | Pilar 1 em produção (P1-001 a P1-004 abertas) | Pilar 1 publicado até 02/10/2026 | Registro de conclusão de P1-005 + evidência de publicação |
| OBJ-02(sessão) | Publicar o Pilar 2 (Processos Neuroadaptativos) com gate G-PILAR2 aprovado | FACT-02 | KR-02: P2-005 concluída com evidência | Não iniciado | Pilar 2 publicado até 09/10/2026 | Registro de conclusão de P2-005 |
| OBJ-03(sessão) | Publicar o Pilar 3 (Ferramentas e Soluções) com gate G-PILAR3 aprovado, fechando o ciclo Problema-Método-Aplicação | FACT-02 | KR-03: P3-005 concluída com evidência | Não iniciado | Pilar 3 publicado até 16/10/2026 | Registro de conclusão de P3-005 |
| OBJ-04(sessão) | Fechar a governança editorial de base (pilares aprovados, PEM consolidado, pipeline definido) | GAP-01, GAP-04 | KR-04: EDT-01, EDT-02 e EDT-03 com evidência de conclusão | Nenhuma das três com evidência | 3 de 3 concluídas dentro do período | Registro de evidência por tarefa |
| OBJ-05(sessão) | Iniciar a priorização de canais de distribuição usando a taxonomia D16 | FACT-07, FACT-10 | KR-05: DST-01 e DST-02 com evidência de conclusão ou avanço registrado | Não iniciado | Canais priorizados e KPIs definidos até o fim do período | Registro de evidência em DST-01/DST-02 |

Apenas 5 objetivos foram mantidos, dimensionados à capacidade de 82,5h calculada em §7.

## 7. Capacidade e Alocação do Mês

Semanas civis do período coberto (28/09 a 31/10/2026): Semana 1 (28/09–04/10), Semana 2 (05/10–11/10), Semana 3 (12/10–18/10), Semana 4 (19/10–25/10), Semana 5 (26/10–31/10) — 34 dias no total (~4,857 semanas).

| Categoria de capacidade | Horas | Evidência ou suposição | Notas |
|---|---|---|---|
| Capacidade nominal do período | 97,1h | DEC-02(sessão) (20h/semana) × 34 dias ÷ 7 ≈ 4,857 semanas | 20 × 4,857 = 97,14h, arredondado para 97,1h |
| Compromissos fixos | 0h | ASM-02 — não evidenciado | Não subtraído por falta de informação, não por suposição de ausência |
| Overhead operacional | 0h | ASM-02 — não evidenciado | Idem |
| Capacidade de execução planejada | 97,1h | Nominal − compromissos fixos − overhead (0h + 0h) | Igual à nominal só porque nada foi descontado; ver ASM-01/ASM-02 sobre o risco disso |
| Reserva de contingência | 14,6h (15%) | Padrão fixo da metodologia (DEC-03(sessão)) | 15% de 97,1h = 14,6h |
| Total alocado às tarefas do período | 82,5h | Execução planejada − contingência (97,1h − 14,6h) | Estritamente menor que a capacidade nominal (97,1h) |

## 8. Plano de Frentes de Trabalho (Workstreams)

| Frente | Resultado do período | Prioridade | Responsável | Stakeholders | Dependências | Capacidade alocada | Evidência de conclusão |
|---|---|---|---|---|---|---|---|
| Editorial — Pilares (P1/P2/P3) | 3 pilares publicados com gates G-PILAR1/2/3 aprovados | Alta (backbone do período, FACT-02) | A definir (GAP-02) | Nenhum stakeholder formal declarado | SETUP-001 concluído (FACT-04); estrutura `editorial/pilares/` já existe (FACT-05) | ~66h (13 tarefas TSK-0004 a TSK-0018, estimativa por peso do ARVOREKIT) | Linhas P1-005/P2-005/P3-005 concluídas em SRC-05 + publicação real |
| Editorial — Governança (EDT) | Pilares aprovados, PEM consolidado, pipeline definido | Alta (bloqueia declarar EDT concluída, GAP-01) | A definir (GAP-02) | Nenhum stakeholder formal declarado | Nenhuma (EDT-01 não depende de nada além de GOV-01, fora de escopo) | ~10h (TSK-0001 a TSK-0003) | EDT-01/02/03 com evidência no Foundation Doc |
| Distribuição — Priorização inicial (DST) | Canais priorizados e KPIs definidos | Média (paralela, não bloqueia a produção dos pilares) | A definir (GAP-02) | Nenhum stakeholder formal declarado | DST-01 depende de EDT-02 (GAP-04); DST-02 é independente | ~6,5h (TSK-0019, TSK-0020) | DST-01/DST-02 com evidência no Foundation Doc |

Total alocado nas 3 frentes: ~82,5h, dentro do limite calculado em §7.

## 9. Plano Operacional Semanal

| Semana | Resultado principal | Tarefas | Responsável | Dependência | Métrica | Evidência de conclusão | Gate |
|---|---|---|---|---|---|---|---|
| Semana 1 (28/09–04/10) | Pilar 1 pesquisado, definido e redigido; governança editorial iniciada | TSK-0001 a TSK-0008 | A definir | Nenhuma | P1-005 concluída | Registro em SRC-05 + publicação | G-PILAR1 |
| Semana 2 (05/10–11/10) | Pilar 2 pesquisado, definido e redigido | TSK-0009 a TSK-0013 | A definir | G-PILAR1 aprovado | P2-005 concluída | Registro em SRC-05 + publicação | G-PILAR2 |
| Semana 3 (12/10–18/10) | Pilar 3 pesquisado, definido e redigido; PEM consolidado | TSK-0014 a TSK-0018, TSK-0002 | A definir | G-PILAR2 aprovado | P3-005 concluída | Registro em SRC-05 + publicação | G-PILAR3 |
| Semana 4 (19/10–25/10) | Pipeline editorial definido; priorização de canais iniciada | TSK-0003, TSK-0019 | A definir | G-PILAR3 aprovado | EDT-03 e DST-01 com evidência | Registro no Foundation Doc | GATE-04(sessão) |
| Semana 5 (26/10–31/10) | KPIs de distribuição definidos; fechamento do período | TSK-0020 | A definir | Nenhuma | DST-02 com evidência | Registro no Foundation Doc | GATE-05(sessão) |

## 10. Registro Executável de Tarefas

O bloco CSV completo (25 colunas, `references/schema-csv-tarefas.md`, TSK-0001 a TSK-0020) está reproduzido em `linear-import-editorial-blog-risco-cognitivo-2026-10.md` — não duplicado aqui para evitar divergência entre cópias; ambos os arquivos foram gerados na mesma execução e devem ser mantidos juntos.

## 11. Visão Diária de Baixa Carga Cognitiva

Não aplicável em granularidade diária — o cronograma real (SRC-05) já opera em granularidade de tarefa por dia dentro de cada semana (ex.: P1-001 em 28/09, P1-002 em 29/09), que é exatamente o que §9 e §10 já registram. Repetir isso como uma visão diária separada duplicaria a informação sem agregar valor.

## 12. Mapa de Stakeholders e Dependências

| ID | Stakeholder ou dependência | Papel | Input necessário | Data necessária | Responsável pelo acompanhamento | Impacto se falhar |
|---|---|---|---|---|---|---|
| DEP-01 | Conclusão de TSK-0001/0002/0003 (governança editorial) | Dependência interna | Pilares aprovados, PEM consolidado, pipeline definido | Ao longo do período (não bloqueia P1-P3, que já têm cronograma próprio) | A definir (GAP-02) | EDT-01/02/03 seguem sem evidência de conclusão indefinidamente |
| DEP-02 | Frente de engenharia (fora deste plano): blog full stack (AR-01), schema (AR-06) | Dependência externa | Blog publicável, schema de conteúdo aprovado | Conforme cronograma da outra sessão | Fora do escopo deste plano | Pilares redigidos e revisados neste plano podem não ter onde publicar (BLOG-05/BLOG-10, fora de escopo) |
| STK-01 | Titular do plano (EXECUTAR / Blog Risco Cognitivo) | Decisor de owner (GAP-02) e de reconciliação pack↔pilar (GAP-03/CONF-01) | Confirmação de responsável; decisão sobre DEC-10 do Foundation Doc | Antes do fechamento do período | Titular | Sem decisão, GAP-02 e GAP-03 seguem em aberto |

## 13. Métricas e Cadência de Revisão

| ID Métrica | Métrica | Fórmula | Fonte de dado | Frequência | Meta | Decisão acionada |
|---|---|---|---|---|---|---|
| MET-01 | Progresso dos pilares | Contagem de gates aprovados (G-PILAR1/2/3) ÷ 3 | SRC-05 / Foundation Doc | Semanal | 3 de 3 até 16/10/2026 | Se atrasar, replanejar semana seguinte |
| MET-02 | Governança editorial fechada | Contagem de EDT-01/02/03 com evidência ÷ 3 | SRC-02 | Semanal (a partir da Semana 4) | 3 de 3 até o fim do período | Se incompleta, priorizar na Semana 5 |
| MET-03 | Canais priorizados | Contagem de canais com função de funil definida | SRC-02 (Anexo E) | Uma vez, Semana 4 | Lista aprovada até 25/10/2026 | Base para o próximo ciclo mensal |

## 14. Riscos e Controles

| ID Risco | Risco | Evidência | Probabilidade | Impacto | Ação preventiva | Contingência | Responsável | Gatilho |
|---|---|---|---|---|---|---|---|---|
| RSK-01 | Duplicação de esforço entre o backbone P1-P3 (usado neste plano) e o detalhamento PACK-01/02/03 do Foundation Doc, se ambos forem executados sem reconciliação | CONF-01, GAP-03 | Média | Alto (retrabalho de produção de peças) | Registrar CONF-01 explicitamente; recomendar ao titular resolver DEC-10 antes do próximo ciclo | Se a duplicação já ocorrer, usar o Foundation Doc (Anexo D) como checklist de peças mínimas por pilar já publicado, não como novo cronograma | A definir (GAP-02) | Início de produção de peças derivadas (fora das 15 tarefas P1-P3) sem reconciliação prévia |
| RSK-02 | Cadência de 15 dias/ciclo usada neste plano (CONF-02) não é a decisão formalmente fechada no Foundation Doc (DEC-01 aberta) | CONF-02 | Baixa (já operacionalizada com datas reais) | Médio (se o titular decidir por 17 dias/pack, todo o cronograma de P1-P3 precisa ser refeito) | Nenhuma — depende de decisão formal do titular | Se DEC-01 for resolvida para 17 dias, recalcular §7 e §9 no próximo ciclo | Titular do plano | Decisão formal de DEC-01 |
| RSK-03 | Nenhum responsável confirmado impede execução coordenada de todas as 20 tarefas deste plano | GAP-02 | Alta (lacuna já observada) | Médio (atraso, não perda de qualidade) | Confirmar responsável o quanto antes na Semana 1 | Titular assume por padrão até nova decisão | Titular do plano | Nenhuma confirmação até o fim da Semana 1 |

## 15. Itens Adiados e Excluídos

| Item | Motivo do adiamento/exclusão | Evidência | Condição de reconsideração |
|---|---|---|---|
| Blog full stack, schema, agentes, Solution Store, Mapa Cognitivo (AR-01, AR-03, AR-04, AR-05, AR-06) | Excluídos por decisão explícita do usuário — engenharia é frente de outra sessão | DEC-01(sessão) | Se o titular pedir para consolidar as duas frentes em um único plano |
| Detalhamento de peças por pack (PACK-01/02/03, ~129 peças do Anexo F) como tarefas individuais deste backlog | Excede a capacidade de 82,5h se tratado como tarefas adicionais às 15 já agendadas; e depende de DEC-10 não resolvida (GAP-03) | FACT-06, GAP-03 | Quando DEC-10 for resolvida e a capacidade do próximo ciclo permitir |
| DST-03 a DST-08 (instrumentação técnica, moderação, aprendizado do lançamento) | Dependem de infraestrutura técnica (eventos first-party, BLOG-05) — fronteira com a frente de engenharia | Anexo F (SRC-02) | Quando a frente de engenharia entregar a base técnica de eventos |
| Quick Frameworks (QF-01 a QF-06) | Dependem de SCH-06 (schema), fora do escopo editorial desta rodada | GAP-05 | Quando a frente de engenharia formalizar o contrato de Block |

## 16. Gates de Decisão

| ID Gate | Decisão | Evidência necessária | Responsável pela decisão | Prazo | Consequência de não decidir |
|---|---|---|---|---|---|
| GATE-01(sessão) | Aprovar avanço para redação do Pilar 1 (TSK-0007) | Esboço de estrutura aprovado (TSK-0006) | A definir (GAP-02) | 30/09/2026 | Redação sem estrutura aprovada pode exigir retrabalho |
| GATE-02(sessão) | Aprovar publicação do Pilar 1 (TSK-0008) — libera G-PILAR2 | Conteúdo redigido e revisado (TSK-0007) | A definir (GAP-02) | 02/10/2026 | Pilar 2 não pode iniciar sem este gate (dependência real do cronograma) |
| GATE-03(sessão) | Aprovar publicação do Pilar 2 (TSK-0013) — libera G-PILAR3 | Conteúdo redigido e revisado (TSK-0012) | A definir (GAP-02) | 09/10/2026 | Pilar 3 não pode iniciar sem este gate |
| GATE-04(sessão) | Aprovar publicação do Pilar 3 (TSK-0018) — fecha o ciclo Problema-Método-Aplicação | Conteúdo redigido e revisado (TSK-0017) | A definir (GAP-02) | 16/10/2026 | Ciclo editorial completo não fecha |
| GATE-05(sessão) | Resolver DEC-10 (mapeamento pack↔pilar) e DEC-01 (15 vs 17 dias) do Foundation Doc | Decisão explícita do titular, registrada em ambos os documentos | Titular do plano | Antes do próximo ciclo mensal | RSK-01 e RSK-02 seguem abertos indefinidamente |

## 17. Próxima Ação Imediata

**Ação única:** iniciar TSK-0004 (pesquisar e mapear fundamentos dos riscos cognitivos — P1-001).

- **Responsável:** a definir pelo titular (GAP-02) — até lá, elegível para qualquer executor disponível na frente editorial.
- **Fonte:** FACT-02 (SRC-05) — primeira tarefa do cronograma real, sem dependência bloqueante, já com data comprometida (28/09/2026).
- **Resultado esperado:** fundamentos, tipos e manifestações de riscos cognitivos mapeados com fonte citável.
- **Duração máxima razoável:** 4 blocos de 90 min (conforme `tempo_estimado` em `linear-import-editorial-blog-risco-cognitivo-2026-10.md`).
- **Evidência de conclusão:** mapeamento registrado com fontes, referenciando P1-001.
- **Por que esta ação e não outra:** é a única tarefa sem nenhuma dependência bloqueante (TSK-0001/0002/0003 de governança são importantes mas não bloqueiam o início do Pilar 1, que já tem data comprometida desde 28/09/2026 — atrasar TSK-0004 atrasaria todo o cronograma em cascata, já que P1→P2→P3 são sequenciais via gates).

## Apêndice A — Tabela Mínima de Rastreabilidade

| ID | Requisito | Fonte original | Citação da fonte | Classificação | Status de evidência | Dependência | Ação |
|---|---|---|---|---|---|---|---|
| REQ-01 | Os 3 pilares devem ser publicados na sequência Problema→Método→Aplicação, com gates G-PILAR1/2/3 | SRC-05, SRC-02 | `blog-riscos-cognitivos-tres-pilares_DADOS.csv`; Foundation Doc seção 00 | REQUIREMENT (derivado de fonte já comprometida com datas) | PARCIALMENTE EVIDENCIADO (agendado, não publicado) | Nenhuma | TSK-0004 a TSK-0018 |
| REQ-02 | Governança editorial (pilares aprovados, PEM, pipeline) deve preceder ou acompanhar a produção dos pilares | SRC-02 | Foundation Doc, Anexo F (EDT-01/02/03) | REQUIREMENT (derivado do próprio Foundation Doc) | NÃO EVIDENCIADO | GAP-01 | TSK-0001 a TSK-0003 |
| REQ-03 | Mapeamento entre PACK-01/02/03 e os 3 pilares não deve ser assumido sem confirmação | SRC-02 | Foundation Doc, DEC-10 | CONSTRAINT (limite documentado explícito) | EVIDENCIADO (a restrição em si está documentada) | GAP-03, CONF-01 | Este plano usa P1-P3 como backbone, não PACK-01/02/03, conforme DEC-04(sessão) |
| REQ-04 | Reserva de contingência deve ser 15% da capacidade de execução planejada | `motor-evidencia-fontes.md` | Padrão fixo da metodologia | REQUIREMENT (regra fixa da metodologia) | EVIDENCIADO (aplicado em §7: 14,6h = 15% de 97,1h) | Nenhuma | Já cumprido em §7 |

## Apêndice B — Referências Cruzadas Rápidas

- Meta do período → §6 (Objetivos)
- O que fazer agora → §17 (Próxima Ação Imediata) + TSK-0004 em `linear-import-editorial-blog-risco-cognitivo-2026-10.md`
- Capacidade e contingência → §7
- Conflito entre PACK-01/02/03 e P1-P3 → §3.5 (CONF-01)
- Conflito de cadência 15 vs 17 dias → §3.5 (CONF-02)
- Lacunas de governança editorial → §3.4 (GAP-01, GAP-04)
- Fronteira com a frente de engenharia → §15 (Itens Excluídos)
- Plano semana a semana → §9
- Riscos do período → §14
- Gates de decisão → §16

## Registro Final de Honestidade

Todas as lacunas identificadas neste processamento foram preservadas como GAP explícito (§3.4), nunca preenchidas por inferência ou suposição disfarçada de fato. Nenhum baseline, meta numérica, responsável ou data foi inventado onde a fonte silenciou — os campos correspondentes permanecem "a definir"/"TBD", refletindo fielmente o estado real do Foundation Doc, do cronograma ARVOREKIT e da taxonomia D16 em 28/09/2026. O conflito entre as duas nomenclaturas de tarefa (CONF-01) e o conflito de cadência já conhecido (CONF-02) não foram resolvidos silenciosamente: ambas as versões foram preservadas em §3.5, com a regra de precedência explicitada e a justificativa de por que o cronograma real (P1-P3) foi escolhido como backbone deste backlog, sem descartar o detalhamento de peças do Foundation Doc. Não se afirma, em nenhum ponto deste documento, conformidade normativa nem conclusão de nenhuma das 211 tarefas do Foundation Doc — todas seguem com status real (aberta/sem evidência). O termo "recomendado" foi usado para ações sem base normativa ou decisão aprovada; "deve"/"obrigatório" foi reservado às decisões já aprovadas nesta conversa e às regras fixas da própria metodologia.

Fim do documento. Emitido em 28/09/2026 às 00:00 (America/Sao_Paulo).
