# Matriz: entregas × lanes × skills

> **Estas atribuições são HIPÓTESES de roteamento**, derivadas das descrições e dos `SKILL.md`
> lidos (coluna *Lido* em `inventario-skills.md`). O estágio **E2** valida cada linha
> executando a skill em um caso real. Célula `—` = **lacuna declarada**, não omissão.
> **Lane** = macro do usuário. `Editorial` é uma lane **derivada** (não está na lista de macros;
> nasce de "linha editorial e campanhas" e do Marketing) → confirmar em E1.

## As 8 lanes

| Lane | Origem | Skills oficiais | Skills proprietárias |
|---|---|---|---|
| **Produto** | macro | `product-management:*` ❌ não instalado | `rc-cognitive-risk-expert` (PRD/ADR), `executar-safe-frameworks` |
| **Engenharia** | macro | `engineering:architecture`, `system-design`, `code-review`, `documentation`, `tech-debt` | `rc` (ADR/handoff) |
| **Design** | macro | `design:*` (7) | `executar-design`, `executar-block-quick-frameworks` (identidade) |
| **QA** | macro | `engineering:testing-strategy`, `code-review`, `debug`; `design:accessibility-review` | `rc` (claim-check), validadores das skills |
| **DevOps** | macro | `engineering:deploy-checklist`, `incident-response`; `operations:change-request`, `runbook` | conectores `Railway`/`Vercel`/`Supabase`; **Cloudflare: —** |
| **Stakeholders** | macro | `operations:status-report`; `product-management:stakeholder-update` ❌ | `executar-business-docx` |
| **Operações** | macro | `operations:*` (9) | `copiloto-executar`, `executar-mapa-os`, `plano-operacional-rastreavel` |
| **Editorial** | derivada | `marketing:*` (8) | `obsidian-editorial-pipeline` ❌ (D5), `executar-block-quick-frameworks`, `rc` (claims) |

## Entregas do usuário (lista literal) → roteamento

### Produto e requisitos

| Entrega | Lane | Skill primária | Apoio | Lacuna / nota |
|---|---|---|---|---|
| **PRD** | Produto | `product-management:write-spec` ❌ | RC `templates/prd.md` | **Fallback disponível:** o template RC tem 13 seções — Problem, Audience/transformation, Goal, Non-goals, User journey, Functional requirements, Data/claim requirements, Accessibility/NFR, Analytics, Dependencies, Acceptance criteria, Risks, Release state |
| **UX / flows** | Design | `design:user-research`, `design-critique`, `design-handoff`, `ux-copy` | RC *User journey* | **Sem skill dedicada a "flows"**; fluxos em Mermaid `flowchart TD` (padrão já usado no Quick Frameworks) |
| **FRD** | Produto | RC `prd.md` § *Functional requirements* | `engineering:system-design` (requisitos) | **FRD como documento separado ou seção do PRD? A DEFINIR** |
| **AC** | Produto/QA | RC `prd.md` § *Acceptance criteria* | `engineering:testing-strategy` | — |
| **NFR** | Engenharia | `engineering:system-design` (não-funcionais) | `design:accessibility-review`; RC § *Accessibility/NFR* | — |
| **Data / Integration requirements** | Engenharia | `system-design` (contratos de API, armazenamento) | RC § *Data/claim requirements* | *Integration*: depende de **conectores** (esquemas não lidos) |
| **Analytics** | Operações | `marketing:performance-report` | `product-management:metrics-review` ❌; Power BI (D4-v1) | Métricas do briefing: downloads, compartilhamento, comentários/reviews |
| **Release constraints** | DevOps | `engineering:deploy-checklist`, `operations:change-request` | RC § *Release state* | RC "release state" ≠ "release constraints" — distinguir em E2 |

### Engenharia

| Entrega | Lane | Skill primária | Apoio | Lacuna / nota |
|---|---|---|---|---|
| **Eng review** | Engenharia | `engineering:code-review` (código) + `architecture` (desenho) | — | — |
| **Spec** | Engenharia | `engineering:system-design` | RC `agent-handoff.md` | — |
| **ADRs** | Engenharia | `engineering:architecture` | RC `templates/adr.md` | **Dois formatos de ADR** (oficial × RC) → escolher um em E2 |
| **API contracts** | Engenharia | `system-design` ("API endpoint design") | — | **Formato formal (ex.: OpenAPI): A DEFINIR** |
| **Data model** | Engenharia | `system-design` ("Data model design") | — | — |
| **Test plan** | QA | `engineering:testing-strategy` | `C-03-eval-suite` | Eval de agente ≠ teste de código: cobrir ambos |
| **Implementation plan** | Engenharia | **—** | `executar-arvore-roadmap` (hipótese) | Sem skill oficial dedicada |
| **Epic issues** | Operações | conector de tracker | `copiloto-executar` | Segundo o estado do Copiloto, o tracker é o Linear (workspace `Executar-Rotina`, time EXE) com **conflito CONF-01 aberto** contra o antigo `Sas-Executar`/SAS → **reverificar em E0** antes de escrever |
| **SOP** | Operações | `operations:process-doc` | SOP-KP-001 (já existe p/ editorial) | Não duplicar o SOP editorial |
| **Runbooks** | DevOps | `operations:runbook`, `engineering:documentation` | — | — |

### Editorial e gestão

| Entrega | Lane | Skill primária | Apoio | Lacuna / nota |
|---|---|---|---|---|
| **Linha editorial e campanhas** | Editorial | `marketing:campaign-plan`, `content-creation`/`draft-content`, `email-sequence`, `seo-audit`, `brand-review` | `obsidian-editorial-pipeline` (motor), Process Doc (governança), RC (claims) | Ver `divergencias-e-lacunas.md` §2 (GEO, Topic Pack, arco, nomenclatura) |
| **Ficha de caracterização (22 pontos)** | Operações | **— (nó `FICHA` do Maestro)** | `executar-safe-frameworks` (5W2H etc.) | Ver `ficha-22-pontos.md` |
| **PRD checklist** | Produto | **—** | derivar de RC `prd.md` + `write-spec` | **Fonte ausente — não inventar** (D9) |

## Cobertura resultante (para o Overkill Gate)

- Entregas com skill primária **instalada**: a maioria → **reuso**, sem skill nova.
- Entregas **sem** skill primária instalada: PRD (D4), Implementation plan, Ficha, PRD checklist, "flows".
- **Skills novas justificáveis** (só se o Reuso falhar): (1) nó `FICHA`; (2) adaptador de estado (é contrato, não skill). Qualquer outra exige as 4 respostas de `C-02`.
