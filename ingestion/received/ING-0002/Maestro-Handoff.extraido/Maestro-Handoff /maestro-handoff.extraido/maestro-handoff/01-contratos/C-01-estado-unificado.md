# C-01 — Estado unificado (um vocabulário, seis adaptadores)

## Problema (verificado)

Existem **seis vocabulários de estado** em uso, sem tradutor entre eles:

| Sistema | Vocabulário (fonte lida) |
|---|---|
| **Copiloto EXECUTAR** | `BACKLOG_VALIDATED → READY → DOING → VERIFY → DONE` + `BLOCKED` (`state-contract.json`) |
| **Mapa-OS** | hierarquia `Projeto → Entrega/Dia Lógico → Fluxo → Ação`; classes `A_OBSERVADO…E_INFERIDO` |
| **Obsidian v2.3** | job: `PLANEJANDO → EM_ANDAMENTO → PRONTO_PARA_EMPACOTAR → EMPACOTADO`; etapa: `PENDING/IN_PROGRESS/DONE/SKIPPED` |
| **Solution Store** | lifecycle `INGESTED → CLASSIFIED → SCHEMA_COMPLETE → BUNDLE_READY → IN_EDITORIAL_PRODUCTION → ASSETS_READY → QA_READY → STORE_READY → PUBLISHED`; operacional `PREPARED/SUBMITTED/APPROVED/RELEASED/VERIFIED/BLOCKED/USER_ACTION_REQUIRED` |
| **Quick Frameworks** | `VERIFIED` / `BLOCKED` |
| **ESTADO.md (handoff v1)** | ⬜ pendente · 🔄 em andamento · ✅ concluído · ⛔ bloqueado |

O Copiloto já impõe: *"Nunca criar um plano, fila, progresso, sprint, gate ou estado paralelo."*
Um sétimo ledger no Maestro **violaria a regra** e repetiria exatamente o problema
declarado ("ainda não integradas como um sistema único").

## Decisão de projeto proposta (D1 — confirmar com o usuário)

**Um vocabulário canônico = o do Copiloto** (já em produção; a UI em português é só rótulo).
Os outros cinco viram **adaptadores de projeção**, não fontes paralelas.

| Canônico (Copiloto) | Rótulo PT | Símbolo no ESTADO.md | Obsidian etapa | Solution Store (eixo **operacional**) | Quick Frameworks | v1 |
|---|---|---|---|---|---|---|
| `BACKLOG_VALIDATED` | VALIDADO | ⬜ | `PENDING` (deps abertas) | — | — | ⬜ |
| `READY` | PRONTO | ⬜ | `PENDING` (deps `DONE`) | `PREPARED` | — | ⬜ |
| `DOING` | EM EXECUÇÃO | 🔄 | `IN_PROGRESS` | *(nó ativo)* | — | 🔄 |
| `VERIFY` | VERIFICAR | 🔎 | *(saída existe, DoD não marcado)* | `SUBMITTED` | *(validador rodando)* | 🔄 |
| `DONE` | CONCLUÍDO | ✅ | `DONE` | `APPROVED` / `VERIFIED` | `VERIFIED` | ✅ |
| `BLOCKED` | BLOQUEADO | ⛔ | — | `BLOCKED` | `BLOCKED` | ⛔ |
| *(motivo de bloqueio)* | AÇÃO DO USUÁRIO | ⛔ + `USER_ACTION_REQUIRED` | — | `USER_ACTION_REQUIRED` | — | — |

> **Solution Store tem dois eixos** (a própria skill manda separá-los): o *lifecycle*
> (`INGESTED → … → PUBLISHED`) e o estado *operacional* (`PREPARED/SUBMITTED/…`). Só o eixo
> operacional entra na tabela acima. O *lifecycle* vira **atributo do nó** (`fase_solution_store`),
> nunca um estado do Maestro — caso contrário o vocabulário canônico ganharia 9 estados que
> pertencem a um único workflow.
>
> ⚠️ **Toda a coluna de mapeamento é PROPOSTA (hipótese H-est-1).** Foi derivada de leitura dos
> contratos, não de teste. O estágio E2 deve validá-la contra `state-contract.json` do
> Copiloto e contra `RUN_STATE.yaml` antes de tratá-la como contrato.

