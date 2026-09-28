# Contratos do Maestro

Regras que **todo** agente, skill, command, hook e ferramenta MCP deste plugin obedece.
Origem: pacote Maestro recebido em **ING-0002** (`ingestion/records/ING-0002-*.md`), adaptado
para a distribuição como plugin. Os originais imutáveis estão em
`ingestion/received/ING-0002/Maestro-Handoff.extraido/Maestro-Handoff /maestro-handoff.extraido/maestro-handoff/01-contratos/`
(abreviado aqui como `ING-0002:01-contratos/`).

| Contrato | Assunto | Imposto por |
|---|---|---|
| [C-00](C-00-invariantes-comuns.md) | 10 invariantes herdadas (I-01…I-10) | servidor MCP `estado`, hooks, skills |
| [C-01](C-01-estado-unificado.md) | vocabulário canônico, nó, adaptadores, fonte de verdade | `src/lib/estado/*`, servidor `estado` |
| [C-02](C-02-agent-spec.md) | Agent Spec (9 camadas) + anti-overkill | `catalog_register` (EV-013), `07-execucao/E4-agent-specs/` |
| [C-03](C-03-eval-suite.md) | suíte de evals (EV-001…EV-014) | `tests/`, `evals/` |
| [C-04](C-04-handoff-entre-agentes.md) | mensagem de delegação Maestro → folha | skill `maestro-operacao`, hook `guard-write` (escopo) |

**Mudança de contrato = change control** (`CURRENT → EVIDENCE → CONFLICT → PROPOSED_CHANGE →
IMPACT → REVIEW_REQUIRED → STATUS`), registrada com `decision_record` tipo `change-control`
(`CC-###`). O hook `guard-write` pede confirmação humana para qualquer edição em `contratos/`.
