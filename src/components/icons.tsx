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
