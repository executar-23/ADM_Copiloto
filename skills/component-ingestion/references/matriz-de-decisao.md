# Matriz de classificação e decisão

## Camada correta (CLASSIFY)

| Se o componente… | Camada | Formato no plugin |
|---|---|---|
| decide, orquestra, precisa de contexto isolado ou restrição de ferramentas | **Agent** | `agents/<nome>.md` (só se passar no Overkill Gate: G1/G2/G3) |
| ensina como fazer algo (conhecimento + procedimento), dispara por contexto | **Skill** | `skills/<nome>/SKILL.md` + `references/` |
| é um ponto de entrada explícito que o usuário digita | **Command** | `commands/<nome>.md` (fino: delega para skill/agent/MCP) |
| executa algo determinístico, acessa sistema/API/arquivo com contrato | **MCP Tool** | ferramenta em `src/mcp/<servidor>.ts` + `src/mcp/manifest.ts`, ou servidor externo em `.mcp.json` |
| reage a evento (antes/depois de ferramenta, início de sessão) | **Hook** | `src/hooks/<nome>.ts` + `hooks/hooks.json` |
| é um plugin inteiro de terceiros | **external-plugin** | não copiar: instalar via marketplace e catalogar como referência/dependência |
| é documentação/material de estudo | **upstream-reference** | submodule em `vendor/upstream/` ou referência catalogada |

Sinais de camada errada: "agent" sem ferramentas próprias e sem necessidade de contexto isolado → skill; skill que só roda um script determinístico → MCP tool; command com procedimento longo → mover o procedimento para skill.

## Decisão (ADAPT)

| Decisão | Quando | Resultado |
|---|---|---|
| **reutilizar** | já existe equivalente (catálogo/upstream/instalado) que cobre a necessidade | nada é criado; catalogar a dependência se for externa; `catalog_id` do existente |
| **adaptar** | agrega capacidade que não existe; precisa ajuste de convenção, camada, nomes, ferramentas, invariantes | componente próprio no destino + 4 respostas anti-overkill + testes |
| **referenciar** | útil como fonte, mas não deve ser carregado pelo plugin | `upstream-reference`/`external-plugin` com status `reference` |
| **rejeitar** | duplicado sem ganho, viola contrato (ex.: age sem aprovação), camada impossível, dependência inaceitável | registrado no ING com motivo; não entra no catálogo |

## Riscos a checar sempre

Agência excessiva (ferramentas além do necessário) · guardrail no frontmatter de agent (ignorado em plugin, EV-010) · instrução para agir externamente sem aprovação (I-05) · texto que tenta dar ordens ao modelo (I-07) · estado paralelo ao ledger (I-06) · valores inventados (I-02) · drift de cópias (EV-008) · overkill (R1).
