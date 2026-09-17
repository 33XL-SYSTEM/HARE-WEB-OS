import type { InstalledRecord } from './types';
import { PM_DB_PATH, PM_LOG_PATH, PM_ROOT } from './types';
import type { VirtualFS } from '../kernel/vfs';

interface DbData {
  format: number;
  installed: Record<string, InstalledRecord>;
}

export class PackageDb {
  private fs: VirtualFS | null = null;

  bind(fs: VirtualFS): void {
    this.fs = fs;
  }

  private get fsx(): VirtualFS {
    if (!this.fs) throw new Error('PackageDb not bound to a filesystem');
    return this.fs;
  }

  load(): Map<string, InstalledRecord> {
    const fs = this.fsx;
    const out = new Map<string, InstalledRecord>();
    if (!fs.exists(PM_DB_PATH)) return out;
    try {
      const data = JSON.parse(fs.readFile(PM_DB_PATH)) as DbData;
      if (data && typeof data === 'object' && data.installed) {
        for (const [name, rec] of Object.entries(data.installed)) out.set(name, rec);
      }
      return out;
    } catch {
      return out;
    }
  }

  save(installed: Map<string, InstalledRecord>): void {
    const fs = this.fsx;
    fs.mkdir(`${PM_ROOT}/db`);
    const data: DbData = { format: 1, installed: Object.fromEntries(installed) };
    fs.writeFile(PM_DB_PATH, JSON.stringify(data, null, 2) + '\n');
  }

  appendLog(line: string): void {
    const fs = this.fsx;
    fs.mkdir(`${PM_ROOT}/logs`);
    const prev = fs.exists(PM_LOG_PATH) ? fs.readFile(PM_LOG_PATH) : '';
    fs.writeFile(PM_LOG_PATH, `${prev}${line}\n`);
  }
}