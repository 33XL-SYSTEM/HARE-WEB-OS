import { useEffect, useRef, useState } from 'react';
import { kernel } from '../kernel/HareBridge';
import type { HostEngineId } from '../kernel/hosts';

interface HistoryLine {
  id: number;
  content: string;
  isCommand: boolean;
  cwd?: string;
  engine?: HostEngineId;
}

interface TerminalProps {
  ready: boolean;
  onCwdChange?: (cwd: string) => void;
  onOpenFile?: (path: string) => void;
}

export function Terminal({ ready, onCwdChange, onOpenFile }: TerminalProps) {
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(kernel.cwd);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!ready) return;
    setHistory([
      { id: ++idRef.current, content: 'HARE-OS SHELL — type "help"', isCommand: false },
      { id: ++idRef.current, content: `cwd: ${kernel.cwd}`, isCommand: false },
    ]);
  }, [ready]);

  useEffect(() => {
    onCwdChange?.(cwd);
  }, [cwd, onCwdChange]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const push = (
    lines: string[],
    isCommand: boolean,
    commandCwd = cwd,
    engine?: HostEngineId,
  ) => {
    setHistory((prev) => [
      ...prev,
      ...lines.map((content) => ({
        id: ++idRef.current,
        content,
        isCommand,
        cwd: commandCwd,
        engine,
      })),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    setInput('');

    const first = raw.split(/\s+/)[0]!.toLowerCase();

    if (first === 'clear') {
      setHistory([]);
      return;
    }

    push([raw], true);

    if ((first === 'open' || first === 'edit') && onOpenFile) {
      const target = raw.split(/\s+/).slice(1).join(' ').trim();
      if (target) {
        const resolved = kernel.resolvePath(target);
        if (kernel.exists(resolved)) {
          onOpenFile(resolved);
          push([`opening ${resolved} in editor`], false);
          return;
        }
        push([`NO_SUCH_FILE: ${target}`], false);
        return;
      }
    }

    try {
      const res = await kernel.executeCommand(raw);
      if (res.cwd) {
        setCwd(res.cwd);
      }
      if (res.text) {
        push(
          res.text.split('\n'),
          false,
          res.cwd ?? cwd,
          res.engine && res.engine !== 'js' ? res.engine : undefined,
        );
      }
    } catch (err) {
      push([err instanceof Error ? err.message : String(err)], false);
    }
  };

  const lastCwd = cwd;

  return (
    <div className="terminal">
      <div className="terminal-head">
        <span className="terminal-title">TERMINAL</span>
        <span className="terminal-dim">BASH-LIKE · HARE SHELL</span>
      </div>
      <div className="terminal-output">
        {history.map((line) => (
          <div key={line.id} className="terminal-line">
            {line.isCommand && (
              <span className="prompt-cwd">{line.cwd ?? lastCwd}</span>
            )}
            {line.isCommand && <span className="prompt-sign">$</span>}
            <span className={line.isCommand ? 'terminal-cmd' : 'terminal-out'}>{line.content}</span>
            {line.engine && <span className="terminal-engine">[{line.engine}]</span>}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {ready && (
        <form onSubmit={handleSubmit} className="terminal-input-row">
          <span className="prompt-cwd">{cwd}</span>
          <span className="prompt-sign">$</span>
          <input
            type="text"
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      )}
    </div>
  );
}