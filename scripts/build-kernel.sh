#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p bin

if command -v hare >/dev/null 2>&1; then
  echo "[kernel] hare toolchain found — building real native kernel from src/kernel/ha/kernel.ha"
  hare build -o bin/hare-kernel src/kernel/ha/kernel.ha
elif command -v clang >/dev/null 2>&1; then
  echo "[kernel] 'hare' toolchain not found — building C reference stand-in (mirrors kernel.ha)."
  echo "[kernel] install Hare (https://harelang.org) then re-run to get the real binary."
  clang -O2 -Wall -Wextra -Werror -o bin/hare-kernel src/kernel/native/standin.c
elif command -v gcc >/dev/null 2>&1; then
  echo "[kernel] 'hare' toolchain not found — building C reference stand-in (mirrors kernel.ha)."
  echo "[kernel] install Hare (https://harelang.org) then re-run to get the real binary."
  gcc -O2 -Wall -Wextra -Werror -o bin/hare-kernel src/kernel/native/standin.c
else
  echo "[kernel] Neither hare, clang, nor gcc found. Skipping native kernel build."
  exit 0
fi

if [ -f bin/hare-kernel ]; then
  echo "[kernel] built bin/hare-kernel ($(wc -c < bin/hare-kernel | tr -d ' ') bytes)"
fi