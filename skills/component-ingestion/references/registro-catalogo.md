# Registro no catálogo (`catalog/components/<tipo>/<nome>.json`)

Schema: `catalog/schema/component.schema.json` (gerado de `src/lib/catalog/schema.ts`).

```json
{
  "id": "skill:exemplo-skill",
  "name": "exemplo-skill",
  "type": "skill",
  "path": "skills/exemplo-skill/SKILL.md",
  "origin": { "kind": "adapted", "source": "ING-0004: lote-outubro/exemplo-skill", "sha": "<sha256 do original>", "license": "A DEFINIR" },
  "responsibility": "Uma frase: o que este componente faz e para quem.",
  "dependencies": ["mcp-server:registry", "rc-cognitive-risk-expert (skill proprietária externa)"],
  "tools": ["Read", "mcp__plugin_maestro_registry__routing_lookup"],
  "related": { "skills": ["roteamento-lanes"], "agents": [], "commands": ["executar"] },
  "status": "experimental",
  "version": "0.1.0",
  "integration": { "date": "2026-10-01", "reason": "por que entrou (necessidade atendida)", "ingestion": "ING-0004" },
  "tests": ["tests/unit/exemplo.test.ts", "evals/exemplo-dispara/"],
  "anti_overkill": {
    "reuso": "o que já existia e por que não bastava",
    "necessidade": "entrega que ficaria impossível/mais lenta sem isto",
    "custo": "arquivos/linhas/dependências",
    "reversao": "como remover"
  },
  "notes": "adaptações feitas em relação ao original"
}
```

- `type`: `agent | skill | command | hook | mcp-server | mcp-tool | external-plugin | upstream-reference`.
- `origin.kind`: `proprietary` (criado aqui) · `adapted` (recebido e adaptado) · `upstream` (Anthropic oficial) · `third-party`.
- `status`: `experimental` (em avaliação) · `active` · `deprecated` · `reference` (não carregado pelo plugin).
- `anti_overkill` é **obrigatório** para agent/skill/command/hook/mcp-server próprios ou adaptados (EV-013).
- `mcp-tool` exige `parent` (ex.: `"parent": "mcp-server:registry"`); `upstream-reference` exige `origin.sha`.
- `related.*` usam nomes (sem prefixo de tipo); `dependencies` com prefixo `<tipo>:` são checadas contra o catálogo.
- Deprecar: mude `status` para `deprecated`, explique em `notes`; nunca apague o histórico (I-10).
