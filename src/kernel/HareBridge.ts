import hareCoreCode from './os_core.ha?raw';
import {
  VirtualFS,
  type FSNodeInput,
  normalizePath,
  basename,
  parentPath,
} from './vfs';
import { createKernelHosts, type HostEngineId, type KernelHost } from './hosts';
import { Scheduler } from './process';

const WORKSPACE = '/workspace/hare-user';

const SEED: FSNodeInput[] = [
  {
    name: 'workspace',
    type: 'dir',
    children: [
      {
        name: 'hare-user',
        type: 'dir',
        children: [
          { name: 'Área de trabalho', type: 'dir', children: [] },
          { name: 'Documentos', type: 'dir', children: [] },
          { name: 'Downloads', type: 'dir', children: [] },
          { name: 'Imagens', type: 'dir', children: [] },
          { name: 'Modelos', type: 'dir', children: [] },
          { name: 'Músicas', type: 'dir', children: [] },
          { name: 'Projetos', type: 'dir', children: [] },
          { name: 'Público', type: 'dir', children: [] },
          { name: 'Vídeos', type: 'dir', children: [] }
        ]
      },
      {
        name: 'hare-os',
        type: 'dir',
        children: [
          {
            name: 'kernel',
            type: 'dir',
            children: [
              { name: 'os_core.ha', type: 'file', content: hareCoreCode },
              {
                name: 'scheduler.ha',
                type: 'file',
                content: `// Round-robin process scheduler (reference)
use fmt;

type Process = struct {
    pid: u32,
    name: str,
    quantum: u32,
};

fn rotate(slice: []Process) void = {
    if (len(slice) < 2) return;
    let head = slice[0];
    // shift left
    for (let p = 0z; p < len(slice) - 1; p += 1) {
        slice[p] = slice[p + 1];
    };
    slice[len(slice) - 1] = head;
};
`,
              },
              {
                name: 'syscall.ha',
                type: 'file',
                content: `use fmt;

type SysCall = enum {
    SYS_READ,
    SYS_WRITE,
    SYS_OPEN,
    SYS_CLOSE,
    SYS_EXEC,
};

export fn dispatch(call: SysCall, fd: u32) u32 = {
    return switch (call) {
        SYS_READ => 0,
        SYS_WRITE => fd,
        SYS_OPEN => 0,
        SYS_CLOSE => 0,
        SYS_EXEC => 1,
    };
};
`,
              },
            ],
          },
          {
            name: 'src',
            type: 'dir',
            children: [
              {
                name: 'main.ts',
                type: 'file',
                content: `const boot = async (): Promise<void> => {
  const kernel = await importKernel();
  const ui = await mountUI();
  ui.render(kernel.boot());
};

boot();
`,
              },
              {
                name: 'system.ts',
                type: 'file',
                content: `export interface SystemStatus {
  kernel: string;
  uptime: number;
  memory: { used: number; total: number };
  version: string;
}

export function readStatus(): SystemStatus {
  return {
    kernel: 'HARE-WASM v0.1.0',
    uptime: process.hrtime()[0],
    memory: { used: 0, total: 0 },
    version: '1.0.0-alpha',
  };
}
`,
              },
              {
                name: 'ide.ts',
                type: 'file',
                content: `export type Activity = 'files' | 'search' | 'git' | 'terminal';

export interface Tab {
  path: string;
  dirty: boolean;
}

export class IdeWorkspace {
  activities: Activity[] = ['files', 'search', 'git', 'terminal'];
  active: Activity = 'files';
  tabs: Tab[] = [];
}
`,
              },
            ],
          },
          {
            name: 'docs',
            type: 'dir',
            children: [
              {
                name: 'HARE_SPEC.md',
                type: 'file',
                content: `# HARE WEB OS — Architecture Spec

## Privilege model

The kernel exposes a minimal syscall surface. All UI runs as
a single process under the compositor.

## Memory map

- 0x0000_0000 — zero page
- 0x4000_0000 — kernel heap
- 0x8000_0000 — user workspace

## Boot sequence

1. Verify kernel image
2. Build VFS mount table
3. Spawn compositor
4. Launch IDE workspace
`,
              },
              {
                name: 'ROADMAP.md',
                type: 'file',
                content: `# Roadmap

- [x] Kernel mock / HareBridge
- [x] Custom tokenizer engine
- [ ] Custom document model
- [ ] Layout engine (own profiler)
- [ ] Hare => WASM toolchain
- [ ] Persistent VFS (IndexedDB)
`,
              },
            ],
          },
          {
            name: 'tools',
            type: 'dir',
            children: [
              {
                name: 'harefmt.ts',
                type: 'file',
                content: `export function fmt(source: string): string {
  const indent = (n: number) => '  '.repeat(n);
  let depth = 0;
  return source
    .split('\\n')
    .map((line) => {
      const trimmed = line.trim();
      if (/^[})\\];]/.test(trimmed)) depth = Math.max(0, depth - 1);
      const out = depth > 0 ? indent(depth) + trimmed : trimmed;
      if (/[{([;$]/.test(trimmed)) depth++;
      return out;
    })
    .join('\\n');
}
`,
              },
            ],
          },
          {
            name: 'package.json',
            type: 'file',
            content: `{
  "name": "hare-os",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "kernel:build": "harc -t wasm src/kernel/*.ha",
    "serve": "hare-serve"
  },
  "license": "MIT"
}
`,
          },
          {
            name: 'README.md',
            type: 'file',
            content: `# HARE-OS

A web operating system whose IDE is the desktop.

## Commands

- \`dev\` — start the compositor
- \`debug\` — attach kernel debugger
- \`fmt\` — format the workspace

## Kernel

Written in the **Hare** programming language. The frontend is a
TypeScript/React GUI speaking to a WASM kernel bridge.
`,
          },
          {
            name: '.gitignore',
            type: 'file',
            content: `node_modules/
dist/
*.wasm
*.log
`,
          },
        ],
      },
    ],
  },
];

