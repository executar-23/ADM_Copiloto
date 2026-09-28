<!-- Referência ingerida em ING-0002 a partir de ING-0002:02-mapa/divergencias-e-lacunas.md (sha256 2e85de7685dc…). Conteúdo preservado; hipóteses continuam HIPÓTESE.
     Adaptações de caminho: '07-execucao/ESTADO.md' → ledger canônico 07-execucao/estado.json (projeção ESTADO.md); '01-contratos/' → contratos/; '02-mapa/' → mapa/.
     Atualizações seguem change control (I-10): não reescrever; acrescentar nota datada. -->

# Divergências e lacunas verificadas

> Cada item traz **o que foi verificado**, **como reverificar** e **o que muda no Maestro**.
> Status: `VERIFICADO` (li o arquivo/rodei o comando nesta preparação) · `RELATO` (fonte
> externa não confirmada) · `HIPÓTESE` (inferência minha — precisa de teste).
> Nada aqui autoriza decidir sozinho: os itens viram decisões `D#` em `07-execucao/ESTADO.md`.

---

## §1 — Seis vocabulários de estado, nenhum tradutor  · `VERIFICADO`
Ver `01-contratos/C-01-estado-unificado.md`. O Copiloto proíbe estado paralelo; o Maestro
não pode ser o sétimo ledger. → **D1**.

---

## §2 — Process Doc (22 tarefas) × SOP-KP-001 (42 etapas)  · `VERIFICADO` + `HIPÓTESE`

**Fato verificado:** a skill Obsidian v2.3 declara em `references/source-precedence.md`
que o SOP-KP-001 é a "fonte canônica única de blocos, gates, dependências e critério de pronto"
e que, **se um Process Doc de marca divergir em gates ou ordem, a divergência deve ser
registrada como decisão de governança — nunca ignorada em silêncio**.
O docx enviado (`PD-CLB-20260906-F01-DOC-V01`) tem **22 tarefas** (Fase 1); o SOP tem **42
etapas em 8 blocos (A–H)**.

> ⚠️ A skill cita "antigo Process Doc **V02**"; o docx enviado é código `…F01-DOC-V01`, status
> "rascunho de pré-produção". **Relação entre os dois: NÃO DETERMINADA.**

**Lacunas verificadas por busca** (`grep -i` em `references/*.md` e `config/process-v03.json`,
saída vazia): *GEO*, *Topic Pack*, *arco*, *nomenclatura/[HUB]-[PILAR]…*, *indexação*,
*ciclo de 15 dias* — **não existem no SOP-KP-001**. Correspondem às Tarefas 03, 07, 19, 20 do docx.

**Correspondência provável (HIPÓTESE — validar em E2):**

| Tarefa (docx) | Etapa(s) SOP | Confiança |
|---|---|---|
| 01 Validação do tema | S01–S02 | média (SOP recusa começar em "tema validado") |
| 02 Pesquisa e evidências | S06–S13 | média |
| **03 Topic Pack** | *sem equivalente* | — **lacuna** |
| 04 Outline da peça-mãe | S10–S11 | alta |
| 05 Redação do artigo mãe | S14–S17 | alta |
| 06 Revisão de estilo editorial | S38 (parcial) | média — SOP-QA não cita "zero coach" |
| **07 GEO/SEO** | *sem equivalente* | — **lacuna** |
| 08 Roteiro do vídeo mãe | S28 | alta |
| 09 Marcação de trechos p/ derivados | S29 | alta |
| 10 Textos curtos | S30 | alta |
| 11 Vídeos verticais | S31 | alta |
| 12 Carrosséis | S32 | alta |
| 13 Copy das imagens | S33 | alta |
| 14 Briefing dos 3 infográficos | S15 + S27 | média |
| 15 Stories | S34 | alta |
| 16 Newsletters | S35 | alta |
| 17 Ebooks | S36 | alta |
| 18 Mapeamento dos CTAs | S37 | alta |
| **19 Coerência do arco** | *sem equivalente* | — **lacuna** |
| **20 Indexação e nomenclatura** | *sem equivalente* (SOP tem manifesto+hash no ZIP) | — **lacuna** |
| 21 Checklist pré-handoff | S38 + `98 - CHECKLIST FINAL` | média |
| 22 Handoff Fase 2 | `99 - FINALIZAR E GERAR ZIP` + `handoff_accepted` | média |

Fases 2–5 do docx (imagens/vídeo, revisão, agendamento, análise) ≈ blocos E, G, H do SOP (S25–S28, S38–S42) — **HIPÓTESE**.

**Recomendação (D2, a confirmar):** SOP-KP-001 = motor de gates (já implementado e testável);
absorver as 4 lacunas (GEO, Topic Pack, arco, nomenclatura) **por change control**, como
acréscimos ao SOP — não como um segundo processo. O docx permanece referência de governança.

---

## §3 — Cópias divergentes e skill não instalada  · `VERIFICADO`

