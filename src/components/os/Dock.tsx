import { useWindowManager, type AppId } from '../wm/WindowManager';
import { APP_REGISTRY } from '../appRegistry';

export function Dock() {
  const { windows, open, focus, minimize, focusedId } = useWindowManager();

  const handleClick = (id: AppId) => {
    const running = windows.filter((w) => w.app === id);
    if (running.length === 0) {
      open(id);
      return;
    }
    const active = running.find((w) => w.id === focusedId);
    const anyVisible = running.some((w) => !w.minimized);
    if (!active || !anyVisible) {
      running.forEach((w) => focus(w.id));
    } else {
      running.forEach((w) => minimize(w.id));
    }
  };

  return (
    <footer className="dock">
      <div className="dock-inner">
        {APP_REGISTRY.map((app) => {
          const running = windows.some((w) => w.app === app.id && !w.minimized);
          const minimized = windows.some((w) => w.app === app.id && w.minimized);
          return (
            <button
              key={app.id}
              className={`dock-item ${running ? 'running' : ''} ${minimized ? 'minimized' : ''}`}
              title={app.name}
              onClick={() => handleClick(app.id)}
            >
              <span className="dock-icon">{app.icon}</span>
              <span className="dock-label">{app.name.toUpperCase()}</span>
              <span className="dock-indicator" data-state={running ? 'on' : 'off'} />
            </button>
          );
        })}
      </div>
    </footer>
  );
}