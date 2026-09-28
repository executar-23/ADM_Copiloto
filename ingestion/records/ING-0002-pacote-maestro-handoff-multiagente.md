---
id: ING-0002
titulo: "Pacote Maestro (handoff multiagente) + handoff de construção do plugin"
status: integrada
estagio_atual: REGISTER
recebido_em: 2026-09-28
origem: "usuário, sessão de 2026-09-28: anexos Maestro-Handoff_.zip + PROMPT-DE-PARTIDA.md e mensagens de handoff ('plugin operacional com agents, skills, commands e MCP'; 'desenvolvimento completo do maestro fullstack')"
received_dir: ingestion/received/ING-0002
componentes:
  - { nome: "01-contratos C-00…C-04", tipo: contrato, decisao: adaptar, destino: contratos/, catalog_id: null }
  - { nome: "02-mapa (inventário, matriz, F0–F8, ficha, divergências)", tipo: documento, decisao: adaptar, destino: mapa/, catalog_id: null }
  - { nome: "matriz-entregas-x-lanes → roteamento", tipo: documento, decisao: adaptar, destino: mapa/roteamento.json, catalog_id: null }
  - { nome: "07-execucao/ESTADO.md", tipo: documento, decisao: adaptar, destino: 07-execucao/estado.json, catalog_id: null }
  - { nome: "00-LEIA-PRIMEIRO/CLAUDE.md", tipo: documento, decisao: adaptar, destino: CLAUDE.md, catalog_id: null }
  - { nome: "00-LEIA-PRIMEIRO/HANDOFF.md + PROMPT-DE-PARTIDA.md", tipo: documento, decisao: referenciar, destino: ingestion/received/ING-0002, catalog_id: null }
  - { nome: "03-arquitetura-alvo (topologia + agent-spec) → maestro", tipo: agent, decisao: adaptar, destino: agents/maestro.md, catalog_id: "agent:maestro" }
  - { nome: "candidato qa-reviewer (G2)", tipo: agent, decisao: adaptar, destino: agents/qa-reviewer.md, catalog_id: "agent:qa-reviewer" }
  - { nome: "candidato evidence-researcher (G1)", tipo: agent, decisao: adaptar, destino: agents/evidence-researcher.md, catalog_id: "agent:evidence-researcher" }
  - { nome: "candidato editorial-worker (G3)", tipo: agent, decisao: rejeitar, destino: null, catalog_id: null }
  - { nome: "component-analyst (pipeline de ingestão do handoff)", tipo: agent, decisao: adaptar, destino: agents/component-analyst.md, catalog_id: "agent:component-analyst" }
  - { nome: "C-01 adaptador + C-04 handoff → maestro-operacao", tipo: skill, decisao: adaptar, destino: skills/maestro-operacao, catalog_id: "skill:maestro-operacao" }
  - { nome: "matriz + inventário §D → roteamento-lanes", tipo: skill, decisao: adaptar, destino: skills/roteamento-lanes, catalog_id: "skill:roteamento-lanes" }
  - { nome: "04-prompts-por-estagio E0–E9, L → estagios-bpm", tipo: skill, decisao: adaptar, destino: skills/estagios-bpm, catalog_id: "skill:estagios-bpm" }
  - { nome: "pipeline de ingestão (handoff) → component-ingestion", tipo: skill, decisao: adaptar, destino: skills/component-ingestion, catalog_id: "skill:component-ingestion" }
  - { nome: "convenções plugin-dev/mcp-server-dev → component-authoring", tipo: skill, decisao: adaptar, destino: skills/component-authoring, catalog_id: "skill:component-authoring" }
  - { nome: "camada Command (handoff)", tipo: command, decisao: adaptar, destino: "commands/{estado,executar,verificar,decidir,ingerir,validar,catalogo}.md", catalog_id: "command:executar" }
  - { nome: "topologia §4 imposição por hook → guard-write", tipo: hook, decisao: adaptar, destino: src/hooks/guard-write.ts, catalog_id: "hook:guard-write" }
  - { nome: "topologia §4 I-05 → guard-external", tipo: hook, decisao: adaptar, destino: src/hooks/guard-external.ts, catalog_id: "hook:guard-external" }
  - { nome: "EV-014 → session-context", tipo: hook, decisao: adaptar, destino: src/hooks/session-context.ts, catalog_id: "hook:session-context" }
  - { nome: "VALIDATE na escrita → validate-on-write", tipo: hook, decisao: adaptar, destino: src/hooks/validate-on-write.ts, catalog_id: "hook:validate-on-write" }
  - { nome: "C-01 estado unificado → servidor MCP estado", tipo: mcp-server, decisao: adaptar, destino: src/mcp/estado.ts, catalog_id: "mcp-server:estado" }
  - { nome: "catálogo + ingestão + roteamento → servidor MCP registry", tipo: mcp-server, decisao: adaptar, destino: src/mcp/registry.ts, catalog_id: "mcp-server:registry" }
