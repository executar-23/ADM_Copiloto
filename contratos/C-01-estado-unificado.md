# C-01 — Estado unificado (um vocabulário, seis adaptadores)

> Versão **1.0.0** · adaptado de `ING-0002:01-contratos/C-01-estado-unificado.md` (sha256 `6ea7c6e5d044…`).
> Adaptações (change control **CC-001**): o ledger da Trilha S passa de `07-execucao/ESTADO.md` para
> **`07-execucao/estado.json` (canônico) + `ESTADO.md` (projeção gerada)**, para que as invariantes
> sejam impostas por código; o esquema do nó abaixo é o implementado em `src/lib/estado/schema.ts`.

## Problema (verificado no pacote)

Seis vocabulários de estado, sem tradutor: Copiloto EXECUTAR (`state-contract.json`), Mapa-OS,
Obsidian v2.3, Solution Store (lifecycle + operacional), Quick Frameworks e o ESTADO.md do handoff v1.
Um sétimo ledger violaria o Copiloto (*"Nunca criar um plano, fila, progresso, sprint, gate ou estado paralelo"*).

## Vocabulário canônico = o do Copiloto

| Canônico | Rótulo PT | Símbolo | Obsidian etapa | Solution Store (eixo operacional) | Quick Frameworks | v1 |
|---|---|---|---|---|---|---|
| `BACKLOG_VALIDATED` | VALIDADO | ⬜ | `PENDING` (deps abertas) | — | — | ⬜ |
| `READY` | PRONTO | ⬜ | `PENDING` (deps `DONE`) | `PREPARED` | — | ⬜ |
| `DOING` | EM EXECUÇÃO | 🔄 | `IN_PROGRESS` | *(nó ativo)* | — | 🔄 |
| `VERIFY` | VERIFICAR | 🔎 | *(saída existe, DoD não marcado)* | `SUBMITTED` | *(validador rodando)* | 🔄 |
| `DONE` | CONCLUÍDO | ✅ | `DONE` | `APPROVED` / `VERIFIED` | `VERIFIED` | ✅ |
| `BLOCKED` | BLOQUEADO | ⛔ | — | `BLOCKED` | `BLOCKED` | ⛔ |
| *(motivo)* | AÇÃO DO USUÁRIO | ⛔ + `USER_ACTION_REQUIRED` | — | `USER_ACTION_REQUIRED` | — | — |

> ⚠️ A coluna de mapeamento continua **HIPÓTESE H-est-1** — derivada de leitura, não de teste. Validar em
> **E2** contra `state-contract.json` (Copiloto) e `RUN_STATE.yaml` (Solution Store) antes de tratá-la como contrato.
> O *lifecycle* do Solution Store vira atributo do nó (`dados.fase_solution_store`), nunca estado do Maestro.
> `SKIPPED`/`DEPRECATED` são **decisões registradas** (campo `decisao`, exige evidência), não estados.
> `PUBLISHED`/`RELEASED`/`EMPACOTADO` são fatos externos: exigem evidência própria; nunca inferidos de `DONE`.

## Transições permitidas (impostas por `node_transition`)

```
BACKLOG_VALIDATED → READY | BLOCKED
READY             → DOING | BLOCKED | BACKLOG_VALIDATED
DOING             → VERIFY | BLOCKED | READY
VERIFY            → DONE | DOING | BLOCKED
DONE              → VERIFY            (reabertura = retrabalho, métrica de C-03)
BLOCKED           → READY | BACKLOG_VALIDATED | DOING | VERIFY
```

Guardas: `DOING` exige WIP livre e dependências `DONE`; `READY` exige dependências `DONE`; `VERIFY` (vindo de
`DOING`) exige `output` ou evidência; `DONE` exige ator `maestro`/`usuario`, evidência, `dod` definido (≠ `A DEFINIR`),
`verificacao` e — se `efeito_externo` — `autorizacao` (senão o nó vai para `BLOCKED` + `USER_ACTION_REQUIRED`);
`BLOCKED` exige `{codigo, detalhe}`. Toda transição exige `motivo` e entra no `historico` (append-only).

