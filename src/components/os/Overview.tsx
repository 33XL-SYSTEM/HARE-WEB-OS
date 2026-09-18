import { useMemo, useState } from 'react';
import { useWindowManager, type AppId } from '../wm/WindowManager';
import { useContextMenu } from './ContextMenu';
import { APP_REGISTRY } from '../appRegistry';
import { SearchIcon } from '../icons';

export function Overview() {
  const { 
    activitiesOpen, 
    setActivities, 
    open, 
    appGridOpen,
    setAppGridOpen,
    pinnedApps,
    togglePinnedApp
  } = useWindowManager();
  const { showContextMenu } = useContextMenu();
  const [query, setQuery] = useState('');

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    const unpinned = APP_REGISTRY.filter((a) => !pinnedApps.includes(a.id as AppId));
    if (!q) return unpinned;
    return unpinned.filter((a) => a.name.toLowerCase().includes(q));
  }, [query, pinnedApps]);

  if (!activitiesOpen) return null;

  const close = () => {
    setActivities(false);
    setAppGridOpen(false);
  };

  return (
    <div className={`overview ${appGridOpen ? 'app-grid-open' : ''}`} onClick={close}>
      <div className="overview-inner" onClick={(e) => e.stopPropagation()}>
        <div className="overview-search-row">
          <input
            autoFocus
            className="overview-search"
            placeholder="Type to search apps…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="overview-search-icon">
            <SearchIcon width={18} height={18} />
          </div>
        </div>

        {appGridOpen && (
          <div className="overview-section">
            <div className="overview-label">APPLICATIONS</div>
            <div className="overview-appgrid">
              {filteredApps.map((a) => (
                <button
                  key={a.id}
                  className="overview-app"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-hare-app', a.id);
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onClick={() => {
                    open(a.id as AppId);
                    setAppGridOpen(false);
                    close();
                  }}
                  onContextMenu={(e) => {
                    showContextMenu(e, [
                      {
                        label: pinnedApps.includes(a.id as AppId) ? 'Unpin from Dock' : 'Pin to Dock',
                        onClick: () => togglePinnedApp(a.id as AppId)
                      }
                    ]);
                  }}
                >
                  <span className="overview-app-icon">{a.icon}</span>
                  <span className="overview-app-name">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}