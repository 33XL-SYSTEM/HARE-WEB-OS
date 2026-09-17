import { kernel } from '../kernel/HareBridge';
import { UserIcon, InfoIcon, CpuIcon, LayoutIcon, DiskIcon } from '../components/icons';

export function SettingsApp() {
  const rows = [
    { icon: <InfoIcon width={15} height={15} />, label: 'KERNEL', value: `HARE ${kernel.versionStr}` },
    { icon: <CpuIcon width={15} height={15} />, label: 'PLATFORM', value: kernel.platformLabel },
    { icon: <LayoutIcon width={15} height={15} />, label: 'ENGINES', value: kernel.engines.join(' + ') },
    { icon: <DiskIcon width={15} height={15} />, label: 'ROOT FS', value: '/workspace' },
    { icon: <UserIcon width={15} height={15} />, label: 'USER', value: 'hare_admin' },
  ];

  return (
    <div className="app settings-app">
      <div className="settings-head">
        <span className="settings-title">SETTINGS</span>
        <span className="settings-kernel">{kernel.versionStr}</span>
      </div>
      <div className="settings-list">
        {rows.map((r) => (
          <div key={r.label} className="settings-row">
            <span className="settings-row-icon">{r.icon}</span>
            <span className="settings-row-label">{r.label}</span>
            <span className="settings-row-value">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="settings-stripes" />
    </div>
  );
}