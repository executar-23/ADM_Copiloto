# Runbook — "Recebi 10 novas skills e 3 agents"

Para o próximo agente Claude Code (ou pessoa) que receber componentes. Não reinvente o processo: siga este roteiro.

## 0. Preparar o ambiente (uma vez por sessão)

```bash
npm ci                         # dependências de desenvolvimento
npm run upstream:sync          # inicializa vendor/upstream (necessário para COMPARE)
npm run build && npm run check # tudo verde antes de começar
claude --plugin-dir .          # sessão com o plugin carregado (ou use /maestro:* na sessão atual)
```

## 1. Colocar o material no inbox

```
ingestion/inbox/<lote>/        ← pastas, .md, .zip, .skill, .plugin — do jeito que chegaram
```

Não edite nada ainda. Anote quem entregou e por qual canal (vai para `origem`).

## 2. Rodar o comando

```
/maestro:ingerir ingestion/inbox/<lote> "usuário X, handoff de <data>"
```

O comando carrega a skill `component-ingestion` e conduz os 11 estágios. O que você deve ver acontecer:

| Momento | Resultado verificável |
|---|---|
| RECEIVE | `ingestion/received/ING-NNNN/` + `MANIFEST.sha256`; `ingestion/records/ING-NNNN-<slug>.md`; nó `ING-NNNN` em DOING |
| ANALYZE→CHECK_CONFLICTS | tabela por componente (via `component-analyst`) nas seções 2–5 |
| ADAPT | decisão por componente; componentes adaptados nos destinos; 4 respostas anti-overkill |
| VALIDATE/TEST | `npm run check` verde; veredito do `qa-reviewer` |
| REGISTER | `catalog/components/**` novos/atualizados, `CATALOG.md`, registro `status: integrada`, nó `ING-NNNN` em DONE |

## 3. Pontos de decisão que são do usuário

- Dois componentes disputam a mesma intenção → escolher um (registrado como D#).
- Componente precisa de credencial, conector ou ação externa → `USER_ACTION_REQUIRED`.
- Componente contradiz um contrato (ex.: publica sem aprovação) → adaptar removendo o comportamento ou rejeitar; nunca integrar como está.

Pergunte no máximo 3 coisas por rodada, em no máximo 2 rodadas. O resto fica `A DEFINIR` no registro.

## 4. Sem o plugin carregado (fallback manual)

Mesma sequência com a CLI e as funções da lib:

```bash
node dist/cli/maestro.js validate        # antes e depois
# RECEIVE manual: copie para ingestion/received/ING-NNNN/, gere o manifesto:
(cd ingestion/received/ING-NNNN && find . -type f ! -name MANIFEST.sha256 -print0 | sort -z | xargs -0 sha256sum | sed 's# \./# #' > MANIFEST.sha256)
cp ingestion/TEMPLATE.md ingestion/records/ING-NNNN-<slug>.md   # e preencha
# catálogo: crie catalog/components/<tipo>/<nome>.json seguindo catalog/schema/component.schema.json
npm run render && npm run check
```

## 5. Checklist de fechamento

- [ ] Registro ING com as 11 seções, sem `PENDENTE`, `status` final e `estagio_atual: REGISTER`
- [ ] Cada componente com decisão; os adaptados com anti-overkill e testes
- [ ] `npm run check` verde (inclui `claude plugin validate --strict`)
- [ ] `claude --plugin-dir . plugin details maestro` mostra os novos componentes
- [ ] Catálogo atualizado (`integration.ingestion`), `CATALOG.md` regenerado
- [ ] Nó `ING-NNNN` em DONE com evidência
- [ ] Commit `feat(ingestao): ING-NNNN — <resumo>`; push/PR só com aprovação
