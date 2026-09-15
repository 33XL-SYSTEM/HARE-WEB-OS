import { useEffect, useState } from 'react';
import { kernel } from '../../kernel/HareBridge';

interface BootScreenProps {
  onDone: () => void;
}

const BOOT_LINES = [
  'HARE-OS KERNEL 0.1.0-alpha',
  '> init scheduler ........ ok',
  '> mount VFS ............. ok',
  '> spawn shell ............ ok',
  '> load compositor ........ ok',
  '> launch window manager .. ok',
  '> START DESKTOP',
];

export function BootScreen({ onDone }: BootScreenProps) {
  const [line, setLine] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        await kernel.init();
      } catch (e) {
        console.error('[HARE] boot failed', e);
      }
      const start = Date.now();
      const id = setInterval(() => {
        setLine((l) => {
          const elapsed = Date.now() - start;
          if (l >= BOOT_LINES.length - 1 || elapsed > 3500) {
            clearInterval(id);
            setReady(true);
            setTimeout(onDone, 350);
            return l;
          }
          return l + 1;
        });
      }, 260);
    };
    boot();
    return () => {};
  }, [onDone]);

  return (
    <div className={`boot ${ready ? 'boot-ready' : ''}`}>
      <div className="boot-center">
        <div className="boot-logo">
          <span className="boot-mark">▮▮</span>
          <span className="boot-word">HARE-OS</span>
        </div>
        <div className="boot-console">
          {BOOT_LINES.slice(0, line + 1).map((l, i) => (
            <div key={i} className="boot-line">
              <span className="boot-prefix">[OK]</span>
              {l}
            </div>
          ))}
        </div>
        <div className="boot-progress">
          <div className="boot-bar" style={{ width: `${(line + 1) / BOOT_LINES.length * 100}%` }} />
        </div>
      </div>
    </div>
  );
}