| Skill | Situação |
|---|---|
| `executar-block-quick-frameworks` | **DRIFT.** Instalada = `SKILL.md` de **162 linhas** (v1.0.0, `automation_level: A4`, contratos em `references/*.yaml`, "briefing de infográfico 16:9"). Enviada = `SKILL.md` de **634 linhas** (monólito com PWA, SVG inline, identidade amarelo-preto-vermelho, validador embutido). Os demais arquivos são idênticos. **Qual é o mais novo: NÃO DETERMINADO** (timestamps sem valor: instalada `1980-01-01`; enviada = data de extração). → **D3** |
| `executar-solution-store` | instalada = enviada (idênticas) |
| `rc-cognitive-risk-expert` | instalada = enviada (idênticas) |
| `obsidian-editorial-pipeline` v2.3.0 | **NÃO INSTALADA.** Existe só o `.skill` enviado (`RELEASE.json`: `SKILL-OBS-EDITORIAL-V2`, `BUILT`, processo `SOP-KP-001`). → **D5** |

**Como reverificar:** `diff -rq <enviada> /mnt/skills/plugins/<skill>`; `ls /mnt/skills/plugins | grep -i obsidian`.
**Impacto:** o Maestro precisa de **fixação de versão** (`skill_version` no nó, C-01) e de um teste de drift (EV-008).
A identidade visual (amarelo/preto/vermelho) hoje só existe na cópia enviada — se a instalada vencer, essa identidade precisa de outra casa (design system).

---

## §4 — Plugin Product Management não está instalado  · `VERIFICADO`

Captura de tela: o plugin mostra botão **Add** (os outros quatro mostram toggle ligado). No
sistema de arquivos: `ls /mnt/skills/plugins | grep -i -E "product|write-spec|roadmap-update|sprint-planning|…"` → **vazio**.

Contagem instalada hoje: Engineering **10**, Operations **9**, Marketing **8**, Design **7** = **34 skills oficiais**.
PM (8 skills + 1 comando, segundo a captura): `competitive-brief, metrics-review, product-brainstorming,
roadmap-update, sprint-planning, stakeholder-update, synthesize-research, write-spec`.

**Impacto:** o macro **Produto** e o **PRD** (entrega central) dependem de `write-spec`.
Alternativas já no ambiente: `templates/prd.md` do RC (13 seções, ver `matriz-entregas-x-lanes.md`) + `engineering:system-design`.
→ **D4 · `USER_ACTION_REQUIRED`** (instalar o plugin ou aprovar o fallback).

**Sobreposições de nome a resolver no roteamento** (invocação ambígua):
`competitive-brief` (Marketing **e** PM) · `research-synthesis` (Design) × `synthesize-research` (PM) ·
`content-creation` × `draft-content` (ambas Marketing, descrições quase idênticas).

---

## §5 — Entradas citadas e não fornecidas  · `VERIFICADO`

| Insumo | Citado em | Efeito |
|---|---|---|
| **README do ecossistema** | Ficha, itens 4–10 | itens 4 e 10 sem base; **não inventar** |
| **ADRs do lançamento granular / "fórmula de lançamento (equação)"** | Ficha, itens 8–9; F1 | F1 ("níveis de consciência") sem definição executável |
| **Legenda dos 22 pontos da Ficha** | "22 pontos" | títulos dos pontos desconhecidos; ver `ficha-22-pontos.md` |
| **Template do "PRD checklist"** | Entregas | fonte ausente → **não inventar checklist**; propor derivação (RC `prd.md` + `write-spec`) para aprovação |
| Definição de "Vera Agente" | F2 | só se sabe que é um agente; docx menciona "agente de IA público" (captação gratuita) |

→ **D9 · `USER_ACTION_REQUIRED`**. Enquanto ausentes, os pontos ficam `A DEFINIR` (EV-005).

---

## §6 — Restrições do Claude Code que moldam o Maestro  · `VERIFICADO` (docs) + `RELATO`

Fonte: `https://code.claude.com/docs/en/sub-agents` (lida nesta preparação).

