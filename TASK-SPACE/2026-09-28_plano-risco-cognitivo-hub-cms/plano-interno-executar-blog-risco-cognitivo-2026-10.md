Titular: EXECUTAR / Blog Risco Cognitivo (titular operacional designado pelo usuário nesta conversa, 28/09/2026)
Período coberto: 01/10/2026 a 31/10/2026
Data de emissão: 28/09/2026
Fuso horário: America/Sao_Paulo (BRT/GMT-3)
Versão: 1.0 — emissão inicial
Metodologia de produção: motor de evidência com hierarquia de fontes e classificação rastreável (skill `plano-operacional-rastreavel`)
Natureza deste documento: planejamento operacional executável. Não é auditoria, certificação,
opinião legal, aprovação regulatória, nem declaração formal de conformidade normativa.

---

## 1. Resumo Executivo

- **Objetivo operacional central do período:** avançar o conteúdo `CNT-RC-0001` ("O que é Risco Cognitivo?") do estágio atual (ARGUMENTAÇÃO/RASCUNHO) até o mais próximo possível de publicação dentro da capacidade do mês, seguindo o funil já definido no Hub Editorial CMS (Brief → Mapa de Argumentos → Evidências → Produção de Texto → Ativos Derivados → SEO → Calendário → Distribuição → Performance).
- **Resultado mais importante esperado:** corpo do artigo redigido (KR-01) e pelo menos 3 dos 5 formatos derivados priorizados no Brief (Shorts, carrossél, LinkedIn, newsletter, diagrama) avançados para produção (KR-02) — ver fontes em §6.
- **Capacidade realista total planejada:** 75,3h no mês (ver §7).
- **Frentes ativas simultâneas no mês:** 1 — Risco Cognitivo (Hub Editorial). WIP semanal recomendado: 1 conteúdo principal em produção simultânea (`CNT-RC-0001`), conforme decisão explícita do usuário de manter só essa frente em outubro/2026.
- **Restrição principal:** capacidade declarada de 20h/semana (DEC-02) e ausência de responsável (`owner`) confirmado para o conteúdo e seus ativos derivados (GAP-OWNER-01).
- **Risco principal:** dois registros do Banco de Conteúdo do Hub (argumentos e evidências) declaram contagens (3 argumentos, 3 evidências) que não têm registro correspondente nas abas de detalhe, que só mostram 1 cada (GAP-ARG-01, GAP-EVD-01) — risco de o artigo ser publicado com menos sustentação do que o indicador sugere.
- **Próxima ação imediata:** ver §17.

## 2. Inventário de Fontes e Evidências

| ID | Fonte | Tipo | Data/versão | Papel na análise | Confiabilidade/limitação |
|---|---|---|---|---|---|
| SRC-01 | Instruções do usuário nesta conversa (respostas ao intake: titular, período, frente do mês, capacidade semanal) | Instrução explícita | 28/09/2026 | Fonte tier 1 — define escopo, período e capacidade do plano | Alta; é a fonte mais autoritativa da hierarquia |
| SRC-02 | `af94b6a3-26-09-GTM-BLOG.md` — Ficha de caracterização da iniciativa "Blog Risco Cognitivo" | Documento de projeto do cliente | anexado 28/09/2026 | Contexto de negócio, 3 pilares editoriais (Riscos Cognitivos → Processos Neuroadaptativos → Ferramentas e Soluções), papel do Copiloto Operacional | Muitos campos do próprio documento estão marcados "TBD — a definir" pelo autor original (campos 11–22); não usados para inventar dado |
| SRC-03 | `MASTER_EDITORIAL_RISCO_COGNITIVO_V1.xlsx` (10 abas) — modelo PROBLEM→SOLUTION→ASSET | Documento de projeto do cliente / schema operacional | sem data de versão explícita no arquivo | Fonte do problema/solução canônicos (`RC-PROBLEM-001`, `RC-SOLUTION-001`) e do dashboard agregado (12 assets planejados, 0 publicados) | Dashboard e fábrica de assets (`03_ASSET_FACTORY`) é um nível de dado (problema/solução) diferente do Hub CMS — ver CONF-01 |
| SRC-04 | `Risco_Cognitivo_Hub_Editorial_CMS_v1.0.xlsx` (22 abas) — CMS operacional | Documento de projeto do cliente — declarado "fonte canônica do CMS" na própria aba `02_BANCO_CONTEUDO` | Versão 1.0, 01/09/2026 | Fonte primária de estado real de produção (`CNT-RC-0001`, argumentos, evidências, produção de texto, ativos derivados, SEO, calendário, backlog, log de decisões) | Priorizada sobre SRC-03 quando os dois descrevem o mesmo conteúdo (ver CONF-01), por ser a fonte que o próprio cliente rotulou como canônica para conteúdo |
| SRC-05 | `Runbooks/RUN-F1-PRODUCAO-EDITORIAL-MULTIPLATAFORMA.yaml` (repositório `executar-23/Copiloto-ops`) | Registro operacional/processo padrão da empresa | commit lido em 27–28/09/2026 | Processo padrão multiplataforma da empresa (ciclo de 15 dias, RACI, 22 passos) | Fonte tier 5 (registro operacional anterior); **não adotada** neste plano porque o Hub CMS real (SRC-04, tier 3) não declara nenhuma cadência fixa própria — citada só como referência, nunca como requisito deste plano |
| SRC-06 | `references/normas-fixas-iso.md` (conjunto ISO fixo da metodologia: 9001:2015/Amd1:2024, 10005, 10006, 21502, 31000, 10075-2) | Documento normativo anexado (fixo da metodologia) | vigente conforme o arquivo da skill | Limite normativo do documento (§4) | Ver SRC-EXT-01 abaixo — há atualização de edição a registrar |
| SRC-EXT-01 | ISO — "ISO launches update to world's most widely used quality management standard" (iso.org/news/2026/09/ISO9001-2026) e ANSI Blog "ISO 9001:2026 — Quality Management Systems Requirements" | EXTERNAL CURRENT SOURCE (fonte primária ISO + fonte secundária ANSI) | Publicado 16/09/2026; acessado 28/09/2026 | Confirma que **ISO 9001:2026** foi lançada em 16/09/2026, substituindo a edição 2015/Amd1:2024; certificados ISO 9001:2015 permanecem válidos até 30/09/2029 (transição de 3 anos) | A busca ao `iso.org/standard/62085.html` retornou HTTP 403 (bloqueio de acesso direto); o fato foi confirmado por resultados de busca e pela página de notícias oficial da ISO, não por leitura direta da norma (protegida por direitos autorais) |

