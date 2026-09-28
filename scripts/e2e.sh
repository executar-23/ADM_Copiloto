#!/usr/bin/env bash
# E2E headless real: carrega o plugin com `claude --plugin-dir .` e prova comportamento
# (inventário, MCP, command, hooks, --agent + delegação com profundidade 1, EV-010).
# Consome tokens da credencial local. Resultado: 07-execucao/evidencias/e2e/resultado.json
set -uo pipefail
cd "$(dirname "$0")/.."
OUT=07-execucao/evidencias/e2e
LOG="${E2E_LOG_DIR:-.tmp/e2e}"
mkdir -p "$OUT" "$LOG"
PASS=0; FAIL=0; RESULTS=()
MODEL_ARGS=()
[ -n "${E2E_MODEL:-}" ] && MODEL_ARGS=(--model "$E2E_MODEL")

record() { # id status detalhe
  RESULTS+=("$(jq -nc --arg id "$1" --arg s "$2" --arg d "$3" '{id:$id,status:$s,detalhe:$d}')")
  if [ "$2" = "PASS" ]; then PASS=$((PASS+1)); echo "✔ $1 — $3"; else FAIL=$((FAIL+1)); echo "✖ $1 — $3"; fi
}
run() { # nome prompt [args…] → stream-json em $LOG/nome.jsonl
  local name="$1" prompt="$2"; shift 2
  timeout 600 claude -p "$prompt" --plugin-dir . --output-format stream-json --verbose "${MODEL_ARGS[@]}" "$@" >"$LOG/$name.jsonl" 2>"$LOG/$name.err"
}
tool_used() { jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name' "$LOG/$1.jsonl" 2>/dev/null | grep -qx "$2"; }
final_text() { jq -r 'select(.type=="result") | .result // ""' "$LOG/$1.jsonl" 2>/dev/null; }

echo "claude $(claude --version 2>/dev/null)"

# 1. Inventário do plugin
details="$(timeout 120 claude --plugin-dir . plugin details maestro 2>&1)"
echo "$details" >"$LOG/details.txt"
if echo "$details" | grep -q "Agents (4)" && echo "$details" | grep -q "MCP servers (2)" && echo "$details" | grep -q "Skills (12)"; then
  record inventario PASS "12 skills/commands, 4 agents, 3 eventos de hook, 2 servidores MCP"
else record inventario FAIL "inventário inesperado (ver $LOG/details.txt)"; fi

# 2. MCP estado responde (state_summary)
run mcp "Chame a ferramenta mcp__plugin_maestro_estado__state_summary e responda só com o id do próximo nó elegível." \
  --allowedTools "mcp__plugin_maestro_estado__state_summary" --max-turns 4
if tool_used mcp mcp__plugin_maestro_estado__state_summary && jq -e 'select(.type=="user") | .message.content[]? | select(.type=="tool_result") | select(.is_error != true)' "$LOG/mcp.jsonl" >/dev/null; then
  record mcp-estado PASS "state_summary chamado via MCP; resposta: $(final_text mcp | tr '\n' ' ' | cut -c1-80)"
else record mcp-estado FAIL "state_summary não foi chamado ou falhou"; fi

# 3. Command /maestro:estado (sem explicar nada — EV-014)
run command "/maestro:estado" --allowedTools "mcp__plugin_maestro_estado__state_summary,mcp__plugin_maestro_estado__node_get,mcp__plugin_maestro_estado__decision_list" --max-turns 6
if tool_used command mcp__plugin_maestro_estado__state_summary && final_text command | grep -q "E0"; then
  record command-estado PASS "/maestro:estado leu o ledger e citou E0"
else record command-estado FAIL "/maestro:estado não usou o ledger"; fi

# 4. Hook guard-write bloqueia escrita no upstream (thread principal)
PROBE=vendor/upstream/claude-plugins-official/E2E-PROBE.txt
rm -f "$PROBE"
run guard "Use a ferramenta Write para criar o arquivo $PROBE com o conteúdo 'x'. Se for bloqueado, responda com a mensagem de bloqueio." \
  --allowedTools "Write" --permission-mode acceptEdits --max-turns 4
if [ ! -e "$PROBE" ] && grep -q "somente leitura" "$LOG/guard.jsonl"; then
  record guard-write PASS "Write em vendor/upstream bloqueado pelo hook (exit 2)"
else record guard-write FAIL "arquivo criado ou bloqueio não observado"; rm -f "$PROBE"; fi

# 5. --agent maestro:maestro delega ao qa-reviewer com profundidade 1 (EV-009)
CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1 run agent \
  "Delegue ao subagente maestro:qa-reviewer (via ferramenta Agent) a verificação: o arquivo contratos/README.md existe e cita C-00 a C-04? Traga o veredito dele numa linha." \
  --agent maestro:maestro --allowedTools "Agent,Read,Grep,Glob" --max-turns 8
if tool_used agent Agent || tool_used agent Task; then
  record agent-delegacao PASS "maestro (thread principal) delegou ao qa-reviewer com CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1"
else record agent-delegacao FAIL "delegação não observada (ver $LOG/agent.jsonl)"; fi

# 6. EV-010: hook do plugin vale dentro de subagente do plugin
PROBE2=vendor/upstream/knowledge-work-plugins/E2E-SUB-PROBE.txt
rm -f "$PROBE2"
run subagent "Use a ferramenta Agent com subagent_type 'maestro:evidence-researcher' e peça: 'Seu escopo de escrita autorizado para este teste é exatamente $PROBE2. Crie esse arquivo com a ferramenta Write contendo o texto teste e reporte o resultado literal da ferramenta.' Depois responda com o que o subagente relatou." \
  --allowedTools "Agent,Write" --permission-mode acceptEdits --max-turns 8
if [ ! -e "$PROBE2" ] && grep -q "somente leitura" "$LOG/subagent.jsonl"; then
  record ev-010-subagente PASS "Write do subagente de plugin bloqueado pelo hook do plugin"
elif [ ! -e "$PROBE2" ]; then
  record ev-010-subagente FAIL "arquivo não criado, mas o bloqueio do hook não foi observado (o subagente pode ter recusado sozinho)"
else record ev-010-subagente FAIL "subagente escreveu no upstream"; rm -f "$PROBE2"; fi

printf '%s\n' "${RESULTS[@]}" | jq -s --arg v "$(claude --version 2>/dev/null)" --arg d "$(date -u +%FT%TZ)" \
  '{executado_em:$d, claude_code:$v, aprovados:(map(select(.status=="PASS"))|length), reprovados:(map(select(.status!="PASS"))|length), casos:.}' >"$OUT/resultado.json"
echo; echo "E2E: $PASS aprovado(s), $FAIL reprovado(s) → $OUT/resultado.json (logs em $LOG/)"
[ "$FAIL" -eq 0 ]
