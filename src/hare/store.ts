import type { PackageBundle, PackageMeta, Repository } from './types';
import { PM_LISTS_DIR, PM_REPOS_PATH, PM_ROOT } from './types';
import { EMBEDDED_CATALOG, EMBEDDED_REPOS, embeddedBundle } from './seeds';
import { compareVersions } from './versions';
import type { VirtualFS } from '../kernel/vfs';

function toMeta(b: PackageBundle): PackageMeta {
  const { files: _files, ...meta } = b;
  return meta;
}

async function fetchMetaIndex(repo: Repository): Promise<PackageMeta[]> {
  const res = await fetch(`${repo.url}/packages.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { packages?: PackageMeta[] };
  return (data.packages ?? []).filter((p) => p && typeof p.name === 'string');
}

async function fetchBundleIndex(repo: Repository, name: string): Promise<PackageBundle | null> {
  try {
    const res = await fetch(`${repo.url}/packages/${encodeURIComponent(name)}.json`);
    if (!res.ok) return null;
    const data = (await res.json()) as PackageBundle;
    return data && data.name === name ? data : null;
  } catch {
    return null;
  }
}

export class PackageStore {
  private fs: VirtualFS | null = null;
  private repositories: Repository[] = EMBEDDED_REPOS.map((r) => ({ ...r }));
  private lists = new Map<string, Map<string, PackageMeta[]>>();

  bind(fs: VirtualFS): void {
    this.fs = fs;
  }

  private get fsx(): VirtualFS {
    if (!this.fs) throw new Error('PackageStore not bound to a filesystem');
    return this.fs;
  }

  /** Merges persisted repo config on top of embedded defaults. */
  loadState(): void {
    const fs = this.fsx;
    if (fs.exists(PM_REPOS_PATH)) {
      try {
        const persisted = JSON.parse(fs.readFile(PM_REPOS_PATH)) as Repository[];
        if (Array.isArray(persisted)) {
          this.repositories = persisted.filter(
            (r) =>
              r && typeof r.name === 'string' && EMBEDDED_REPOS.some((e) => e.name === r.name),
          );
        }
      } catch {
        this.repositories = EMBEDDED_REPOS.map((r) => ({ ...r }));
      }
    }
    for (const def of EMBEDDED_REPOS) {
      if (!this.repositories.some((r) => r.name === def.name)) this.repositories.push({ ...def });
    }
  }

  persistRepos(): void {
    const fs = this.fsx;
    fs.mkdir(PM_ROOT);
    fs.writeFile(PM_REPOS_PATH, JSON.stringify(this.repositories, null, 2) + '\n');
  }

  getRepos(): Repository[] {
    return this.repositories.map((r) => ({ ...r }));
  }

  async refresh(): Promise<string[]> {
    const fs = this.fsx;
    fs.mkdir(PM_LISTS_DIR);
    const messages: string[] = [];
    for (const repo of this.repositories) {
      if (!repo.enabled) continue;
      let metas: PackageMeta[] = [];
      try {
        if (repo.kind === 'embedded') {
          metas = EMBEDDED_CATALOG.filter((b) => b.repo === repo.name).map(toMeta);
        } else {
          metas = await fetchMetaIndex(repo);
        }
      } catch (err) {
        messages.push(`Err: ${repo.name} ${repo.url} — failed to fetch (${err instanceof Error ? err.message : String(err)})`);
        continue;
      }
      if (metas.length === 0) {
        messages.push(`W: no candidate packages found in ${repo.name}`);
      }
      const grouped = new Map<string, PackageMeta[]>();
      for (const m of metas) {
        const list = grouped.get(m.name) ?? [];
        list.push(m);
        grouped.set(m.name, list);
      }
      this.lists.set(repo.name, grouped);
      fs.writeFile(`${PM_LISTS_DIR}/${repo.name}.json`, JSON.stringify(metas, null, 2) + '\n');
      const count = grouped.size;
      messages.push(`Get:1 ${repo.name} — [${count} unique package${count === 1 ? '' : 's'}]`);
    }
    return messages;
  }

  /** All candidates from enabled repositories, newest first per name. */
  candidates(): Map<string, PackageMeta[]> {
    const out = new Map<string, PackageMeta[]>();
    for (const repo of this.repositories) {
      if (!repo.enabled) continue;
      const list = this.lists.get(repo.name);
      if (!list) continue;
      for (const [name, metas] of list) {
        const prev = out.get(name) ?? [];
        out.set(name, [...prev, ...metas]);
      }
    }
    for (const metas of out.values()) {
      metas.sort((a, b) => compareVersions(b.version, a.version));
    }
    return out;
  }

  async bundle(repo: string, name: string): Promise<PackageBundle | null> {
    const r = this.repositories.find((x) => x.name === repo);
    if (!r) return null;
    if (r.kind === 'embedded') return embeddedBundle(repo, name);
    return fetchBundleIndex(r, name);
  }
}