/*
 * HARE-OS kernel — WebAssembly core module.
 *
 * This is the WASM side of the hybrid kernel. The command/ABI set mirrors
 * src/kernel/ha/kernel.ha (the Hare reference implementation). When the Hare
 * compiler gains an official WebAssembly backend, this module should be built
 * from the .ha sources and this C file retired.
 *
 * Freestanding: compiled with `clang --target=wasm32-unknown-unknown
 * -nostdlib`. No libc, no WASI imports — zero imports, portable to any
 * WebAssembly runtime (browser + Node).
 *
 * ABI (all offsets point into the exported linear memory):
 *   env_buf() -> i32   input buffer (host writes the command packet here)
 *   env_cap() -> i32   input capacity
 *   res_buf() -> i32   result buffer (kernel writes output here)
 *   res_cap() -> i32   result capacity
 *   execute(len) -> i32  number of bytes written into the result buffer
 */

typedef unsigned int u32;
typedef unsigned char u8;

static char IN_BUF[1024];
static char OUT_BUF[4096];
static char CWD_BUF[256] = "/workspace\0";

static u32 out_len = 0;

static int cmp(const char *a, const char *b) {
  while (*a && *b && *a == *b) { a++; b++; }
  return *a == *b;
}

__attribute__((export_name("env_buf"))) u32 env_buf(void) {
  return (u32)(unsigned long)IN_BUF;
}
__attribute__((export_name("env_cap"))) u32 env_cap(void) {
  return (u32)sizeof(IN_BUF);
}
__attribute__((export_name("res_buf"))) u32 res_buf(void) {
  return (u32)(unsigned long)OUT_BUF;
}
__attribute__((export_name("res_cap"))) u32 res_cap(void) {
  return (u32)sizeof(OUT_BUF);
}

static void out_raw(const char *s) {
  while (*s && out_len < (u32)sizeof(OUT_BUF) - 1) OUT_BUF[out_len++] = *s++;
}
static void out_char(char c) {
  if (out_len < (u32)sizeof(OUT_BUF) - 1) OUT_BUF[out_len++] = c;
}
static void out_hex(u32 n) {
  static const char hex[] = "0123456789abcdef";
  char tmp[10];
  int i = 0;
  do { tmp[i++] = hex[n & 0xf]; n >>= 4; } while (n);
  while (i > 0) out_char(tmp[--i]);
}

/* split input into tokens; returns argc and fills argv[] (points into IN_BUF) */
static u32 tokenize(char *in, char **argv, u32 max) {
  u32 argc = 0;
  char *p = in;
  while (*p) {
    while (*p == ' ' || *p == '\t' || *p == '\n' || *p == '\r') *p++ = '\0';
    if (!*p) break;
    if (argc >= max) break;
    argv[argc++] = p;
    while (*p && *p != ' ' && *p != '\t' && *p != '\n' && *p != '\r') p++;
  }
  return argc;
}

static void set_cwd(const char *path) {
  u32 i = 0;
  const char *p = path;
  if (*p == '/') { p++; }
  while (*p && i < (u32)sizeof(CWD_BUF) - 1) CWD_BUF[i++] = *p++;
  CWD_BUF[i] = '\0';
}

__attribute__((export_name("execute"))) u32 execute(u32 len) {
  char *in = IN_BUF;
  char *argv[32];
  u32 argc = tokenize(in, argv, 32);
  out_len = 0;

  if (argc == 0) return 0;
  const char *cmd = argv[0];

  if (cmp(cmd, "version")) {
    out_raw("HARE-OS kernel v0.1.0 (wasm32)");
  } else if (cmp(cmd, "uname")) {
    out_raw("HARE-OS wasm32 minimal/0.1 hare");
  } else if (cmp(cmd, "uptime")) {
    out_raw("up 0 seconds (wasm tick)");
  } else if (cmp(cmd, "whoami")) {
    out_raw("hare_admin");
  } else if (cmp(cmd, "echo")) {
    for (u32 i = 1; i < argc; i++) {
      if (i > 1) out_char(' ');
      out_raw(argv[i]);
    }
  } else if (cmp(cmd, "fnv")) {
    u32 h = 2166136261u;
    for (u32 i = 1; i < argc; i++) {
      const char *tok = argv[i];
      while (*tok) { h ^= (u8)*tok; h *= 16777619u; tok++; }
    }
    out_raw("fnv1a=");
    out_hex(h);
  } else if (cmp(cmd, "pwd")) {
    out_raw(CWD_BUF);
  } else if (cmp(cmd, "cd")) {
    if (argc > 1) set_cwd(argv[1]);
    return 0; /* silent */
  } else if (cmp(cmd, "id")) {
    out_raw("uid=0(hare) gid=0(hare) groups=0(hare)");
  } else if (cmp(cmd, "ident")) {
    out_raw("wasm:kernel-0.1");
  } else {
    out_raw("core: unknown command '");
    out_raw(cmd);
    out_raw("' (handled by JS fallback)");
  }

  return out_len;
}