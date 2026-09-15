import { useEffect, useState } from 'react';
import { useWindowManager } from '../wm/WindowManager';
import { LayoutIcon, WifiIcon, PowerIcon, UserIcon } from '../icons';

export function TopBar() {
  const { setActivities, windows, focusedId } = useWindowManager();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const focused = windows.find((w) => w.id === focusedId);
  const running = windows.filter((w) => !w.minimized).length;
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
        <span className="topbar-chip" title="Network (mock)">
          <WifiIcon width={13} height={13} />
        </span>
        <span className="topbar-chip" title="Power">
          <PowerIcon width={13} height={13} />
        </span>
        <span className="topbar-chip topbar-user" title="hare_admin">
          <UserIcon width={13} height={13} />
          <span>HARE</span>
        </span>
        <span className="topbar-running" title="Running windows">{running} WIN</span>
      </div>
    </header>
  );
}