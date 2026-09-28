#!/usr/bin/env bash
# Gate local e de CI: typecheck → build (dist em dia) → testes → maestro validate → validador oficial.
set -euo pipefail
cd "$(dirname "$0")/.."

step() { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }

step "typecheck"
npx tsc --noEmit -p tsconfig.json

step "build (dist/ versionado)"
node scripts/build.mjs
if [ "${CI:-}" = "true" ] && ! git diff --quiet -- dist; then
  echo "✖ dist/ commitado está desatualizado em relação a src/ — rode 'npm run build' e commite dist/." >&2
  exit 1
fi

step "projeções geradas em dia"
node dist/cli/maestro.js render >/dev/null
if [ "${CI:-}" = "true" ] && ! git diff --quiet -- 07-execucao/ESTADO.md catalog/CATALOG.md mapa/roteamento.md; then
  echo "✖ projeções commitadas estavam desatualizadas — rode 'npm run render' e commite." >&2
  exit 1
fi

step "testes (unit + integration + repo)"
npm test --silent

step "maestro validate"
node dist/cli/maestro.js validate

step "claude plugin validate (estrito, com avisos aceitos por política — scripts/validate-official.mjs)"
if command -v claude >/dev/null 2>&1; then
  node scripts/validate-official.mjs
else
  echo "⚠ CLI 'claude' não encontrada — validação oficial pulada (instale @anthropic-ai/claude-code)." >&2
  [ "${CI:-}" = "true" ] && exit 1
fi

step "rota remota Cloudflare (typecheck + bundle --dry-run, sem publicar, sem credencial)"
if [ -d cloudflare-worker/node_modules ] || [ "${CI:-}" = "true" ]; then
  [ -d cloudflare-worker/node_modules ] || (cd cloudflare-worker && npm ci --silent)
  npm run --silent cloudflare:check
else
  echo "⚠ cloudflare-worker/node_modules ausente — rode 'cd cloudflare-worker && npm install' para incluir este passo." >&2
fi

printf '\n\033[32m✔ check verde\033[0m\n'
