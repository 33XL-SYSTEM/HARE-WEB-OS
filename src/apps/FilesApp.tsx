import { useCallback, useMemo, useState } from 'react';
import { kernel } from '../kernel/HareBridge';
import {
  FileIcon,
  DirIcon,
  NewFileIcon,
  NewDirIcon,
  RefreshIcon,
  TrashIcon,
  ChevronRightIcon,
  CloseIcon,
} from '../components/icons';

interface FilesAppProps {
  onOpenInCode: (path: string) => void;
}

interface DirEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
}

export function FilesApp({ onOpenInCode }: FilesAppProps) {
  const [cwd, setCwd] = useState(kernel.cwd);
  const [selection, setSelection] = useState<string | null>(null);

  const entries = useMemo<DirEntry[]>(() => {
    return kernel.listDir(cwd).map((n) => {
      const node = kernel.fs.get(n.path);
      const size = node && node.type === 'file' ? node.content.length : 0;
      return { ...n, size };
    });
  }, [cwd]);

  const crumb = useMemo(() => {
    const parts = cwd.split('/').filter(Boolean);
    let acc = '/';
    const items = [{ name: '/', path: acc }];
    parts.forEach((p) => {
      acc = acc === '/' ? `/${p}` : `${acc}/${p}`;
      items.push({ name: p, path: acc });
    });
    return items;
  }, [cwd]);

  const refresh = useCallback(() => {
    setCwd((c) => c); // force re-render via memo dep change
    setSelection(null);
  }, []);

  const goUp = () => {
    const parent = cwd.slice(0, cwd.lastIndexOf('/')) || '/';
    setCwd(parent);
    setSelection(null);
  };

  const openEntry = (e: DirEntry) => {
    setSelection(e.path);
    if (e.type === 'dir') {
      setCwd(e.path);
    } else {
      onOpenInCode(e.path);
    }
  };

  const handleNewFile = () => {
    const name = window.prompt('New file name', 'untitled.ts');
    if (!name) return;
    kernel.createFile(`${cwd}/${name}`);
    refresh();
  };

  const handleNewDir = () => {
    const name = window.prompt('New folder name', 'untitled');
    if (!name) return;
    kernel.createDir(`${cwd}/${name}`);
    refresh();
  };

  const handleDelete = () => {
    if (!selection) return;
    if (!window.confirm(`Delete ${selection}?`)) return;
    kernel.deletePath(selection);
    setSelection(null);
  };

  const fmtSize = (n: number) => {
    if (n < 1000) return `${n} B`;
    if (n < 1_000_000) return `${(n / 1000).toFixed(1)} KB`;
    return `${(n / 1_000_000).toFixed(1)} MB`;
  };

  return (
    <div className="app files-app">
      <div className="files-toolbar">
        <div className="files-crumbs">
          <button className="crumb-btn" onClick={() => setCwd('/')}>/</button>
          {crumb.slice(1).map((c) => (
            <span key={c.path} className="crumb-seg">
              <ChevronRightIcon width={10} height={10} />
              <button className="crumb-btn" onClick={() => setCwd(c.path)}>{c.name}</button>
            </span>
          ))}
        </div>
        <div className="files-actions">
          <button onClick={goUp} title="Up">↑</button>
          <button onClick={handleNewFile} title="New File"><NewFileIcon width={14} height={14} /></button>
          <button onClick={handleNewDir} title="New Folder"><NewDirIcon width={14} height={14} /></button>
          <button onClick={handleDelete} disabled={!selection} title="Delete"><TrashIcon width={14} height={14} /></button>
          <button onClick={refresh} title="Refresh"><RefreshIcon width={14} height={14} /></button>
        </div>
      </div>

      <div className="files-header">
        <span className="fh-name">NAME</span>
        <span className="fh-meta">TYPE</span>
        <span className="fh-meta">SIZE</span>
      </div>

      <div className="files-body">
        {entries.map((e) => (
          <button
            key={e.path}
            className={`files-row ${selection === e.path ? 'selected' : ''}`}
            onDoubleClick={() => openEntry(e)}
            onClick={() => setSelection(e.path)}
          >
            <span className="fr-name">
              {e.type === 'dir' ? <DirIcon width={14} height={14} /> : <FileIcon width={14} height={14} />}
              <span className="fr-name-text">{e.name}</span>
            </span>
            <span className="fr-meta">{e.type === 'dir' ? 'folder' : (e.name.split('.').pop() ?? 'file')}</span>
            <span className="fr-meta">{e.type === 'dir' ? '—' : fmtSize(e.size)}</span>
          </button>
        ))}
        {entries.length === 0 && (
          <div className="files-empty">
            EMPTY DIRECTORY <CloseIcon width={12} height={12} />
          </div>
        )}
      </div>
    </div>
  );
}