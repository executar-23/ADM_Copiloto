# E5 — Walking skeleton → plugin `maestro` v0.1.0 (relatório)

> Artefato **antecipado** por decisão do usuário (CC-002): o pacote previa E5 em Modo A (projeto, sem plugin); o usuário pediu o
> plugin completo nesta rodada. O nó E5 continua `BACKLOG_VALIDATED` (depende de E0–E4) e **re-verifica** este relatório quando
> chegar a vez dele. O trabalho desta rodada está no nó `BUILD-0.1.0`.

## O que foi construído

| Camada | Entregue | Onde |
|---|---|---|
| Agents | `maestro` (thread principal) + folhas `qa-reviewer`, `evidence-researcher`, `component-analyst` (3 ≤ teto 4) | `agents/` |
| Skills | `maestro-operacao`, `roteamento-lanes`, `estagios-bpm` (11 playbooks), `component-ingestion`, `component-authoring` | `skills/` |
| Commands | `/maestro:estado`, `executar`, `verificar`, `decidir`, `ingerir`, `validar`, `catalogo` | `commands/` |
| MCP | `estado` (13 ferramentas) e `registry` (12), TypeScript + SDK oficial, bundles autocontidos | `src/mcp/`, `dist/mcp/`, `.mcp.json` |
| Hooks | `session-context`, `guard-write`, `guard-external`, `validate-on-write` | `src/hooks/`, `hooks/hooks.json` |
| Ledger | `estado.json` (23 nós, 24 decisões/divergências/CC) + `ESTADO.md` gerado | `07-execucao/` |
| Catálogo | 55 registros + schemas JSON + `CATALOG.md` gerado | `catalog/` |
| Ingestão | pipeline de 11 estágios, template, ING-0001 (upstreams) e ING-0002 (pacote) fechados | `ingestion/`, `docs/process/` |
| Contratos/mapa | C-00…C-04 adaptados; mapa preservado; `roteamento.json` | `contratos/`, `mapa/` |
| Testes | 75 testes determinísticos (unit, integração MCP/hooks, consistência do repo), E2E headless 6/6, 5 evals comportamentais 5/5 (score 1.0) | `tests/`, `scripts/e2e.sh`, `evals/` |
| CI | `npm run check` em PR | `.github/workflows/check.yml` |

## Relatório Overkill (C-02)

| Métrica | Valor |
|---|---|
| Componentes reutilizados/referenciados (upstream + externos) | 8 (2 repositórios, plugin-dev ativo, 5 plugins de referência) |
| Componentes próprios/adaptados carregados | 22 (4 agents, 5 skills, 7 commands, 4 hooks, 2 servidores MCP) + 25 ferramentas MCP |
| Anti-overkill registrado | 22/22 (obrigatório no catálogo — EV-013) |
| Candidatos rejeitados | `editorial-worker` (G3 sem paralelismo real), cópia das skills do plugin-dev, `cowork-plugin-management` |
| Custo sempre-ativo no contexto | ~4,1k tokens (`claude --plugin-dir . plugin details maestro`) |
| Dependências de runtime do plugin instalado | Node ≥ 20 (git/unzip opcionais) — `dist/` sem `npm install` |

Crítica honesta (R1): o volume é maior que o "1 agente, 1 ledger, 1 validador, 1 lane" do E5 original, por decisão do usuário (plugin completo + pipeline + catálogo). O que **não** foi construído por anti-overkill: memória de agente, dashboard, Agent SDK (F2), conectores externos sem esquema lido, mais de 3 folhas.

## Evidência dos EVs

| EV | Resultado | Evidência |
|---|---|---|
| EV-001 WIP | ✅ bloqueia | `tests/unit/machine.test.ts`, `tests/integration/mcp-estado.test.ts` |
| EV-002 DONE sem evidência | ✅ rejeita | idem |
| EV-003 externo sem autorização | ✅ BLOCKED + USER_ACTION_REQUIRED; hook `ask` → negação em headless | idem + `tests/integration/hooks.test.ts` + `evidencias/E0/prova-D.jsonl` |
| EV-005 A DEFINIR | ✅ dod `A DEFINIR` bloqueia DONE; eval comportamental | `machine.test.ts`; `evidencias/evals/` |
| EV-006 divergência registrada | ✅ DIV-001 + D2 aberta | `tests/repo/repo.test.ts` |
| EV-008 drift | ✅ | `tests/unit/fingerprint.test.ts` |
| EV-009 profundidade 1 | ✅ | `evidencias/E0/prova-B2.jsonl`, `evidencias/e2e/resultado.json` (`agent-delegacao`) |
| EV-010 guardrail no plugin | ✅ hooks bloqueiam no subagente; frontmatter ignorado (confirmado) | `evidencias/e2e/resultado.json` (`ev-010-subagente`), `evidencias/E0/prova-C.jsonl` |
| EV-011 saída oficial = rascunho | ✅ DONE só de VERIFY | `machine.test.ts`; eval |
| EV-012 ledger paralelo/projeção | ✅ | `tests/unit/estado-validate.test.ts` |
| EV-013 anti-overkill | ✅ recusa | `tests/unit/catalog.test.ts`, `tests/integration/mcp-registry.test.ts` |
| EV-014 aceite de produto | ✅ `/maestro:estado` sem explicação; SessionStart injeta estado | `evidencias/e2e/resultado.json` (`command-estado`), `hooks.test.ts`; eval |
| EV-004, EV-005, EV-007, EV-011, EV-014 | ✅ evals 1.0 (juiz PASS×3 cada) | `07-execucao/evidencias/evals/resumo.md` |

## Nó real ponta a ponta

**ING-0002** (o próprio pacote Maestro) atravessou o pipeline do plugin: RECEIVE por `ingestion_start` (33 arquivos com sha256, zip aninhado extraído), análise/classificação/comparação/conflitos registradas, adaptação em componentes, validação (`maestro validate` + `claude plugin validate --strict`), testes, documentação, integração e registro no catálogo. Registro: `ingestion/records/ING-0002-pacote-maestro-handoff-multiagente.md`.

## Achados que mudaram o código

1. `Agent(...)` em plugin exige nomes `maestro:<agent>` (allowlist vazia antes) → corrigido + lint `AGENT_ALLOWLIST`.
2. `.mcp.json` da raiz também é config de projeto → `disabledMcpjsonServers`.
3. Validador oficial não inspeciona componentes quando há `marketplace.json` → `check.sh` valida cópia sem ele.
4. `README.md` em `agents/`/`commands/` vira componente → lint `README_LOADED_AS_COMPONENT`.
5. `ask` em headless = negação → documentado (DE-010).
6. Eval EV-014 revelou que o ledger caía para a raiz do plugin num projeto sem ledger (estado paralelo) → corrigido (DE-011) + teste.

## Veredito proposto

`BUILD-0.1.0` → DONE com as evidências acima. E4/E5 → aguardam E0 (local), E1–E3 e **veredito do usuário** (gate humano).
