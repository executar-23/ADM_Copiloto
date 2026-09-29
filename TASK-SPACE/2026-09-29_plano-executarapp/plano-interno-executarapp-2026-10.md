Titular: EXECUTAR / EXECUTAR APP (resposta explícita do usuário nesta rodada — não reaproveitado de planos anteriores desta sessão, que eram de outra frente)
Período coberto: 01/10/2026 a 31/10/2026
Data de emissão: 29/09/2026
Fuso horário: America/Sao_Paulo (BRT/GMT-3)
Versão: 1.0 — emissão inicial
Metodologia de produção: motor de evidência com hierarquia de fontes e classificação rastreável (skill `plano-operacional-rastreavel`)
Natureza deste documento: planejamento operacional executável. Não é auditoria, certificação,
opinião legal, aprovação regulatória, nem declaração formal de conformidade normativa.

**Escopo desta rodada:** o usuário pediu explicitamente cobrir **todas as 5 páginas da fonte**, organizadas em Epic/Issue, com desenvolvimento **full stack** — ou seja, o backlog completo do lançamento do EXECUTAR APP (produto), não um subconjunto. Este documento registra o backlog integral (11 Epics, 48 Issues, ~403h de esforço estimado) e, dentro dele, aloca para execução em Outubro/2026 apenas o subconjunto que cabe na capacidade declarada (74h de 75,3h alocáveis) — ver DEC-06 e RSK-01 sobre por que o mês não cobre o escopo inteiro.

---

## 1. Resumo Executivo

- **Objetivo operacional central do período:** iniciar a construção full-stack do EXECUTAR APP pela base técnica (autenticação, persistência, API, frontend) e pelos 4 primeiros passos da jornada do usuário (Descoberta → Cadastro → Organização → Onboarding), dentro da capacidade real de Outubro/2026.
- **Resultado mais importante esperado:** fundação técnica operante (auth + banco + API + frontend shell) e os 4 primeiros passos da jornada implementados e testáveis — ver KR-01 a KR-02 em §6.
- **Capacidade realista total planejada:** 75,3h no mês; 74h alocados a tarefas de Outubro (ver §7).
- **Escopo total do backlog registrado neste plano (não só Outubro):** 11 Epics, 48 Issues, ~403h de esforço estimado (ver §10) — cobrindo as 5 páginas da fonte na íntegra: jornada de 25 etapas (pág.2), arquitetura full-stack (pág.4), workflow agentic e estados (pág.4), site público e rotas do app (pág.3), Primeiro Entregável Oficial (pág.5), Modo Rotina (pág.5) e mitigação de riscos/conflitos entre fontes (pág.5).
- **Restrição principal:** a capacidade mensal (75,3h) cobre ~18,4% do esforço total estimado do backlog completo (403h) — o mês não fecha o lançamento, apenas avança a fundação (DEC-06).
- **Risco principal:** a fonte declara, na própria pág.5, 4 divergências não resolvidas entre os dois XMind de origem (autenticação, persistência, critério de conclusão, e a ambiguidade "Prisma estratégico" vs. "Prisma ORM") — construir sobre elas sem decisão do titular arrisca retrabalho estrutural (CONF-01 a CONF-04).
- **Próxima ação imediata:** ver §17.

## 2. Inventário de Fontes e Evidências

| ID | Fonte | Tipo | Data/versão | Papel na análise | Confiabilidade/limitação |
|---|---|---|---|---|---|
| SRC-01 | Instruções do usuário nesta conversa (respostas ao intake: titular, período, capacidade, escopo total "full stack") | Instrução explícita | 29/09/2026 | Fonte tier 1 — define titular, período, capacidade e o escopo total (não um subconjunto) | Alta; fonte mais autoritativa da hierarquia |
| SRC-02 | `EXECUTAR_APP_cinco_paginas.pdf` — "Síntese dos dois XMind fornecidos: A (Arquitetura, Fluxos e Customer Journey) e B (Visão Sistêmica Mestre)", formato A3 horizontal, 5 páginas | Documento de projeto do cliente — síntese consolidada de duas fontes primárias (mapas mentais A e B) não anexadas individualmente | anexado 29/09/2026 | Fonte primária de todo o conteúdo deste plano: visão de produto (pág.1), jornada de 25 etapas (pág.2), experiência/telas (pág.3), arquitetura/Copiloto (pág.4), entregáveis/riscos/pendências (pág.5) | A própria fonte declara no rodapé da pág.1: "Leitura das fontes: especificação do produto e dos fluxos; implementação e decisões em aberto não foram verificadas" — ou seja, é um documento de especificação, não de implementação confirmada. A pág.5 registra explicitamente conflitos e lacunas entre A e B que não foram resolvidos na própria síntese — preservados aqui como CONF/GAP, nunca inferidos |

**Fontes NÃO consultadas nesta rodada:** os dois arquivos XMind originais (A e B) não foram anexados — só a síntese em PDF. Onde a síntese aponta uma divergência entre A e B sem resolver (pág.5), este documento preserva a divergência (§3.5) em vez de tentar reconstruir o XMind original.

## 3. Fatos, Decisões, Suposições, Lacunas e Conflitos

### 3.1 Fatos observáveis (FACT)

