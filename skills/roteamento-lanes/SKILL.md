---
name: roteamento-lanes
description: Roteia uma intenção ou entrega do lançamento (PRD, FRD, ADR, runbook, test plan, linha editorial, analytics, ficha etc.) para a lane certa (Produto, Engenharia, Design, QA, DevOps, Stakeholders, Operações, Editorial) e para UMA skill vencedora — oficial Anthropic ou proprietária EXECUTAR — resolvendo sobreposições, fallbacks e lacunas sem inventar skill. Use quando o usuário pedir uma entrega, perguntar "qual skill uso para…", "quem faz…", ou quando o Maestro precisar escolher a skill de um nó. Also triggers on "which skill", "route this", "which lane".
---

# Roteamento intenção → lane → skill

Fonte: `mapa/roteamento.json` (projeção legível em `mapa/roteamento.md`). **Status global: HIPÓTESE** até o estágio E2 validar cada linha executando a skill num caso real.

## Procedimento

1. `routing_lookup(query="<entrega ou intenção>")` → linhas candidatas com lane, skill primária, disponibilidade, apoio, lacuna, sobreposições e fallbacks.
2. **Uma vencedora por intenção.** Se a linha tiver `primaria.skill`:
   - `disponivel = "sim"` → use-a; grave `skill` (e `skill_version` via `skill_fingerprint` quando houver cópias) no nó.
   - `disponivel = "nao"` → aplique o **fallback** listado e peça aprovação do usuário (ex.: PRD sem `product-management:write-spec` → RC `templates/prd.md`, decisão D4). Não use o fallback em silêncio.
   - `disponivel = "A DEFINIR"` → verifique (`skill_fingerprint(name=…)`); se não achar, registre `A DEFINIR` — "não achei" ≠ "não existe".
3. **Sem skill primária** (`skill = null`) → a lacuna está declarada; use o apoio listado e registre o gap no nó. **Não crie skill nova** sem passar pelo pipeline `component-ingestion` e pelas 4 respostas anti-overkill.
4. **Sobreposição** (duas skills para a mesma intenção): use a `proposta`; se for `null`, a escolha é decisão de E2 — registre/consulte a decisão antes de seguir.
5. Skill com **drift** entre cópias (ex.: `executar-block-quick-frameworks`, D3): não use até a decisão; registre divergência.

## Lanes

| Lane | Origem | Foco |
|---|---|---|
| `produto` | macro | PRD, FRD, AC, PRD checklist |
| `engenharia` | macro | spec, ADR, API, data model, NFR, eng review, implementation plan |
| `design` | macro | UX/flows, design system, acessibilidade, UX copy |
| `qa` | macro | test plan, revisão independente (folha `qa-reviewer`) |
| `devops` | macro | release constraints, deploy checklist, runbooks, change request |
| `stakeholders` | macro | status report, stakeholder update, relatórios executivos |
| `operacoes` | macro | SOP, analytics, epics/tracker, ficha, rotina (Copiloto) |
| `editorial` | derivada | linha editorial, campanhas, packs (SOP-KP-001) |

Detalhes por lane (skills oficiais × proprietárias, lacunas conhecidas): `references/lanes.md`.

## Regras

- Skill oficial devolve documento sem estado → o resultado é **rascunho** até a verificação (nó em `VERIFY`).
- Conectores (Notion, Railway, Supabase, Vercel, Linear…) têm esquemas **não lidos**: qualquer escrita é ação externa (I-05) e exige autorização.
- Mudou a tabela? Edite `mapa/roteamento.json` (o hook valida o schema), rode `npm run render` e registre a mudança (decisão D# ou nota no nó E2).
