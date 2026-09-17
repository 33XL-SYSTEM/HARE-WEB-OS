export type FSNodeType = 'file' | 'dir';

export interface FSNode {
  name: string;
  path: string;
  type: FSNodeType;
  children: FSNode[];
  content: string;
}

export interface FSNodeInput {
  name: string;
  type: FSNodeType;
  children?: FSNodeInput[];
  content?: string;
}

export function nodeFrom(base: string, input: FSNodeInput): FSNode {
  const path = join(base, input.name);
  return {
    name: input.name,
    path,
    type: input.type,
    children: (input.children ?? []).map((c) => nodeFrom(path, c)),
    content: input.content ?? '',
  };
}

export function normalizePath(input: string, cwd = '/'): string {
  const trimmed = input.trim();
  const isAbsolute = trimmed.startsWith('/');
  const joined = isAbsolute ? trimmed : `${cwd.replace(/\/+$/, '')}/${trimmed}`;
  const parts: string[] = [];
  for (const segment of joined.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      parts.pop();
      continue;
    }
    parts.push(segment);
  }
  return '/' + parts.join('/');
}

export function join(base: string, name: string): string {
  return normalizePath(`${base.replace(/\/+$/, '')}/${name}`);
}

export function parentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

export function basename(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.at(-1) ?? '';
}

export function relativePath(from: string, to: string): string {
  const fromParts = from.split('/').filter(Boolean);
  const toParts = to.split('/').filter(Boolean);
  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) i++;
  const ups = fromParts.length - i;
  const downs = toParts.slice(i);
  return [...Array(ups).fill('..'), ...downs].join('/') || '.';
}

export class VirtualFS {
  private root: FSNode;
  private index = new Map<string, FSNode>();
  private versionCounter = 0;
  private saveTimeout: number | null = null;
  private dbName = 'hare-vfs';
  private storeName = 'files';

  constructor(seed: FSNodeInput[] = [], rootName = '/') {
    this.root = {
      name: rootName,
      path: '/',
      type: 'dir',
      children: seed.map((s) => nodeFrom('/', s)),
      content: '',
    };
    this.reindex();
  }

  private reindex(): void {
    this.index.clear();
    const walk = (node: FSNode) => {
      this.index.set(node.path, node);
      for (const child of node.children) walk(child);
    };
    walk(this.root);
  }

  get version(): number {
    return this.versionCounter;
  }

  exists(path: string): boolean {
    return this.index.has(normalizePath(path));
  }

  get(path: string): FSNode | undefined {
    return this.index.get(normalizePath(path));
  }

  isDir(path: string): boolean {
    return this.get(path)?.type === 'dir';
  }

  isFile(path: string): boolean {
    return this.get(path)?.type === 'file';
  }

