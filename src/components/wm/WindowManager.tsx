import {
  useCallback,
  useContext,
  useEffect,
  useState,
  createContext,
  type ReactNode,
} from 'react';

export type AppId = 'files' | 'code' | 'terminal' | 'settings' | 'monitor';

export interface WindowRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState extends WindowRect {
  id: string;
  app: AppId;
  title: string;
  minimized: boolean;
  maximized: boolean;
  z: number;
  prev?: WindowRect;
  data?: unknown;
}

export interface OpenOptions {
  title?: string;
  data?: unknown;
}

interface WindowManagerValue {
  windows: WindowState[];
  focusedId: string | null;
  activitiesOpen: boolean;
  booted: boolean;
  setBooted: (b: boolean) => void;
  open: (app: AppId, options?: OpenOptions) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focus: (id: string) => void;
  moveToFront: (id: string) => void;
  updateRect: (id: string, rect: Partial<WindowRect>) => void;
  setActivities: (open: boolean) => void;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

let zCounter = 100;
let idCounter = 0;

const DEFAULT_GEOM: Record<AppId, WindowRect> = {
  files: { x: 90, y: 90, w: 640, h: 460 },
  code: { x: 130, y: 60, w: 820, h: 540 },
  terminal: { x: 200, y: 160, w: 620, h: 380 },
  settings: { x: 300, y: 150, w: 560, h: 420 },
  monitor: { x: 160, y: 100, w: 700, h: 440 },
};

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [booted, setBooted] = useState(false);

  const open = useCallback((app: AppId, options?: OpenOptions) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.app === app);
      zCounter++;
      const rect = DEFAULT_GEOM[app];

      if (existing) {
        setFocusedId(existing.id);
        return prev.map((w) =>
          w.id === existing.id
            ? {
                ...w,
                minimized: false,
                z: zCounter,
                title: options?.title ?? w.title,
                data: options?.data !== undefined ? options.data : w.data,
              }
            : w,
        );
      }

      const id = `win-${++idCounter}`;
      const win: WindowState = {
        id,
        app,
        title: options?.title ?? defaultTitle(app),
        ...rect,
        minimized: false,
        maximized: false,
        z: zCounter,
        data: options?.data,
      };
      setFocusedId(id);
      return [...prev, win];
    });
  }, []);

  const close = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setFocusedId((cur) => (cur === id ? null : cur));
  }, []);

  const minimize = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
    setFocusedId((cur) => (cur === id ? null : cur));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          return { ...w, maximized: false, ...(w.prev ?? DEFAULT_GEOM[w.app]) };
        }
        return { ...w, maximized: true, prev: { x: w.x, y: w.y, w: w.w, h: w.h } };
      }),
    );
  }, []);

  const moveToFront = useCallback((id: string) => {
    zCounter++;
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: false, z: zCounter } : w)),
    );
    setFocusedId(id);
  }, []);

  const focus = useCallback((id: string) => {
    moveToFront(id);
  }, [moveToFront]);

  const updateRect = useCallback((id: string, rect: Partial<WindowRect>) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...rect } : w)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activitiesOpen) {
        setActivitiesOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activitiesOpen]);

  const value: WindowManagerValue = {
    windows,
    focusedId,
    activitiesOpen,
    booted,
    setBooted,
    open,
    close,
    minimize,
    toggleMaximize,
    focus,
    moveToFront,
    updateRect,
    setActivities: setActivitiesOpen,
  };

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
  return ctx;
}

function defaultTitle(app: AppId): string {
  switch (app) {
    case 'files': return 'Files';
    case 'code': return 'Code';
    case 'terminal': return 'Terminal';
    case 'settings': return 'Settings';
    case 'monitor': return 'System Monitor';
  }
}