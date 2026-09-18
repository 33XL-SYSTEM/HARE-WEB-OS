import { useEffect, useState } from 'react';
import { useWindowManager } from '../wm/WindowManager';
import { LayoutIcon, WifiIcon, PowerIcon, UserIcon } from '../icons';
import { QuickSettings } from './QuickSettings';

export function TopBar() {
  const { setActivities, windows, focusedId } = useWindowManager();
  const [time, setTime] = useState(() => new Date());
  const [qsOpen, setQsOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const focused = windows.find((w) => w.id === focusedId);
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-btn topbar-activities" onClick={() => setActivities(true)} title="Overview">
          <LayoutIcon width={15} height={15} />
          <span>ACTIVITIES</span>
        </button>
        <span className="topbar-title">{focused ? focused.title : 'HARE-OS'}</span>
      </div>

      <div className="topbar-center">
        <span className="topbar-datetime">
          {String(time.getDate()).padStart(2, '0')}/{String(time.getMonth() + 1).padStart(2, '0')} {hh}:{mm}
        </span>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn topbar-qs-btn" onClick={() => setQsOpen(!qsOpen)} title="Quick Settings">
          <WifiIcon width={14} height={14} />
          <PowerIcon width={14} height={14} />
          <UserIcon width={14} height={14} />
        </button>
      </div>

      {qsOpen && <QuickSettings onClose={() => setQsOpen(false)} />}
    </header>
  );
}