#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
export CELLQUANT_ROOT="$ROOT"
export PYTHONPATH="$ROOT/src${PYTHONPATH:+:$PYTHONPATH}"
export PYTHONIOENCODING=utf-8
export PYTHONUTF8=1
cd "$ROOT"
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m cellquant "$@"
fi
if command -v python >/dev/null 2>&1; then
  exec python -m cellquant "$@"
fi
echo "Python nao encontrado. Instale Python 3." >&2
exit 1
