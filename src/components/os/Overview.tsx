import { useMemo, useState } from 'react';
import { useWindowManager } from '../wm/WindowManager';
import { APP_REGISTRY } from '../appRegistry';
import { SearchIcon } from '../icons';

export function Overview() {
  const { 
    activitiesOpen, 
    setActivities, 
    open, 
    appGridOpen,
    setAppGridOpen
  } = useWindowManager();
  const [query, setQuery] = useState('');

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return APP_REGISTRY;
    return APP_REGISTRY.filter((a) => a.name.toLowerCase().includes(q));
  }, [query]);

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
                  onClick={() => {
                    open(a.id);
                    setAppGridOpen(false);
                    close();
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