## Onde mora a fonte de verdade (D1 — **aberta**)

| Opção | Prós | Contras |
|---|---|---|
| A. Só repositório | nativo do Claude Code, versionado, testável | ledger paralelo ao Control Center → viola I-06 |
| B. Só Control Center (Drive) | respeita I-06 | depende de conector; difícil testar; mistura código e operação |
| **C. Híbrido com fronteira** *(recomendação do pacote)* | cada trilha tem um dono | exige adaptador de leitura e regra clara de fronteira |

Implementação atual (compatível com C, sem fechar D1): **Trilha S** → repositório (`estado.json`) é canônico.
**Trilha L** → nós com `dono_canonico: control-center` são **projeções**; o Maestro lê via contratos do
`copiloto-executar` (`drive-bindings.json`, `state-contract.json` — **não fornecidos**, `USER_ACTION_REQUIRED`)
e nunca escreve plano concorrente.

## Esquema do nó (superconjunto do `RUN_STATE` do Solution Store)

Campos herdados de `RUN_STATE.yaml` → nome no Maestro: `ID→id`, `STATUS→status`, `INPUT/OUTPUT→output`,
`DEPENDS_ON→depends_on`, `BLOCKS` (derivado das dependências), `EVIDENCE→evidencias`, `HANDOFF` (C-04),
`WIP` (global), `GAPS→gaps`, `CONFLICTS→conflitos`, `LAST_VERIFIED_STATE` (último `historico` com `para=DONE`).
`VERSION/AREA/WORKFLOW/OWNER/AUTOMATION_LEVEL`: ainda não mapeados — `A DEFINIR` em E2 junto com H-est-1.

Campos que o Maestro acrescenta (cada um com motivo, como manda o pacote):

| Campo | Motivo |
|---|---|
| `trilha` / `tipo` | separar S (construir) de L (lançamento) e estágio/fase/tarefa/ficha/ingestão |
| `lane` | macro (Produto/Engenharia/Design/QA/DevOps/Stakeholders/Operações/Editorial) |
| `skill` / `skill_version` | qual skill executa + hash de árvore para detectar drift (EV-008) |
| `dono_canonico` | `repo` ou `control-center` (D1) |
| `dod` | critério único de pronto (uma frase) |
| `classe_evidencia` (em cada evidência) | `A_OBSERVADO…E_INFERIDO` (Mapa-OS). Só A, D e E têm nome conhecido; B e C: **A DEFINIR** |
| `autorizacao` + `efeito_externo` | escopo autorizado para ação externa (I-05); vazio = só preparar |
| `escopo_escrita` | globs que a lane pode escrever (C-04), impostos pelo hook `guard-write` |
| `playbook` | referência ao procedimento do estágio (skill `estagios-bpm`) |
| `historico` | I-10 |

## Adaptador de skill (skill sem estado → nó com estado)

| Passo | O quê | Ferramenta |
|---|---|---|
| 1. PRÉ-CONDIÇÃO | `DEPENDS_ON` = DONE; WIP livre; autorização suficiente | `node_next`, `node_transition → DOING` |
| 2. ENTRADA | caminhos explícitos (o prompt é o único canal p/ subagente) | mensagem C-04 |
| 3. INVOCAÇÃO | `/<skill>` com a entrada; resultado salvo em arquivo (nunca só no chat) | `Skill` / `Agent`; `node_update(output)` |
| 4. RASCUNHO | estado → `VERIFY` | `node_transition → VERIFY` |
| 5. VERIFICAÇÃO | aplicar o `dod`; registrar evidência | `qa-reviewer`; `evidence_add` |
| 6. PROMOÇÃO | `VERIFY → DONE` só com dod ✅ + evidência | `node_transition → DONE` (ator `maestro`) |
| 7. REGISTRO | ledger atualizado (repo) ou projetado (control-center) | automático (`ESTADO.md` regenerado) |

## Versionamento

Toda mudança em C-00/C-01/C-02 segue change control; registre com `decision_record` (`CC-###`).