export interface CommandResult {
  text: string;
  cwd?: string;
  engine?: HostEngineId;
}

class HareBridge {
  private isInitializing = false;
  private isReady = false;
  readonly fs = new VirtualFS(SEED);
  readonly scheduler = new Scheduler();
  private readonly hostChain: KernelHost[] = createKernelHosts();
  private currentDir = WORKSPACE;
  private version = '0.1.0-alpha';
  private bootTime = Date.now();

  get ready(): boolean {
    return this.isReady;
  }

  get hosts(): readonly KernelHost[] {
    return this.hostChain;
  }

  /** Live engines in priority order (native → wasm → js fallback). */
  get engines(): HostEngineId[] {
    return [
      ...this.hostChain.filter((h) => h.available).map((h) => h.id),
      'js',
    ];
  }

  get platformLabel(): string {
    const live = this.hostChain.filter((h) => h.available).map((h) => h.label);
    return live.length ? `Hybrid · ${live.join(' → ')} → JS fallback` : 'Hybrid · JS fallback only';
  }

  get cwd(): string {
    return this.currentDir;
  }

  get versionStr(): string {
    return this.version;
  }

  get uptime(): string {
    const s = Math.floor((Date.now() - this.bootTime) / 1000);
    return `${s}s`;
  }

  async init(): Promise<void> {
    if (this.isInitializing || this.isReady) return;
    this.isInitializing = true;
    try {
      console.log('[HARE] initializing hybrid kernel (native → wasm → js)...');
      await this.fs.restoreState();
      
      // Ensure home directory and standard folders exist
      if (!this.fs.exists(WORKSPACE)) {
        this.fs.mkdir(WORKSPACE, true);
      }
      ['Área de trabalho', 'Documentos', 'Downloads', 'Imagens', 'Modelos', 'Músicas', 'Projetos', 'Público', 'Vídeos'].forEach(dir => {
        if (!this.fs.exists(`${WORKSPACE}/${dir}`)) {
          this.fs.mkdir(`${WORKSPACE}/${dir}`, true);
        }
      });

      await Promise.all(this.hostChain.map((h) => h.init()));
      console.log(`[HARE] engines live: ${this.engines.join(' + ')}`);
      await new Promise((r) => setTimeout(r, 600));
      this.isReady = true;
    } catch (e) {
      console.error('[HARE] kernel init failed', e);
      throw e;
    } finally {
      this.isInitializing = false;
    }
  }

