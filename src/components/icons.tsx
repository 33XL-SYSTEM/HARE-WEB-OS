import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps): IconProps => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  ...props,
});

export const FilesIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M3 9h18" />
    <path d="M3 3v16" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L21 21" />
  </svg>
);

export const GitIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M6 8.5v3a5 5 0 0 0 5 5h3" />
  </svg>
);

export const TerminalIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2.5" y="2.5" width="19" height="19" />
    <path d="M7 8l4 4-4 4" />
    <path d="M14 16h4" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const FileIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 2.5h8l4 4V21.5H6z" />
    <path d="M14 2.5V6.5h4" />
  </svg>
);

export const DirIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 6.5h7l2 3h9v11H3z" />
  </svg>
);

export const DirOpenIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 6.5h7l2 3h9v2H3z" />
    <path d="M3 11.5V20.5h17V11.5" />
  </svg>
);

export const NewFileIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 2.5h8l4 4V21.5H6z" />
    <path d="M14 2.5V6.5h4" />
    <path d="M11 11v6M8 14h6" />
  </svg>
);

export const NewDirIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 6.5h7l2 3h9v11H3z" />
    <path d="M11 13.5v6M8 16.5h6" />
  </svg>
);

export const RefreshIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 3v5h-5" />
  </svg>
);

export const RunIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 3.5l13 8.5-13 8.5z" />
  </svg>
);

export const SaveIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 2.5h16V21.5H4z" />
    <path d="M7 2.5V9h10V2.5" />
    <path d="M7 21.5V14h10v7.5" />
  </svg>
);

export const CommandIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 9a3 3 0 1 0 0-6 3 3 0 1 0 0 6z" />
    <path d="M5 5.5A3 3 0 0 1 8 8.5V15H5a3 3 0 1 1-2-5.2" />
  </svg>
);

export const SparkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 2.5l2.6 6.9L21.5 12l-6.9 2.6L12 21.5l-2.6-6.9L2.5 12l6.9-2.6z" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6.5h16" />
    <path d="M8.5 6.5V3.5h7v3" />
    <path d="M6 6.5l1 15h10l1-15" />
  </svg>
);

export const AppGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const RenameIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 8.5l12.5-6 6 3.5L9 11z" />
    <path d="M3 8.5v7l3 1.5v-7" />
    <path d="M9 11v7l3 1.5v-7" />
  </svg>
);
export const CodeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 6l-6 6 6 6M16 6l6 6-6 6M13.5 4L10 20" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v3.2M12 18v3.2M2.8 12H6M18 12h3.2M4.9 4.9l2.3 2.3M16.8 16.8l2.3 2.3M19.1 4.9l-2.3 2.3M7.2 16.8l-2.3 2.3" />
  </svg>
);

export const CpuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="6.5" y="6.5" width="11" height="11" />
    <path d="M9.5 2.8v3M9.5 18.2v3M14.5 2.8v3M14.5 18.2v3M2.8 9.5h3M2.8 14.5h3M18.2 9.5h3M18.2 14.5h3" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20V10M9.5 20V4M15 20v-9M20.5 20H3" />
  </svg>
);

export const RowIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="4" width="17" height="6.5" />
    <rect x="3.5" y="13.5" width="17" height="6.5" />
  </svg>
);

export const QueIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="12" height="16" />
    <path d="M8 2v18M15 8h6v12h-6" />
  </svg>
);

export const DiskIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="6" width="18" height="5" />
    <rect x="3" y="13.5" width="18" height="5" />
    <path d="M6.5 7.5v2M6.5 15.5v2" />
  </svg>
);

export const WifiIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2.5 9.5a13 13 0 0 1 19 0M6 13.4a8.2 8.2 0 0 1 12 0M9.5 17.3a3.8 3.8 0 0 1 5 0M12 21l.01 0" />
  </svg>
);

export const SpeedIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 18.5h17" />
    <path d="M6 18.5l4.4-8.2 3.2 4.8L18 8" />
  </svg>
);

export const PowerIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3v9" />
    <path d="M6.3 6.9a8 8 0 1 0 11.4 0" />
  </svg>
);

export const RestartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 3v5h-5" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const LayoutIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M3 9h18M3 15h18" />
  </svg>
);

export const GlobeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.8 2.4 2.8 14.6 0 17M12 3.5c-2.8 2.4-2.8 14.6 0 17" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 10.5V17M12 7.2v.01" />
  </svg>
);

export const TerminalPromptIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2.5" y="2.5" width="19" height="19" />
    <path d="M7 8l4 4-4 4M14 16h4" />
  </svg>
);

export const BrowserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" /><path d="M3 8h18M8 4v4" />
  </svg>
);

export const StoreIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 8h12l1 12H5L6 8zM9 8V5a3 3 0 1 1 6 0v3" />
  </svg>
);

export const MailIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" /><path d="M3 7l9 6 9-6" />
  </svg>
);

export const CalendarIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" /><path d="M8 2v4M16 2v4M3 10h18" />
  </svg>
);

export const CalculatorIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4" y="2" width="16" height="20" /><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
);

export const NotesIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2z"/><path d="M9 13h6M9 17h6M9 9h2"/>
  </svg>
);

export const MusicIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

export const VideoIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2" y="6" width="15" height="12" /><path d="M17 10l5-3v10l-5-3" />
  </svg>
);

export const PhotosIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="18" height="18" /><circle cx="8.5" cy="8.5" r="2"/><path d="M21 15l-5-5L5 21" />
  </svg>
);

export const CameraIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);

export const MapsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

export const WeatherIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M17 18a5 5 0 0 0-10 0M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);

export const ContactsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16"/><circle cx="12" cy="10" r="3"/><path d="M6 18c0-3 3-4 6-4s6 1 6 4"/>
  </svg>
);

export const MessagesIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

export const TasksIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

export const PodcastsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-14 0M22 12a10 10 0 0 0-20 0"/>
  </svg>
);

export const WalletIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/>
  </svg>
);

export const HealthIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.9 7.9 7.9-7.9 1-1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>
);

export const NewsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v18z"/><path d="M14 2v6h6M8 12h8M8 16h8"/>
  </svg>
);

export const RecorderIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
  </svg>
);

export const TranslateIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 8l6 6M4 14l6-6M15 10v10M11 16h8"/>
  </svg>
);

export const DictionaryIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M8 8h6M8 12h4"/>
  </svg>
);

export const MeasureIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2" y="8" width="20" height="8"/><path d="M6 8v3M10 8v3M14 8v3M18 8v3"/>
  </svg>
);

export const FitnessIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
  </svg>
);

export const BooksIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export const CompassIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="10"/><path d="M16 8l-3 9-9-3 3-9 9 3z"/>
  </svg>
);

export const PasswordsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>
  </svg>
);

export const ScannerIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="18" height="18"/><path d="M3 12h18"/><path d="M12 3v18"/>
  </svg>
);

export const PaintIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export const TrymonIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <polygon points="12 2 22 8.5 22 21.5 12 28 2 21.5 2 8.5"/>
    <circle cx="12" cy="15" r="4"/>
  </svg>
);

export const BluetoothIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6.5 6.5l11 11-5.5 5.5v-22l5.5 5.5-11 11" />
  </svg>
);

export const VolumeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export const SunIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export const MoonIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
