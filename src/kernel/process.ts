export type ProcessState = 'RUNNING' | 'STOPPED' | 'ZOMBIE';

export interface Process {
  pid: number;
  name: string;
  cwd: string;
  state: ProcessState;
  createdAt: number;
  memory: number; // Simulated memory in KB
}

export class Scheduler {
  private processes = new Map<number, Process>();
  private nextPid = 100;
  
  // Event listeners for IPC (UI integration)
  private listeners: Array<(pid: number, event: 'spawn' | 'kill') => void> = [];

  spawn(name: string, cwd: string = '/'): Process {
    const p: Process = {
      pid: this.nextPid++,
      name,
      cwd,
      state: 'RUNNING',
      createdAt: Date.now(),
      memory: Math.floor(Math.random() * 4096) + 1024, // 1-5MB mock
    };
    this.processes.set(p.pid, p);
    this.notifyListeners(p.pid, 'spawn');
    return p;
  }

  kill(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;
    
    p.state = 'ZOMBIE';
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

  onEvent(cb: (pid: number, event: 'spawn' | 'kill') => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners(pid: number, event: 'spawn' | 'kill'): void {
    for (const listener of this.listeners) {
      try {
        listener(pid, event);
      } catch (err) {
        console.error('[HARE SCHEDULER] Listener error', err);
      }
    }
  }
}