**Fontes NÃO consultadas (por escolha justificada):** o arquivo `campanha_tdah_gestao_projetos_12_abas_numbers_print.xlsx` (mesmo zip) não foi usado — DECISION DEC-01, o usuário definiu explicitamente que a frente do mês é só Risco Cognitivo.

**Nota sobre atualização do protocolo da skill (§0 do `SKILL.md`):** conforme SRC-EXT-01, o conjunto normativo fixo desta metodologia (`normas-fixas-iso.md`) referencia a edição 2015/Amd 1:2024 da ISO 9001, que foi substituída por ISO 9001:2026 em 16/09/2026. Por instrução da própria skill ("não trocar norma por conta própria"), este documento **mantém** o conjunto fixo declarado (ISO 9001:2015/Amd 1:2024) e apenas sinaliza a atualização — recomenda-se que o arquivo `references/normas-fixas-iso.md` da skill seja revisado por quem mantém a metodologia.

## 3. Fatos, Decisões, Suposições, Lacunas e Conflitos

### 3.1 Fatos observáveis (FACT)

| ID | Fato | Fonte | Citação literal/localização |
|---|---|---|---|
| FACT-01 | `CNT-RC-0001` "O que é Risco Cognitivo?" é um Artigo fundador, rota "Risco Cognitivo", status editorial "ARGUMENTAÇÃO" | SRC-04 | aba `02_BANCO_CONTEUDO`, linha `CNT-RC-0001` |
| FACT-02 | O Brief de `CNT-RC-0001` está em status "EM PRODUÇÃO" e lista formatos derivados desejados: Shorts; carrosséis; LinkedIn; newsletter; diagramas | SRC-04 | aba `03_BRIEF_FORMULARIO`, linha `CNT-RC-0001` |
| FACT-03 | `ARG-RC-0001` (argumento "Problema") está em status "PESQUISA", classe epistêmica "E · Inferido" | SRC-04 | aba `04_MAPA_ARGUMENTOS`, linha `ARG-RC-0001` |
| FACT-04 | `EVD-RC-0001` (Sarah Gardner, Association for Project Management, "Leading in an age of cognitive risk…", 26/08/2026) está com status "VALIDADA", classe "C · Publicado" | SRC-04 | aba `05_EVIDENCIAS_FONTES`, linha `EVD-RC-0001` |
| FACT-05 | A Produção de Texto de `CNT-RC-0001` tem outline definido (9 blocos), 0 palavras no corpo redigidas, e cobertura de claims declarada em 100% (3 claims, 3 com evidência) | SRC-04 | aba `06_PRODUCAO_TEXTO`, linha `CNT-RC-0001` |
| FACT-06 | `AST-RC-0001` (YouTube Shorts, derivado de `CNT-RC-0001`) está em status "PLANEJADO", owner "Não determinado" | SRC-04 | aba `07_ATIVOS_DERIVADOS`, linha `AST-RC-0001` |
| FACT-07 | `VIS-RC-0001` (infográfico "Fator → Exposição → Evento → Consequência") está em status "BRIEF", owner "Não determinado" | SRC-04 | aba `08_INFOGRAFICOS_DRIVE`, linha `VIS-RC-0001` |
| FACT-08 | O SEO de `CNT-RC-0001` já tem slug (`/risco-cognitivo/`) e SEO Title definidos, status "EM PRODUÇÃO"; o campo "Links internos de entrada" está vazio | SRC-04 | aba `13_SEO_METADADOS`, linha `CNT-RC-0001` |
| FACT-09 | As abas de Calendário de Publicação, Distribuição e Performance não têm nenhuma linha de dado preenchida para `CNT-RC-0001` (só cabeçalho + linha padrão "PLANEJADO"/"Não determinado") | SRC-04 | abas `14_CALENDARIO_PUBLICACAO`, `15_DISTRIBUICAO`, `16_PERFORMANCE` |
| FACT-10 | O Backlog de Ideias tem `IDE-RC-0001` ("O problema da expressão erro humano"), prioridade "ALTA", status "TRIAGEM" | SRC-04 | aba `17_BACKLOG_IDEIAS`, linha `IDE-RC-0001` |
| FACT-11 | O Log de Decisões registra `DEC-RC-0001`: "Manter Risco Cognitivo como marca principal", decidida em 30/08/2026, owner "Não determinado" | SRC-04 | aba `20_LOG_DECISOES`, linha `DEC-RC-0001` |
| FACT-12 | O Master Editorial declara: 1 problema cadastrado (`RC-PROBLEM-001`), 1 solução cadastrada (`RC-SOLUTION-001`), meta de 12 assets por problema, 12 assets gerados, 0 assets publicados, 0 problemas publicados | SRC-03 | aba `09_DASHBOARD` |
| FACT-13 | `RC-PROBLEM-001` ("Sobrecarga ao ler relatórios") tem prioridade "Alta", nível de consciência "Consciente da solução", pilar editorial "Controles e Ergonomia", e está ligado a `RC-SOLUTION-001` ("Conversor de Relatório") | SRC-03 | abas `01_PROBLEMS` e `02_SOLUTIONS` |
| FACT-14 | A fábrica de assets do Master (`03_ASSET_FACTORY`) lista 12 linhas de ativos derivados de `RC-PROBLEM-001`/`RC-SOLUTION-001` (ex.: `RC-PROBLEM-001-CAR-01`, `-REEL-02`, `-STORY-03`, `-PROMPT-04`, `-HTML-05`, …), todas em status "Planejado", com `production_owner` = "Leonardo" | SRC-03 | aba `03_ASSET_FACTORY` |
| FACT-15 | ISO 9001:2026 foi lançada em 16/09/2026, substituindo ISO 9001:2015/Amd 1:2024; certificados na edição 2015 continuam válidos até 30/09/2029 | SRC-EXT-01 | iso.org/news/2026/09/ISO9001-2026; blog.ansi.org/ansi/iso-9001-2026-qms-revision-updates |