> `SKIPPED` (Obsidian) e `DEPRECATED` (Solution Store) **não** são estados de fluxo: são
> *decisões registradas* (com evidência). Mapeiam para um campo `decisao: SKIPPED|DEPRECATED`,
> nunca para um estado novo.
> `PUBLISHED`/`RELEASED`/`EMPACOTADO` são **fatos externos** (I-03/I-05): exigem evidência
> própria e nunca são inferidos de `DONE`.

## Onde mora a fonte de verdade (D1)

| Opção | Prós | Contras |
|---|---|---|
| **A. Só repositório** (`07-execucao/ESTADO.md`) | Nativo do Claude Code, versionado, testável | Cria ledger paralelo ao Control Center → viola I-06 |
| **B. Só Control Center (Drive)** | Respeita I-06 | Claude Code depende de conector; difícil de testar; mistura código com operação |
| **C. Híbrido com fronteira** *(recomendação)* | Cada trilha tem **um** dono | Exige o adaptador de leitura e regra clara de fronteira |

**Recomendação (C):**
- **Trilha S (construir o Maestro)** → repositório é canônico (`07-execucao/ESTADO.md`). É código e decisão de engenharia.
- **Trilha L (operar o lançamento)** → `EXECUTAR_CONTROL_CENTER` continua canônico; o Maestro **lê** via contratos do
  `copiloto-executar` (`drive-bindings.json`, `state-contract.json`) e **projeta** o subgrafo do lançamento. Nunca escreve um plano concorrente.
- A fronteira (qual nó pertence a qual trilha) é uma coluna do ESTADO.md: `dono_canonico`.

## Esquema mínimo de um nó (superconjunto do `RUN_STATE` do Solution Store)

Campos herdados de `RUN_STATE.yaml` (lidos): `ID, VERSION, AREA, WORKFLOW, OWNER, STATUS, INPUT,
OUTPUT, DEPENDS_ON, BLOCKS, EVIDENCE, AUTOMATION_LEVEL, HANDOFF, WIP, GAPS, CONFLICTS, LAST_VERIFIED_STATE`.

Campos que o Maestro **acrescenta** (só estes; cada um tem motivo):

| Campo | Motivo |
|---|---|
| `lane` | Qual macro (Produto/Engenharia/Design/QA/DevOps/Stakeholders/Operações) |
| `skill` | Qual skill executa (oficial ou proprietária) — rastreia o adaptador |
| `skill_version` | Detecta *drift* entre cópias (ver `divergencias-e-lacunas.md` §3) |
| `dono_canonico` | `repo` ou `control-center` (D1) |
| `dod` | Critério único de pronto (uma frase) — herdado do padrão 1 etapa = 1 entregável |
| `classe_evidencia` | `A_OBSERVADO…E_INFERIDO` (Mapa-OS). Claims de domínio RC mantêm `E1/E2/S/FW` **dentro** do domínio |
| `autorizacao` | Escopo autorizado para ação externa (I-05); vazio = só preparar |

> **Não** acrescentar campo sem motivo aqui. Cada campo novo é custo de manutenção (risco R1: overkill).

## Contrato do adaptador de skill oficial (skill sem estado → nó com estado)

```
1. PRÉ-CONDIÇÃO   todos DEPENDS_ON = DONE; WIP livre; autorização suficiente
2. ENTRADA        caminhos de arquivo explícitos (o prompt é o único canal p/ subagente)
3. INVOCAÇÃO      /<skill> com a entrada; resultado salvo em OUTPUT (nunca só no chat)
4. RASCUNHO       estado → VERIFY (a saída de skill oficial é rascunho até verificada)
5. VERIFICAÇÃO    aplicar o dod; registrar EVIDENCE (arquivo + critério satisfeito)
6. PROMOÇÃO       VERIFY → DONE somente com dod ✅ + evidência (I-04)
7. REGISTRO       atualizar ESTADO.md (dono_canonico=repo) ou projetar (control-center)
```

## Versionamento de contratos (change control herdado do RC)

Toda mudança em C-00/C-01/C-02 segue: `CURRENT → EVIDENCE → CONFLICT → PROPOSED_CHANGE →
IMPACT → REVIEW_REQUIRED → STATUS`. Nunca alterar um contrato implicitamente.
