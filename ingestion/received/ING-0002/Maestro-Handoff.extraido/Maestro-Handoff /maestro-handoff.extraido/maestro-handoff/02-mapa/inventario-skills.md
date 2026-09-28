# Inventário de skills

> Coluna **Lido**: `INTEGRAL` = li o `SKILL.md` inteiro · `PARCIAL` = li início/contratos ·
> `SÓ DESCRIÇÃO` = vi apenas a descrição no catálogo/captura (**não inspecionei o conteúdo**).
> Nada aqui substitui o registro `EXECUTAR_SKILLS_REGISTRY` (ver `divergencias-e-lacunas.md` §8):
> E0 calcula o **delta** contra ele.

## A. Proprietárias em foco (as que você nomeou + 1 dependência)

| Skill | Papel no sistema | Contrato de estado / gate (lido) | Instalada? | Lido |
|---|---|---|---|---|
| **obsidian-editorial-pipeline v2.3.0** | Motor de produção editorial: SOP-KP-001, **42 etapas, blocos A–H**, WIP=1, ZIP com hashes | job `PLANEJANDO→EM_ANDAMENTO→PRONTO_PARA_EMPACOTAR→EMPACOTADO`; etapa `PENDING/IN_PROGRESS/DONE/SKIPPED`; `USER_ACTION_REQUIRED`; DoD = saída + evidência + critério único; scripts `create_job`, `next_action`, `update_step`, `validate_job`, `build_production_zip`, `verify_package` | ❌ **só enviada** (D5) | INTEGRAL |
| **executar-safe-frameworks** | Seleção e aplicação de frameworks (catálogo `FW-DNN-NNN`, 23 domínios); análise rastreável fato×inferência | Gates de qualidade (`references/quality-gates.md`), `validate_report.py`; separa FATO/INFERÊNCIA/HIPÓTESE/CONFLITO/GAP | ✅ | INTEGRAL |
| **executar-block-quick-frameworks** | Quick Frameworks pesquisados (13 blocos, frase-síntese, infográfico) | `VERIFIED`/`BLOCKED` via `validate_output.py`; WIP=1 | ✅ **com DRIFT** (D3) | INTEGRAL (enviada) + PARCIAL (instalada) |
| **rc-cognitive-risk-expert** | **Especialista de domínio** do Mapa Interativo de Risco Cognitivo; SOT + claims + change control | Invariantes (`fator≠vulnerabilidade≠exposição≠risco`; `[FW]` nunca `[E1]`); `CURRENT→EVIDENCE→CONFLICT→PROPOSED_CHANGE→IMPACT→REVIEW_REQUIRED→STATUS`; templates `prd.md`, `adr.md`, `agent-handoff.md` | ✅ (idêntica à enviada) | INTEGRAL |
| **executar-solution-store** *(enviada; alimenta F3)* | Oficina/Loja: ingestão→classificação→schema→handoff→publicação | lifecycle 9 estados + operacional; `RUN_STATE.yaml`; gates G1–G6; `store.py` (`sources/init/validate/bundle`) | ✅ (idêntica à enviada) | INTEGRAL |

## B. Outras proprietárias detectadas no ambiente (candidatas a **reuso** — anti-overkill)

Você não as listou, mas existem em `/mnt/skills` e cobrem lacunas do Maestro. **Somente descrição lida.**
O agente deve **consultá-las antes de criar qualquer skill nova** (C-02, "Reuso").

| Skill | Uso provável no Maestro (HIPÓTESE) | Lido |
|---|---|---|
| `copiloto-executar` (+ `executar-copiloto:*`) | Estado canônico e rotina diária; **contratos de estado a reaproveitar** (D1) | PARCIAL (SKILL.md) |
| `executar-mapa-os` | Projeção Agora/Próximo/Depois; hierarquia `Projeto→Entrega→Fluxo→Ação` | PARCIAL |
| `plano-operacional-rastreavel` | Plano mensal com IDs estáveis; schema de 25 colunas | SÓ DESCRIÇÃO |
| `executar-prompt` | Compilar prompts em contrato (é a skill que gerou este pacote) | INTEGRAL |
| `executar-skill-creator`, `gerador-skill-directory` | **Autoria** de qualquer skill fina nova do Maestro | SÓ DESCRIÇÃO |
| `executar-arvore-roadmap` | Roadmap em árvore navegável (Implementation plan) | SÓ DESCRIÇÃO |
| `executar-business-docx`, `executar-design`, `deskgo-business-workbook`, `gerar-workbook-deskgo` | Relatórios A4, cards impressos, workbook (candidatas a **F8**, D8) | SÓ DESCRIÇÃO |
| `executar-calendar`, `paper-sprint:*` | Cadência (ciclo de 15 dias) e folhas impressas | SÓ DESCRIÇÃO |
| `commercial-video:*` | Vídeo mãe / vídeos verticais (planejar → validar → renderizar) | SÓ DESCRIÇÃO |
| `executar-fluxo-documental-notion` | Registro documental no Notion (R1–R9) | SÓ DESCRIÇÃO |

## C. Oficiais Anthropic

**Instaladas (34), sem estado — cada uma devolve um documento** (ver `C-00`).

| Plugin | Skills (verificadas no sistema de arquivos) | Lido |
|---|---|---|
| **Engineering** (10) | architecture · code-review · debug · deploy-checklist · documentation · incident-response · standup · system-design · tech-debt · testing-strategy | **INTEGRAL** (as 10) |
| **Operations** (9) | capacity-plan · change-request · compliance-tracking · process-doc · process-optimization · risk-assessment · runbook · status-report · vendor-review | SÓ DESCRIÇÃO |
| **Design** (7) | accessibility-review · design-critique · design-handoff · design-system · research-synthesis · user-research · ux-copy | SÓ DESCRIÇÃO |
| **Marketing** (8) | brand-review · campaign-plan · competitive-brief · content-creation · draft-content · email-sequence · performance-report · seo-audit | SÓ DESCRIÇÃO |

**NÃO instalada — Product Management (8 + 1 comando; segundo a captura):**
competitive-brief · metrics-review · product-brainstorming · roadmap-update · sprint-planning ·
stakeholder-update · synthesize-research · write-spec. → **D4 · `USER_ACTION_REQUIRED`**.

**Conectores por plugin (captura):** Engineering 10 · Design 9 · Marketing 13 · Operations 6 · PM 16.
**Quais estão realmente conectados: NÃO DETERMINADO.** Esquemas de ferramentas de conector são
lacuna declarada até serem lidos (princípio do registro `exe`). Conectores MCP presentes no ambiente:
`executar`, `Notion`, `Railway`, `Supabase`, `Vercel`. **Não há conector Cloudflare** listado (o
hosting do blog é Cloudflare) → lacuna para a lane DevOps.

## D. Regra de roteamento contra sobreposição

Onde duas skills disputam a mesma intenção, a tabela de roteamento (E2) **fixa uma vencedora** e registra o motivo:

| Intenção | Concorrentes | Proposta (HIPÓTESE) |
|---|---|---|
| análise competitiva | `marketing:competitive-brief` × `product-management:competitive-brief` | Marketing (PM não instalado) |
| síntese de pesquisa | `design:research-synthesis` × `product-management:synthesize-research` | Design |
| conteúdo de marketing | `marketing:content-creation` × `marketing:draft-content` | uma só, escolhida em E2 após ler ambas |
| framework/estratégia | oficiais × `executar-safe-frameworks` | proprietária para análise rastreável; oficial para o artefato de formato fixo |