| ID | Fato | Fonte | Citação literal/localização |
|---|---|---|---|
| FACT-01 | O produto é descrito em 6 blocos macro: Valor e Direção; Entrada e Contexto; Inteligência e Plano; Experiência de Execução; Entrega e Aprendizado; Controle e Confiança | SRC-02 | pág.1 |
| FACT-02 | Fluxo mestre declarado: CAPTURAR → INTERPRETAR → ESTRUTURAR → PRIORIZAR → CONFIRMAR → EXECUTAR → VERIFICAR → REGISTRAR → EMITIR → ADAPTAR | SRC-02 | pág.1, "Do contexto à entrega comprovada" |
| FACT-03 | A jornada do usuário tem 25 etapas numeradas, em 5 grupos de 5 (Entrada e Acesso; Dados e Planejamento; Foco e Trabalho; Entrega e Visibilidade; Continuidade e Saída), cada etapa com um risco nomeado | SRC-02 | pág.2, "Jornada completa do usuário · 25 etapas" |
| FACT-04 | A própria fonte registra 2 problemas de qualidade não resolvidos na síntese: etapa 18 precisa ser alinhada à exigência de DoD+evidência da fonte B; a ação do usuário na etapa 14 está truncada na fonte A ("Usu...") | SRC-02 | pág.2, "Regra de leitura" |
| FACT-05 | 4 fases de experiência descritas com objetivo/sistema/percepção/atrito/métrica: Descoberta-Cadastro; Onboarding-Conexões; Scanner-Execução; Revisão-Estratégia | SRC-02 | pág.3 |
| FACT-06 | Mapa de rotas declarado para o site público (14 rotas) e para o aplicativo (rotas de entrada, projetos, tempo, inteligência, operação, views) | SRC-02 | pág.3 |
| FACT-07 | Stack técnica declarada: Frontend Web + Mobile (Expo/React Native); API/orquestração (Next.js/Node.js); Copilot Engine; Task Engine; Agent SDK (skills `executar-*`); Neon/PostgreSQL + Prisma ORM; Clerk; Stripe; Vercel; conectores OAuth2, webhooks e MCP | SRC-02 | pág.4 |
| FACT-08 | Workflow agentic nomeado (fonte B): SYNC → UNDERSTAND → STRUCTURE → VISUALIZE → PRE_APPROVE → DECOMPOSE → EXECUTE → RECONCILE → REPORT → REPLAN | SRC-02 | pág.4, "WORKFLOW AGENTIC · nomes e ordem da fonte B" |
| FACT-09 | Estados declarados: VALIDADO → PRONTO → EM EXECUÇÃO → VERIFICAR → CONCLUÍDO, mais BLOQUEADO; "DoD (Definition of Done) + evidência aprovada são a regra de conclusão (B)" | SRC-02 | pág.4 |
| FACT-10 | 12 comandos do Copiloto listados, registrados em log para auditoria | SRC-02 | pág.4 |
| FACT-11 | "Primeiro Entregável Oficial" = 8 itens: onboarding consolidado; Status Report dos projetos; Prisma (objetivos e valores); Mapa-OS operacional; backlog inicial priorizado; IDs verbais/taxonomia do workspace; rotinas propostas; próximos passos — usuário confirma o plano, registrar aprovação | SRC-02 | pág.5 |
| FACT-12 | Modo Rotina descrito como ciclo: padrão repetido → proposta de automação → consentimento explícito → definir gatilho/frequência → executar skill `executar-*` → registrar em memória/log → notificar conclusão/falha → aplicar retry | SRC-02 | pág.5 |
| FACT-13 | 5 riscos→respostas previstas explicitamente listados: tokens expostos; IA erra prazo crítico; carga cognitiva excessiva; agenda/dependência quebrada; conclusão errada/perda de dados | SRC-02 | pág.5 |
| FACT-14 | A própria fonte tem uma seção "A DEFINIR / CONFLITO NAS FONTES" listando 9 itens não fechados, incluindo um conflito explícito entre OCR tradicional e DINOv2/ONNX para o scanner, "registrado em B" | SRC-02 | pág.5 |
| FACT-15 | A própria fonte tem uma seção "PONTOS A ALINHAR ENTRE OS MAPAS" com 4 divergências nomeadas entre fonte A e fonte B (autenticação, persistência, conclusão, Prisma/PRE_APPROVE), fechando com a frase: "As pendências acima foram preservadas ou apontadas para alinhamento; nenhuma foi resolvida silenciosamente nesta conversão" | SRC-02 | pág.5 |

### 3.2 Decisões aprovadas (DECISION)

| ID | Decisão | Fonte | Nota |
|---|---|---|---|
| DEC-01(sessão) | Titular do plano = "EXECUTAR / EXECUTAR APP" | SRC-01 | Resposta explícita do usuário nesta rodada |
| DEC-02(sessão) | Período = Outubro/2026 (01/10 a 31/10/2026) | SRC-01 | Resposta explícita do usuário |
| DEC-03(sessão) | Capacidade semanal = 20h/semana | SRC-01 | Resposta explícita do usuário |
| DEC-04(sessão) | Escopo = **todas as 5 páginas da fonte**, organizadas em Epic/Issue, desenvolvimento full stack — não um subconjunto | SRC-01 | Resposta explícita do usuário à pergunta de escopo; substitui a opção "só onboarding+scanner" ou "só arquitetura" que havia sido oferecida |
| DEC-05(sessão) | Reserva de contingência = 15% da capacidade de execução planejada (padrão fixo da metodologia) | `motor-evidencia-fontes.md` | Nenhum pedido do usuário para outro percentual |
| DEC-06(sessão) | Como o escopo total (~403h estimadas, §10) excede em ~5,4× a capacidade alocável do mês (75,3h), o Registro Executável de Tarefas (§10) traz o **backlog integral** dos 11 Epics/48 Issues, mas só marca como "Outubro/2026" os itens que cabem em 74h dessa capacidade, escolhidos por critério de dependência estrutural evidenciada (fundação técnica antes de funcionalidade de usuário; ordem numérica da jornada de 25 etapas conforme a própria fonte, sem pular etapas) — os demais ficam com prazo "Backlog — ciclo seguinte" | Cálculo desta rodada (§7, §10) | Decisão de modelagem necessária para não silenciar o descompasso escopo×capacidade nem inventar um cronograma de 403h caberia em 1 mês; nenhuma tarefa foi descartada do backlog, só sequenciada |