---

# ING-0002 — Pacote Maestro (handoff multiagente) + handoff de construção do plugin

> Registro permanente do pipeline de ingestão (`docs/process/ingestion-pipeline.md`).
> Este foi o **nó real ponta a ponta** do walking skeleton (E5): o próprio pipeline do plugin recebeu o pacote (RECEIVE via `ingestion_start`).

## 1. RECEIVE

- **Origem:** usuário, sessão de 2026-09-28 — anexos `Maestro-Handoff_.zip` (contém `maestro-handoff.zip` aninhado) e `PROMPT-DE-PARTIDA.md`; mensagens de handoff pedindo o plugin operacional completo.
- **Itens recebidos:**
- `ingestion/inbox/Maestro-Handoff.zip`
- `ingestion/inbox/PROMPT-DE-PARTIDA.md`
- **Originais imutáveis:** `ingestion/received/ING-0002` · manifesto: ingestion/received/ING-0002/MANIFEST.sha256 (33 arquivos)

- **Execução:** `ingestion_start` (lib `startIngestion`) — cópia, extração recursiva de compactados (sem `__MACOSX`), `MANIFEST.sha256` (33 arquivos), remoção do inbox.
- **Integridade:** `tests/repo/repo.test.ts` recalcula os 33 hashes a cada `npm test`.

## 2. ANALYZE

| Parte do pacote | Propósito | Dependências / observações |
|---|---|---|
| `00-LEIA-PRIMEIRO/` (HANDOFF, CLAUDE, PROMPT) | objetivo, restrições globais, ordem E0→E9, stop conditions | exige Plan Mode, WIP=1, nunca inventar, aprovação externa, Regra do 3 |
| `01-contratos/` C-00…C-04 | invariantes, estado unificado, Agent Spec, evals, handoff | C-01 depende de `state-contract.json` (Copiloto) e `RUN_STATE.yaml` — **não fornecidos** |
| `02-mapa/` | inventário de skills, matriz entregas×lanes, F0–F8, ficha 22 pontos, divergências §1–§9 | quase tudo marcado HIPÓTESE; insumos ausentes (§5) |
| `03-arquitetura-alvo/` | topologia (1 agente principal + lanes como roteamento; Overkill Gate; hooks) e Agent Spec do Maestro (DRAFT) | fatos de §6 (docs do Claude Code) a provar em E0 |
| `04-prompts-por-estagio/` | playbooks E0–E9 e L | OUTPUT CONTRACT/VALIDATION por estágio |
| `07-execucao/ESTADO.md` | ledger inicial (Trilha S, Trilha L, D1–D11, D1-v1…D6-v1) | vocabulário canônico do Copiloto |

Duplicatas internas (mesmo sha256): `HANDOFF.md`, `divergencias-e-lacunas.md` e `PROMPT-DE-PARTIDA.md` aparecem fora e dentro do zip aninhado — idênticos; usado o do zip.

## 3. CLASSIFY

| Componente | Camada |
|---|---|
| contratos, mapa, ledger, CLAUDE.md | documentos normativos (não carregados como componente) |
| Maestro (topologia + spec) | **Agent** de thread principal |
| candidatos G1/G2 | **Agents** folha |
| adaptador C-01, handoff C-04 | **Skill** (procedimento) + **MCP Tool** (regras de estado impostas por código) |
| matriz de roteamento | **Skill** + dado (`roteamento.json`) + **MCP Tool** (`routing_lookup`) |
| prompts por estágio | **Skill** (playbooks sob demanda) |
| "imposição por hook, não por pedido" (topologia §4) | **Hooks** |
| pipeline de ingestão, commands (handoff) | **Skill** + **Commands** + **MCP Tools** + **Agent** |

## 4. COMPARE

