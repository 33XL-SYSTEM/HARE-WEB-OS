import type { ReactNode } from 'react';
import type { AppId } from './wm/WindowManager';
import { FilesIcon, CodeIcon, TerminalIcon, SettingsIcon, ChartIcon, BrowserIcon, StoreIcon, MailIcon, CalendarIcon, CalculatorIcon, NotesIcon, MusicIcon, VideoIcon, PhotosIcon, CameraIcon, MapsIcon, WeatherIcon, ClockIcon, ContactsIcon, MessagesIcon, TasksIcon, PodcastsIcon, WalletIcon, HealthIcon, NewsIcon, RecorderIcon, TranslateIcon, DictionaryIcon, MeasureIcon, FitnessIcon, BooksIcon, CompassIcon, PasswordsIcon, HomeIcon, ScannerIcon, PaintIcon, TrymonIcon } from './icons';

export interface AppMeta {
  id: AppId;
  name: string;
  icon: ReactNode;
}

export const APP_REGISTRY: AppMeta[] = [
  { id: 'files', name: 'Files', icon: <FilesIcon width={20} height={20} /> },
  { id: 'code', name: 'Code', icon: <CodeIcon width={20} height={20} /> },
  { id: 'terminal', name: 'Terminal', icon: <TerminalIcon width={20} height={20} /> },
  { id: 'settings', name: 'Settings', icon: <SettingsIcon width={20} height={20} /> },
  { id: 'monitor', name: 'System Monitor', icon: <ChartIcon width={20} height={20} /> },
  { id: 'browser', name: 'Browser', icon: <BrowserIcon width={20} height={20} /> },
  { id: 'store', name: 'Store', icon: <StoreIcon width={20} height={20} /> },
  { id: 'mail', name: 'Mail', icon: <MailIcon width={20} height={20} /> },
  { id: 'calendar', name: 'Calendar', icon: <CalendarIcon width={20} height={20} /> },
  { id: 'calculator', name: 'Calculator', icon: <CalculatorIcon width={20} height={20} /> },
  { id: 'notes', name: 'Notes', icon: <NotesIcon width={20} height={20} /> },
  { id: 'music', name: 'Music', icon: <MusicIcon width={20} height={20} /> },
  { id: 'video', name: 'Video', icon: <VideoIcon width={20} height={20} /> },
  { id: 'photos', name: 'Photos', icon: <PhotosIcon width={20} height={20} /> },
  { id: 'camera', name: 'Camera', icon: <CameraIcon width={20} height={20} /> },
  { id: 'maps', name: 'Maps', icon: <MapsIcon width={20} height={20} /> },
  { id: 'weather', name: 'Weather', icon: <WeatherIcon width={20} height={20} /> },
  { id: 'clock', name: 'Clock', icon: <ClockIcon width={20} height={20} /> },
  { id: 'contacts', name: 'Contacts', icon: <ContactsIcon width={20} height={20} /> },
  { id: 'messages', name: 'Messages', icon: <MessagesIcon width={20} height={20} /> },
  { id: 'tasks', name: 'Tasks', icon: <TasksIcon width={20} height={20} /> },
  { id: 'podcasts', name: 'Podcasts', icon: <PodcastsIcon width={20} height={20} /> },
  { id: 'wallet', name: 'Wallet', icon: <WalletIcon width={20} height={20} /> },
  { id: 'health', name: 'Health', icon: <HealthIcon width={20} height={20} /> },
  { id: 'news', name: 'News', icon: <NewsIcon width={20} height={20} /> },
  { id: 'recorder', name: 'Recorder', icon: <RecorderIcon width={20} height={20} /> },
  { id: 'translate', name: 'Translate', icon: <TranslateIcon width={20} height={20} /> },
  { id: 'dictionary', name: 'Dictionary', icon: <DictionaryIcon width={20} height={20} /> },
  { id: 'measure', name: 'Measure', icon: <MeasureIcon width={20} height={20} /> },
  { id: 'fitness', name: 'Fitness', icon: <FitnessIcon width={20} height={20} /> },
  { id: 'books', name: 'Books', icon: <BooksIcon width={20} height={20} /> },
  { id: 'compass', name: 'Compass', icon: <CompassIcon width={20} height={20} /> },
  { id: 'passwords', name: 'Passwords', icon: <PasswordsIcon width={20} height={20} /> },
  { id: 'home', name: 'Home', icon: <HomeIcon width={20} height={20} /> },
  { id: 'scanner', name: 'Scanner', icon: <ScannerIcon width={20} height={20} /> },
  { id: 'paint', name: 'Paint', icon: <PaintIcon width={20} height={20} /> },
  { id: 'trymon', name: 'Trymon OS', icon: <TrymonIcon width={20} height={20} /> },
];
