# E5 — Walking skeleton (v0)  (construção mínima que prova o sistema)

## OBJECTIVE
Construir a menor versão executável do Maestro: **1 agente, 1 ledger, 1 validador, 1 lane, 1 nó real**.

## CONTEXT
Toda peça adicional é manutenção (R1). O esqueleto existe para provar EV-001…EV-005 e EV-014, não para cobrir F0–F8.

## INPUT
`E4-*`, `03-arquitetura-alvo/maestro-topologia.md` §7 e §8, `01-contratos/*`.

## CONSTRAINTS
- **Modo A (projeto).** Sem plugin, sem Agent SDK, sem skills novas, sem memória de agente.
- Testes **antes** do código (plano de E4); commits pequenos.
- Nenhum efeito externo: nada de push, deploy ou publicação sem aprovação.
- Relatório **Overkill**: arquivos/agentes criados × reutilizados, com as 4 respostas de C-02.

## EXECUTION
1. `CLAUDE.md` mínimo (referencia C-00).
2. `.claude/agents/maestro.md` + `settings.json` com os hooks de guardrail (WIP, escopo, efeito externo).
3. Validador do ledger (WIP=1; `DONE` exige evidência; transições permitidas).
4. Tabela de roteamento; adaptador de UMA skill real.
5. Rodar 1 nó real ponta a ponta (sugestão: **Ficha de 22 pontos** ou **F7-delta**).
6. Rodar EV-001…005 e EV-014.

## OUTPUT CONTRACT
Repositório `maestro/` funcional; `07-execucao/E5-relatorio.md` (o que foi construído, o que foi reutilizado, evidência dos evals).

## VALIDATION
`check` verde; EV-001/002/003 **falham do jeito certo** (bloqueiam); relatório Overkill preenchido.

## STOP CONDITIONS
Mesmo gate falhando 2× → `engineering:debug` (causa-raiz, não sintoma). Qualquer necessidade de skill nova → voltar às 4 respostas de C-02.
