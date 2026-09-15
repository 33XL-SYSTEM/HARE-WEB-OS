import { CloseIcon } from './icons';
import { detectLang } from '../editor/syntax';

export interface TabInfo {
  path: string;
  dirty: boolean;
}

interface TabBarProps {
  tabs: TabInfo[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onCloseAll: () => void;
}

const LANG_DOT: Record<string, string> = {
  ts: 'ts', js: 'js', json: 'json', html: 'html', css: 'css', md: 'md', ha: 'ha', text: 'txt',
};

export function TabBar({ tabs, activePath, onSelect, onClose, onCloseAll }: TabBarProps) {
  return (
    <div className="tabbar">
      <div className="tabbar-tabs">
        {tabs.map((t) => {
          const name = t.path.split('/').pop() ?? t.path;
          const lang = detectLang(t.path);
          return (
            <div
              key={t.path}
              className={`tab ${activePath === t.path ? 'active' : ''}`}
              onClick={() => onSelect(t.path)}
              onAuxClick={(e) => { if (e.button === 1) onClose(t.path); }}
            >
              <span className={`tab-dot ${LANG_DOT[lang] ?? 'txt'}`} />
              <span className="tab-name">{name}</span>
              {t.dirty && <span className="tab-dirty">●</span>}
              <button
                className="tab-close"
                onClick={(e) => { e.stopPropagation(); onClose(t.path); }}
              >
                <CloseIcon width={10} height={10} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="tabbar-actions">
        <button className="tabbar-more" onClick={onCloseAll} title="Close All">✕{''}</button>
      </div>
    </div>
  );
}