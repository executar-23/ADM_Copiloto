# Roteamento — entregas × lanes × skills

> **Gerado de `mapa/roteamento.json` — não editar à mão.** Status global: **HIPOTESE**. Fonte: ING-0002: 02-mapa/matriz-entregas-x-lanes.md (sha256 7e353301a452…) + 02-mapa/inventario-skills.md §D (sha256 0a2bf6d262c3…).
> Disponibilidade = verificação do pacote no ambiente do usuário (não reverificada nesta sessão; E0 local). Toda linha é HIPÓTESE até E2 validar executando a skill num caso real.

## Lanes

| Lane | Origem | Skills oficiais | Skills proprietárias |
|---|---|---|---|
| Produto (`produto`) | macro | product-management:* | rc-cognitive-risk-expert, executar-safe-frameworks |
| Engenharia (`engenharia`) | macro | engineering:architecture, engineering:system-design, engineering:code-review, engineering:documentation, engineering:tech-debt | rc-cognitive-risk-expert |
| Design (`design`) | macro | design:accessibility-review, design:design-critique, design:design-handoff, design:design-system, design:research-synthesis, design:user-research, design:ux-copy | executar-design, executar-block-quick-frameworks |
| QA (`qa`) | macro | engineering:testing-strategy, engineering:code-review, engineering:debug, design:accessibility-review | rc-cognitive-risk-expert |
| DevOps (`devops`) | macro | engineering:deploy-checklist, engineering:incident-response, operations:change-request, operations:runbook | — |
| Stakeholders (`stakeholders`) | macro | operations:status-report, product-management:stakeholder-update | executar-business-docx |
| Operações (`operacoes`) | macro | operations:* | copiloto-executar, executar-mapa-os, plano-operacional-rastreavel |
| Editorial (`editorial`) | derivada | marketing:* | obsidian-editorial-pipeline, executar-block-quick-frameworks, rc-cognitive-risk-expert |

## Entregas

