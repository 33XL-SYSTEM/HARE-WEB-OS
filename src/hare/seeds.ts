import type { PackageBundle, Repository } from './types';

export const EMBEDDED_REPOS: Repository[] = [
  {
    name: 'core',
    url: 'embedded://core',
    kind: 'embedded',
    enabled: true,
    description: 'HARE-OS core package repository (embedded catalog)',
  },
  {
    name: 'extras',
    url: 'embedded://extras',
    kind: 'embedded',
    enabled: false,
    description: 'HARE-OS extra packages (embedded catalog, disabled by default)',
  },
];

const HARECORE_1_0: PackageBundle = {
  name: 'harecore',
  version: '1.0.0',
  arch: 'wasm32',
  repo: 'core',
  size: 2451,
  summary: 'HARE-OS core runtime library',
  description: 'Low-level kernel bindings used by every HARE-OS component.',
  depends: [],
  recommends: [],
  provides: ['hre-runtime'],
  conflicts: [],
  files: [
    {
      path: '/workspace/hare-os/lib/harecore.ha',
      content: `// harecore — core runtime bindings
use rt;
use fmt;

export fn uptime_secs() u32 = {
    return rt::clock() / 1000;
};

export fn syscall(n: u32, a: u32, b: u32) u32 = {
    return rt::call(n, a, b);
};
`,
    },
  ],
};

const HARECORE_1_1: PackageBundle = {
  ...HARECORE_1_0,
  version: '1.1.0',
  size: 2489,
  files: [
    {
      path: '/workspace/hare-os/lib/harecore.ha',
      content: `// harecore 1.1 — core runtime bindings
use rt;
use fmt;

export fn uptime_secs() u32 = {
    return rt::clock() / 1000;
};

export fn syscall(n: u32, a: u32, b: u32) u32 = {
    return rt::call(n, a, b);
};

export fn syscall3(n: u32, a: u32, b: u32, c: u32) u32 = {
    return rt::call3(n, a, b, c);
};
`,
    },
  ],
};

const HARELANG: PackageBundle = {
  name: 'harelang',
  version: '2.3.0',
  arch: 'wasm32',
  repo: 'core',
  size: 18432,
  summary: 'Hare language toolchain',
  description: 'The hare compiler driver and build tool, compiled to wasm32.',
  depends: ['harecore'],
  recommends: ['hfs'],
  provides: ['harec'],
  conflicts: [],
  files: [
    {
      path: '/workspace/hare-os/tools/harec.ha',
      content: `// harecc — compiler front-end driver
use fmt;
use os;

export fn main() void = {
    const args = os::args();
    fmt::printfln("harec 2.3.0: compiling {} module(s)", len(args) - 1)!;
};
`,
    },
    {
      path: '/workspace/hare-os/tools/hare.ha',
      content: `// hare — build tool
use fmt;
use os;

export fn main() void = {
    const args = os::args();
    fmt::printfln("hare 2.3.0: building {}", args[1])!;
};
`,
    },
  ],
};

const HFS: PackageBundle = {
  name: 'hfs',
  version: '1.4.0',
  arch: 'wasm32',
  repo: 'core',
  size: 9210,
  summary: 'HARE-OS filesystem utilities',
  description: 'Virtual filesystem daemon tools: mount, ls, du, df.',
  depends: ['harecore'],
  recommends: [],
  provides: ['fs-utils'],
  conflicts: [],
  files: [
    {
      path: '/workspace/hare-os/tools/dfs.ha',
      content: `// dfs — VFS daemon utilities
use fmt;
use os;

export fn main() void = {
    const args = os::args();
    if (len(args) > 1 && args[1] == "du") {
        fmt::println("usage: du <path>")!;
    };
};
`,
    },
  ],
};

const HTERM: PackageBundle = {
  name: 'hterm',
  version: '3.2.1',
  arch: 'wasm32',
  repo: 'core',
  size: 15330,
  summary: 'HARE terminal emulator',
  description: 'The terminal widget and pty backend used across the desktop.',
  depends: ['harelang>=2.0'],
  recommends: [],
  provides: ['terminal-emulator'],
  conflicts: [],
  files: [
    {
      path: '/workspace/hare-os/apps/hterm.ha',
      content: `// hterm — terminal emulator
use fmt;
use strings;

export fn render(line: str) str = {
    return strings::concat("$ ", line);
};
`,
    },
  ],
};

