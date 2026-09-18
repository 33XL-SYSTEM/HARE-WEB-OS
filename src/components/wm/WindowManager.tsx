/* eslint-disable react-refresh/only-export-components */
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
  pinnedApps: AppId[];
  wallpaper: string | null;
  customWallpapers: string[];
  globalBrightness: number;
  setGlobalBrightness: (val: number) => void;
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
  togglePinnedApp: (id: AppId) => void;
  setWallpaper: (url: string | null) => void;
  addWallpaper: (url: string) => void;
  removeWallpaper: (url: string) => void;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

let zCounter = 100;
let idCounter = 0;

const DEFAULT_GEOM: Record<AppId, WindowRect> = {
  files: { x: 450, y: 80, w: 1000, h: 700 },
  code: { x: 400, y: 60, w: 1100, h: 750 },
  terminal: { x: 450, y: 80, w: 1000, h: 700 },
  settings: { x: 500, y: 100, w: 900, h: 600 },
  monitor: { x: 450, y: 80, w: 1000, h: 700 },
  browser: { x: 400, y: 60, w: 1100, h: 750 },
  store: { x: 450, y: 80, w: 1000, h: 700 },
  mail: { x: 450, y: 80, w: 1000, h: 700 },
  calendar: { x: 500, y: 100, w: 900, h: 600 },
  calculator: { x: 650, y: 150, w: 600, h: 500 },
  notes: { x: 500, y: 100, w: 900, h: 600 },
  music: { x: 500, y: 100, w: 900, h: 600 },
  video: { x: 450, y: 80, w: 1000, h: 700 },
  photos: { x: 450, y: 80, w: 1000, h: 700 },
  camera: { x: 450, y: 80, w: 1000, h: 700 },
  maps: { x: 400, y: 60, w: 1100, h: 750 },
  weather: { x: 500, y: 100, w: 900, h: 600 },
  clock: { x: 650, y: 150, w: 600, h: 500 },
  contacts: { x: 500, y: 100, w: 900, h: 600 },
  messages: { x: 500, y: 100, w: 900, h: 600 },
  tasks: { x: 500, y: 100, w: 900, h: 600 },
  podcasts: { x: 500, y: 100, w: 900, h: 600 },
  wallet: { x: 500, y: 100, w: 900, h: 600 },
  health: { x: 500, y: 100, w: 900, h: 600 },
  news: { x: 450, y: 80, w: 1000, h: 700 },
  recorder: { x: 650, y: 150, w: 600, h: 500 },
  translate: { x: 500, y: 100, w: 900, h: 600 },
  dictionary: { x: 500, y: 100, w: 900, h: 600 },
  measure: { x: 650, y: 150, w: 600, h: 500 },
  fitness: { x: 500, y: 100, w: 900, h: 600 },
  books: { x: 450, y: 80, w: 1000, h: 700 },
  compass: { x: 650, y: 150, w: 600, h: 500 },
  passwords: { x: 500, y: 100, w: 900, h: 600 },
  home: { x: 450, y: 80, w: 1000, h: 700 },
  scanner: { x: 500, y: 100, w: 900, h: 600 },
  paint: { x: 400, y: 60, w: 1100, h: 750 },
  trymon: { x: 450, y: 80, w: 1000, h: 700 },
};

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [activitiesOpen, setActivities] = useState(false);
  const [appGridOpen, setAppGridOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(0);
  const [pinnedApps, setPinnedApps] = useState<AppId[]>(() => {
    try {
      const saved = localStorage.getItem('hare-os-pinned-apps');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['files', 'code', 'terminal', 'settings', 'monitor'];
  });
  const [wallpaper, setWallpaperState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hare-os-wallpaper') || null;
    } catch {}
    return null;
  });
  const [customWallpapers, setCustomWallpapers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hare-os-custom-wallpapers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [globalBrightness, setGlobalBrightness] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hare-os-brightness');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 100;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hare-os-brightness', String(globalBrightness));
    } catch {}
  }, [globalBrightness]);

  const togglePinnedApp = useCallback((id: AppId) => {
    setPinnedApps((prev) => {
      const next = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id];
      try {
        localStorage.setItem('hare-os-pinned-apps', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const setWallpaper = useCallback((url: string | null) => {
    setWallpaperState(url);
    try {
      if (url) localStorage.setItem('hare-os-wallpaper', url);
      else localStorage.removeItem('hare-os-wallpaper');
    } catch {}
  }, []);

  const addWallpaper = useCallback((url: string) => {
    setCustomWallpapers((prev) => {
      if (prev.includes(url)) return prev;
      const next = [...prev, url];
      try {
        localStorage.setItem('hare-os-custom-wallpapers', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeWallpaper = useCallback((url: string) => {
    setCustomWallpapers((prev) => {
      const next = prev.filter((w) => w !== url);
      try {
        localStorage.setItem('hare-os-custom-wallpapers', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (wallpaper === url) {
      setWallpaper(null);
    }
  }, [wallpaper, setWallpaper]);

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
    pinnedApps,
    wallpaper,
    customWallpapers,
    globalBrightness,
    setGlobalBrightness,
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
    togglePinnedApp,
    setWallpaper,
    addWallpaper,
    removeWallpaper,
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