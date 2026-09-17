/*
 * HARE-OS kernel — native reference stand-in.
 *
 * Mirrors src/kernel/ha/kernel.ha and the WASM core (src/kernel/wasm/kernel.c)
 * so the Node host protocol is exercisable end-to-end even without the Hare
 * toolchain installed. Built by scripts/build-kernel.sh when `hare` is absent;
 * when Hare IS installed, bin/hare-kernel is the real .ha build and this file
 * is unused.
 *
 * Protocol: invoked as `hare-kernel "<raw command line>"` (single argv[1],
 * matching the Hare host protocol); tokenizes in-process, prints the reply on
 * stdout, exits.
 */

#include <stdio.h>
#include <string.h>
#include <stdint.h>

static uint32_t fnv_fold(char **toks, int n) {
  uint32_t hash = 2166136261u;
  for (int i = 1; i < n; i++) {
    for (const unsigned char *p = (const unsigned char *)toks[i]; *p; p++) {
      hash ^= *p;
      hash *= 16777619u;
    }
  }
  return hash;
}

int main(int argc, char **argv) {
  if (argc < 2) {
    putchar('\n');
    return 0;
  }

  char line[1024];
  snprintf(line, sizeof(line), "%s", argv[1]);
  char *toks[64];
  int n = 0;
  char *p = line;
  while (*p && n < 64) {
    while (*p == ' ' || *p == '\t') *p++ = '\0';
    if (!*p) break;
    toks[n++] = p;
    while (*p && *p != ' ' && *p != '\t') p++;
  }
  if (n == 0) {
    putchar('\n');
    return 0;
  }

  const char *cmd = toks[0];
  if (strcmp(cmd, "version") == 0) {
    puts("HARE-OS kernel v0.1.0 (hare-linux)");
  } else if (strcmp(cmd, "uname") == 0) {
    puts("HARE-OS linux minimal/0.1 hare");
  } else if (strcmp(cmd, "whoami") == 0) {
    puts("hare_admin");
  } else if (strcmp(cmd, "ident") == 0) {
    puts("native:kernel-0.1");
  } else if (strcmp(cmd, "uptime") == 0) {
    puts("up 0 seconds (native tick)");
  } else if (strcmp(cmd, "echo") == 0) {
    for (int i = 1; i < n; i++) {
      if (i > 1) putchar(' ');
      fputs(toks[i], stdout);
    }
    putchar('\n');
  } else if (strcmp(cmd, "fnv") == 0) {
    printf("fnv1a=%x\n", fnv_fold(toks, n));
  } else {
    printf("core: unknown command '%s' (handled by JS fallback)\n", cmd);
  }
  return 0;
}