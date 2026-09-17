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
import { BrowserApp } from './apps/BrowserApp';
import { StoreApp } from './apps/StoreApp';
import { MailApp } from './apps/MailApp';
import { CalendarApp } from './apps/CalendarApp';
import { CalculatorApp } from './apps/CalculatorApp';
import { NotesApp } from './apps/NotesApp';
import { MusicApp } from './apps/MusicApp';
import { VideoApp } from './apps/VideoApp';
import { PhotosApp } from './apps/PhotosApp';
import { CameraApp } from './apps/CameraApp';
import { MapsApp } from './apps/MapsApp';
import { WeatherApp } from './apps/WeatherApp';
import { ClockApp } from './apps/ClockApp';
import { ContactsApp } from './apps/ContactsApp';
import { MessagesApp } from './apps/MessagesApp';
import { TasksApp } from './apps/TasksApp';
import { PodcastsApp } from './apps/PodcastsApp';
import { WalletApp } from './apps/WalletApp';
import { HealthApp } from './apps/HealthApp';
import { NewsApp } from './apps/NewsApp';
import { RecorderApp } from './apps/RecorderApp';
import { TranslateApp } from './apps/TranslateApp';
import { DictionaryApp } from './apps/DictionaryApp';
import { MeasureApp } from './apps/MeasureApp';
import { FitnessApp } from './apps/FitnessApp';
import { BooksApp } from './apps/BooksApp';
import { CompassApp } from './apps/CompassApp';
import { PasswordsApp } from './apps/PasswordsApp';
import { HomeApp } from './apps/HomeApp';
import { ScannerApp } from './apps/ScannerApp';
import { PaintApp } from './apps/PaintApp';

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
    case 'browser':
      return <BrowserApp />;
    case 'store':
      return <StoreApp />;
    case 'mail':
      return <MailApp />;
    case 'calendar':
      return <CalendarApp />;
    case 'calculator':
      return <CalculatorApp />;
    case 'notes':
      return <NotesApp />;
    case 'music':
      return <MusicApp />;
    case 'video':
      return <VideoApp />;
    case 'photos':
      return <PhotosApp />;
    case 'camera':
      return <CameraApp />;
    case 'maps':
      return <MapsApp />;
    case 'weather':
      return <WeatherApp />;
    case 'clock':
      return <ClockApp />;
    case 'contacts':
      return <ContactsApp />;
    case 'messages':
      return <MessagesApp />;
    case 'tasks':
      return <TasksApp />;
    case 'podcasts':
      return <PodcastsApp />;
    case 'wallet':
      return <WalletApp />;
    case 'health':
      return <HealthApp />;
    case 'news':
      return <NewsApp />;
    case 'recorder':
      return <RecorderApp />;
    case 'translate':
      return <TranslateApp />;
    case 'dictionary':
      return <DictionaryApp />;
    case 'measure':
      return <MeasureApp />;
    case 'fitness':
      return <FitnessApp />;
    case 'books':
      return <BooksApp />;
    case 'compass':
      return <CompassApp />;
    case 'passwords':
      return <PasswordsApp />;
    case 'home':
      return <HomeApp />;
    case 'scanner':
      return <ScannerApp />;
    case 'paint':
      return <PaintApp />;
    default:
      return null;
  }
}

function Desktop() {
  const { 
    windows, 
    booted, 
    setBooted, 
    setActivities, 
    activitiesOpen, 
    activeWorkspace, 
    totalWorkspaces,
    setActiveWorkspace,
    moveWindowToWorkspace
  } = useWindowManager();

  if (!booted) {
    return <BootScreen onDone={() => setBooted(true)} />;
  }

  const trackStyle = {
    transform: activitiesOpen 
      ? `translateX(calc(-73.5vw * ${activeWorkspace})) scale(0.7)` 
      : `translateX(calc(-105vw * ${activeWorkspace})) scale(1)`,
    transformOrigin: '50vw center'
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (activitiesOpen) e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, workspaceIdx: number) => {
    if (!activitiesOpen) return;
    e.preventDefault();
    const winId = e.dataTransfer.getData('text/plain');
    if (winId) {
      moveWindowToWorkspace(winId, workspaceIdx);
    }
  };

  return (
    <div className="os-desktop">
      <TopBar />
      <main className={`desktop-area ${activitiesOpen ? 'overview-active' : ''}`} onClick={() => setActivities(false)}>
        <div className="workspace-track" style={trackStyle}>
          {Array.from({ length: totalWorkspaces }).map((_, idx) => (
            <div 
              key={idx} 
              className="workspace-container"
              onClick={(e) => {
                if (activitiesOpen) {
                  e.stopPropagation();
                  if (activeWorkspace === idx) {
                    setActivities(false);
                  } else {
                    setActiveWorkspace(idx);
                  }
                }
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
            >
              {windows.filter(w => w.workspace === idx).map((win) => (
                <AppWindow key={win.id} win={win} icon={appIcon(win.app)}>
                  <WindowContent win={win} />
                </AppWindow>
              ))}
              {windows.filter(w => w.workspace === idx).length === 0 && (
                <div className="desktop-empty">
                  <span className="desktop-empty-mark">▮▮</span>
                  <span className="desktop-empty-title">HARE-OS {idx === totalWorkspaces - 1 && "(New Workspace)"}</span>
                  <span className="desktop-empty-hint">CLICK 'ACTIVITIES' TO OPEN APPLICATIONS</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      {activitiesOpen && <Dock />}
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