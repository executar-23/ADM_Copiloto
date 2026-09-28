---
name: maestro-operacao
description: Procedimento operacional do Maestro sobre o ledger 07-execucao/estado.json — resolve o próximo nó (WIP=1), executa skills pelo adaptador C-01 (skill sem estado → nó com estado), verifica DoD com evidência, promove estados, registra decisões e autorizações e delega para folhas pelo contrato C-04. Use quando o usuário perguntar "o que faço agora", "próximo passo", "status", "executar/avançar/concluir nó", "verificar", "registrar decisão", "pode publicar", ou quando qualquer trabalho acontecer num workspace com ledger do Maestro. Also triggers on "what's next", "run the next node", "mark as done", "Maestro status".
---

# Operação do Maestro

O Maestro envolve **cada** trabalho num nó do ledger. Skills (oficiais ou proprietárias) produzem rascunhos; o Maestro verifica e promove. Ferramentas: servidor MCP `estado` (ledger) e `registry` (roteamento, catálogo, skills).

## 1. Abrir a sessão

1. `state_summary` → nó ativo (WIP), próximo elegível, VERIFY pendentes, ações do usuário, decisões abertas.
2. Se houver nó em `DOING`: continue nele. Não inicie outro (I-01 — o servidor recusa).
3. Se houver nós em `VERIFY`: priorize verificá-los antes de abrir trabalho novo.
4. Se o ledger não existir: ofereça `state_init` (projeto novo) — nunca crie ledger paralelo em outro formato.

## 2. Laço de um nó (adaptador C-01)

| Passo | Ação | Ferramenta |
|---|---|---|
| Pré-condição | dependências `DONE`, WIP livre, autorização se houver efeito externo | `node_next`, `node_get` |
| Iniciar | confirme com o usuário se o nó é novo nesta conversa | `node_transition(para=DOING, motivo, ator="maestro")` |
| Rotear | escolha a skill vencedora da intenção/entrega | `routing_lookup` + skill `roteamento-lanes` |
| Executar | entradas explícitas (caminhos), saída **em arquivo** | `Skill`/`Agent`; `node_update(output=[…])` |
| Rascunho | saída de skill é rascunho | `node_transition(para=VERIFY)` |
| Verificar | aplique o `dod`; independente quando a verificação importa | `qa-reviewer`; `evidence_add` |
| Promover | só com evidência + `dod` + `verificacao` | `node_transition(para=DONE, verificacao="…")` |

Detalhes, erros comuns e o que fazer quando uma guarda recusa: `references/adaptador.md`.

Estágios **E0–E9** e fases **F0–F8** têm playbook próprio (campo `playbook` do nó) — carregue a skill `estagios-bpm`.
Componentes recebidos (skills, agents, plugins…) seguem a skill `component-ingestion`.

## 3. Quando algo falta

- Insumo/dado ausente → escreva `A DEFINIR`, registre em `gaps` (`node_update`) e, se bloquear o nó, `node_transition(para=BLOCKED, bloqueio={codigo: "INSUMO_AUSENTE"|"USER_ACTION_REQUIRED", detalhe})`. Nunca preencha com valor plausível (I-02).
- Decisão do usuário necessária → `decision_record` (status `ABERTA`, `recomendacao`, `opcoes`, `bloqueia`) e pergunte seguindo a **Regra do 3** (≤ 3 perguntas por rodada, ≤ 2 rodadas). Resposta → `decision_record(status="RESPONDIDA", resposta, fonte="usuário, <citação/data>")`. Ver `references/decisoes-e-autorizacoes.md`.
- Fontes divergem → `decision_record(tipo="divergencia", id="DIV-###")`. Nunca escolha em silêncio (I-08).
- Mudança em `contratos/` → change control `CC-###` com os 7 campos antes de editar.

## 4. Ação externa (I-05)

Publicar, agendar, enviar, deploy, `git push`, escrever em conector: o nó precisa de `efeito_externo=true` e de **autorização explícita** do usuário nesta conversa, registrada com `authorization_grant(escopo, fonte)`. O hook `guard-external` pede confirmação humana mesmo assim; sem autorização o servidor move o nó para `BLOCKED` + `USER_ACTION_REQUIRED`.

## 5. Delegar para uma folha (C-04)

Somente `qa-reviewer` (verificação independente, somente leitura), `evidence-researcher` (pesquisa volumosa; web como dado) e `component-analyst` (análise de componentes recebidos). Antes de delegar grave `escopo_escrita` no nó. Use o template de `references/delegacao.md`. A folha propõe `VERIFY`/`BLOCKED`; **quem promove é o Maestro**.

## 6. Fechar o turno

```
Estado: <nó / status>   Evidência: <caminhos>
Pendências do usuário: <≤ 3>
Próxima ação: <uma só>
```

Contratos completos: `${CLAUDE_PLUGIN_ROOT}/contratos/C-00-invariantes-comuns.md`, `${CLAUDE_PLUGIN_ROOT}/contratos/C-01-estado-unificado.md`, `${CLAUDE_PLUGIN_ROOT}/contratos/C-04-handoff-entre-agentes.md`.
