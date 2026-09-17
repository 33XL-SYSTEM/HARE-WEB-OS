import { NativeHost } from './nativeHost';
import { CORE_CMDS } from './cmds';

export type HostEngineId = 'js' | 'wasm' | 'native';

export interface KernelHost {
  readonly id: HostEngineId;
  readonly label: string;
  available: boolean;
  init(): Promise<void>;
  supports(command: string): boolean;
  execute(raw: string): string | null | Promise<string | null>;
}

interface KernelWasmExports {
  env_buf(): number;
  env_cap(): number;
  res_buf(): number;
  res_cap(): number;
  execute(len: number): number;
  memory: WebAssembly.Memory;
}

/**
 * WASM side of the hybrid kernel.
 *
 * Loads public/kernel.wasm (built from src/kernel/wasm/kernel.c via
 * `npm run kernel:wasm`). The flat ABI uses two scratch buffers inside the
 * exported linear memory: the host writes the raw command line into
 * env_buf(), calls execute(len), then reads the reply from res_buf().
 */
export class WasmHost implements KernelHost {
  readonly id = 'wasm' as const;
  readonly label = 'WASM kernel';
  available = false;
  private wasm: KernelWasmExports | null = null;

  async init(): Promise<void> {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}kernel.wasm`);
      if (!res.ok) {
        console.warn(`[HARE] kernel.wasm not served (HTTP ${res.status})`);
        return;
      }
      const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {});
      this.wasm = instance.exports as unknown as KernelWasmExports;
      const probe = this.execute('ident');
      if (!probe) {
        console.warn('[HARE] kernel.wasm probe returned no output');
        this.wasm = null;
        return;
      }
      this.available = true;
      console.log(`[HARE] WASM kernel up → ${probe}`);
    } catch (err) {
      console.warn('[HARE] WASM kernel unavailable — falling back to JS host', err);
    }
  }

  supports(command: string): boolean {
    return CORE_CMDS.has(command);
  }

  execute(raw: string): string | null {
    const w = this.wasm;
    if (!w) return null;
    const input = new TextEncoder().encode(raw);
    if (input.length >= w.env_cap()) return null;
    const view = new Uint8Array(w.memory.buffer, w.env_buf(), w.env_cap());
    view.fill(0);
    view.set(input);
    const n = w.execute(input.length);
    if (n < 0) return null;
    if (n === 0) return '';
    return new TextDecoder().decode(new Uint8Array(w.memory.buffer, w.res_buf(), n));
  }
}

/**
 * Builds the ordered host chain: native (Node + Hare binary) first, then
 * WASM, then the JS fallback implicit in HareBridge. First match wins.
 */
export function createKernelHosts(): KernelHost[] {
  return [new NativeHost(), new WasmHost()];
}