### 3.3 Suposições (ASSUMPTION)

| ID | Suposição | Por que foi necessária | Risco se errada |
|---|---|---|---|
| ASM-01 | A fundação técnica (autenticação, persistência, API, shell de frontend — EPIC-06) precisa existir antes de qualquer etapa da jornada do usuário poder ser implementada de fato, mesmo que a fonte não declare essa ordem explicitamente entre "arquitetura" e "jornada" | A fonte descreve arquitetura (pág.4) e jornada (pág.2) como seções paralelas, sem afirmar qual vem primeiro — a suposição é de engenharia de software padrão (não é possível implementar Cadastro sem Auth, por exemplo), não uma decisão do cliente | Se o titular já tiver uma fundação técnica pronta em outro projeto/repositório (ex.: reaproveitando Clerk/Neon de outra iniciativa EXECUTAR), parte de EPIC-06 pode ser desnecessária ou muito mais rápida do que estimado aqui |
| ASM-02 | A capacidade de 20h/semana informada nesta rodada é dedicada ao EXECUTAR APP e não compartilhada com as frentes de Blog Risco Cognitivo já planejadas nesta mesma sessão de trabalho para o mesmo período (Outubro/2026) | O usuário não foi perguntado explicitamente se as capacidades das diferentes frentes desta sessão se somam ou competem pelo mesmo tempo do titular | Se a mesma pessoa/equipe executa as 3 frentes desta sessão (Blog Hub CMS, Blog Editorial GTM, EXECUTAR APP) com um único pool de 20h/semana, a capacidade real disponível para cada uma é uma fração dos valores calculados em cada plano — recomenda-se ao titular esclarecer isso antes do início da execução |
| ASM-03 | Os itens do "Primeiro Entregável Oficial" (EPIC-09, pág.5, FACT-11) referem-se a entregáveis do **produto para o usuário final** (onboarding, Status Report, Mapa-OS etc. dentro do app), não a documentos internos de gestão de projeto com o mesmo nome | A fonte não deixa isso explícito; a leitura mais consistente com o restante do documento (que descreve funcionalidades do app) é a de entregáveis do produto | Se "Primeiro Entregável Oficial" for na verdade um pacote de documentos de gestão (como nos planos anteriores desta sessão), EPIC-09 precisaria ser reformulado |

### 3.4 Lacunas (GAP)

| ID | Lacuna | Fonte que deveria cobrir | Impacto | Ação recomendada |
|---|---|---|---|---|
| GAP-01 | Energy Score citado duas vezes (pág.1 e pág.4) como componente do módulo Productivity, mas sempre marcado "a definir" | SRC-02 | ISS-08 (Productivity) não pode fechar critério de aceite sem essa definição | Titular deve definir a métrica antes de ISS-08 avançar para produção |
| GAP-02 | SLA de disponibilidade das APIs — citado como "a definir" na pág.5 | SRC-02 | Nenhum compromisso de disponibilidade pode ser assumido no plano | Definir antes do lançamento público |
| GAP-03 | Criptografia ponta-a-ponta em notas — citada como pendência distinta da criptografia em trânsito/repouso já declarada como fato (FACT-07 implícito, pág.4) | SRC-02 | ISS-31 (Auth/Billing) e ISS-30 (Persistência) não cobrem esse requisito adicional sem definição | Definir escopo de dados que exige ponta-a-ponta |
| GAP-04 | Conectores MCP customizados — citados como oportunidade em A, sem especificação | SRC-02 | ISS-32 (conectores) não tem escopo fechado para "customizados" | Levantar com o titular quais integrações customizadas são prioritárias |
| GAP-05 | Política de retenção/backup e de soft/hard delete no encerramento de conta — "a fechar"/"a definir" (pág.5) | SRC-02 | ISS-25 (Pausa/exclusão/fim) não pode declarar critério de aceite completo | Definir política antes de liberar a função de exclusão ao usuário final |
| GAP-06 | Ação do Copiloto no cadastro e "pendências críticas do sistema" — citadas só como pendência da fonte B, sem detalhe | SRC-02 | ISS-02 (Cadastro) e ISS-35 (comandos do Copiloto) podem não cobrir esse comportamento | Esclarecer com o titular o que a fonte B quis dizer |
| GAP-07 | Carga cognitiva "M" no onboarding/scanner (fonte A) — abreviação não expandida na fonte; não presumido como "Média" ou "Moderada" | SRC-02 | Não afeta uma tarefa específica, mas limita a leitura de FACT-05 | Confirmar com quem produziu o XMind original |
| GAP-08 | Etapa 14 da jornada (Execução individual) — ação do usuário truncada em "Usu" na fonte A, sem completar | SRC-02 | ISS-14 não tem a descrição completa da ação esperada do usuário nessa etapa | Recuperar o XMind original ou perguntar ao autor |
| GAP-09 | Nenhuma das 48 Issues deste plano nem dos 8 itens do Primeiro Entregável Oficial tem responsável (owner) confirmado em nenhuma fonte | SRC-01, SRC-02 | Nenhuma tarefa pode ter responsável definido com confiança | Titular deve confirmar responsável(is) antes ou durante a execução (ver §12) |
| GAP-10 | Nenhuma capacidade adicional dedicada ao EXECUTAR APP, além dos 20h/semana informados, foi declarada — ver ASM-02 sobre o risco de sobreposição com as outras frentes desta sessão | SRC-01 | Capacidade de execução planejada em §7 pode estar competindo com outras frentes do mesmo titular | Titular deve esclarecer se há pool único ou capacidades independentes por frente |
| GAP-11 | O esforço total estimado do backlog completo (~403h, §10) é ~5,4× maior que a capacidade alocável de um mês (75,3h) — nenhuma fonte informa um prazo-alvo de lançamento do EXECUTAR APP contra o qual medir se esse ritmo é suficiente | SRC-01, SRC-02 | Sem uma data-alvo de lançamento, não é possível avaliar se ~5-6 meses no ritmo atual (403h ÷ 75,3h/mês) é aceitável | Titular deve informar, em um próximo ciclo de intake, se há uma data-alvo de lançamento pública ou comercial |

