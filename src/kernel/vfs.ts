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
}

export function createPreview(bytes: number): string {
  return bytes.toString();
}