import type { ReactNode } from 'react';
import type { AppId } from './wm/WindowManager';
import { FilesIcon, CodeIcon, TerminalIcon, SettingsIcon, ChartIcon } from './icons';

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
];