### 3.5 Conflitos (CONFLICT)

| ID | Fonte A | Fonte B | Fonte priorizada | Regra de precedência usada |
|---|---|---|---|---|
| CONF-01 | "descrição de hashes/JWT e credenciais próprias" para autenticação | Autenticação via Clerk (citado também na pág.3, "Conta/tenant via Clerk", e na pág.4 na lista de stack) | **Nenhuma priorizada — não resolvido nesta rodada** | A própria síntese (pág.5) marca isso como pendência explícita ("definir responsabilidade"), não como decisão já tomada; ISS-31 (Auth) é modelado usando Clerk por ser citado 2x na síntese como parte da stack declarada (FACT-07), mas essa escolha fica sujeita à confirmação do titular antes de produção — registrado aqui, não decidido silenciosamente |
| CONF-02 | Backlog descrito em "memória curta" (contexto de sessão) | "Banco = fonte canônica" (pág.1); Neon/PostgreSQL + Prisma ORM como persistência declarada (pág.4) | Fonte B (banco canônico) para fins de modelagem de ISS-30 | A pág.1 do próprio documento (não atribuída a A ou B especificamente) declara "Banco = fonte canônica; Mapa-OS = projeção dos dados" como um princípio do produto — mais consistente com persistência durável do que com memória de sessão. A pendência de "explicitar gravação durável" (pág.5) permanece registrada como GAP dentro de ISS-30 |
| CONF-03 | "Done/Completed" e automações como critério de conclusão | DoD (Definition of Done) + evidência aprovada como regra de conclusão (pág.4, "B") | Fonte B (DoD + evidência) | A pág.1 do documento já declara "Conclusão exige DoD e evidência aprovada" como um princípio consolidado do produto (não atribuído só a B) — usado como critério de aceite de ISS-18, mas a unificação formal com o vocabulário "Done/Completed" de A permanece pendência do titular |
| CONF-04 | — | "Prisma" aparece em 2 sentidos: Prisma estratégico (objetivos/projetos, Mapa-OS) e Prisma ORM (camada de persistência); PRE_APPROVE do workflow agentic é descrito como "pré-requisitos", não necessariamente como prova de aceite humano | **Nenhuma priorizada — ambiguidade nominal, não uma escolha entre fontes** | Registrado como CONFLICT porque a própria síntese pede explicitamente para "distinguir Prisma estratégico de Prisma ORM" (pág.5) — tratado neste plano como dois conceitos com o mesmo nome (ISS-19 usa "Prisma estratégico"; ISS-30 usa "Prisma ORM"), e ISS-33/ISS-34 tratam PRE_APPROVE como uma etapa técnica do workflow, não como aprovação humana, até o titular confirmar o contrário |
| CONF-05 | Scanner: OCR tradicional | Scanner: DINOv2/ONNX | **Nenhuma priorizada — conflito explicitamente registrado em B, não resolvido** | A própria fonte (pág.5) já classifica isso como "Conflito explicitamente registrado em B" — ISS-07 (Scanner) é modelado sem comprometer a tecnologia de extração, deixando essa escolha técnica como pendência de decisão do titular antes de produção |

## 4. Limite Normativo e Disclaimer

Este documento **não é** auditoria, certificação, opinião legal, aprovação regulatória, nem declaração formal de conformidade normativa.

Conjunto normativo fixo desta metodologia: ISO 9001:2015/Amd 1:2024 (única norma do conjunto com requisitos de sistema de gestão), ISO 10005, ISO 10006, ISO 21502, ISO 31000 e ISO 10075-2 (orientações, não requisitos obrigatórios). A checagem de edição vigente (§0 da skill) já foi feita nesta mesma sessão de trabalho (registrada em plano interno anterior desta conversa: SRC-EXT-01, ISO 9001:2026 lançada em 16/09/2026, substituindo 2015/Amd1:2024) — não repetida aqui por já ter sido verificada nesta sessão.

Frameworks operacionais próprios (ex.: contingência de 15%, WIP=1 frente de desenvolvimento por vez) são decisão de desenho operacional, não requisito ISO.

## 5. Evidência Organizada pela Estrutura Harmonizada

| Cabeçalho | Norma aplicável | Cláusula | Requisito | Evidência observável | Status | Lacuna/ação |
|---|---|---|---|---|---|---|
| 6. Planejamento | ISO 9001:2015/Amd1:2024 | 6.2 | Objetivo mensurável com método de acompanhamento | Objetivos do mês em §6, com fonte e resultado mensurável | PARCIALMENTE EVIDENCIADO | Falta data-alvo de lançamento (GAP-11) para calibrar a meta de ritmo mensal |
| 8. Operação | — (orientação ISO 21502) | — | Planejamento operacional de tarefas com responsável e critério de aceite | Registro de 48 tarefas em §10, com `fonte_id` rastreável às páginas 2-5 do PDF | PARCIALMENTE EVIDENCIADO | Responsável não confirmado para nenhuma tarefa (GAP-09) |
| 9. Avaliação de Desempenho | ISO 9001:2015/Amd1:2024 | 9.1 | Métricas de desempenho com meta e frequência | MET-01 a MET-03 em §13 | PARCIALMENTE EVIDENCIADO | Nenhum dado real de execução ainda existe (mês ainda não iniciado) |

