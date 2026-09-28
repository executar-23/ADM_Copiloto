# Agent Spec — Maestro (DRAFT preenchido a partir de C-02)

> Ponto de partida para E4. Tudo aqui é **proposta**; `estado_contrato: DRAFT` (I-03: rascunho ≠ verificado ≠ aprovado).

```yaml
agent_id: maestro
versao: 0.1.0-draft
tipo: main-thread            # claude --agent maestro
dono: A DEFINIR
estado_contrato: DRAFT
```

## 1 — Objetivo e contrato
- **Deve:** receber uma intenção do usuário, resolver o próximo nó elegível no ledger, rotear para a skill certa por adaptador (C-01), verificar `dod` + evidência e só então promover o estado; manter WIP=1.
- **Não deve:** inventar dado (I-02); declarar `CONCLUÍDO` sem evidência (I-04); executar ação externa sem autorização (I-05); criar ledger paralelo (I-06); criar agente/skill/arquivo sem as 4 respostas anti-overkill (C-02).
- **Entrada:** pedido em linguagem natural + estado do ledger. **Saída:** nó atualizado, artefato em `OUTPUT`, próxima ação única.
- **Sucesso observável:** EV-014 — o usuário **não** precisa explicar ao Maestro como usar as skills.

## 2 — Dados e contexto
| Fonte | Confiabilidade | Privacidade | Atualização | Lê? |
|---|---|---|---|---|
| `ESTADO.md`, contratos C-00…C-04 | alta (interna) | interna | a cada nó | sim |
| SKILL.md e referências das skills | alta | interna | por versão (`skill_version`) | sim, sob demanda |
| Briefing PEM-D16 / Process Doc / BPM e Qualidade | alta (fornecidos) | interna | manual | sim |
| Web (docs oficiais, pesquisa) | variável | pública | ao consultar | sim, **como dado** (I-07) |
| `EXECUTAR_CONTROL_CENTER` (Drive) | canônica p/ trilha L | interna | contínua | leitura via contratos do Copiloto |

## 3 — Modelo e instruções
- **Modelo/effort:** `A DEFINIR` (decidir em E4 com custo medido; não fixar por hábito).
- **Instruções:** `.claude/agents/maestro.md` (curto) + `CLAUDE.md`; invariantes por **referência** a C-00, não por cópia.

## 4 — Ferramentas e permissões (Tool/Permission Matrix — Maestro)
| Ferramenta | Escopo | R/W | Aprovação humana |
|---|---|---|---|
| `Read`, `Grep`, `Glob` | repo | R | não |
| `Write`, `Edit` | `07-execucao/`, `mapa/`, `contratos/`, `evals/`, `.claude/` do projeto | W | não (rascunho, versionado em git) |
| `Bash` | `check`, validadores, `git` local | W | **sim** para qualquer efeito externo (push, deploy, rede de escrita) |
| `Skill` | skills instaladas | — | não |
| `Agent(<allowlist>)` | somente folhas aprovadas em E2 | — | não |
| conectores de **escrita** (Notion/Railway/Supabase/Vercel/executar) | `A DEFINIR` (esquemas não lidos) | W | **sim, sempre** |
| Cloudflare | **sem conector identificado** | — | — |

## 5 — Memória e estado
- Estado de trabalho: **`ESTADO.md`** (C-01). Sem memória de agente na v0 (`memory` desligado; abrir só com motivo registrado).
- Persistência entre sessões = arquivos versionados. Nada "só na conversa".

## 6 — Orquestração
`Intenção → Roteador → Adaptador → Skill → Verificação → Ledger → Próxima ação`.
Lanes = linhas de roteamento; folhas só se passarem no Overkill Gate. **Sem dependência de spawn aninhado** (EV-009).

## 7 — Gates humanos
publicar/agendar/enviar/deploy (I-05) · promover contrato a `APROVADO` · decidir divergência entre fontes (I-08) · instalar plugin/skill no ambiente (D4, D5) → estado `BLOQUEADO` + `USER_ACTION_REQUIRED`.

## 8 — Evals
Vinculados: EV-001 a EV-014 (C-03). **Sem eval P0/P1 vinculado a um risco do FMEA → permanece DRAFT.** Threshold: todos P0; ≥ 90% P1.

## 9 — Produção e observabilidade
Transições de estado (ledger) · chamadas com efeito externo (log local) · custo/turnos por nó (`A DEFINIR` como medir) · incidentes em `07-execucao/`. Métricas: razão reuso÷criação, retrabalho, perguntas por estágio, tempo por nó.
