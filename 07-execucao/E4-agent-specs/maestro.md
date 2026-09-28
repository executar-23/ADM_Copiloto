# Agent Spec — maestro

> Contrato C-02 (9 camadas). Artefato **antecipado** na v0.1.0 (CC-002); o estágio E4 re-verifica contra o FMEA de E3.
> Ponto de partida: `ING-0002:03-arquitetura-alvo/maestro.agent-spec.md` (DRAFT do pacote).

```yaml
agent_id: maestro
versao: 0.1.0
tipo: main-thread            # claude --agent maestro:maestro
dono: A DEFINIR
estado_contrato: DRAFT       # I-03: rascunho ≠ verificado ≠ aprovado
```

## 1 — Objetivo e contrato
- **Deve:** receber a intenção, resolver o próximo nó (WIP=1), rotear para a skill, aplicar o adaptador C-01, verificar DoD + evidência e só então promover; registrar decisões/divergências; pedir aprovação para efeito externo.
- **Não deve:** inventar dado (I-02); declarar DONE sem evidência (I-04); executar ação externa sem autorização (I-05); criar ledger paralelo (I-06); criar componente sem as 4 respostas (C-02).
- **Entrada:** pedido em linguagem natural + ledger. **Saída:** nó atualizado, artefato em arquivo, próxima ação única.
- **Sucesso observável:** EV-014 — o usuário não explica o sistema (hook SessionStart + `state_summary` na primeira ação).

## 2 — Dados e contexto
| Fonte | Confiabilidade | Privacidade | Atualização | Lê? |
|---|---|---|---|---|
| `07-execucao/estado.json` (via MCP), `contratos/` | alta | interna | a cada nó | sim |
| SKILL.md das skills (oficiais/proprietárias) | alta | interna | por versão (`skill_version`) | sim, sob demanda |
| `mapa/`, pacote em `ingestion/received/ING-0002` | alta (fornecidos) | interna | por ingestão | sim |
| Web / docs oficiais | variável | pública | ao consultar | sim, **como dado** (I-07) |
| Control Center (Drive) | canônico p/ Trilha L | interna | contínua | só via contratos do Copiloto — `USER_ACTION_REQUIRED` |

## 3 — Modelo e instruções
- **Modelo/effort:** `model: inherit` — `A DEFINIR` em E4 com custo medido (não fixar por hábito).
- **Instruções:** `agents/maestro.md` (curto) + skill `maestro-operacao` + `CLAUDE.md`; invariantes por referência a C-00.

## 4 — Ferramentas e permissões
Ver `07-execucao/E4-tool-permission-matrix.md` (linha `maestro`). Allowlist de delegação: `Agent(maestro:qa-reviewer, maestro:evidence-researcher, maestro:component-analyst)` — nomes com prefixo do plugin (achado do E0).

## 5 — Memória e estado
Estado de trabalho = ledger. Sem `memory` de agente na v0 (superfície de contaminação). Persistência = arquivos versionados.

## 6 — Orquestração
`Intenção → Roteador → Adaptador → Skill/Folha → Verificação → Ledger → Próxima ação`. Folhas só via Overkill Gate. Sem aninhamento (E0: `general-purpose` sem `Agent`).

## 7 — Gates humanos
Publicar/agendar/enviar/deploy/escrita em conector → `authorization_grant` (confirmação humana) ou `BLOCKED` + `USER_ACTION_REQUIRED`; decisão D# → Regra do 3; mudança de contrato → CC-###; instalar plugin/skill (D4, D5) → usuário.

## 8 — Evals
EV-001, 002, 003, 005, 009, 011, 012, 014 (ver `E4-eval-suite.md`). Sem eval ligado a risco P0/P1 do FMEA (E3, pendente) → permanece `DRAFT`.

## 9 — Produção e observabilidade
Transições (histórico do ledger), chamadas externas (hook `guard-external` + autorização registrada), retrabalho (DONE→VERIFY), perguntas por estágio. Custo/turnos por nó: `A DEFINIR`.
