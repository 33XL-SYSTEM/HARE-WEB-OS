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
  const [activePid, setActivePid] = useState<number | null>(null);
  
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const pidRef = useRef<number | null>(null);

  useEffect(() => {
    pidRef.current = activePid;
  }, [activePid]);

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

  // Handle kernel IPC events for the terminal
  useEffect(() => {
    if (!ready) return;
    const unsub = kernel.scheduler.onEvent((eventPid, type) => {
      if (type === 'io') {
        const stdout = kernel.scheduler.readStdout(eventPid);
        const stderr = kernel.scheduler.readStderr(eventPid);
        
        if (stdout.length > 0 || stderr.length > 0) {
          const lines = [...stdout, ...stderr].flatMap(l => l.split('\n'));
          push(lines, false, kernel.cwd);
        }
      } else if (type === 'kill' || type === 'state_change') {
        const p = kernel.scheduler.get(eventPid);
        if (!p || p.state === 'ZOMBIE') {
          if (pidRef.current === eventPid) {
            setActivePid(null);
            setCwd(kernel.cwd);
          }
        }
      }
    });
    return () => unsub();
  }, [ready]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (activePid !== null) {
        push([`^C`], false);
        kernel.scheduler.signal(activePid, 'SIGINT');
      } else {
        push([`${cwd}$ ^C`], false);
        setInput('');
      }
      return;
    }
    
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePid !== null) {
      // Send stdin
      kernel.scheduler.writeStdin(activePid, input + '\n');
      push([input], false); // echo input
      setInput('');
      return;
    }

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
      const pid = kernel.spawnProcess(raw);
      if (pid > 0) {
        setActivePid(pid);
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
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            placeholder={activePid !== null ? 'process running...' : ''}
          />
        </form>
      )}
    </div>
  );
}