- Catálogo vazio antes desta ingestão (exceto ING-0001) → sem duplicação interna.
- Equivalentes externos avaliados: `copiloto-executar` (estado diário sobre o Control Center — não cobre produção multi-lane: D11), `plugin-validator` (estrutura de plugin, não DoD de nó), `cowork-plugin-management` (sem registro de ingestão).
- Padrões Anthropic aplicados: plugin-structure, agent/skill/command/hook-development, mcp-integration, mcp-server-dev tool-design (ING-0001).

## 5. CHECK_CONFLICTS

| Conflito / risco | Tratamento |
|---|---|
| E5 do pacote: "Modo A, sem plugin" × usuário: plugin completo agora | **CC-002** (autoridade 1 do C-04: decisão explícita do usuário) |
| C-01: ledger em markdown × invariantes impostas por código | **CC-001**: `estado.json` + projeção gerada |
| Ordem E0→E5 × construção antecipada | E4/E5 ficam `BACKLOG_VALIDATED` com `output` antecipado; nada promovido sem evidência |
| Guardrail no frontmatter de agent (ignorado em plugin) | lint `IGNORED_IN_PLUGIN`; hooks no plugin (E0 prova C confirmou) |
| Nome "PRISMA" já usado no sistema de cards | não reutilizado (topologia §6) |
| Sobreposições de skills (competitive-brief etc.) | `roteamento.json.sobreposicoes` (HIPÓTESE) |
| Insumos ausentes (README, ADRs, legenda, PRD checklist) | `A DEFINIR` + D9 (EV-005) |
| editorial-worker (G3) sem ≥ 2 packs em paralelo | **rejeitado** na v0 (anti-overkill) |

## 6. ADAPT

Decisões por componente no frontmatter. Adaptações relevantes em relação ao original:
- Contratos ganharam versão, procedência (sha256) e a coluna "imposto por"; C-03 aponta onde cada EV roda.
- Mapa preservado integralmente com cabeçalho de procedência; matriz convertida em `roteamento.json` (21 entregas, 8 lanes, 4 sobreposições, 4 fallbacks) — **sem** escolher vencedoras que o pacote deixou para E2.
- Ledger: 23 nós (E0–E9, ING-0001/0002, BUILD-0.1.0, F0–F8, FICHA com os 22 pontos sem títulos inventados) e 24 registros (D1–D13, D1-v1…D6-v1, DIV-001…003, CC-001/002).
- Topologia H-arq-1 mantida (1 principal + ≤ 4 folhas; teto respeitado: 3 folhas).
- Anti-overkill: respostas registradas em cada componente do catálogo.

## 7. VALIDATE

- `node dist/cli/maestro.js validate` → ✔ workspace válido (catálogo 55, componentes no disco 47).
- `claude plugin validate --strict` → manifesto ✔, marketplace ✔, conteúdo (sem marketplace.json) ✔.
- `claude --plugin-dir . plugin details maestro` → 12 skills/commands, 4 agents, 3 eventos de hook, 2 servidores MCP (~4,1k tokens always-on).

## 8. TEST

- `npm test`: unit (máquina de estados, auditoria, catálogo, lint, conflitos, fingerprint, ingestão, roteamento, utilitários), integração (servidores MCP reais via SDK/stdio; hooks via stdin), consistência do repo (inclui os 33 hashes do MANIFEST).
- E0 (provas headless): `--agent`, allowlist, profundidade 1, hooks de frontmatter ignorados, `ask` em headless, #80036 — `07-execucao/E0-verificacao.md`.
- E2E e evals: `07-execucao/evidencias/e2e/resultado.json`, `07-execucao/evidencias/evals/`.

## 9. DOCUMENT

`README.md`, `CLAUDE.md`, `docs/` (arquitetura, máquina de estados, MCP, decisões DE-001…010, pipeline, runbook, manutenção), `contratos/README.md`, `skills/*/references/`, `07-execucao/E0-verificacao.md`, `E4-*`, `E5-relatorio.md`.

## 10. INTEGRATE

Componentes nos destinos do frontmatter; plugin carregado por `claude --plugin-dir .`; commits na branch `claude/plugin-architecture-setup-roe253` (push/PR = ação externa, sujeita a acesso ao GitHub).

## 11. REGISTER

Catálogo: 4 agents, 5 skills, 7 commands, 4 hooks, 2 mcp-servers e 25 mcp-tools com `integration.ingestion = ING-0002`; `catalog/CATALOG.md` regenerado. Ledger: nó `ING-0002` com evidência deste registro. Status: **integrada**.