As demais subseções (Contexto, Liderança, Suporte, Melhoria) não têm evidência material específica deste backlog além do já registrado em §2–§3 — classificadas como NÃO AVALIADO neste ciclo.

## 6. Objetivos do Mês e Resultados Mensuráveis

| ID Objetivo | Objetivo do mês | Fonte | Resultado mensurável | Baseline | Meta do mês | Método de validação |
|---|---|---|---|---|---|---|
| OBJ-01 | Colocar em pé a fundação técnica full-stack do EXECUTAR APP (autenticação, persistência, API, frontend shell) | FACT-07, ASM-01 | KR-01: ISS-26, ISS-27, ISS-30, ISS-31 concluídas com evidência de ambiente funcional | Nenhuma fundação técnica declarada como existente em nenhuma fonte | 4 de 4 issues de fundação concluídas | Ambiente implantado (Vercel) respondendo, com autenticação e persistência ativas |
| OBJ-02 | Implementar os 4 primeiros passos da jornada do usuário (Descoberta, Cadastro, Organização, Onboarding) | FACT-03 | KR-02: ISS-01 a ISS-04 concluídas com evidência funcional | Nenhum passo da jornada implementado | 4 de 4 issues concluídas, em ordem | Fluxo de ponta a ponta demonstrável: visitante → conta → workspace → onboarding |
| OBJ-03 | Registrar formalmente, para decisão do titular, os 5 conflitos entre as fontes A e B que bloqueiam decisões técnicas de fundação (CONF-01 a CONF-05) | FACT-15 | KR-03: 5 de 5 conflitos com registro formal e pergunta objetiva ao titular | 0 conflitos formalmente encaminhados para decisão | 5 de 5 registrados e encaminhados | Registro em ISS-48 com resposta do titular anexada (ou pendência explícita se ainda não respondido) |

Apenas 3 objetivos foram mantidos, dimensionados à capacidade de 74h calculada em §7 — os demais 44 Issues do backlog ficam sem objetivo mensal atribuído neste ciclo (ver §15).

## 7. Capacidade e Alocação do Mês

Semanas civis do período (Out/2026): Semana 1 (01/10 a 04/10, parcial), Semana 2 (05/10 a 11/10), Semana 3 (12/10 a 18/10), Semana 4 (19/10 a 25/10), Semana 5 (26/10 a 31/10, parcial) — 31 dias no total.

| Categoria de capacidade | Horas | Evidência ou suposição | Notas |
|---|---|---|---|
| Capacidade nominal do mês | 88,6h | DEC-03(sessão) (20h/semana) × 31 dias ÷ 7 ≈ 4,43 semanas | 20 × (31/7) = 88,57h, arredondado para 88,6h |
| Compromissos fixos | 0h | Não evidenciado no intake | Não subtraído por falta de informação |
| Overhead operacional | 0h | Não evidenciado no intake | Idem |
| Capacidade de execução planejada | 88,6h | Nominal − compromissos fixos − overhead | Ver ASM-02 sobre o risco de esta capacidade estar dividida com outras frentes desta sessão |
| Reserva de contingência | 13,3h (15%) | Padrão fixo da metodologia (DEC-05) | 15% de 88,6h = 13,3h |
| Total alocado às tarefas do mês | 75,3h | Execução planejada − contingência (88,6h − 13,3h) | Teto do mês — estritamente menor que a capacidade nominal (88,6h) |

Do teto de 75,3h, o Registro Executável de Tarefas (§10) efetivamente ocupa 74h (soma de ISS-26, ISS-27, ISS-30, ISS-31, ISS-01, ISS-02, ISS-03, ISS-04), deixando 1,3h de folga não alocada como buffer.

**Nota sobre a escala do backlog:** o Registro Executável de Tarefas (§10) contém 48 Issues somando ~403h de esforço estimado — muito além de qualquer mês único. Isso reflete o pedido explícito do usuário de registrar o escopo total (DEC-04), não um erro de cálculo. A distribuição desse total ao longo dos próximos ciclos está em §15.

## 8. Plano de Frentes de Trabalho (Workstreams)

| Frente (Epic) | Resultado de outubro | Prioridade | Responsável | Stakeholders | Dependências | Capacidade alocada em out/2026 | Evidência de conclusão |
|---|---|---|---|---|---|---|---|
| EPIC-06 Arquitetura e Infraestrutura Full-Stack | Fundação técnica (auth, banco, API, frontend shell) operante | Alta (bloqueia toda a jornada, ASM-01) | A definir (GAP-09) | Nenhum stakeholder formal declarado | Nenhuma | 40h (ISS-26, ISS-27, ISS-30, ISS-31) | Ambiente implantado, respondendo, com auth e persistência ativas |
| EPIC-01 Entrada e Acesso | 4 dos 5 passos da jornada implementados (01-04) | Alta (primeiro contato real do usuário com o produto) | A definir (GAP-09) | Nenhum stakeholder formal declarado | Depende da fundação técnica (EPIC-06) | 34h (ISS-01 a ISS-04) | Fluxo demonstrável visitante → workspace → onboarding |
| Demais 9 Epics (EPIC-02 a EPIC-05, EPIC-07 a EPIC-11) | Sem execução prevista em outubro — backlog registrado, sem data | Média a Baixa, conforme dependência (ver §15) | A definir (GAP-09) | Nenhum stakeholder formal declarado | Dependem, em cascata, da fundação e dos primeiros passos da jornada | 0h em outubro | N/A — ver §15 |

Total alocado em outubro: 74h, dentro do limite de 75,3h calculado em §7.

## 9. Plano Operacional Semanal

