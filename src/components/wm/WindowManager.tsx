import {
  useCallback,
  useContext,
  useEffect,
  useState,
  createContext,
  type ReactNode,
} from 'react';
import { kernel } from '../../kernel/HareBridge';

export type AppId = 'files' | 'code' | 'terminal' | 'settings' | 'monitor' | 'browser' | 'store' | 'mail' | 'calendar' | 'calculator' | 'notes' | 'music' | 'video' | 'photos' | 'camera' | 'maps' | 'weather' | 'clock' | 'contacts' | 'messages' | 'tasks' | 'podcasts' | 'wallet' | 'health' | 'news' | 'recorder' | 'translate' | 'dictionary' | 'measure' | 'fitness' | 'books' | 'compass' | 'passwords'  | 'home'
  | 'scanner'
  | 'paint'
  | 'trymon';

export interface WindowRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState extends WindowRect {
  id: string;
  pid: number;
  app: AppId;
  workspace: number;
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
  appGridOpen: boolean;
  activeWorkspace: number;
  totalWorkspaces: number;
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
  setAppGridOpen: (open: boolean) => void;
  setActiveWorkspace: (index: number) => void;
  moveWindowToWorkspace: (id: string, workspace: number) => void;
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
  browser: { x: 200, y: 150, w: 600, h: 400 },
  store: { x: 200, y: 150, w: 600, h: 400 },
  mail: { x: 200, y: 150, w: 600, h: 400 },
  calendar: { x: 200, y: 150, w: 600, h: 400 },
  calculator: { x: 200, y: 150, w: 600, h: 400 },
  notes: { x: 200, y: 150, w: 600, h: 400 },
  music: { x: 200, y: 150, w: 600, h: 400 },
  video: { x: 200, y: 150, w: 600, h: 400 },
  photos: { x: 200, y: 150, w: 600, h: 400 },
  camera: { x: 200, y: 150, w: 600, h: 400 },
  maps: { x: 200, y: 150, w: 600, h: 400 },
  weather: { x: 200, y: 150, w: 600, h: 400 },
  clock: { x: 200, y: 150, w: 600, h: 400 },
  contacts: { x: 200, y: 150, w: 600, h: 400 },
  messages: { x: 200, y: 150, w: 600, h: 400 },
  tasks: { x: 200, y: 150, w: 600, h: 400 },
  podcasts: { x: 200, y: 150, w: 600, h: 400 },
  wallet: { x: 200, y: 150, w: 600, h: 400 },
  health: { x: 200, y: 150, w: 600, h: 400 },
  news: { x: 200, y: 150, w: 600, h: 400 },
  recorder: { x: 200, y: 150, w: 600, h: 400 },
  translate: { x: 200, y: 150, w: 600, h: 400 },
  dictionary: { x: 200, y: 150, w: 600, h: 400 },
  measure: { x: 200, y: 150, w: 600, h: 400 },
  fitness: { x: 200, y: 150, w: 600, h: 400 },
  books: { x: 200, y: 150, w: 600, h: 400 },
  compass: { x: 200, y: 150, w: 600, h: 400 },
  passwords: { x: 200, y: 150, w: 600, h: 400 },
  home: { x: 200, y: 150, w: 600, h: 400 },
  scanner: { x: 200, y: 150, w: 600, h: 400 },
  paint: { x: 200, y: 150, w: 600, h: 400 },
  trymon: { x: 100, y: 100, w: 800, h: 500 },
};

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [activitiesOpen, setActivities] = useState(false);
  const [appGridOpen, setAppGridOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(0);

  // Dynamic total workspaces: always one more than the max workspace index currently in use, or active.
  const totalWorkspaces = Math.max(
    activeWorkspace,
    windows.length > 0 ? Math.max(...windows.map(w => w.workspace)) : 0
  ) + 2; // +2 because 0-indexed, so max index 0 means 1 workspace, and we want 1 empty at the end, so 2.

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

      const p = kernel.scheduler.spawn(app, kernel.cwd);
      const id = `win-${++idCounter}`;
      const win: WindowState = {
        id,
        pid: p.pid,
        app,
        workspace: activeWorkspace,
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
  }, [activeWorkspace]);

  const close = useCallback((id: string) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (win) kernel.scheduler.kill(win.pid);
      return prev.filter((w) => w.id !== id);
    });
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

  const moveWindowToWorkspace = useCallback((id: string, workspace: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, workspace } : w)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activitiesOpen) {
        if (appGridOpen) {
          setAppGridOpen(false);
        } else {
          setActivities(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activitiesOpen, appGridOpen]);

  // Listen to kernel process kills
  useEffect(() => {
    const unsub = kernel.scheduler.onEvent((pid, event) => {
      if (event === 'kill') {
        setWindows((prev) => {
          const win = prev.find((w) => w.pid === pid);
          if (!win) return prev;
          setFocusedId((cur) => (cur === win.id ? null : cur));
          return prev.filter((w) => w.pid !== pid);
        });
      }
    });
    return unsub;
  }, []);

  const value: WindowManagerValue = {
    windows,
    focusedId,
    activitiesOpen,
    appGridOpen,
    activeWorkspace,
    totalWorkspaces,
    booted,
    setBooted,
    open,
    close,
    minimize,
    toggleMaximize,
    focus,
    moveToFront,
    updateRect,
    setActivities,
    setAppGridOpen,
    setActiveWorkspace,
    moveWindowToWorkspace,
  };

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
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
    case 'browser': return 'BROWSER';
    case 'store': return 'STORE';
    case 'mail': return 'MAIL';
    case 'calendar': return 'CALENDAR';
    case 'calculator': return 'CALCULATOR';
    case 'notes': return 'NOTES';
    case 'music': return 'MUSIC';
    case 'video': return 'VIDEO';
    case 'photos': return 'PHOTOS';
    case 'camera': return 'CAMERA';
    case 'maps': return 'MAPS';
    case 'weather': return 'WEATHER';
    case 'clock': return 'CLOCK';
    case 'contacts': return 'CONTACTS';
    case 'messages': return 'MESSAGES';
    case 'tasks': return 'TASKS';
    case 'podcasts': return 'PODCASTS';
    case 'wallet': return 'WALLET';
    case 'health': return 'HEALTH';
    case 'news': return 'NEWS';
    case 'recorder': return 'RECORDER';
    case 'translate': return 'TRANSLATE';
    case 'dictionary': return 'DICTIONARY';
    case 'measure': return 'MEASURE';
    case 'fitness': return 'FITNESS';
    case 'books': return 'BOOKS';
    case 'compass': return 'COMPASS';
    case 'passwords': return 'PASSWORDS';
    case 'home': return 'HOME';
    case 'scanner': return 'SCANNER';
    case 'paint': return 'PAINT';
    case 'trymon': return 'Trymon OS';
    default: return 'Application';
  }
}