| ID | Entrega | Grupo | Lane | Skill primária | Disponível | Apoio | Lacuna | Status |
|---|---|---|---|---|---|---|---|---|
| R-001 | PRD | Produto e requisitos | produto | `product-management:write-spec` | nao | rc-cognitive-risk-expert (templates/prd.md, 13 seções) | Plugin PM não instalado; fallback disponível: template RC (Problem … Release state) | HIPOTESE |
| R-002 | UX / flows | Produto e requisitos | design | — | A DEFINIR | design:user-research, design:design-critique, design:design-handoff, design:ux-copy, rc-cognitive-risk-expert (§ User journey) | Sem skill dedicada a 'flows'; fluxos em Mermaid flowchart TD (padrão do Quick Frameworks) | HIPOTESE |
| R-003 | FRD | Produto e requisitos | produto | `rc-cognitive-risk-expert` | sim | engineering:system-design (requisitos) | FRD como documento separado ou seção do PRD? A DEFINIR | HIPOTESE |
| R-004 | AC (acceptance criteria) | Produto e requisitos | produto | `rc-cognitive-risk-expert` | sim | engineering:testing-strategy | — | HIPOTESE |
| R-005 | NFR | Produto e requisitos | engenharia | `engineering:system-design` | sim | design:accessibility-review, rc-cognitive-risk-expert (§ Accessibility/NFR) | — | HIPOTESE |
| R-006 | Data / Integration requirements | Produto e requisitos | engenharia | `engineering:system-design` | sim | rc-cognitive-risk-expert (§ Data/claim requirements) | Integration depende de conectores cujos esquemas não foram lidos | HIPOTESE |
| R-007 | Analytics | Produto e requisitos | operacoes | `marketing:performance-report` | sim | product-management:metrics-review (não instalada), Power BI (D4-v1) | Metas numéricas A DEFINIR (briefing não fornece) | HIPOTESE |
| R-008 | Release constraints | Produto e requisitos | devops | `engineering:deploy-checklist` | sim | operations:change-request, rc-cognitive-risk-expert (§ Release state) | RC 'release state' ≠ 'release constraints' — distinguir em E2 | HIPOTESE |
| R-009 | Eng review | Engenharia | engenharia | `engineering:code-review` | sim | engineering:architecture (desenho) | — | HIPOTESE |
| R-010 | Spec | Engenharia | engenharia | `engineering:system-design` | sim | rc-cognitive-risk-expert (agent-handoff.md) | — | HIPOTESE |
| R-011 | ADRs | Engenharia | engenharia | `engineering:architecture` | sim | rc-cognitive-risk-expert (templates/adr.md) | Dois formatos de ADR (oficial × RC) — escolher um | HIPOTESE |
| R-012 | API contracts | Engenharia | engenharia | `engineering:system-design` | sim | — | Formato formal (ex.: OpenAPI): A DEFINIR | HIPOTESE |
| R-013 | Data model | Engenharia | engenharia | `engineering:system-design` | sim | — | — | HIPOTESE |
| R-014 | Test plan | Engenharia | qa | `engineering:testing-strategy` | sim | contratos/C-03-eval-suite.md | Eval de agente ≠ teste de código: cobrir ambos | HIPOTESE |
| R-015 | Implementation plan | Engenharia | engenharia | — | A DEFINIR | executar-arvore-roadmap (hipótese) | Sem skill oficial dedicada | HIPOTESE |
| R-016 | Epic issues | Engenharia | operacoes | — | A DEFINIR | conector de tracker (Linear), copiloto-executar | Tracker Linear (workspace Executar-Rotina, time EXE) com conflito CONF-01 aberto × Sas-Executar/SAS — reverificar em E0 antes de qualquer escrita | HIPOTESE |
| R-017 | SOP | Engenharia | operacoes | `operations:process-doc` | sim | SOP-KP-001 (editorial) | Não duplicar o SOP editorial | HIPOTESE |
| R-018 | Runbooks | Engenharia | devops | `operations:runbook` | sim | engineering:documentation | — | HIPOTESE |
| R-019 | Linha editorial e campanhas | Editorial e gestão | editorial | `marketing:campaign-plan` | sim | marketing:content-creation \| marketing:draft-content (uma, em E2), marketing:email-sequence, marketing:seo-audit, marketing:brand-review, obsidian-editorial-pipeline (motor, D5), Process Doc (governança), rc-cognitive-risk-expert (claims) | Lacunas do SOP-KP-001: GEO, Topic Pack, arco, nomenclatura | HIPOTESE |
| R-020 | Ficha de caracterização (22 pontos) | Editorial e gestão | operacoes | — | A DEFINIR | nó FICHA do ledger, executar-safe-frameworks (5W2H etc.) | Legenda dos 22 pontos não fornecida — não inventar títulos | HIPOTESE |
| R-021 | PRD checklist | Editorial e gestão | produto | — | A DEFINIR | rc-cognitive-risk-expert templates/prd.md, product-management:write-spec | Fonte ausente — não inventar checklist; propor derivação para aprovação | HIPOTESE |

## Sobreposições (uma vencedora por intenção)

| Intenção | Concorrentes | Proposta | Motivo | Status |
|---|---|---|---|---|
| análise competitiva | marketing:competitive-brief × product-management:competitive-brief | marketing:competitive-brief | Product Management não instalado | HIPOTESE |
| síntese de pesquisa | design:research-synthesis × product-management:synthesize-research | design:research-synthesis | PM não instalado; Design instalado | HIPOTESE |
| conteúdo de marketing | marketing:content-creation × marketing:draft-content | A DEFINIR | descrições quase idênticas — escolher uma em E2 após ler ambas | HIPOTESE |
| framework/estratégia | skills oficiais (engineering/operations/…) × executar-safe-frameworks | executar-safe-frameworks para análise rastreável; oficial para artefato de formato fixo | separa fato × inferência com gates | HIPOTESE |

## Fallbacks

- **Quando** product-management:write-spec indisponível (D4) → **usar** rc-cognitive-risk-expert templates/prd.md (13 seções) + engineering:system-design — sujeito à aprovação do usuário _(fonte: matriz-entregas-x-lanes.md; divergencias-e-lacunas.md §4)_
- **Quando** obsidian-editorial-pipeline não instalada (D5) → **usar** USER_ACTION_REQUIRED: instalar a skill enviada (v2.3); nenhum pack editorial avança sem o motor SOP-KP-001 _(fonte: divergencias-e-lacunas.md §3)_
- **Quando** executar-block-quick-frameworks com drift (D3) → **usar** skill_fingerprint nas duas cópias + decisão D3 antes de usar _(fonte: divergencias-e-lacunas.md §3)_
- **Quando** hosting Cloudflare (blog) sem conector → **usar** lacuna declarada — USER_ACTION_REQUIRED; sem substituto definido _(fonte: inventario-skills.md §C)_