| Semana | Resultado principal | Tarefas | Responsável | Dependência | Métrica | Evidência de conclusão | Gate |
|---|---|---|---|---|---|---|---|
| Semana 1 (01/10–04/10) | Persistência e API base no ar | ISS-30, ISS-27 (início) | A definir | Nenhuma | Migrations aplicadas; endpoint de saúde respondendo | Ambiente Neon + rota `/api/health` ativos | GATE-01 |
| Semana 2 (05/10–11/10) | Autenticação e frontend shell no ar | ISS-31, ISS-26 | A definir | GATE-01 aprovado | Login funcional; app carrega tela vazia autenticada | Fluxo de login end-to-end demonstrável | GATE-02 |
| Semana 3 (12/10–18/10) | Descoberta e Cadastro implementados | ISS-01, ISS-02 | A definir | GATE-02 aprovado | Landing publicada; conta criável | Cadastro real de um usuário de teste | GATE-03 |
| Semana 4 (19/10–25/10) | Organização (workspace) implementada | ISS-03 | A definir | GATE-03 aprovado | Workspace criável/convite aceitável | Workspace de teste criado com 2º membro convidado | GATE-04 |
| Semana 5 (26/10–31/10) | Onboarding implementado; conflitos encaminhados ao titular | ISS-04, ISS-48 | A definir | GATE-04 aprovado | Trilha de onboarding completável; 5 conflitos registrados | Onboarding de teste concluído; registro de ISS-48 com os 5 CONF encaminhados | GATE-05 |

## 10. Registro Executável de Tarefas

O bloco CSV completo (25 colunas, `references/schema-csv-tarefas.md`, 48 linhas: ISS-01 a ISS-48, agrupadas em 11 Epics) está reproduzido no entregável `linear-import-executarapp-2026-10.md` — não duplicado aqui para evitar divergência entre cópias; ambos os arquivos foram gerados na mesma execução e devem ser mantidos juntos. Resumo estrutural:

| Epic | Issues | Soma de horas estimadas | Alocado em Outubro/2026? |
|---|---|---|---|
| EPIC-01 Entrada e Acesso | ISS-01 a ISS-05 | 40h | Parcial — ISS-01 a ISS-04 (34h); ISS-05 fica para o próximo ciclo |
| EPIC-02 Dados e Planejamento | ISS-06 a ISS-10 | 56h | Não |
| EPIC-03 Foco e Trabalho | ISS-11 a ISS-15 | 36h | Não |
| EPIC-04 Entrega e Visibilidade | ISS-16 a ISS-20 | 52h | Não |
| EPIC-05 Continuidade e Saída | ISS-21 a ISS-25 | 38h | Não |
| EPIC-06 Arquitetura e Infraestrutura Full-Stack | ISS-26 a ISS-32 | 74h | Parcial — ISS-26, ISS-27, ISS-30, ISS-31 (40h); ISS-28, ISS-29, ISS-32 ficam para o próximo ciclo |
| EPIC-07 Workflow Agentic e Estados | ISS-33 a ISS-35 | 32h | Não |
| EPIC-08 Site Público e Rotas do Aplicativo | ISS-36 a ISS-37 | 24h | Não |
| EPIC-09 Primeiro Entregável Oficial (Governança de Lançamento) | ISS-38 a ISS-45 | 29h | Não |
| EPIC-10 Modo Rotina — Ciclo de Controle | ISS-46 | 10h | Não |
| EPIC-11 Segurança, Riscos e Alinhamento entre Fontes | ISS-47 a ISS-48 | 12h | Parcial — ISS-48 (4h) entra em outubro (Semana 5); ISS-47 fica para o próximo ciclo |
| **Total** | **48 Issues** | **~403h** | **74h alocadas em outubro (18,4% do total)** |

## 11. Visão Diária de Baixa Carga Cognitiva

Não aplicável em granularidade diária neste ciclo — a fonte não declara um modelo de dias úteis fixos para o desenvolvimento do produto. O plano usa a visão semanal de §9, com 1 a 2 issues de fundação por semana, respeitando WIP baixo (no máximo 2 issues abertas simultaneamente por semana, dado o volume de horas de cada uma).

## 12. Mapa de Stakeholders e Dependências

| ID | Stakeholder ou dependência | Papel | Input necessário | Data necessária | Responsável pelo acompanhamento | Impacto se falhar |
|---|---|---|---|---|---|---|
| DEP-01 | Conclusão de ISS-30/ISS-27/ISS-31/ISS-26 (fundação técnica) | Dependência interna | Ambiente técnico operante | Antes do início de ISS-01 (Semana 3) | A definir (GAP-09) | Toda a jornada do usuário (EPIC-01 em diante) fica bloqueada |
| DEP-02 | Decisão do titular sobre CONF-01 (Clerk vs. auth própria) | Dependência de decisão humana | Confirmação de qual mecanismo de autenticação usar | Antes de ISS-31 avançar além do esqueleto técnico | Titular | Retrabalho de autenticação se a escolha inicial (Clerk, por ser citado na stack) for revertida depois |
| DEP-03 | Decisão do titular sobre GAP-11 (data-alvo de lançamento) | Dependência de decisão humana | Prazo-alvo público/comercial | Recomendado antes do 2º ciclo mensal | Titular | Sem data-alvo, não é possível avaliar se o ritmo de ~75h/mês é suficiente para o lançamento pretendido |
| STK-01 | Titular do plano (EXECUTAR / EXECUTAR APP) | Decisor de owner (GAP-09), dos 5 conflitos (CONF-01 a CONF-05) e da data-alvo (GAP-11) | Confirmações acima | Ao longo do mês, formalizado em ISS-48 (Semana 5) | Titular | Sem decisão, os GAPs/CONFs seguem em aberto indefinidamente e cada ciclo repete a mesma pendência |

## 13. Métricas e Cadência de Revisão

