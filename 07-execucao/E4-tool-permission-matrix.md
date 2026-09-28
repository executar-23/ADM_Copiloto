# E4 — Tool/Permission Matrix (antecipada, v0.1.0)

> C-02 camada 4. Menor privilégio por agente; toda ferramenta com efeito externo tem linha própria e aprovação definida.
> Imposição: `tools:` do frontmatter (o que o agente **vê**) + hooks do plugin (o que é **bloqueado/confirmado**, inclusive em subagentes).

| Ferramenta | Escopo | R/W | Reversível? | Aprovação humana | maestro | qa-reviewer | evidence-researcher | component-analyst |
|---|---|---|---|---|---|---|---|---|
| Read, Grep, Glob | workspace | R | — | não | ✔ | ✔ | ✔ | ✔ |
| Write, Edit | workspace (exceto upstream, received, ledger, gerados; escopo do nó ativo) | W | sim (git) | contratos/ → **ask** | ✔ | — | Write só no escopo | — |
| Bash | comandos locais | R/W | depende | efeito externo (push, publish, deploy, curl de escrita…) → **ask** (hook) | ✔ | ✔ (verificação) | — | — |
| Skill | skills instaladas | — | — | não | ✔ | — | — | — |
| Agent | só folhas `maestro:*` | — | — | não | ✔ (allowlist) | — | — | — |
| WebSearch, WebFetch | web pública | R | — | não (conteúdo = dado) | ✔ | — | ✔ | — |
| MCP `estado` leitura (`state_summary`, `node_list/get/next`, `decision_list`, `state_validate`) | ledger | R | — | não | ✔ | parcial | `node_get` | — |
| MCP `estado` escrita (`state_init`, `node_create/update/transition`, `evidence_add`, `decision_record`) | ledger | W | sim (git) | não (guardas no servidor) | ✔ | — | — | — |
| MCP `estado.authorization_grant` | ledger | W | sim | **sempre** (`destructiveHint` + hook ask) | ✔ | — | — | — |
| MCP `registry` leitura (catálogo, inspect, conflitos, upstream, roteamento, fingerprint, validate, ingestões) | workspace | R | — | não | ✔ | parcial | — | ✔ |
| MCP `registry` escrita (`ingestion_start`, `catalog_register`) | ingestion/, catalog/ | W | sim (git) | não | ✔ | — | — | — |
| Conectores externos (Notion, Drive, Vercel, Railway, Neon, Cloudflare, Resend, GitHub…) | serviços externos | R/W | **não** p/ produção | escrita → **ask** (hook `guard-external`) | via sessão | — | — | — |

Lacunas declaradas: esquemas das ferramentas dos conectores **não lidos** (`USER_ACTION_REQUIRED` antes de qualquer escrita); Supabase e Linear ausentes nesta sessão (E0).
