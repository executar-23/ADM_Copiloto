# Hook

1. Código em `src/hooks/<nome>.ts`, usando `src/hooks/io.ts` (`readInput`, `maestroWorkspace`, `block`, `ask`, `pass`).
2. Entrada no build: `scripts/build.mjs` (`"hooks/<nome>": "src/hooks/<nome>.ts"`) → `npm run build`.
3. Registro em `hooks/hooks.json` (formato **wrapper** de plugin):

```json
{ "hooks": { "PreToolUse": [ { "matcher": "Write|Edit", "hooks": [ { "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/dist/hooks/<nome>.js\"", "timeout": 10 } ] } ] } }
```

Semântica:

| Saída | Efeito |
|---|---|
| exit 0 sem stdout | segue normalmente |
| exit 2 + stderr | **bloqueia** a chamada; o motivo vai para o Claude (PreToolUse) ou vira feedback (PostToolUse) |
| stdout `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"…"}}` | força confirmação humana |
| stdout `{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"…"}}` | injeta contexto na sessão |

- O hook deve ser rápido (< 200 ms) e **só agir em workspace do Maestro** (`maestroWorkspace(input)`), porque plugin habilitado roda em qualquer projeto.
- Hooks de plugin valem também dentro de subagentes — é onde os guardrails devem morar (EV-010).
- Teste com stdin em `tests/integration/hooks.test.ts`.