| ID Métrica | Métrica | Fórmula | Fonte de dado | Frequência | Meta | Decisão acionada |
|---|---|---|---|---|---|---|
| MET-01 | Progresso da fundação técnica | Issues concluídas de EPIC-06 ÷ 4 (as alocadas em outubro) | Registro de conclusão das issues | Semanal | 4 de 4 até 11/10/2026 | Se atrasar, replanejar Semana 3 |
| MET-02 | Progresso da jornada (Entrada e Acesso) | Issues concluídas de ISS-01 a ISS-04 ÷ 4 | Registro de conclusão das issues | Semanal (a partir da Semana 3) | 4 de 4 até 31/10/2026 | Se atrasar, ISS-05 e EPIC-02 do próximo ciclo são replanejados |
| MET-03 | Ritmo de execução do backlog total | Horas concluídas no mês ÷ 403h (backlog total) | Soma de `tempo_estimado` das issues concluídas | Mensal | ≥ 18% (74h) | Base para recalibrar GAP-11 (data-alvo de lançamento) no próximo ciclo |

## 14. Riscos e Controles

| ID Risco | Risco | Evidência | Probabilidade | Impacto | Ação preventiva | Contingência | Responsável | Gatilho |
|---|---|---|---|---|---|---|---|---|
| RSK-01 | O ritmo de 75,3h/mês não é suficiente para lançar um produto full-stack de 25 etapas de jornada + arquitetura + Copiloto em prazo competitivo, sem uma data-alvo declarada para calibrar | GAP-11 | Alta (matemática simples: 403h ÷ 75,3h/mês ≈ 5,4 meses só para a v1 do backlog atual, sem contar retrabalho) | Alto (lançamento pode atrasar indefinidamente sem visibilidade) | Registrar GAP-11 e pedir ao titular uma data-alvo no próximo ciclo | Se não houver resposta, revisar o ritmo a cada ciclo e reportar a projeção atualizada (X meses restantes no ritmo atual) | Titular do plano | Início do 2º ciclo mensal sem resposta a GAP-11 |
| RSK-02 | Construir a autenticação sobre Clerk (escolha usada para modelar ISS-31) sem confirmação do titular, quando a fonte A sugere credenciais próprias (CONF-01) | CONF-01 | Média | Alto (retrabalho de toda a camada de auth e de qualquer dado já gravado com o modelo de usuário do Clerk) | Encaminhar CONF-01 ao titular via ISS-48 antes de ISS-31 avançar além do esqueleto | Se a decisão vier depois de ISS-31 avançada, replanejar a migração de usuários como nova issue no próximo ciclo | Titular do plano | Início de ISS-31 além da etapa de esqueleto técnico |
| RSK-03 | Nenhum responsável confirmado impede execução coordenada de qualquer uma das 8 issues alocadas em outubro | GAP-09 | Alta (lacuna já observada, não hipótese) | Médio (atraso, não perda de qualidade) | Confirmar responsável o quanto antes na Semana 1 | Titular assume por padrão até nova decisão | Titular do plano | Nenhuma confirmação até o fim da Semana 1 |

## 15. Itens Adiados e Excluídos

| Item | Motivo do adiamento | Evidência | Condição de reconsideração |
|---|---|---|---|
| ISS-05 (Consentimentos) | Não cabe nas 75,3h de outubro junto com a fundação técnica e ISS-01 a ISS-04; mantido fora da ordem para não quebrar a sequência 01→02→03→04 já em andamento | §7, §10 | Primeira issue do próximo ciclo mensal, junto com o início de EPIC-02 |
| EPIC-02 a EPIC-05 (Dados e Planejamento; Foco e Trabalho; Entrega e Visibilidade; Continuidade e Saída) — 20 issues, 182h | Dependem, em cascata, da jornada de Entrada e Acesso estar completa; excedem em muito a capacidade de um único mês | §7, §10, ASM-01 | Entram em ciclos subsequentes, na ordem numérica da própria fonte (pág.2) |
| ISS-28, ISS-29, ISS-32 (Copilot Engine/Agent SDK, Task Engine, Deploy+conectores MCP) | Parte de EPIC-06 que não cabe na capacidade de outubro; a fundação mínima (auth+banco+API+frontend) foi priorizada sobre a camada de agentes, que só é necessária a partir do EPIC-02 (Productivity/Operations) | §7, §10 | Próximo ciclo, junto com o início de EPIC-02 |
| EPIC-07 a EPIC-11 (Workflow agentic; Site público e rotas do app; Primeiro Entregável Oficial; Modo Rotina; Segurança/riscos) — 24 issues, 179h | Dependem de a jornada básica e a camada de agentes já existirem; site público e Primeiro Entregável Oficial fazem mais sentido perto do lançamento real, não no primeiro mês de fundação | §7, §10 | Ciclos futuros, priorizados conforme a proximidade da data-alvo de lançamento (a definir, GAP-11) |
| ISS-47 (mitigar os 5 riscos previstos pela fonte) | Mitigação de risco de produto em produção só faz sentido quando há algo em produção; adiado para quando EPIC-01/EPIC-02 estiverem mais avançados | §7, §10 | Quando a fundação e a Entrada e Acesso estiverem concluídas |

## 16. Gates de Decisão