### 3.2 Decisões aprovadas (DECISION)

| ID | Decisão | Fonte | Nota |
|---|---|---|---|
| DEC-01 | Frente do mês = só "Risco Cognitivo (Hub Editorial)"; a campanha TDAH x Gestão de Projetos fica fora deste plano | SRC-01 | Resposta explícita do usuário à pergunta de frentes do mês |
| DEC-02 | Capacidade semanal do titular = 20h/semana | SRC-01 | Resposta explícita do usuário |
| DEC-03 | Período do plano = Outubro/2026 (01/10 a 31/10/2026) | SRC-01 | Resposta explícita do usuário |
| DEC-04 | Titular do plano = "EXECUTAR / Blog Risco Cognitivo" | SRC-01 | Resposta explícita do usuário |
| DEC-05 | Reserva de contingência = 15% da capacidade de execução planejada (padrão fixo da metodologia; nenhum pedido do usuário para outro percentual) | `motor-evidencia-fontes.md` | Aplicado por padrão, não é uma escolha livre |

### 3.3 Suposições (ASSUMPTION)

| ID | Suposição | Por que foi necessária | Risco se errada |
|---|---|---|---|
| ASM-01 | O Hub Editorial CMS v1.0 (SRC-04) reflete o estado real e atual da produção (não uma versão desatualizada) | Não há confirmação explícita do usuário de que o Hub está com dados correntes; a única data do arquivo é 01/09/2026 | Se o Hub estiver desatualizado, tarefas deste plano podem repetir trabalho já feito ou ignorar avanço real não registrado |
| ASM-02 | Nenhum compromisso fixo ou overhead operacional consome a capacidade semanal declarada (20h) além do que está neste plano | O usuário não informou compromissos fixos nem overhead no intake (campo não coberto pelas 4 respostas) | Se houver compromissos não declarados, a capacidade real disponível para as tarefas de outubro é menor do que os 75,3h calculados em §7 |

### 3.4 Lacunas (GAP)