| Fato | Consequência de projeto |
|---|---|
| Subagentes podem criar subagentes, mas o **limite depende da versão**: padrão atual **3 níveis** (v2.1.219+); foi 5 (v2.1.172–216) e 1 (v2.1.217–218). Configurável por `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` | **Não depender de aninhamento.** Testar com profundidade 1 (EV-009) |
| `RELATO` (issue pública `anthropics/claude-code#80036`, **não confirmado**): subagentes `general-purpose`/`claude` sem a ferramenta `Agent` na prática; só `fork` a mantém | Mais um motivo para o Maestro ser **thread principal** e as lanes serem folhas |
| `claude --agent <nome>` faz a **sessão inteira** assumir o agente; `tools: Agent(a, b)` limita quais subagentes ele pode criar — **vale só para agente na thread principal** | **Maestro = agente de thread principal** com allowlist de lanes |
| **Subagente vindo de plugin ignora `hooks`, `mcpServers` e `permissionMode`** | Guardrails **não podem viver no frontmatter** se as lanes forem distribuídas como plugin; ficam em `settings.json`/`hooks.json` do plugin ou no projeto (EV-010) |
| Contexto do subagente começa **novo**; o **prompt de delegação é o único canal** | Passagem explícita por arquivos + C-04 |
| Limite de **20** subagentes simultâneos; descrições combinadas acima de **15.000 tokens** geram aviso | Poucas lanes com descrição curta |
| Hooks `PreToolUse` com saída `exit 2` **bloqueiam** a chamada; valem também dentro de subagentes | WIP=1 e "sem efeito externo sem aprovação" podem ser **impostos por hook**, não só pedidos por prompt |
| Estrutura de plugin: `.claude-plugin/plugin.json` (manifesto), componentes na **raiz** (`commands/`, `agents/`, `skills/`, `hooks/hooks.json`, `.mcp.json`); manifesto é opcional (auto-descoberta) | Distribuição como plugin é viável, com a restrição acima |

**A versão do Claude Code do usuário não é conhecida.** → E0 roda `claude --version` e prova os comportamentos acima na máquina real, em vez de assumir.

---

## §7 — Ambiguidades de leitura (transcrição por voz)  · `HIPÓTESE`

| Termo original | Minha leitura | Confirmar |
|---|---|---|
| "pluging" (na lista de áreas oficiais) | **empacotamento do Maestro como plugin** (3ª distribuição), não um plugin Anthropic. Não há plugin oficial chamado "Plugin" no ambiente | **D6** |
| "mangemnet" (idem) | **as três camadas de gestão** citadas no objetivo ("operacional, estratégica e tática"), não um plugin | **D6** |
| "DRP" em "Produto — Engenharia — DRP" | **A DEFINIR** (pode ser documento de requisitos de produto; não afirmar) | **D7** |
| F8 "Workbook final" | candidatos no ambiente: `gerar-workbook-deskgo`, `deskgo-business-workbook`, `plano-operacional-rastreavel`. **A DEFINIR** | **D8** |
| F5 "CMS de produção" | provavelmente o Obsidian → blog (pipeline editorial + publicação). **A DEFINIR** | E1 |
| F1 "níveis de consciência" | **≠** do arco de 3 artigos do docx (Problema → Fatores → Exposição)? Dependem da "fórmula de lançamento" (não fornecida) | **D9** |
| Numeração da Ficha | contém sobreposição (`5` dentro de `4–10`; `18` duas vezes). Não normalizar sem legenda | **D9** |
| "Astro – twland" (v1) | Tailwind? — pendência herdada do handoff v1 (D6 do v1) | v1 |

---

## §8 — F7 sobrepõe um registro já existente  · `VERIFICADO`

O projeto `exe` mantém o **`EXECUTAR_SKILLS_REGISTRY`** (índice mestre, mapa de capacidades,
relatório de lacunas, relatório de validação), com princípio de integridade "sem esquemas
fabricados; lacuna = `A DEFINIR`/`GAP`/`USER_ACTION_REQUIRED`". Estado registrado em 17/09/2026:
9 skills de usuário, 3 namespaces (14 skills), 4 plugins ricos, 5 conectores MCP.
**Contagem hoje (verificada com `ls`)** versus o registro:

| Grupo | Registro (17/09) | Hoje |
|---|---|---|
| Namespaces multi-skill próprios (`paper-sprint`, `executar-copiloto`, `commercial-video`) | 14 | **14** (batem) |
| Plugins standalone próprios | 4 | **12** |
| Skills standalone em `/mnt/skills/user` | 9 | **6** |
| Plugins **oficiais** Anthropic (Eng/Ops/Mkt/Design) | 0 (escopo excluía) | **34** |

Total em `/mnt/skills/plugins` = 14 + 12 + 34 = **60** diretórios. O registro está desatualizado
(ou o escopo mudou). **Hipótese** (não verificada, exige abrir o registro): parte das skills passou de `/user` para `/plugins`; e há **34 oficiais** que o registro não cobria.

**Consequência:** **F7 = delta do registro existente**, não um relatório novo. E0 abre o registro,
calcula o delta contra o sistema de arquivos e atualiza — não reconstrói. (Anti-overkill, C-02.)

---

## §9 — Conflito herdado a não reabrir por engano  · `VERIFICADO`

O handoff v1 (`handoff/`) **é o F0** ("Blog ativo fullstack"). Suas decisões abertas D1–D6
(Astro × Arrow/Vite; Tailwind × Obsidian/Minimal; HIG+Fluent × "sem design system próprio";
Power BI; licença do `app.css`; ambiguidades "twland"/"adotidade") **continuam abertas**.
O Maestro **importa o v1 como subárvore** (`F0.S0…F0.S8` no ESTADO.md) — não cria segundo pipeline
de blog. Nomenclatura: decisões do v1 = `D1-v1…D6-v1`; as novas = `D1…` (sem prefixo).
