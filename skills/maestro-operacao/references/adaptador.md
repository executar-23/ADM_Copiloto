# Adaptador C-01 — detalhes operacionais

## Guardas do servidor `estado` e como reagir

| Recusa (`codigo`) | Significa | O que fazer |
|---|---|---|
| `WIP` | já existe nó em `DOING` | termine (VERIFY), bloqueie (`BLOCKED` + motivo) ou devolva (`READY`) o nó ativo |
| `DEPS` | dependência não está `DONE` | trabalhe a dependência (`node_next` indica) ou registre por que a ordem mudou (change control) |
| `OUTPUT` | `VERIFY` sem saída registrada | salve a saída em arquivo e `node_update(output=[caminho])` |
| `EVIDENCE` | `DONE` sem evidência | `evidence_add(caminho/url, criterio, classe)` |
| `DOD` | `dod` é `A DEFINIR` | defina o critério com o usuário (`node_update(dod=…)`) — não invente |
| `VERIFICACAO` | faltou dizer como o dod foi satisfeito | passe `verificacao` citando a evidência |
| `PROMOTER` | ator não é `maestro`/`usuario` | folha propõe; o Maestro promove |
| `AUTORIZACAO` | efeito externo sem autorização | o nó já foi para `BLOCKED` + `USER_ACTION_REQUIRED`; peça aprovação e use `authorization_grant` |
| `NOT_ALLOWED` | transição fora da máquina | veja `contratos/C-01-estado-unificado.md` §Transições |

## Skill oficial Anthropic (sem estado)

1. Entradas explícitas: caminhos de arquivos, decisões já tomadas, restrições.
2. Invoque a skill (ex.: `engineering:system-design`). Salve a resposta em `07-execucao/<nó>/…` ou no destino do artefato.
3. `node_update(output=[…], skill="engineering:system-design", skill_version=…)`. Para skill com mais de uma cópia no ambiente, rode `skill_fingerprint` e grave o hash.
4. `VERIFY` sempre — nunca direto a `DONE` (EV-011).

## Skill proprietária com estado próprio (Obsidian, Solution Store, Quick Frameworks, Copiloto)

- Use a tabela de mapeamento de `contratos/C-01-estado-unificado.md` para **projetar** o estado dela no nó. Ex.: Obsidian `IN_PROGRESS` ↔ `DOING`; Solution Store `SUBMITTED` ↔ `VERIFY`.
- O estado interno da skill continua sendo dela (ex.: `RUN_STATE.yaml`); no nó grave só a projeção e a referência (`dados.fase_solution_store`, caminho do job etc.).
- A tabela é **HIPÓTESE H-est-1** até E2: se o mapeamento não se encaixar, registre divergência em vez de forçar.

## Evidência — classes

`A_OBSERVADO` (você viu/rodou: saída de comando, arquivo aberto, URL primária) · `D_INTERNO` (documento interno confirmado) · `E_INFERIDO` (dedução — exige confirmação; não fecha fato externo). As classes B e C existem no Mapa-OS mas sua legenda não foi fornecida: não use nomes inventados.

## Progresso

Nunca declare percentual: `state_summary.progresso` é derivado (concluídos ÷ habilitados, I-09).