  resolvePath(input: string): string {
    if (!input) return this.currentDir;
    return normalizePath(input, this.currentDir);
  }

  readFile(path: string): string {
    return this.fs.readFile(this.resolvePath(path));
  }

  writeFile(path: string, content: string): void {
    this.fs.writeFile(this.resolvePath(path), content);
  }

  exists(path: string): boolean {
    return this.fs.exists(this.resolvePath(path));
  }

  listDir(path: string): { name: string; path: string; type: 'file' | 'dir' }[] {
    return this.fs.list(this.resolvePath(path)).map((n) => ({
      name: n.name,
      path: n.path,
      type: n.type,
    }));
  }

  createFile(path: string, content = ''): void {
    this.fs.writeFile(this.resolvePath(path), content);
  }

  createDir(path: string): void {
    this.fs.mkdir(this.resolvePath(path));
  }

  deletePath(path: string): void {
    const full = normalizePath(path, this.currentDir);
    this.fs.rm(full);
  }

  renamePath(oldPath: string, newName: string): void {
    const full = normalizePath(oldPath, this.currentDir);
    this.fs.rename(full, newName);
  }

  spawnProcess(raw: string, overrideCwd?: string): number {
    if (!this.isReady) throw new Error('Kernel not loaded');

    const cmd = raw.trim();
    if (!cmd) return -1;

    const [head, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(' ').trim();
    const name = head!.toLowerCase();
    
    // Spawn the process via scheduler
    const cwd = overrideCwd || this.currentDir;
    const process = this.scheduler.spawn(name, cwd, null, rest, {});
    const pid = process.pid;

    // Helper to write to stdout and kill
    const end = (text: string, code: number = 0, chdir?: string) => {
      if (text) this.scheduler.writeStdout(pid, text);
      if (chdir) this.currentDir = chdir; // Update global cwd if needed
      this.scheduler.kill(pid, code);
    };

    // Evaluate async
    setTimeout(async () => {
      // Check if process was killed early
      if (!this.scheduler.get(pid)) return;

      for (const host of this.hostChain) {
        if (!host.available || !host.supports(name)) continue;
        try {
          const out = await host.execute(cmd);
          if (out !== null && out !== undefined) {
            end(out);
            return;
          }
        } catch (err) {
          console.warn(`[HARE] ${host.id} host failed for '${cmd}'`, err);
        }
      }

      switch (name) {
        case 'sleep': {
          const ms = (parseInt(arg, 10) || 1) * 1000;
          this.scheduler.writeStdout(pid, `Sleeping for ${ms/1000}s...`);
          await new Promise(r => setTimeout(r, ms));
          if (this.scheduler.get(pid)) end('');
          return;
        }
        case 'uname':
          end(`HARE-OS kernel ${this.version} (JS fallback)`);
          return;
      case 'ps': {
        const procs = this.scheduler.list();
        if (procs.length === 0) {
          end('PID   PPID  STATE     MEM      CMD');
          return;
        }
        
        const lines = ['PID   PPID  STATE     MEM      CMD'];
        for (const p of procs) {
          const mem = (p.memory / 1024).toFixed(1) + 'M';
          const ppid = p.ppid !== null ? p.ppid.toString() : '-';
          lines.push(`${p.pid.toString().padEnd(5)} ${ppid.padEnd(5)} ${p.state.padEnd(9)} ${mem.padEnd(8)} ${p.name}`);
        }
        end(lines.join('\n'));
        return;
      }
      case 'kill': {
        if (!arg) {
          end('usage: kill [-SIGNAL] <pid>', 1);
          return;
        }
        
        let sig: any = 'SIGTERM';
        let targetPidStr = arg;
        
        if (arg.startsWith('-')) {
          const parts = arg.split(' ');
          const rawSig = parts[0].substring(1).toUpperCase();
          if (rawSig === '9') sig = 'SIGKILL';
          else if (!rawSig.startsWith('SIG')) sig = `SIG${rawSig}`;
          else sig = rawSig;
          
          targetPidStr = parts.slice(1).join(' ');
        }

        const pid = parseInt(targetPidStr, 10);
        if (isNaN(pid)) return { text: `kill: invalid pid: ${targetPidStr}` };
        
        if (this.scheduler.signal(pid, sig)) {
          end(`process ${pid} signaled with ${sig}`);
        } else {
          end(`kill: no such process: ${pid}`, 1);
        }
        return;
      }
      case 'date':
        end(new Date().toISOString());
        return;
      case 'pwd':
        end(this.currentDir);
        return;
      case 'echo':
        end(arg);
        return;
      case 'whoami':
        end('hare_admin');
        return;
      case 'uptime':
        end(`up ${this.uptime}`);
        return;
      case 'version':
        end(`HARE-OS ${this.version}`);
        return;
      case 'ls':
      case 'dir': {
        const targetDir = arg || this.currentDir;
        if (!this.fs.isDir(this.resolvePath(targetDir))) {
          end(`NO_SUCH_DIRECTORY: ${targetDir}`, 1);
        } else {
          end(this.listDir(targetDir).map((n) => (n.type === 'dir' ? n.name + '/' : n.name)).join('    '));
        }
        return;
      }
      case 'tree':
        end(this.fs.tree(this.resolvePath(arg || '.')).join('\n') || '.');
        return;
      case 'cd': {
        if (!arg) {
          end('', 0, WORKSPACE);
          return;
        }
        const target = this.resolvePath(arg);
        if (this.fs.isDir(target)) {
          end('', 0, target);
        } else {
          end(`NO_SUCH_DIRECTORY: ${arg}`, 1);
        }
        return;
      }
      case 'cat':
        if (!arg) end('usage: cat <file>', 1);
        else if (!this.fs.exists(arg)) end(`NO_SUCH_FILE: ${arg}`, 1);
        else if (this.fs.isDir(arg)) end(`IS_A_DIRECTORY: ${arg}`, 1);
        else end(this.fs.readFile(arg));
        return;
      case 'head': {
        if (!arg) {
          end('usage: head <file> [n]', 1);
          return;
        }
        const [fileArg, numArg] = arg.split(/\s+/);
        const n = numArg ? parseInt(numArg, 10) : 10;
        if (!this.fs.exists(fileArg!)) {
          end(`NO_SUCH_FILE: ${fileArg}`, 1);
        } else {
          const lines = this.fs.readFile(fileArg!).split('\n').slice(0, n);
          end(lines.join('\n'));
        }
        return;
      }
      case 'touch':
        if (!arg) end('usage: touch <file>', 1);
        else {
          if (!this.fs.exists(arg)) this.createFile(arg, '');
          end(`touched ${basename(this.resolvePath(arg))}`);
        }
        return;
      case 'mkdir':
        if (!arg) end('usage: mkdir <dir>', 1);
        else {
          this.createDir(arg);
          end(`created ${basename(this.resolvePath(arg))}`);
        }
        return;
      case 'rm':
        if (!arg) end('usage: rm <path>', 1);
        else {
          this.deletePath(arg);
          end(`removed ${basename(this.resolvePath(arg))}`);
        }
        return;
      case 'find':
        end(this.fs.find(arg || '').map((n) => n.path).join('\n') || '(no results)');
        return;
      case 'stat': {
        const target = this.resolvePath(arg || '.');
        const node = this.fs.get(target);
        if (!node) end(`NO_SUCH_PATH: ${arg}`, 1);
        else {
          const size = node.type === 'dir' ? node.children.length : node.content.length;
          end(`[${node.type}] ${node.path}\n  size: ${size}\n  parent: ${parentPath(node.path)}`);
        }
        return;
      }
      case 'help':
        end([
          `Hybrid kernel engines: ${this.engines.join(' + ')}`,
          'Available commands:',
          '  version, uname, ident, whoami, echo, fnv (core)',
          '  date, uptime, ls, tree, cd, pwd, cat, head, touch, mkdir, rm, find, stat',
          '  ps, kill, open, edit, help, sleep, clear',
        ].join('\n'));
        return;
      default:
        end(`command not found: ${head}`, 127);
        return;
      }
    }, 0); // end of setTimeout

    return pid;
  }
}

export const kernel = new HareBridge();