| ID | Lacuna | Fonte que deveria cobrir | Impacto | Ação recomendada |
|---|---|---|---|---|
| GAP-OWNER-01 | Nenhum responsável (`owner`) confirmado para `CNT-RC-0001` e a maioria de seus ativos derivados no Hub CMS (aparece "Não determinado" em Banco de Conteúdo, Brief, Ativos Derivados, Infográficos, Calendário, Distribuição, Log de Decisões) | SRC-04 (múltiplas abas) | Nenhuma tarefa deste plano pode ter responsável definido com confiança; ver CONF-01 sobre "Leonardo" | Confirmar com o titular se "Leonardo" (FACT-14, fonte diferente) é o responsável real ou se outro nome deve ser atribuído |
| GAP-ARG-01 | O Banco de Conteúdo declara "# Argumentos: 3" para `CNT-RC-0001`, mas só 1 argumento (`ARG-RC-0001`) tem registro na aba de Mapa de Argumentos | SRC-04, abas `02_BANCO_CONTEUDO` e `04_MAPA_ARGUMENTOS` | Risco de o artigo avançar com menos argumentação estruturada do que o indicador sugere | Localizar/registrar os 2 argumentos restantes antes de fechar a redação do corpo (ver TSK-0002) |
| GAP-EVD-01 | O Banco de Conteúdo declara "# Evidências: 3" para `CNT-RC-0001`, mas só 1 evidência (`EVD-RC-0001`) tem registro na aba de Evidências e Fontes | SRC-04, abas `02_BANCO_CONTEUDO` e `05_EVIDENCIAS_FONTES` | Mesmo risco do GAP-ARG-01, mas para sustentação factual do artigo | Localizar/registrar as 2 evidências restantes antes de fechar a redação (ver TSK-0003) |
| GAP-CAP-01 | Nenhum compromisso fixo semanal foi informado pelo usuário no intake | SRC-01 (campo não coberto) | Capacidade de execução planejada em §7 assume 0h de compromissos fixos | Confirmar no próximo ciclo de intake se há compromissos fixos a descontar |
| GAP-CAP-02 | Nenhum overhead operacional (reuniões, administração) foi informado pelo usuário | SRC-01 (campo não coberto) | Mesma lógica do GAP-CAP-01 | Idem |
| GAP-GATES-01 | Nenhum gate semanal foi definido pelo usuário no intake | SRC-01 (campo não coberto) | Os gates de §16 são propostos por Claude com base no funil do Hub CMS, não confirmados pelo titular | Titular deve validar ou ajustar os gates propostos em §16 |
| GAP-DIST-01 | Nenhuma distribuição percentual de capacidade (principal/operação/contingência) foi informada pelo usuário | SRC-01 (campo não coberto) | §7 aplica só o percentual fixo de contingência (15%); o restante da capacidade de execução não foi subdividido em "resultado principal" vs. "operação" | Titular pode declarar essa distribuição em um próximo ciclo, se desejar mais granularidade |
| GAP-RISK-01 | Nenhum risco/resposta específico do mês foi informado pelo usuário | SRC-01 (campo não coberto) | A tabela de riscos em §14 é derivada só da evidência do Hub CMS (GAP-ARG-01, GAP-EVD-01, GAP-OWNER-01), não de riscos declarados pelo titular | Titular pode complementar riscos adicionais no próximo ciclo |
| GAP-STK-01 | Nenhum stakeholder formal (consultor de validação, usuários-teste) foi informado | SRC-01 (campo não coberto) | §12 fica limitado às dependências internas do próprio funil do Hub CMS | Titular pode declarar stakeholders formais se existirem |
| GAP-CAL-01 | As abas de Calendário de Publicação, Distribuição e Performance do Hub CMS estão vazias — nenhuma data real de publicação, distribuição ou métrica registrada para `CNT-RC-0001` | SRC-04 | Nenhuma meta de data de publicação pode ser afirmada como compromisso; §9 e §13 usam "a definir" | Definir data-alvo de publicação quando a produção avançar (ver TSK-0008) |

### 3.5 Conflitos (CONFLICT)

| ID | Fonte A | Fonte B | Fonte priorizada | Regra de precedência usada |
|---|---|---|---|---|
| CONF-01 | SRC-03 (`03_ASSET_FACTORY` do Master Editorial): `production_owner` = "Leonardo" para os 12 ativos derivados de `RC-PROBLEM-001`/`RC-SOLUTION-001` | SRC-04 (várias abas do Hub CMS): owner = "Não determinado" para os ativos derivados de `CNT-RC-0001` (o mesmo conteúdo, em outra granularidade de dado) | SRC-04 (Hub CMS) | O Hub CMS se autodeclara "fonte canônica do CMS" para conteúdo (aba `02_BANCO_CONTEUDO`: "Fonte canônica do CMS. Uma linha por conteúdo aprovado ou em produção.") e é a integração operacional mais recente; por isso o plano trata o owner como "Não determinado" (GAP-OWNER-01), mas registra "Leonardo" como candidato factual a confirmar com o titular — nenhuma das duas informações foi descartada |

## 4. Limite Normativo e Disclaimer

Este documento **não é** auditoria, certificação, opinião legal, aprovação regulatória, nem declaração formal de conformidade normativa.

O conjunto normativo de referência desta metodologia é fixo: ISO 9001:2015/Amd 1:2024 (única norma do conjunto com requisitos de sistema de gestão), ISO 10005, ISO 10006, ISO 21502, ISO 31000 e ISO 10075-2 (as cinco últimas são orientações, não requisitos obrigatórios — nunca se escreve "a norma X exige" para elas). Ver SRC-EXT-01 em §2 sobre a atualização para ISO 9001:2026 — mantido o conjunto fixo por instrução da própria metodologia.

Frameworks operacionais próprios da empresa (ex.: limite de 1 frente simultânea, distribuição de capacidade, contingência de 15%) foram excluídos da seção normativa — são decisão de desenho operacional, não requisito ISO. Toda afirmação normativa é rastreável a uma norma e cláusula específica do conjunto fixo; ausência de cláusula ou evidência observável impede conclusão. A Estrutura Harmonizada (Annex SL, §5) é usada apenas para organizar evidência, nunca como requisito autônomo.

## 5. Evidência Organizada pela Estrutura Harmonizada

Esta seção organiza a evidência disponível sob os 7 cabeçalhos da Estrutura Harmonizada — não é uma auditoria de conformidade, e a ausência de avaliação não implica não conformidade.

