import { useMemo, useState } from 'react';
import { useWindowManager } from '../wm/WindowManager';
import { APP_REGISTRY } from '../appRegistry';
import { CloseIcon } from '../icons';

export function Overview() {
  const { windows, activitiesOpen, setActivities, open, focus } = useWindowManager();
  const [query, setQuery] = useState('');

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return APP_REGISTRY;
    return APP_REGISTRY.filter((a) => a.name.toLowerCase().includes(q));
  }, [query]);

  if (!activitiesOpen) return null;

  const close = () => setActivities(false);

  return (
    <div className="overview" onClick={close}>
      <div className="overview-inner" onClick={(e) => e.stopPropagation()}>
        <div className="overview-search-row">
          <input
            autoFocus
            className="overview-search"
            placeholder="Type to search apps…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="overview-close" onClick={close}>
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        {windows.length > 0 && (
          <div className="overview-section">
            <div className="overview-label">OPEN WINDOWS</div>
            <div className="overview-windowgrid">
              {windows.map((w) => (
                <button
                  key={w.id}
                  className="overview-thumb"
                  onClick={() => {
                    focus(w.id);
                    close();
                  }}
                >
                  <span className="overview-thumb-title">
                    {w.app.toUpperCase()} · {w.title}
                  </span>
                  <span className="overview-thumb-rect">▭</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overview-section">
          <div className="overview-label">APPLICATIONS</div>
          <div className="overview-appgrid">
            {filteredApps.map((a) => (
              <button
                key={a.id}
                className="overview-app"
                onClick={() => {
                  open(a.id);
                  close();
                }}
              >
                <span className="overview-app-icon">{a.icon}</span>
                <span className="overview-app-name">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}