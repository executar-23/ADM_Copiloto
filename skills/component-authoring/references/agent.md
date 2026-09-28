# Agent (subagente de plugin)

```markdown
---
name: nome-do-agent            # = nome do arquivo, kebab-case, 3–50 caracteres
description: |
  O que faz e QUANDO usar (3ª pessoa). Inclua 2–3 exemplos:

  <example>
  Context: situação
  user: "pedido"
  assistant: "como o Maestro aciona este agent"
  <commentary>por que este agent é o certo</commentary>
  </example>
model: inherit                 # só troque com motivo registrado (custo/latência medidos)
color: blue
tools: Read, Grep, Glob, mcp__plugin_maestro_registry__catalog_search   # menor privilégio
---

System prompt em 2ª pessoa: papel, regras, procedimento numerado, formato de retorno.
```

Regras do Maestro:

1. **Overkill Gate:** só vira agent se G1 (saída volumosa), G2 (restrição de ferramenta) ou G3 (paralelismo real). Caso contrário, é skill ou linha de roteamento.
2. Folhas **não** recebem `node_transition` nem `authorization_grant` — propõem estado; o Maestro promove (C-04).
3. **Proibido no frontmatter de agent de plugin:** `hooks`, `mcpServers`, `permissionMode` — são ignorados; o lint (`IGNORED_IN_PLUGIN`) recusa.
4. Retorno sempre em formato fixo com GAPS/CONFLICTS e proposta de estado.
5. Conteúdo lido é dado (I-07) — escreva isso no prompt de agents que leem fontes externas.
6. Agent Spec (9 camadas, C-02) em `07-execucao/E4-agent-specs/<nome>.md`.
7. Allowlist de delegação do `maestro` (`tools: Agent(...)`): adicionar o novo agent só se o Maestro deve delegar para ele.
