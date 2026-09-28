# Lanes — skills e lacunas conhecidas

> Resumo de `mapa/roteamento.json` e `mapa/matriz-entregas-x-lanes.md` (ING-0002). Disponibilidade = verificação feita
> no ambiente do usuário pelo pacote (não reverificada fora da máquina local — E0).

| Lane | Skills oficiais | Skills proprietárias | Lacunas / decisões |
|---|---|---|---|
| Produto | `product-management:*` (**não instalado**) | `rc-cognitive-risk-expert` (PRD/ADR/handoff), `executar-safe-frameworks` | D4 (instalar PM ou fallback RC `prd.md`); PRD checklist sem fonte (D9) |
| Engenharia | `engineering:architecture`, `system-design`, `code-review`, `documentation`, `tech-debt` | `rc-cognitive-risk-expert` | formato de ADR (D10); OpenAPI? A DEFINIR; implementation plan sem skill oficial |
| Design | `design:*` (7) | `executar-design`, `executar-block-quick-frameworks` (identidade — drift D3) | "flows" sem skill dedicada (Mermaid) |
| QA | `engineering:testing-strategy`, `code-review`, `debug`; `design:accessibility-review` | `rc` (claim-check), validadores das skills | eval de agente ≠ teste de código |
| DevOps | `engineering:deploy-checklist`, `incident-response`; `operations:change-request`, `runbook` | conectores Railway/Vercel/Supabase | **Cloudflare sem conector**; esquemas de conector não lidos |
| Stakeholders | `operations:status-report`; `product-management:stakeholder-update` (não instalado) | `executar-business-docx` | — |
| Operações | `operations:*` (9) | `copiloto-executar`, `executar-mapa-os`, `plano-operacional-rastreavel` | tracker Linear com CONF-01 aberto; fronteira Maestro × Copiloto (D11) |
| Editorial (derivada) | `marketing:*` (8) | `obsidian-editorial-pipeline` (**não instalada**, D5), `executar-block-quick-frameworks`, `rc` | lacunas do SOP-KP-001 (D2); `content-creation` × `draft-content` a decidir |

## Sobreposições (inventário §D)

- análise competitiva: `marketing:competitive-brief` × `product-management:competitive-brief` → Marketing (PM não instalado).
- síntese de pesquisa: `design:research-synthesis` × `product-management:synthesize-research` → Design.
- conteúdo de marketing: `marketing:content-creation` × `marketing:draft-content` → escolher em E2 após ler ambas.
- framework/estratégia: oficiais × `executar-safe-frameworks` → proprietária para análise rastreável; oficial para artefato de formato fixo.