| Cabeçalho | Norma aplicável | Cláusula | Requisito | Evidência observável | Status | Lacuna/ação |
|---|---|---|---|---|---|---|
| 6. Planejamento | ISO 9001:2015/Amd1:2024 | 6.2 (Objetivos da qualidade e planejamento para alcançá-los) | Objetivo mensurável com método de acompanhamento | Objetivo do mês declarado em §6, com KR e fonte | PARCIALMENTE EVIDENCIADO | Falta baseline numérico de publicação/performance (GAP-CAL-01) |
| 8. Operação | — (orientação ISO 21502) | — | Planejamento operacional de tarefas com responsável e critério de aceite | Registro de tarefas em §10, com `fonte_id` | PARCIALMENTE EVIDENCIADO | Responsável não confirmado para a maioria das tarefas (GAP-OWNER-01) |
| 9. Avaliação de Desempenho | ISO 9001:2015/Amd1:2024 | 9.1 (Monitoramento, medição, análise e avaliação) | Métricas de desempenho com meta e frequência | Abas `16_PERFORMANCE`/`15_DISTRIBUICAO` existem, mas sem nenhuma linha preenchida | NÃO EVIDENCIADO | Nenhum dado de performance real ainda existe para `CNT-RC-0001` (o conteúdo não foi publicado) |

As demais 4 subseções da Estrutura Harmonizada (Contexto, Liderança, Suporte, Melhoria) não têm evidência material específica deste mês no Hub CMS além do que já está registrado em §2–§3 — classificadas como NÃO AVALIADO neste ciclo, não como não conformidade.

## 6. Objetivos do Mês e Resultados Mensuráveis

| ID Objetivo | Objetivo do mês | Fonte | Resultado mensurável | Baseline | Meta do mês | Método de validação |
|---|---|---|---|---|---|---|
| OBJ-01 | Avançar `CNT-RC-0001` de ARGUMENTAÇÃO/RASCUNHO para o mais próximo possível de publicação | FACT-01, FACT-05 | KR-01: corpo do artigo redigido (≥ outline de 9 blocos cobertos) | 0 palavras no corpo (FACT-05) | Corpo redigido e revisado | Contagem de palavras + checklist de cobertura de claims na aba `06_PRODUCAO_TEXTO` |
| OBJ-02 | Produzir os formatos derivados priorizados no Brief a partir do artigo | FACT-02 | KR-02: pelo menos 3 dos 5 formatos (Shorts, carrossél, LinkedIn, newsletter, diagrama) com ativo criado e em produção | 1 ativo planejado (`AST-RC-0001`, FACT-06); 1 infográfico em BRIEF (`VIS-RC-0001`, FACT-07) | ≥ 3 ativos em status "Produção" ou além | Contagem de linhas com status ≥ "Produção" nas abas `07_ATIVOS_DERIVADOS`/`08_INFOGRAFICOS_DRIVE` |
| OBJ-03 | Resolver a lacuna de sustentação argumentativa e de evidências antes de fechar o corpo do artigo | GAP-ARG-01, GAP-EVD-01 | KR-03: 3 argumentos e 3 evidências com registro completo (hoje 1 de cada) | 1 argumento, 1 evidência registrados | 3 argumentos, 3 evidências registrados | Contagem de linhas em `04_MAPA_ARGUMENTOS` e `05_EVIDENCIAS_FONTES` |
| OBJ-04 | Decidir sobre o próximo item do backlog (`IDE-RC-0001`, prioridade ALTA) dentro da capacidade restante do mês | FACT-10 | KR-04: decisão registrada em `20_LOG_DECISOES` sobre abrir ou não `RC-PROBLEM-002` em outubro | Item em status TRIAGEM | Decisão tomada (abrir ou adiar) | Nova linha em `20_LOG_DECISOES` |

Apenas 4 objetivos foram mantidos, dimensionados à capacidade de 75,3h calculada em §7 — nenhum objetivo foi inflado para parecer mais completo.

## 7. Capacidade e Alocação do Mês

Semanas civis do período (Out/2026): Semana 1 (01/10 a 04/10, parcial), Semana 2 (05/10 a 11/10), Semana 3 (12/10 a 18/10), Semana 4 (19/10 a 25/10), Semana 5 (26/10 a 31/10, parcial) — 31 dias no total.

| Categoria de capacidade | Horas | Evidência ou suposição | Notas |
|---|---|---|---|
| Capacidade nominal do mês | 88,6h | DEC-02 (20h/semana) × 31 dias ÷ 7 ≈ 4,43 semanas | 20 × (31/7) = 88,57h, arredondado para 88,6h |
| Compromissos fixos | 0h | ASM-02 / GAP-CAP-01 — não evidenciado no intake | Não subtraído por falta de informação, não por suposição de que não existe |
| Overhead operacional | 0h | ASM-02 / GAP-CAP-02 — não evidenciado no intake | Idem |
| Capacidade de execução planejada | 88,6h | Nominal − compromissos fixos − overhead (0h + 0h) | Igual à nominal só porque nada foi descontado; ver ASM-02 sobre o risco disso |
| Reserva de contingência | 13,3h (15%) | Padrão fixo da metodologia (DEC-05) | 15% de 88,6h = 13,3h |
| Total alocado às tarefas do mês | 75,3h | Execução planejada − contingência (88,6h − 13,3h) | Estritamente menor que a capacidade nominal (88,6h), conforme exigido pela metodologia |

## 8. Plano de Frentes de Trabalho (Workstreams)

| Frente | Resultado de outubro | Prioridade | Responsável | Stakeholders | Dependências | Capacidade alocada | Evidência de conclusão |
|---|---|---|---|---|---|---|---|
| Risco Cognitivo (Hub Editorial) | `CNT-RC-0001` com corpo redigido, argumentos/evidências completos (3+3), e ≥ 3 ativos derivados em produção | Alta (única frente do mês, DEC-01) | A definir (GAP-OWNER-01; candidato factual "Leonardo", ver CONF-01) | Nenhum stakeholder formal declarado (GAP-STK-01) | Outline já definido (FACT-05); Brief já em produção (FACT-02) | 75,3h (100% da capacidade alocada do mês, única frente ativa) | Linhas atualizadas em `06_PRODUCAO_TEXTO`, `04_MAPA_ARGUMENTOS`, `05_EVIDENCIAS_FONTES`, `07_ATIVOS_DERIVADOS`, `08_INFOGRAFICOS_DRIVE` do Hub CMS |

