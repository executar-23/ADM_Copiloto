# Command (entrada explícita de workflow)

```markdown
---
description: O que o comando faz (aparece em /help)
argument-hint: "<obrigatório> [opcional]"
allowed-tools: Skill, mcp__plugin_maestro_estado__state_summary
---

Instruções PARA o Claude (não para o usuário). Use $ARGUMENTS.
1. Carregue a skill <nome> (ferramenta Skill).
2. …delegue/chame as ferramentas…
3. Feche com o bloco Estado / Pendências / Próxima ação.
```

- O comando é **fino**: interpreta argumentos e delega. Procedimento longo mora na skill.
- Nome do arquivo = nome do comando → `/maestro:<nome>`. Skills e commands compartilham esse namespace: `conflict_check` acusa colisão.
- `allowed-tools` pré-aprova as ferramentas que o comando usa; não coloque ferramentas de efeito externo ali.
- Nada de README em `commands/`.
