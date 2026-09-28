# Skill (padrão Agent Skills)

```
skills/<nome>/
├── SKILL.md          # obrigatório
├── references/       # detalhe carregado sob demanda
├── scripts/          # código determinístico (preferir MCP tool se for capacidade reutilizável)
└── examples/
```

```markdown
---
name: <nome>          # = diretório; minúsculas, números e hífen; ≤ 64
description: Faz X para Y. Use quando o usuário pedir "gatilho 1", "gatilho 2"… Also triggers on "english trigger".   # ≤ 1024
---
# Título
Procedimento no imperativo, curto (≤ 500 linhas; alvo 1.500–2.000 palavras). Aponte para references/… quando houver detalhe.
```

- **Progressive disclosure:** metadados sempre no contexto; `SKILL.md` quando dispara; `references/` só quando lido.
- A descrição é o gatilho: diga o que faz **e** quando usar, com frases reais do usuário (PT e EN).
- Skill invocada pelo usuário como comando explícito? Prefira um **command** fino que carrega a skill (camada Command × Skill do Maestro).
- Referências citadas (`references/x.md`, `${CLAUDE_PLUGIN_ROOT}/…`) precisam existir — o lint (`BROKEN_REF`) confere.
- Skills com estado próprio (ex.: Obsidian, Solution Store) não criam ledger: projetam no nó (C-01).