  list(path: string): FSNode[] {
    const dir = this.get(path);
    if (!dir || dir.type !== 'dir') return [];
    return [...dir.children].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  readFile(path: string): string {
    const node = this.get(path);
    if (!node || node.type !== 'file') throw new Error(`NO_SUCH_FILE: ${path}`);
    return node.content;
  }

  writeFile(path: string, content: string): void {
    const node = this.get(path);
    if (node) {
      if (node.type === 'dir') throw new Error(`IS_A_DIRECTORY: ${path}`);
      node.content = content;
      this.versionCounter++;
      this.scheduleSave();
      return;
    }
    const parent = this.get(parentPath(path));
    if (!parent || parent.type !== 'dir') throw new Error(`NO_SUCH_DIRECTORY: ${parentPath(path)}`);
    const child: FSNode = {
      name: basename(path),
      path: normalizePath(path),
      type: 'file',
      children: [],
      content,
    };
    parent.children.push(child);
    this.index.set(child.path, child);
    this.versionCounter++;
    this.scheduleSave();
  }

  mkdir(path: string, recursive = true): void {
    const node = this.get(path);
    if (node) return;
    const parentPathStr = parentPath(path);
    if (!this.exists(parentPathStr)) {
      if (!recursive) throw new Error(`NO_SUCH_DIRECTORY: ${parentPathStr}`);
      this.mkdir(parentPathStr, true);
    }
    const parent = this.get(parentPathStr)!;
    const child: FSNode = {
      name: basename(path),
      path: normalizePath(path),
      type: 'dir',
      children: [],
      content: '',
    };
    parent.children.push(child);
    this.index.set(child.path, child);
    this.versionCounter++;
    this.scheduleSave();
  }

  rm(path: string): void {
    const node = this.get(path);
    if (!node || node.path === '/') return;
    const parent = this.get(node.path.split('/').slice(0, -1).join('/') || '/');
    if (parent) {
      parent.children = parent.children.filter((c) => c.path !== node.path);
    }
    const removeSubtree = (n: FSNode) => {
      this.index.delete(n.path);
      n.children.forEach(removeSubtree);
    };
    removeSubtree(node);
    this.versionCounter++;
    this.scheduleSave();
  }

  rename(oldPath: string, newName: string): void {
    const node = this.get(oldPath);
    if (!node || node.path === '/') throw new Error(`CANNOT_RENAME: ${oldPath}`);
    
    // Ensure new path doesn't already exist
    const parentPathStr = parentPath(oldPath);
    const newPath = join(parentPathStr, newName);
    if (this.exists(newPath)) throw new Error(`ALREADY_EXISTS: ${newPath}`);

    // Update node
    node.name = newName;
    node.path = newPath;

    // We must rebuild the paths for all children
    const updatePaths = (n: FSNode, parentP: string) => {
      n.path = join(parentP, n.name);
      n.children.forEach(c => updatePaths(c, n.path));
    };
    node.children.forEach(c => updatePaths(c, node.path));

    // Reindex everything to be safe
    this.reindex();
    
    this.versionCounter++;
    this.scheduleSave();
  }

  find(query: string, limit = 100): FSNode[] {
    const q = query.toLowerCase();
    const results: FSNode[] = [];
    const walk = (node: FSNode) => {
      if (results.length >= limit) return;
      if (node.path !== '/' && (node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q))) {
        results.push(node);
      }
      if (node.type === 'dir') node.children.forEach(walk);
    };
    walk(this.root);
    return results;
  }

  searchContent(query: string, limit = 200): { node: FSNode; line: number; text: string }[] {
    const q = query.toLowerCase();
    const results: { node: FSNode; line: number; text: string }[] = [];
    const walk = (node: FSNode) => {
      if (results.length >= limit) return;
      if (node.type === 'file' && node.content) {
        const lines = node.content.split('\n');
        lines.forEach((text, idx) => {
          if (text.toLowerCase().includes(q)) {
            results.push({ node, line: idx + 1, text });
          }
        });
      }
      node.children.forEach(walk);
    };
    walk(this.root);
    return results;
  }

  flatten(path: string): FSNode[] {
    const rootNode = this.get(path);
    if (!rootNode) return [];
    const out: FSNode[] = [];
    const walk = (node: FSNode) => {
      out.push(node);
      if (node.type === 'dir') node.children.forEach(walk);
    };
    walk(rootNode);
    return out;
  }

  tree(path: string, prefix = ''): string[] {
    const node = this.get(path);
    if (!node) return [];
    if (node.type === 'file') return [];
    const out: string[] = [];
    const children = this.list(path);
    children.forEach((child, i) => {
      const last = i === children.length - 1;
      const connector = last ? '└─' : '├─';
      out.push(`${prefix}${connector} ${child.name}${child.type === 'dir' ? '/' : ''}`);
      if (child.type === 'dir') {
        out.push(...this.tree(child.path, prefix + (last ? '   ' : '│  ')));
      }
    });
    return out;
  }

  // --- Persistence ---

  private scheduleSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = window.setTimeout(() => this.saveState(), 500);
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(this.storeName);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async saveState(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        
        // Strip circular references/unnecessary data for storage if any, 
        // though FSNode doesn't have parent links.
        store.put(this.root, 'root');
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[HARE VFS] Failed to save state', err);
    }
  }

  async restoreState(): Promise<void> {
    try {
      const db = await this.getDB();
      const rootNode = await new Promise<FSNode | undefined>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get('root');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (rootNode) {
        this.root = rootNode;
        this.reindex();
        console.log('[HARE VFS] Restored state from IndexedDB');
      }
    } catch (err) {
      console.warn('[HARE VFS] Failed to restore state', err);
    }
  }
}

export function createPreview(bytes: number): string {
  return bytes.toString();
}