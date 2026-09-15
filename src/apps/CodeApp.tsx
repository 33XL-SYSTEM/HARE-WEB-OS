import { useCallback, useEffect, useMemo, useState } from 'react';
import { kernel } from '../kernel/HareBridge';
import { EditorPane } from '../components/EditorPane';
import { TabBar, type TabInfo } from '../components/TabBar';
import { detectLang, LANG_LABEL } from '../editor/syntax';
import type { TextPosition } from '../editor/engine';

interface CodeTab {
  path: string;
  content: string;
  dirty: boolean;
}

interface CodeAppProps {
  initialPath?: string;
  openedPath?: string;
}

export function CodeApp({ initialPath, openedPath }: CodeAppProps) {
  const [tabs, setTabs] = useState<CodeTab[]>(() => {
    if (!initialPath) return [];
    let content = '';
    try {
      content = kernel.readFile(initialPath);
    } catch {
      content = '';
    }
    return [{ path: initialPath, content, dirty: false }];
  });
  const [activePath, setActivePath] = useState<string | null>(initialPath ?? null);
  const [cursor, setCursor] = useState<TextPosition>({ line: 0, col: 0 });

  useEffect(() => {
    if (!openedPath) return;
    setTabs((prev) => {
      if (prev.some((t) => t.path === openedPath)) {
        setActivePath(openedPath);
        return prev;
      }
      let content = '';
      try {
        content = kernel.readFile(openedPath);
      } catch {
        content = '';
      }
      setActivePath(openedPath);
      return [...prev, { path: openedPath, content, dirty: false }];
    });
  }, [openedPath]);

  const updateContent = useCallback((path: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.path === path ? { ...t, content, dirty: true } : t)),
    );
  }, []);

  const save = useCallback(
    (path: string) => {
      const tab = tabs.find((t) => t.path === path);
      if (!tab) return;
      kernel.writeFile(path, tab.content);
      setTabs((prev) => prev.map((t) => (t.path === path ? { ...t, dirty: false } : t)));
    },
    [tabs],
  );

  const closeTab = useCallback((path: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.path === path);
      const next = prev.filter((t) => t.path !== path);
      setActivePath((a) => {
        if (a !== path) return a;
        const fb = next[Math.min(idx, next.length - 1)];
        return fb ? fb.path : null;
      });
      return next;
    });
  }, []);

  const activeTab = tabs.find((t) => t.path === activePath) ?? null;
  const langLabel = activeTab ? LANG_LABEL[detectLang(activeTab.path)] : null;

  const tabInfos = useMemo<TabInfo[]>(
    () => tabs.map((t) => ({ path: t.path, dirty: t.dirty })),
    [tabs],
  );

  return (
    <div className="app code-app">
      {tabs.length === 0 ? (
        <div className="code-blank">
          <span>CODE — OPEN A FILE FROM FILES</span>
        </div>
      ) : (
        <>
          <TabBar
            tabs={tabInfos}
            activePath={activePath}
            onSelect={setActivePath}
            onClose={closeTab}
            onCloseAll={() => {
              setTabs([]);
              setActivePath(null);
            }}
          />
          {activeTab ? (
            <EditorPane
              key={activeTab.path}
              path={activeTab.path}
              value={activeTab.content}
              onChange={(v) => updateContent(activeTab.path, v)}
              onCursor={setCursor}
              onSave={() => save(activeTab.path)}
            />
          ) : (
            <div className="code-blank">NO FILE OPEN</div>
          )}
        </>
      )}
      <div className="code-statusbar">
        <span>{langLabel ?? '—'}</span>
        <span>
          Ln {cursor.line + 1}, Col {cursor.col + 1}
        </span>
        <span className="code-statusbar-right">HARE ENGINE v0.1</span>
      </div>
    </div>
  );
}