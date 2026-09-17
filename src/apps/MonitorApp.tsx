import { useEffect, useState } from 'react';
import { kernel } from '../kernel/HareBridge';
import type { Process } from '../kernel/process';

export function MonitorApp() {
  const [procs, setProcs] = useState<Process[]>([]);
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);
  const [uptime, setUptime] = useState(kernel.uptime);

  useEffect(() => {
    // Initial fetch
    setProcs(kernel.scheduler.list());

    const unsub = kernel.scheduler.onEvent(() => {
      setProcs(kernel.scheduler.list());
    });

    const id = setInterval(() => {
      // Force refresh to simulate active resource usage updates
      setProcs([...kernel.scheduler.list()]);
      setUptime(kernel.uptime);
      
      const ps = kernel.scheduler.list();
      
      // Calculate realistic total mem based on sum
      let totalMem = ps.reduce((acc, p) => acc + p.memory, 0); // KB
      let memPct = Math.min(100, Math.floor((totalMem / (1024 * 1024)) * 100)); // Assumes 1GB total RAM
      setMem(Math.max(2, memPct)); // Minimum baseline 2%

      // Mock total CPU based on active processes
      let activeCount = ps.filter(p => p.state === 'RUNNING').length;
      let cpuPct = Math.min(100, activeCount * 5 + Math.floor(Math.random() * 10)); 
      setCpu(Math.max(1, cpuPct));
    }, 1000);

    return () => {
      unsub();
      clearInterval(id);
    };
  }, []);

  const formatMem = (kb: number) => {
    if (kb > 1024 * 1024) return (kb / (1024 * 1024)).toFixed(1) + ' GB';
    if (kb > 1024) return (kb / 1024).toFixed(1) + ' MB';
    return kb + ' KB';
  };
  
  const getSimulatedCpu = (p: Process) => {
    if (p.state !== 'RUNNING') return '0.0';
    if (p.name.includes('code')) return (Math.random() * 5 + 1).toFixed(1);
    if (p.name.includes('terminal')) return (Math.random() * 3).toFixed(1);
    return (Math.random() * 2).toFixed(1);
  };

  return (
    <div className="app monitor-app">
      <div className="monitor-gauges">
        <div className="gauge">
          <span className="gauge-label">CPU</span>
          <div className="gauge-bar"><div className="gauge-fill" style={{ width: `${cpu}%` }} /></div>
          <span className="gauge-val">{cpu}%</span>
        </div>
        <div className="gauge">
          <span className="gauge-label">MEM</span>
          <div className="gauge-bar"><div className="gauge-fill" style={{ width: `${mem}%` }} /></div>
          <span className="gauge-val">{mem}%</span>
        </div>
        <div className="gauge gauge-none">
          <span className="gauge-label">UPTIME</span>
          <span className="gauge-val gauge-up">{uptime}</span>
        </div>
      </div>

      <div className="monitor-engines">
        {kernel.engines.map((e) => (
          <span key={e} className={`engine-chip ${e}`}>{e}</span>
        ))}
      </div>

      <table className="proc-table">
        <thead>
          <tr>
            <th>PID</th><th>PPID</th><th>NAME</th><th>CPU%</th><th>MEM</th><th>STATE</th>
          </tr>
        </thead>
        <tbody>
          {procs.map((p) => (
            <tr key={p.pid}>
              <td>{p.pid}</td>
              <td>{p.ppid !== null ? p.ppid : '-'}</td>
              <td>{p.name}</td>
              <td>{getSimulatedCpu(p)}</td>
              <td>{formatMem(p.memory)}</td>
              <td className={`proc-state ${p.state === 'RUNNING' ? 'run' : ''}`}>{p.state}</td>
            </tr>
          ))}
          {procs.length === 0 && (
            <tr>
              <td colSpan={6} style={{textAlign: 'center', opacity: 0.5}}>No processes running</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}