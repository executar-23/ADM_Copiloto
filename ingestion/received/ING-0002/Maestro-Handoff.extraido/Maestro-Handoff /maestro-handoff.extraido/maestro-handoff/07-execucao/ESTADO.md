# ESTADO DO MAESTRO — ledger único (C-01)

> Vocabulário canônico: `BACKLOG_VALIDATED · READY · DOING · VERIFY · DONE · BLOCKED`.
> Rótulos PT / símbolos: VALIDADO ⬜ · PRONTO ⬜ · EM EXECUÇÃO 🔄 · VERIFICAR 🔎 · CONCLUÍDO ✅ · BLOQUEADO ⛔.
> **WIP = 1**: no máximo um nó em 🔄 por vez. Nenhum nó vira ✅ sem `evidencia` preenchida (I-04).
> **Dono canônico** por trilha: `repo` (construir o Maestro) ou `control-center` (operar o lançamento) — ver C-01 §"Onde mora a fonte de verdade".

**Última atualização:** (preencher a cada nó)
**Nó ativo (WIP):** (nenhum ainda)

## Trilha S — Construir o Maestro

| Estágio | Skill/prompt | Status | Dono | Evidência |
|---|---|---|---|---|
| E0 Verificação e inventário | `04-prompts-por-estagio/E0-*.md` | ⬜ pendente | repo | |
| E1 Descoberta e definição | `E1-*.md` | ⬜ pendente | repo | |
| E2 Desenho e modelagem | `E2-*.md` | ⬜ pendente | repo | |
| E3 Análise de riscos | `E3-*.md` | ⬜ pendente | repo | |
| E4 Agent Spec / permissões / evals | `E4-*.md` | ⬜ pendente | repo | |
| E5 Walking skeleton | `E5-*.md` | ⬜ pendente | repo | |
| E6 Teste e validação | `E6-*.md` | ⬜ pendente | repo | |
| E7 Formalização (SOP/RACI/KPIs) | `E7-*.md` | ⬜ pendente | repo | |
| E8 Implantação e operação | `E8-*.md` | ⬜ pendente | repo | |
| E9 Monitoramento e melhoria | `E9-*.md` | ⬜ pendente | repo | |

## Trilha L — Operar o lançamento (PEM-D16) — abre só após gate de E6

| Fase | Literal | Status | Dono | Depende de | Evidência |
|---|---|---|---|---|---|
| F0 | Blog ativo fullstack | ⬜ pendente *(= handoff v1, ver `/mnt/user-data/outputs/handoff`)* | control-center | E6 | |
| F1 | 3 packages pilares editoriais | ⬜ pendente | control-center | F0; **D9** | |
| F2 | Vera Agente | ⬜ pendente | control-center | F0, F1, F4 | |
| F3 | Loja oficina | ⬜ pendente | control-center | F0 | |
| F4 | Mapa cognitivo | ⬜ pendente | control-center | F0 | |
| F5 | CMS de produção | ⬜ pendente | control-center | F0 | |
| F6 | Pipeline BPM e Qualidade | 🔄 *(é a Trilha S)* | repo | — | |
| F7 | Relatório de skills e capacidades | ⬜ pendente *(delta em E0)* | repo | E0 | |
| F8 | Workbook final | ⬜ pendente | control-center | F1–F7; **D8** | |

## Decisões abertas — novas (Maestro)

| # | Decisão | Onde é decidida | Resposta | Data |
|---|---|---|---|---|
| D1 | Fonte de verdade do estado: repo × control-center × híbrido | E2 | | |
| D2 | Lacunas do SOP (GEO, Topic Pack, arco, nomenclatura): absorver por change control ou manter Process Doc separado | E1/E2 | | |
| D3 | Versão canônica de `executar-block-quick-frameworks` (enviada × instalada) | E0/E2 | | |
| D4 | Plugin Product Management: instalar ou usar fallback RC `prd.md` | E0 | | |
| D5 | `obsidian-editorial-pipeline` v2.3: instalar no ambiente | E0 | | |
| D6 | Leitura de "pluging"/"mangemnet": distribuição plugin? camadas de gestão? | E0 | | |
| D7 | Significado de "DRP" | E0 | | |
| D8 | Qual skill gera o "workbook final" (F8) | E0/E2 | | |
| D9 | Fórmula de lançamento / "níveis de consciência" (bloqueia F1) | E1 | | |
| D10 | Formato único de ADR (oficial × RC) | E2 | | |
| D11 | Fronteira Maestro × Copiloto EXECUTAR | E2 | | |

## Decisões herdadas do handoff v1 (F0) — ainda abertas

D1-v1 Astro × Arrow/Vite · D2-v1 Tailwind × classes Obsidian/Minimal · D3-v1 HIG+Fluent × "sem design system próprio" · D4-v1 Power BI (licença/custo/auth) · D5-v1 uso de `app.css` em site público · D6-v1 leitura de "twland"/"adotidade".

## Bloqueios

(vazio)

## Log de mudanças de contrato (change control)

(vazio — usar o formato `CURRENT→EVIDENCE→CONFLICT→PROPOSED_CHANGE→IMPACT→REVIEW_REQUIRED→STATUS` de `01-contratos/C-02`)