## 9. Plano Operacional Semanal

| Semana | Resultado principal | Tarefas | Responsável | Dependência | Métrica | Evidência de conclusão | Gate |
|---|---|---|---|---|---|---|---|
| Semana 1 (01/10–04/10) | Lacunas de argumentação e evidência fechadas | TSK-0002, TSK-0003 | A definir | Nenhuma | GAP-ARG-01/GAP-EVD-01 fechados | Linhas novas em `04_MAPA_ARGUMENTOS`/`05_EVIDENCIAS_FONTES` | GATE-01 |
| Semana 2 (05/10–11/10) | Corpo do artigo redigido | TSK-0001 | A definir | GATE-01 aprovado | Palavras no corpo ≥ cobertura do outline | Linha atualizada em `06_PRODUCAO_TEXTO` | GATE-02 |
| Semana 3 (12/10–18/10) | Ativos derivados e infográfico em produção | TSK-0004, TSK-0005 | A definir | GATE-02 aprovado | ≥ 3 ativos em status "Produção" | Linhas atualizadas em `07_ATIVOS_DERIVADOS`/`08_INFOGRAFICOS_DRIVE` | GATE-03 |
| Semana 4 (19/10–25/10) | SEO fechado e calendário de publicação definido | TSK-0007, TSK-0008 | A definir | GATE-03 aprovado | Meta description e links internos completos; data-alvo registrada | Linha atualizada em `13_SEO_METADADOS`/`14_CALENDARIO_PUBLICACAO` | GATE-04 |
| Semana 5 (26/10–31/10) | Governança do mês fechada: owner confirmado, backlog triado, decisão registrada | TSK-0006, TSK-0009, TSK-0010 | A definir | GATE-04 aprovado | Owner confirmado; decisão sobre `IDE-RC-0001` registrada | Nova linha em `20_LOG_DECISOES` | GATE-05 |

Não foram alocadas tarefas para sábados/domingos — o Hub CMS e o intake não indicam modelo de dias não úteis, então o plano segue granularidade semanal, não diária (ver §11).

## 10. Registro Executável de Tarefas

O bloco CSV completo (25 colunas, `references/schema-csv-tarefas.md`, TSK-0001 a TSK-0010) está reproduzido em `linear-import-executar-blog-risco-cognitivo-2026-10.md` (colunas 1–22) mais os campos `tempo_estimado`, `status`, `fonte_id` — não duplicado aqui para evitar divergência entre cópias; ambos os arquivos foram gerados na mesma execução e devem ser mantidos juntos.

## 11. Visão Diária de Baixa Carga Cognitiva

Não aplicável em granularidade diária neste ciclo — o Hub CMS e o intake do titular não indicam um modelo de dias úteis fixos nem uma cadência diária declarada (diferente, por exemplo, do Runbook RUN-F1 do Copiloto-ops, que não foi adotado aqui, ver §2/SRC-05). O plano usa a visão semanal de §9, que já traz resultado principal, tarefas, gate e evidência por semana — não inventar trabalho para todo dia quando o modelo real do cliente é semanal.

## 12. Mapa de Stakeholders e Dependências

| ID | Stakeholder ou dependência | Papel | Input necessário | Data necessária | Responsável pelo acompanhamento | Impacto se falhar |
|---|---|---|---|---|---|---|
| DEP-01 | Conclusão de TSK-0002/TSK-0003 (argumentos e evidências completos) | Dependência interna | 3 argumentos + 3 evidências registrados | Antes do fim da Semana 1 | A definir (GAP-OWNER-01) | TSK-0001 (redação do corpo) fica bloqueada ou avança com sustentação incompleta |
| DEP-02 | Conclusão de TSK-0001 (corpo redigido) | Dependência interna | Corpo do artigo redigido | Antes do início da Semana 3 | A definir (GAP-OWNER-01) | TSK-0004/TSK-0005/TSK-0007 (derivados, infográfico, SEO) ficam bloqueadas ou refazem pesquisa |
| STK-01 | Titular do plano (EXECUTAR / Blog Risco Cognitivo) | Decisor de owner (TSK-0006) e de abertura de backlog (TSK-0009) | Confirmação de owner e decisão sobre `IDE-RC-0001` | Semana 5 | Titular | Sem decisão, GAP-OWNER-01 e o backlog seguem em aberto indefinidamente |

Nenhum stakeholder externo formal (consultor de validação, usuários-teste) foi declarado — ver GAP-STK-01.

## 13. Métricas e Cadência de Revisão