| ID Gate | Decisão | Evidência necessária | Responsável pela decisão | Prazo | Consequência de não decidir |
|---|---|---|---|---|---|
| GATE-01 | Aprovar avanço para autenticação/frontend (Semana 2) | Persistência e API base no ar (ISS-30, ISS-27) | A definir (GAP-09) | 04/10/2026 | Semana 2 não deve iniciar sem base de dados e API funcionando |
| GATE-02 | Aprovar avanço para a jornada do usuário (Semana 3) | Auth e frontend shell no ar (ISS-31, ISS-26) | A definir (GAP-09) | 11/10/2026 | Descoberta/Cadastro não devem ser implementados sem login funcional |
| GATE-03 | Aprovar avanço para Organização (Semana 4) | Descoberta e Cadastro implementados (ISS-01, ISS-02) | A definir (GAP-09) | 18/10/2026 | Workspace não deve ser implementado sem conta de usuário funcional |
| GATE-04 | Aprovar avanço para Onboarding (Semana 5) | Organização implementada (ISS-03) | A definir (GAP-09) | 25/10/2026 | Onboarding depende de workspace existente |
| GATE-05 | Aprovar o plano de novembro/2026, incluindo resposta do titular aos 5 CONF e a data-alvo de lançamento (GAP-11) | Onboarding concluído (ISS-04) + registro de ISS-48 | Titular do plano | 31/10/2026 | Próximo ciclo mensal repete as mesmas pendências sem base de decisão nova |

## 17. Próxima Ação Imediata

**Ação única:** iniciar ISS-30 (Persistência — Neon/PostgreSQL + Prisma ORM).

- **Responsável:** a definir pelo titular (GAP-09) — até lá, elegível para qualquer executor técnico disponível.
- **Fonte:** FACT-07 (stack declarada), ASM-01 (fundação precede jornada).
- **Resultado esperado:** banco de dados provisionado, schema inicial migrado, ambiente acessível.
- **Duração máxima razoável:** 10h (conforme `tempo_estimado` em `linear-import-executarapp-2026-10.md`).
- **Evidência de conclusão:** ambiente Neon ativo + migrations aplicadas, registrado em ISS-30.
- **Por que esta ação e não outra:** é a única issue da fundação sem nenhuma dependência técnica bloqueante — API (ISS-27) e Auth (ISS-31) tipicamente dependem de um schema de dados mínimo existir primeiro; começar pelo banco reduz o risco de retrabalho nas duas issues seguintes.

## Apêndice A — Tabela Mínima de Rastreabilidade

| ID | Requisito | Fonte original | Citação da fonte | Classificação | Status de evidência | Dependência | Ação |
|---|---|---|---|---|---|---|---|
| REQ-01 | A jornada do usuário deve ser implementada na ordem numérica 01→25 declarada pela fonte, sem pular etapas | SRC-02 | pág.2, "Leia de cima para baixo em cada coluna; avance da coluna 1 para a 5" | REQUIREMENT (derivado da própria estrutura de leitura da fonte) | PARCIALMENTE EVIDENCIADO (só ISS-01 a ISS-04 planejadas para outubro) | ASM-01 | ISS-01 a ISS-25, em ordem, ao longo dos ciclos |
| REQ-02 | A conclusão de qualquer item deve exigir DoD + evidência aprovada | SRC-02 | pág.1 ("Conclusão exige DoD e evidência aprovada"); pág.4 (fonte B) | REQUIREMENT (declarado como princípio do produto, não atribuído só a uma fonte) | EVIDENCIADO (citado 2x de forma consistente) | CONF-03 (unificação de vocabulário com "Done/Completed" de A ainda pendente) | ISS-18, ISS-34 |
| REQ-03 | Reserva de contingência do mês deve ser 15% da capacidade de execução planejada | `motor-evidencia-fontes.md` | Padrão fixo da metodologia | REQUIREMENT (regra fixa da metodologia, não norma ISO) | EVIDENCIADO (aplicado em §7: 13,3h = 15% de 88,6h) | Nenhuma | Já cumprido em §7 |
| REQ-04 | Os 5 conflitos e as 11 lacunas explicitamente registrados pela própria fonte (pág.5) não devem ser resolvidos por inferência | SRC-02 | pág.5, "nenhuma foi resolvida silenciosamente nesta conversão" | CONSTRAINT (a própria fonte já impõe essa regra) | EVIDENCIADO (todos preservados em §3.4/§3.5) | Nenhuma | ISS-48 encaminha os 5 CONF ao titular |

## Apêndice B — Referências Cruzadas Rápidas

- Meta do mês → §6 (Objetivos)
- O que fazer agora → §17 (Próxima Ação Imediata) + ISS-30 em `linear-import-executarapp-2026-10.md`
- Capacidade e escala do backlog total → §7
- Os 5 conflitos entre fontes A e B → §3.5 (CONF-01 a CONF-05)
- As 11 lacunas → §3.4 (GAP-01 a GAP-11)
- Por que só 74h de 403h entram em outubro → DEC-06, §10, §15
- Plano semana a semana → §9
- Riscos do mês → §14
- Gates de decisão → §16

## Registro Final de Honestidade

Todas as lacunas identificadas neste processamento foram preservadas como GAP explícito (§3.4), nunca preenchidas por inferência ou suposição disfarçada de fato. Os 5 conflitos que a própria fonte já registra entre os XMind A e B (autenticação, persistência, critério de conclusão, ambiguidade "Prisma", e Scanner OCR vs. DINOv2/ONNX) foram preservados em §3.5 exatamente como a fonte os apresenta — nenhum foi resolvido por conta própria; onde uma escolha de modelagem foi necessária para descrever uma issue (ex.: ISS-31 usar Clerk), isso foi marcado como escolha de modelagem sujeita a confirmação, nunca como decisão do titular. O escopo pedido pelo usuário ("todas as 5 páginas... tudo deve ser desenvolvido full stack") foi respeitado integralmente no Registro Executável de Tarefas (48 Issues, ~403h) — nada do que a fonte descreve foi omitido do backlog. O que não foi inventado foi um cronograma que fizesse esse total caber em um mês: a diferença entre o que foi pedido (tudo) e o que cabe na capacidade informada (74h de 403h) está registrada como GAP-11/RSK-01, não escondida atrás de estimativas otimistas. Nenhum responsável, data de lançamento ou SLA foi inventado onde a fonte ou o usuário silenciaram.

Fim do documento. Emitido em 29/09/2026 (America/Sao_Paulo).
