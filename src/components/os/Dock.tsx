import { useWindowManager, type AppId } from '../wm/WindowManager';
import { useContextMenu } from './ContextMenu';
import { APP_REGISTRY } from '../appRegistry';
import { AppGridIcon } from '../icons';

export function Dock() {
  const { windows, open, focus, minimize, focusedId, setActivities, appGridOpen, setAppGridOpen, pinnedApps, togglePinnedApp } = useWindowManager();
  const { showContextMenu } = useContextMenu();

  const handleClick = (id: AppId) => {
    const running = windows.filter((w) => w.app === id);
    if (running.length === 0) {
      open(id);
    } else {
      const active = running.find((w) => w.id === focusedId);
      const anyVisible = running.some((w) => !w.minimized);
      if (!active || !anyVisible) {
        running.forEach((w) => focus(w.id));
      } else {
        running.forEach((w) => minimize(w.id));
      }
    }
    setActivities(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-hare-app') || e.dataTransfer.types.includes('application/x-hare-app-unpin')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('application/x-hare-app') as AppId;
    if (appId && !pinnedApps.includes(appId)) {
      togglePinnedApp(appId);
    }
  };

  return (
    <footer 
      className="dock"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="dock-inner">
        {APP_REGISTRY.filter(app => pinnedApps.includes(app.id as AppId) || windows.some(w => w.app === app.id)).map((app) => {
          const running = windows.some((w) => w.app === app.id && !w.minimized);
          const minimized = windows.some((w) => w.app === app.id && w.minimized);
          return (
            <button
              key={app.id}
              className={`dock-item ${running ? 'running' : ''} ${minimized ? 'minimized' : ''}`}
              title={app.name}
              draggable={pinnedApps.includes(app.id as AppId)}
              onDragStart={(e) => {
                if (!pinnedApps.includes(app.id as AppId)) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.setData('application/x-hare-app-unpin', app.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragEnd={(e) => {
                if (e.dataTransfer.dropEffect === 'none' && pinnedApps.includes(app.id as AppId)) {
                  togglePinnedApp(app.id as AppId);
                }
              }}
              onClick={() => handleClick(app.id)}
              onContextMenu={(e) => {
                showContextMenu(e, [
                  {
                    label: pinnedApps.includes(app.id as AppId) ? 'Unpin from Dock' : 'Pin to Dock',
                    onClick: () => togglePinnedApp(app.id as AppId)
                  }
                ]);
              }}
            >
              <span className="dock-icon">{app.icon}</span>
              <span className="dock-label">{app.name.toUpperCase()}</span>
              <span className="dock-indicator" data-state={running ? 'on' : 'off'} />
            </button>
          );
        })}
        
        <div className="dock-divider" />
        <button
          className={`dock-item ${appGridOpen ? 'active' : ''}`}
          title="Show Applications"
          onClick={() => {
            setActivities(true);
            setAppGridOpen(!appGridOpen);
          }}
        >
          <span className="dock-icon"><AppGridIcon width={24} height={24} /></span>
          <span className="dock-label">APPS</span>
        </button>
      </div>
    </footer>
  );
}