| ID Métrica | Métrica | Fórmula | Fonte de dado | Frequência | Meta | Decisão acionada |
|---|---|---|---|---|---|---|
| MET-01 | Cobertura de argumentação | (nº de argumentos registrados ÷ 3) × 100% | Aba `04_MAPA_ARGUMENTOS` | Semanal (Semana 1) | 100% (3 de 3) | Se < 100% ao fim da Semana 1, TSK-0001 não deve iniciar (gate GATE-01) |
| MET-02 | Cobertura de evidências | (nº de evidências registradas ÷ 3) × 100% | Aba `05_EVIDENCIAS_FONTES` | Semanal (Semana 1) | 100% (3 de 3) | Mesma lógica de MET-01 |
| MET-03 | Progresso de redação do corpo | Palavras redigidas — baseline não evidenciado, medir antes de confirmar meta numérica | Aba `06_PRODUCAO_TEXTO` | Semanal (Semana 2) | Corpo cobrindo os 9 blocos do outline | Se incompleto ao fim da Semana 2, replanejar Semana 3 |
| MET-04 | Ativos derivados em produção | Contagem de linhas com status ≥ "Produção" | Aba `07_ATIVOS_DERIVADOS` | Semanal (Semana 3) | ≥ 3 | Se < 3, ajustar prioridade de formatos na Semana 4 |

## 14. Riscos e Controles

| ID Risco | Risco | Evidência | Probabilidade | Impacto | Ação preventiva | Contingência | Responsável | Gatilho |
|---|---|---|---|---|---|---|---|---|
| RSK-01 | Artigo ser redigido/publicado com sustentação incompleta (só 1 de 3 argumentos/evidências reais) | GAP-ARG-01, GAP-EVD-01 | Média (qualitativo — sem dado histórico) | Alto (credibilidade do conteúdo fundador do pilar) | TSK-0002/TSK-0003 antes de TSK-0001 (dependência bloqueante) | Se as 2 evidências/argumentos restantes não forem localizados, reduzir o escopo do claim central em vez de publicar sem lastro | A definir (GAP-OWNER-01) | Fim da Semana 1 sem 3/3 registrados |
| RSK-02 | Nenhum responsável confirmado impede execução coordenada das tarefas | GAP-OWNER-01, CONF-01 | Alta (é lacuna já observada, não hipótese) | Médio (atraso, não perda de qualidade) | TSK-0006 na Semana 5, mas recomendável antecipar para a Semana 1 se possível | Se a decisão de owner não vier a tempo, o titular do plano assume por padrão até nova decisão | Titular do plano | Nenhuma confirmação até o fim da Semana 1 |
| RSK-03 | Capacidade real menor que a calculada por compromissos/overhead não declarados (ASM-02) | GAP-CAP-01, GAP-CAP-02 | Não avaliável (sem dado) | Médio (menos tarefas concluídas que o planejado) | Nenhuma — depende de dado que o titular ainda não forneceu | Revisar §7 no próximo ciclo de intake com dados reais de compromissos fixos | Titular do plano | Constatação de sobrecarga durante a execução |

## 15. Itens Adiados e Excluídos

| Item | Motivo do adiamento/exclusão | Evidência | Condição de reconsideração |
|---|---|---|---|
| Campanha TDAH x Gestão de Projetos (10 peças-matriz + ebook de 12 capítulos) | Excluída do plano por decisão explícita do usuário (DEC-01) — fora da frente do mês | DEC-01 | Se o titular decidir incluir essa frente em um próximo ciclo mensal |
| Distribuição e Performance de `CNT-RC-0001` (abas `15_DISTRIBUICAO`/`16_PERFORMANCE`) | Adiado — depende de publicação, que não está confirmada para este mês (GAP-CAL-01) | FACT-09 | Quando TSK-0008 definir uma data-alvo de publicação viável |
| Abertura de `RC-PROBLEM-002` a partir de `IDE-RC-0001` | Não decidido antecipadamente — depende da capacidade restante após as tarefas de `CNT-RC-0001` (ver TSK-0009) | FACT-10 | Resultado de TSK-0009 na Semana 5 |
| Formatos derivados adicionais além dos 3 priorizados em TSK-0004 (dos 5 do Brief) | Excede a capacidade calculada de 75,3h se todos os 5 formatos forem produzidos junto com as demais tarefas do mês | §7 (cálculo de capacidade) | Se a Semana 3 concluir com capacidade sobrando |

## 16. Gates de Decisão

| ID Gate | Decisão | Evidência necessária | Responsável pela decisão | Prazo | Consequência de não decidir |
|---|---|---|---|---|---|
| GATE-01 | Aprovar avanço para redação do corpo (TSK-0001) | 3/3 argumentos e evidências registrados (MET-01, MET-02) | A definir (GAP-OWNER-01) | Fim da Semana 1 (04/10/2026) | TSK-0001 não deve iniciar com sustentação incompleta — risco RSK-01 se ignorado |
| GATE-02 | Aprovar avanço para produção de derivados (TSK-0004/TSK-0005) | Corpo do artigo redigido (MET-03) | A definir (GAP-OWNER-01) | Fim da Semana 2 (11/10/2026) | Derivados produzidos sem fonte final podem exigir retrabalho |
| GATE-03 | Aprovar avanço para SEO/calendário (TSK-0007/TSK-0008) | ≥ 3 ativos derivados em produção (MET-04) | A definir (GAP-OWNER-01) | Fim da Semana 3 (18/10/2026) | Definir data de publicação sem produção suficiente gera compromisso não sustentável |
| GATE-04 | Aprovar fechamento de governança do mês (TSK-0006/TSK-0009/TSK-0010) | SEO e calendário definidos (§9, Semana 4) | Titular do plano | Fim da Semana 4 (25/10/2026) | Mês fecha sem owner confirmado nem decisão sobre backlog |
| GATE-05 | Aprovar o plano de novembro/2026 com base no fechamento de outubro | Registro consolidado em `20_LOG_DECISOES` (TSK-0010) | Titular do plano | Fim da Semana 5 (31/10/2026) | Próximo ciclo mensal não tem base de partida rastreável |

