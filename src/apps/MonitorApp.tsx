import { useEffect, useState } from 'react';
import { kernel } from '../kernel/HareBridge';

interface Proc {
  pid: number;
  name: string;
  cpu: string;
  mem: string;
  state: string;
}

function seedProcs(): Proc[] {
  return [
    { pid: 1, name: 'kernel', cpu: '2.1', mem: '48MB', state: 'S' },
    { pid: 2, name: 'compositor', cpu: '7.4', mem: '82MB', state: 'R' },
    { pid: 3, name: 'shell', cpu: '1.9', mem: '22MB', state: 'S' },
    { pid: 4, name: 'vfsd', cpu: '0.4', mem: '9MB', state: 'S' },
    { pid: 5, name: 'npm run dev', cpu: '14.2', mem: '160MB', state: 'R' },
    { pid: 6, name: 'kernel.wasm', cpu: '5.6', mem: '64MB', state: 'R' },
    { pid: 7, name: 'tx-bridge', cpu: '1.2', mem: '18MB', state: 'S' },
  ];
}

export function MonitorApp() {
  const [procs, setProcs] = useState<Proc[]>(seedProcs);
  const [cpu, setCpu] = useState(38);
  const [mem, setMem] = useState(62);

  useEffect(() => {
    const id = setInterval(() => {
      setProcs((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: (Math.random() * 20 + 0.2).toFixed(1),
          state: Math.random() > 0.7 ? 'R' : 'S',
        })),
      );
      setCpu(Math.floor(20 + Math.random() * 55));
      setMem(Math.floor(45 + Math.random() * 35));
    }, 1200);
    return () => clearInterval(id);
  }, []);

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
          <span className="gauge-val gauge-up">{kernel.uptime}</span>
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
            <th>PID</th><th>NAME</th><th>CPU%</th><th>MEM</th><th>STATE</th>
          </tr>
        </thead>
        <tbody>
          {procs.map((p) => (
            <tr key={p.pid}>
              <td>{p.pid}</td>
              <td>{p.name}</td>
              <td>{p.cpu}</td>
              <td>{p.mem}</td>
              <td className={`proc-state ${p.state === 'R' ? 'run' : ''}`}>{p.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}