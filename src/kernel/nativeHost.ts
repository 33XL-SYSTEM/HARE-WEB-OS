import type { KernelHost } from './hosts';
import { CORE_CMDS } from './cmds';

/**
 * Node side of the hybrid kernel.
 *
 * Spawns the native kernel binary (bin/hare-kernel, built with
 * `npm run kernel:build` from the Hare sources in src/kernel/ha/) once per
 * command, using a single-shot line protocol. Only active when the app runs
 * under Node (dev tooling, Electron/Tauri hosts) and the binary exists;
 * otherwise the chain falls through to the WASM/JS hosts.
 *
 * Deliberately byte-oriented and typeless about Node builtins so this module
 * stays bundleable for the browser runtime: builtins are loaded lazily via a
 * non-analyzable dynamic import and only ever executed under Node.
 */

const runtime = globalThis as typeof globalThis & {
  process?: {
    versions?: { node?: string };
    env?: Record<string, string>;
  };
};

interface Spawned {
  stdout: { on(event: 'data', cb: (chunk: unknown) => void): void };
  stderr: { on(event: 'data', cb: (chunk: unknown) => void): void };
  on(event: 'error' | 'close', cb: () => void): void;
  kill(): void;
}

interface NodeChildProcess {
  spawn(cmd: string, args: string[], opts?: object): Spawned;
}

interface NodeFs {
  existsSync(path: string): boolean;
}

async function loadBuiltin(name: string): Promise<unknown> {
  const dynamicKey = `node:${name}`;
  const mod = (await import(/* @vite-ignore */ dynamicKey)) as Record<string, unknown>;
  return mod.default ?? mod;
}

function spawnOne(cp: NodeChildProcess, cmd: string, args: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    let child: Spawned;
    try {
      child = cp.spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {
      resolve(null);
      return;
    }
    let out = '';
    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {
        /* already gone */
      }
      resolve(out.trimEnd() || null);
    }, 4000);
    const finish = (value: string | null) => {
      clearTimeout(timer);
      resolve(value);
    };
    child.stdout.on('data', (d) => {
      out += String(d);
    });
    child.stderr.on('data', () => {});
    child.on('error', () => finish(null));
    child.on('close', () => {
      clearTimeout(timer);
      finish(out.trimEnd() || null);
    });
  });
}

export class NativeHost implements KernelHost {
  readonly id = 'native' as const;
  readonly label = 'Native HARE kernel';
  available = false;
  private binPath: string;
  private isNode = false;

  private get inNode(): boolean {
    return !!this.isNode;
  }

  constructor() {
    this.binPath = runtime.process?.env?.HARE_KERNEL_BIN ?? 'bin/hare-kernel';
    this.isNode = !!runtime.process?.versions?.node;
  }

  async init(): Promise<void> {
    if (!this.inNode) return;
    try {
      const fs = (await loadBuiltin('fs')) as NodeFs;
      if (!fs.existsSync(this.binPath)) {
        console.warn(
          `[HARE] native kernel not found at ${this.binPath} — run "npm run kernel:build"`,
        );
        return;
      }
      const cp = (await loadBuiltin('child_process')) as NodeChildProcess;
      const probe = await spawnOne(cp, this.binPath, ['ident']);
      if (!probe) {
        console.warn('[HARE] native kernel probe failed');
        return;
      }
      this.available = true;
      this.isNode = true;
      console.log(`[HARE] native kernel up → ${probe}`);
    } catch (err) {
      console.warn('[HARE] native kernel unavailable', err);
    }
  }

  supports(command: string): boolean {
    return CORE_CMDS.has(command);
  }

  async execute(raw: string): Promise<string | null> {
    if (!this.inNode) return null;
    try {
      const cp = (await loadBuiltin('child_process')) as NodeChildProcess;
      return await spawnOne(cp, this.binPath, [raw]);
    } catch {
      return null;
    }
  }
}