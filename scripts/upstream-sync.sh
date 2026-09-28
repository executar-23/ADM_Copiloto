#!/usr/bin/env bash
# Inicializa (ou atualiza, com --update) os upstreams oficiais em vendor/upstream.
# Atualizar muda o SHA fixado: rode o COMPARE (docs/maintenance.md) e atualize o catálogo antes de commitar.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "${1:-}" = "--update" ]; then
  git submodule update --init --depth 1 --remote vendor/upstream
  echo "Submodules atualizados. Diferenças de SHA:"
  git submodule status vendor/upstream
  echo "→ Próximo passo: COMPARE (docs/maintenance.md §Upstream) e 'catalog_register' com o novo origin.sha."
else
  git submodule update --init --depth 1 vendor/upstream
  git submodule status vendor/upstream
fi
