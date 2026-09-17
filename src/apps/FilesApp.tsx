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

type DialogState = {
  isOpen: boolean;
  type: 'delete' | 'rename' | 'newFile' | 'newDir' | null;
  inputValue: string;
  targetPath: string | null;
};

const SIDEBAR_LINKS = [
  { name: 'Home', path: '/workspace/hare-user' },
  { name: 'Área de trabalho', path: '/workspace/hare-user/Área de trabalho' },
  { name: 'Documentos', path: '/workspace/hare-user/Documentos' },
  { name: 'Downloads', path: '/workspace/hare-user/Downloads' },
  { name: 'Imagens', path: '/workspace/hare-user/Imagens' },
  { name: 'Músicas', path: '/workspace/hare-user/Músicas' },
  { name: 'Vídeos', path: '/workspace/hare-user/Vídeos' },
  { name: 'Lixeira', path: '/tmp' }, // Fake trash for now
];

export function FilesApp({ onOpenInCode }: FilesAppProps) {
  const [cwd, setCwd] = useState(kernel.cwd);
  const [selection, setSelection] = useState<string | null>(null);
  
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: null,
    inputValue: '',
    targetPath: null,
  });

  const entries = useMemo<DirEntry[]>(() => {
    return kernel.listDir(cwd).map((n) => {
      const node = kernel.fs.get(n.path);
      const size = node && node.type === 'file' ? node.content.length : 0;
      return { ...n, size };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cwd, kernel.fs.version]);

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
    setCwd((c) => c);
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
      setSelection(null);
    } else {
      onOpenInCode(e.path);
    }
  };

  const openDialog = (type: DialogState['type']) => {
    if ((type === 'delete' || type === 'rename') && !selection) return;
    
    let initialValue = '';
    if (type === 'newFile') initialValue = 'untitled.ts';
    if (type === 'newDir') initialValue = 'untitled';
    if (type === 'rename' && selection) initialValue = selection.split('/').pop() || '';

    setDialog({
      isOpen: true,
      type,
      targetPath: selection,
      inputValue: initialValue,
    });
  };

  const closeDialog = () => {
    setDialog(d => ({ ...d, isOpen: false }));
  };

  const submitDialog = (e?: React.FormEvent) => {
    e?.preventDefault();
    const { type, inputValue, targetPath } = dialog;
    
    try {
      if (type === 'newFile' && inputValue) {
        kernel.createFile(`${cwd}/${inputValue}`);
      } else if (type === 'newDir' && inputValue) {
        kernel.createDir(`${cwd}/${inputValue}`);
      } else if (type === 'delete' && targetPath) {
        kernel.deletePath(targetPath);
        setSelection(null);
      } else if (type === 'rename' && targetPath && inputValue) {
        const oldName = targetPath.split('/').pop();
        if (inputValue !== oldName) {
          kernel.renamePath(targetPath, inputValue);
          setSelection(null);
        }
      }
    } catch (err: any) {
      // Very basic error handling, could also be a modal
      alert(err.message);
    }
    
    closeDialog();
    refresh();
  };

  const fmtSize = (n: number) => {
    if (n < 1000) return `${n} B`;
    if (n < 1_000_000) return `${(n / 1000).toFixed(1)} KB`;
    return `${(n / 1_000_000).toFixed(1)} MB`;
  };

  return (
    <div className="app files-app">
      <div className="files-sidebar">
        <div className="files-sidebar-title">Lugares</div>
        {SIDEBAR_LINKS.map(link => (
          <button 
            key={link.path}
            className={`files-sidebar-link ${cwd === link.path ? 'active' : ''}`}
            onClick={() => { setCwd(link.path); setSelection(null); }}
          >
            {link.name}
          </button>
        ))}
      </div>
      
      <div className="files-main">
        <div className="files-toolbar">
          <div className="files-actions">
            <button onClick={goUp} title="Up">↑</button>
            <div className="files-crumbs">
              <button className="crumb-btn" onClick={() => setCwd('/')}>/</button>
              {crumb.slice(1).map((c) => (
                <span key={c.path} className="crumb-seg">
                  <ChevronRightIcon width={10} height={10} />
                  <button className="crumb-btn" onClick={() => setCwd(c.path)}>{c.name}</button>
                </span>
              ))}
            </div>
          </div>
          <div className="files-actions">
            <button onClick={() => openDialog('newFile')} title="Novo Arquivo"><NewFileIcon width={14} height={14} /></button>
            <button onClick={() => openDialog('newDir')} title="Nova Pasta"><NewDirIcon width={14} height={14} /></button>
            <button onClick={() => openDialog('rename')} disabled={!selection} title="Renomear" style={{ fontSize: '10px' }}>R</button>
            <button onClick={() => openDialog('delete')} disabled={!selection} title="Deletar"><TrashIcon width={14} height={14} /></button>
            <button onClick={refresh} title="Atualizar"><RefreshIcon width={14} height={14} /></button>
          </div>
        </div>

        <div className="files-header">
          <span className="fh-name">NOME</span>
          <span className="fh-meta">TIPO</span>
          <span className="fh-meta">TAMANHO</span>
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
              <span className="fr-meta">{e.type === 'dir' ? 'Pasta' : (e.name.split('.').pop() ?? 'Arquivo')}</span>
              <span className="fr-meta">{e.type === 'dir' ? '—' : fmtSize(e.size)}</span>
            </button>
          ))}
          {entries.length === 0 && (
            <div className="files-empty">
              PASTA VAZIA <CloseIcon width={12} height={12} />
            </div>
          )}
        </div>
      </div>

      {dialog.isOpen && (
        <div className="files-dialog-overlay" onClick={closeDialog}>
          <div className="files-dialog" onClick={e => e.stopPropagation()}>
            <form onSubmit={submitDialog}>
              <h3>
                {dialog.type === 'delete' && 'Deletar Item'}
                {dialog.type === 'rename' && 'Renomear'}
                {dialog.type === 'newFile' && 'Novo Arquivo'}
                {dialog.type === 'newDir' && 'Nova Pasta'}
              </h3>
              
              {dialog.type === 'delete' ? (
                <p>Tem certeza que deseja deletar <b>{dialog.targetPath?.split('/').pop()}</b>?</p>
              ) : (
                <input 
                  type="text" 
                  value={dialog.inputValue}
                  onChange={(e) => setDialog({ ...dialog, inputValue: e.target.value })}
                  autoFocus
                />
              )}

              <div className="files-dialog-actions">
                <button type="button" className="btn-secondary" onClick={closeDialog}>Cancelar</button>
                <button type="submit" className={dialog.type === 'delete' ? 'btn-danger' : 'btn-primary'}>
                  {dialog.type === 'delete' ? 'Deletar' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}