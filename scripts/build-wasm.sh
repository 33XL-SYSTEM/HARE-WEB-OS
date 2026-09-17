#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="public/kernel.wasm"
mkdir -p public
clang --target=wasm32-unknown-unknown -O2 -nostdlib -fno-builtin -Wl,--no-entry \
  -Wl,--export=env_buf -Wl,--export=env_cap \
  -Wl,--export=res_buf -Wl,--export=res_cap \
  -Wl,--export=execute -Wl,--export-memory \
  -o "$OUT" src/kernel/wasm/kernel.c
echo "built $OUT ($(wc -c < "$OUT") bytes)"
