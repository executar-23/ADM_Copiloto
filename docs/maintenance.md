# Manutenção e expansão

## Ambiente de desenvolvimento

```bash
npm ci                    # Node ≥ 20
npm run upstream:sync     # submodules de vendor/upstream
npm run build             # src/ → dist/ (commitar dist/)
npm run check             # gate completo (o mesmo da CI)
claude --plugin-dir .     # sessão com o plugin carregado a partir do disco (mudanças valem na próxima sessão)
```

`claude --agent maestro:maestro --plugin-dir .` abre a sessão com o Maestro como thread principal.

## Comandos

| Comando | Faz |
|---|---|
| `npm run build` | bundles de `src/` em `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | unit + integração (MCP real via stdio, hooks via stdin) + consistência do repo |
| `npm run validate` | `maestro validate` (catálogo, ledger, convenções, roteamento, ingestões) |
| `npm run render` | regenera `ESTADO.md`, `CATALOG.md`, `mapa/roteamento.md` |
| `npm run validate:plugin` | validador oficial estrito em manifesto, marketplace e conteúdo, com lista explícita de avisos aceitos (`scripts/validate-official.mjs`) |
| `npm run check` | typecheck → build → projeções → testes → validate → validador oficial (manifesto, marketplace e conteúdo) |
| `npm run test:e2e` | E2E headless com `claude -p` (consome tokens; grava `07-execucao/evidencias/e2e/resultado.json`) |
| `claude plugin eval . --runs 3 --trust-plugin --allow-real-servers --allow-tools Write mcp__plugin_maestro_estado__state_summary mcp__plugin_maestro_estado__node_next mcp__plugin_maestro_estado__node_get` | casos comportamentais em `evals/` (consome tokens). Sem `--allow-real-servers` os servidores MCP do plugin não sobem; ferramentas MCP e `Write` precisam de `--allow-tools`; `Bash` só com sandbox (`bubblewrap`) disponível |
| `node dist/cli/maestro.js schema` | reexporta JSON Schemas para `catalog/schema/` |

## Adicionar / alterar componentes

Sempre pelo pipeline ([process/ingestion-pipeline.md](process/ingestion-pipeline.md)). Mesmo um componente criado aqui
(não recebido) abre um `ING-NNNN` com origem "proprietário" — o registro é o mesmo.

## Upstream (vendor/upstream)

1. `npm run upstream:sync -- --update` (ou `bash scripts/upstream-sync.sh --update`) → novos SHAs.
2. **COMPARE:** para cada plugin referenciado (plugin-dev, mcp-server-dev, agent-sdk-dev, KW engineering/product-management/operations):
   `git -C vendor/upstream/<repo> diff <sha-antigo>..<sha-novo> --stat -- <caminho>`; leia o que mudou nas skills/agents usados como padrão.
3. Mudança de padrão relevante → abrir `ING-NNNN` ("atualização de upstream"), adaptar `component-authoring` se preciso.
4. Atualizar `origin.sha`/`version` dos registros `upstream-reference` e `external-plugin` (o validador acusa `UPSTREAM_PIN` até isso).

## Versões e release

- `version` igual em `package.json` e `.claude-plugin/plugin.json` (o validador confere) e no `marketplace.json`.
- SemVer: MAJOR = contrato/ledger incompatível; MINOR = componente novo; PATCH = correção.
- Mudança no schema do ledger → incrementar `versao_schema` + migração + change control (CC-###).

## Deprecar

`status: "deprecated"` no catálogo + nota; remova o componente do disco apenas numa ingestão posterior (histórico preservado, I-10).

## CI

`.github/workflows/check.yml`: `npm ci` → instala a CLI do Claude Code → `npm run check` com `CI=true` (dist/ e projeções precisam estar commitados). Não roda E2E nem evals (exigem credencial).

## Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| Servidores `estado`/`registry` aparecem duplicados/falhando como "project" | `.mcp.json` da raiz lido como config de projeto | manter `disabledMcpjsonServers` em `.claude/settings.json` |
| `README.md` aparece como agent/command | arquivo dentro de `agents/` ou `commands/` | mover para `docs/` (lint `README_LOADED_AS_COMPONENT`) |
| `upstream_search` → `UPSTREAM_NOT_INITIALIZED` | submodules vazios | `npm run upstream:sync` |
| Escrita bloqueada "fora do escopo do nó" | nó ativo com `escopo_escrita` | ampliar com `node_update` ou concluir/bloquear o nó |
| `PROJECTION_DIVERGENT` / `CATALOG_PROJECTION` | arquivo gerado desatualizado | `npm run render` |
| Push/deploy pede confirmação inesperada | hook `guard-external` (I-05) | aprovar, ou registrar autorização no nó (`authorization_grant`) |