## 17. Próxima Ação Imediata

**Ação única:** iniciar TSK-0002 (completar o Mapa de Argumentos de `CNT-RC-0001`).

- **Responsável:** a definir pelo titular (GAP-OWNER-01) — até lá, a ação é elegível para qualquer executor disponível na frente Risco Cognitivo.
- **Fonte:** GAP-ARG-01, bloqueante de TSK-0001 (dependência registrada em §10).
- **Resultado esperado:** 3 linhas completas em `04_MAPA_ARGUMENTOS` para `CNT-RC-0001` (hoje: 1).
- **Duração máxima razoável:** 90 minutos (conforme `tempo_estimado` em `linear-import-executar-blog-risco-cognitivo-2026-10.md`).
- **Evidência de conclusão:** aba `04_MAPA_ARGUMENTOS` do Hub CMS com 3 linhas para `CNT-RC-0001`.
- **Por que esta ação e não outra:** é a única tarefa sem dependência bloqueante própria (TSK-0003 é paralela e igualmente elegível), e ambas bloqueiam a tarefa central do mês (TSK-0001, redação do corpo) — atacar a lacuna de sustentação argumentativa primeiro reduz o risco RSK-01 antes de qualquer investimento em redação.

## Apêndice A — Tabela Mínima de Rastreabilidade

| ID | Requisito | Fonte original | Citação da fonte | Classificação | Status de evidência | Dependência | Ação |
|---|---|---|---|---|---|---|---|
| REQ-01 | Corpo do artigo de `CNT-RC-0001` deve cobrir os 9 blocos do outline já definido | SRC-04, aba `06_PRODUCAO_TEXTO` | Outline: "Problema invisível; risco; cognitivo; definição; distinções; modelo; exemplos; contexto; próximos passos" | REQUIREMENT (derivado do outline já aprovado, não obrigação normativa) | PARCIALMENTE EVIDENCIADO (outline existe, corpo com 0 palavras) | GAP-ARG-01, GAP-EVD-01 | TSK-0001 |
| REQ-02 | Argumentos e evidências de `CNT-RC-0001` devem somar 3 cada, conforme já declarado no Banco de Conteúdo | SRC-04, aba `02_BANCO_CONTEUDO` | "# Argumentos: 3", "# Evidências: 3" | REQUIREMENT (derivado de contagem já declarada pelo próprio cliente no CMS) | NÃO EVIDENCIADO (só 1 de cada registrado) | Nenhuma | TSK-0002, TSK-0003 |
| REQ-03 | Reserva de contingência do mês deve ser 15% da capacidade de execução planejada | `motor-evidencia-fontes.md` (padrão fixo da metodologia) | "Reserva de contingência: use sempre 15% da capacidade de execução planejada." | REQUIREMENT (regra fixa da própria metodologia da empresa, não norma ISO) | EVIDENCIADO (aplicado em §7: 13,3h = 15% de 88,6h) | Nenhuma | Já cumprido em §7 |
| REQ-04 | Owner de `CNT-RC-0001` e seus ativos deve ser confirmado antes de atribuição confiável de responsabilidade | SRC-04 (múltiplas abas), CONF-01 | Campo "Owner"/"Não determinado" em várias abas | GAP | NÃO EVIDENCIADO | CONF-01 | TSK-0006 |

## Apêndice B — Referências Cruzadas Rápidas

- Meta do mês → §6 (Objetivos)
- O que fazer agora → §17 (Próxima Ação Imediata) + §10 (TSK-0002/TSK-0003)
- Capacidade e contingência → §7
- Conflito de fontes sobre owner → §3.5 (CONF-01)
- Lacunas de argumentação/evidência → §3.4 (GAP-ARG-01, GAP-EVD-01)
- Atualização normativa (ISO 9001:2026) → §2 (SRC-EXT-01) e §4
- Plano semana a semana → §9
- Riscos do mês → §14
- O que ficou de fora → §15

## Registro Final de Honestidade

Todas as lacunas identificadas neste processamento foram preservadas como GAP explícito (§3.4), nunca preenchidas por inferência ou suposição disfarçada de fato. Nenhum baseline, data de publicação, hora ou responsável foi inventado onde a fonte silenciou — os campos correspondentes permanecem "a definir"/"TBD"/"Não determinado", refletindo fielmente o estado real do Hub Editorial CMS e do Master Editorial em 28/09/2026. O conflito identificado entre as duas planilhas (CONF-01, sobre o owner dos ativos derivados) não foi resolvido silenciosamente: ambas as versões foram preservadas em §3.5, com a regra de precedência explicitada. Não se afirma, em nenhum ponto deste documento, conformidade normativa — a seção 5 declara explicitamente os status NÃO EVIDENCIADO e NÃO AVALIADO onde aplicável. O termo "recomendado" foi usado para ações sem base normativa ou decisão aprovada (ex.: TSK-0004 priorizar 3 de 5 formatos); "deve"/"obrigatório" foi reservado às decisões já aprovadas pelo usuário nesta conversa (DEC-01 a DEC-05) e às regras fixas já documentadas da própria metodologia.

Fim do documento. Emitido em 28/09/2026 às 00:00 (America/Sao_Paulo).
