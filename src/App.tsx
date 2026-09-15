import './App.css';
import { WindowManagerProvider, useWindowManager, type AppId, type WindowState } from './components/wm/WindowManager';
import { AppWindow } from './components/wm/AppWindow';
import { TopBar } from './components/os/TopBar';
import { Dock } from './components/os/Dock';
import { APP_REGISTRY } from './components/appRegistry';
import { Overview } from './components/os/Overview';
import { BootScreen } from './components/os/BootScreen';
import { FilesApp } from './apps/FilesApp';
import { CodeApp } from './apps/CodeApp';
import { TerminalApp } from './apps/TerminalApp';
import { SettingsApp } from './apps/SettingsApp';
import { MonitorApp } from './apps/MonitorApp';

function appIcon(app: AppId) {
  return APP_REGISTRY.find((a) => a.id === app)?.icon ?? null;
}

function WindowContent({ win }: { win: WindowState }) {
  const { open } = useWindowManager();
  switch (win.app) {
    case 'files':
      return <FilesApp onOpenInCode={(path) => open('code', { data: path })} />;
    case 'code':
      return <CodeApp openedPath={win.data as string | undefined} />;
    case 'terminal':
      return <TerminalApp onCwdChange={() => 0} onOpenFile={(path) => open('code', { data: path })} />;
    case 'settings':
      return <SettingsApp />;
    case 'monitor':
      return <MonitorApp />;
    default:
      return null;
  }
}

function Desktop() {
  const { windows, booted, setBooted, setActivities } = useWindowManager();

  if (!booted) {
    return <BootScreen onDone={() => setBooted(true)} />;
  }

  return (
    <div className="os-desktop">
      <TopBar />
      <main className="desktop-area" onClick={() => setActivities(false)}>
        {windows.map((win) => (
          <AppWindow key={win.id} win={win} icon={appIcon(win.app)}>
            <WindowContent win={win} />
          </AppWindow>
        ))}
        {windows.length === 0 && (
          <div className="desktop-empty">
            <span className="desktop-empty-mark">▮▮</span>
            <span className="desktop-empty-title">HARE-OS</span>
            <span className="desktop-empty-hint">OPEN AN APPLICATION FROM THE DOCK BELOW</span>
          </div>
        )}
      </main>
      <Dock />
      <Overview />
    </div>
  );
}

export default function App() {
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}