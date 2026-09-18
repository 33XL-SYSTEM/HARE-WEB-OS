#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="public/kernel.wasm"
mkdir -p public
if ! command -v clang >/dev/null 2>&1; then
  echo "[wasm] clang not found!"
  if [ -f "$OUT" ]; then
    echo "[wasm] $OUT already exists, skipping WASM compilation."
    exit 0
  else
    echo "[wasm] $OUT is missing and clang is not available to build it. Deployment may fail."
    exit 1
  fi
fi

clang --target=wasm32-unknown-unknown -O2 -nostdlib -fno-builtin -Wl,--no-entry \
  -Wl,--export=env_buf -Wl,--export=env_cap \
  -Wl,--export=res_buf -Wl,--export=res_cap \
  -Wl,--export=execute -Wl,--export=memory \
  -o "$OUT" src/kernel/wasm/kernel.c
echo "built $OUT ($(wc -c < "$OUT") bytes)"