const NETD: PackageBundle = {
  name: 'netd',
  version: '0.9.2',
  arch: 'wasm32',
  repo: 'core',
  size: 12740,
  summary: 'HARE-OS network daemon',
  description: 'Userspace networking daemon (mock 127.0.0.1 loopback).',
  depends: ['harecore', 'hfs'],
  recommends: [],
  provides: ['net-stack'],
  conflicts: ['oldnet'],
  files: [
    {
      path: '/workspace/hare-os/daemons/netd.ha',
      content: `// netd — networking daemon
use fmt;

export fn main() void = {
    fmt::println("netd: bound 127.0.0.1:8080 (mock)")!;
};
`,
    },
  ],
};

const OLDNET: PackageBundle = {
  name: 'oldnet',
  version: '0.1.0',
  arch: 'wasm32',
  repo: 'core',
  size: 3102,
  summary: 'Legacy networking daemon (superseded by netd)',
  description: 'Pre-netd network daemon. Conflicts with the modern netd package.',
  depends: ['harecore'],
  recommends: [],
  provides: [],
  conflicts: ['netd'],
  files: [
    {
      path: '/workspace/hare-os/daemons/oldnet.ha',
      content: `// oldnet — legacy daemon, do not use
use fmt;

export fn main() void = {
    fmt::println("oldnet: legacy loopback estimator")!;
};
`,
    },
  ],
};

const HWM: PackageBundle = {
  name: 'hwm',
  version: '2.0.0',
  arch: 'wasm32',
  repo: 'core',
  size: 22890,
  summary: 'HARE window manager / compositor',
  description: 'Tile-stacking compositor serving the desktop shell.',
  depends: ['hterm>=3.0', 'harelang'],
  recommends: [],
  provides: ['compositor'],
  conflicts: [],
  files: [
    {
      path: '/workspace/hare-os/apps/hwm.ha',
      content: `// hwm — compositor
use fmt;

export fn main() void = {
    fmt::println("hwm: compositor online")!;
};
`,
    },
  ],
};

const HIBD: PackageBundle = {
  name: 'hibd',
  version: '1.5.0',
  arch: 'wasm32',
  repo: 'core',
  size: 19340,
  summary: 'HARE-OS integrated development environment',
  description: 'The editor engine, tabs and language services bundled as an app.',
  depends: ['hterm', 'hfs'],
  recommends: [],
  provides: ['ide'],
  conflicts: [],
  files: [
    {
      path: '/workspace/hare-os/apps/ide.ts',
      content: `export function bootIDE(): string {
  return 'HARE-OS IDE v1.5.0 ready';
}
`,
    },
  ],
};

const META: PackageBundle = {
  name: 'hareos-meta',
  version: '1.0.0',
  arch: 'wasm32',
  repo: 'core',
  size: 0,
  summary: 'HARE-OS standard desktop meta-package',
  description:
    'Pulls in the full standard desktop stack. This package has no payload of its own.',
  depends: ['hwm', 'hibd', 'netd', 'harelang'],
  recommends: [],
  provides: ['desktop-meta'],
  conflicts: [],
  files: [],
};

const SYSRPCD: PackageBundle = {
  name: 'sysrpcd',
  version: '0.3.1',
  arch: 'wasm32',
  repo: 'extras',
  size: 6045,
  summary: 'System RPC daemon (extras)',
  description: 'Sample extras-repository package depending on the harecore runtime.',
  depends: ['hre-runtime', 'hfs'],
  recommends: [],
  provides: [],
  conflicts: [],
  files: [
    {
      path: '/workspace/hare-os/daemons/sysrpcd.ha',
      content: `// sysrpcd — system RPC daemon
use fmt;

export fn main() void = {
    fmt::println("sysrpcd: accepting rpc on unix socket")!;
};
`,
    },
  ],
};

export const EMBEDDED_CATALOG: PackageBundle[] = [
  HARECORE_1_0,
  HARECORE_1_1,
  HARELANG,
  HFS,
  HTERM,
  NETD,
  OLDNET,
  HWM,
  HIBD,
  META,
  SYSRPCD,
];

export function embeddedBundle(repo: string, name: string): PackageBundle | null {
  return EMBEDDED_CATALOG.find((b) => b.repo === repo && b.name === name) ?? null;
}