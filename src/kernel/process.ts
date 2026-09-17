export type ProcessState = 'STARTING' | 'RUNNING' | 'STOPPED' | 'ZOMBIE' | 'EXITED' | 'CRASHED';

export type Signal =
  | 'SIGHUP'
  | 'SIGINT'
  | 'SIGQUIT'
  | 'SIGILL'
  | 'SIGTRAP'
  | 'SIGABRT'
  | 'SIGBUS'
  | 'SIGSEGV'
  | 'SIGTERM'
  | 'SIGCONT'
  | 'SIGSTOP'
  | 'SIGKILL';

export interface Process {
  pid: number;
  ppid: number | null;
  name: string;
  cwd: string;
  state: ProcessState;
  createdAt: number;
  memory: number; // Simulated memory in KB
  children: number[];
  
  // Execution context
  env: Record<string, string>;
  argv: string[];
  
  // IO Buffers (IPC)
  stdout: string[];
  stderr: string[];
  stdinPending: string;
  
  exitCode: number | null;
}

export class Scheduler {
  private processes = new Map<number, Process>();
  private nextPid = 100;
  
  // Event listeners for IPC (UI integration)
  private listeners: Array<(pid: number, event: 'spawn' | 'kill' | 'state_change' | 'io') => void> = [];

  spawn(name: string, cwd: string = '/', ppid: number | null = null, argv: string[] = [], env: Record<string, string> = {}): Process {
    const p: Process = {
      pid: this.nextPid++,
      ppid,
      name,
      cwd,
      state: 'RUNNING',
      createdAt: Date.now(),
      memory: this.simulateMemory(name),
      children: [],
      env,
      argv,
      stdout: [],
      stderr: [],
      stdinPending: '',
      exitCode: null,
    };
    
    if (ppid !== null) {
      const parent = this.processes.get(ppid);
      if (parent) parent.children.push(p.pid);
    }
    
    this.processes.set(p.pid, p);
    this.notifyListeners(p.pid, 'spawn');
    return p;
  }

  private simulateMemory(name: string): number {
    // Return mock memory based on app name for more realism
    if (name.includes('code')) return 80 * 1024; // 80 MB
    if (name.includes('files')) return 25 * 1024; // 25 MB
    if (name.includes('terminal')) return 15 * 1024; // 15 MB
    if (name.includes('monitor')) return 12 * 1024; // 12 MB
    return Math.floor(Math.random() * 4096) + 1024; // 1-5MB generic
  }

  signal(pid: number, sig: Signal): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;

    switch (sig) {
      case 'SIGKILL':
      case 'SIGTERM':
      case 'SIGINT':
      case 'SIGHUP':
        this.kill(pid, sig === 'SIGKILL' ? 9 : 15);
        break;
      case 'SIGSTOP':
        p.state = 'STOPPED';
        this.notifyListeners(pid, 'state_change');
        break;
      case 'SIGCONT':
        p.state = 'RUNNING';
        this.notifyListeners(pid, 'state_change');
        break;
      default:
        // Ignore others for now
        break;
    }
    return true;
  }

  kill(pid: number, exitCode: number = 0): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;
    
    p.state = 'ZOMBIE';
    p.exitCode = exitCode;
    
    // Cleanup children recursively
    for (const childPid of p.children) {
      this.kill(childPid, exitCode);
    }
    
    this.processes.delete(pid);
    this.notifyListeners(pid, 'kill');
    return true;
  }

  get(pid: number): Process | undefined {
    return this.processes.get(pid);
  }

  list(): Process[] {
    return Array.from(this.processes.values()).sort((a, b) => a.pid - b.pid);
  }

  writeStdin(pid: number, data: string): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;
    p.stdinPending += data;
    this.notifyListeners(pid, 'io');
    return true;
  }

  writeStdout(pid: number, data: string): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;
    p.stdout.push(data);
    this.notifyListeners(pid, 'io');
    return true;
  }

  writeStderr(pid: number, data: string): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;
    p.stderr.push(data);
    this.notifyListeners(pid, 'io');
    return true;
  }

  readStdout(pid: number): string[] {
    const p = this.processes.get(pid);
    if (!p) return [];
    const out = [...p.stdout];
    p.stdout = [];
    return out;
  }
  
  readStderr(pid: number): string[] {
    const p = this.processes.get(pid);
    if (!p) return [];
    const out = [...p.stderr];
    p.stderr = [];
    return out;
  }

  onEvent(cb: (pid: number, event: 'spawn' | 'kill' | 'state_change' | 'io') => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners(pid: number, event: 'spawn' | 'kill' | 'state_change' | 'io'): void {
    for (const listener of this.listeners) {
      try {
        listener(pid, event);
      } catch (err) {
        console.error('[HARE SCHEDULER] Listener error', err);
      }
    }
  }
}
