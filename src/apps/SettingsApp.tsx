import { useState, useRef } from 'react';
import { kernel } from '../kernel/HareBridge';
import { UserIcon, InfoIcon, CpuIcon, LayoutIcon, DiskIcon, CloseIcon } from '../components/icons';
import { useWindowManager, type WindowState } from '../components/wm/WindowManager';

export function SettingsApp({ win }: { win?: WindowState }) {
  const [activeTab, setActiveTab] = useState<'system' | 'wallpaper'>(() => {
    if (win?.data && typeof win.data === 'object' && 'tab' in win.data) {
      return (win.data as any).tab === 'wallpaper' ? 'wallpaper' : 'system';
    }
    return 'system';
  });
  const { wallpaper, customWallpapers, setWallpaper, addWallpaper, removeWallpaper } = useWindowManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  const rows = [
    { icon: <InfoIcon width={15} height={15} />, label: 'KERNEL', value: `HARE ${kernel.versionStr}` },
    { icon: <CpuIcon width={15} height={15} />, label: 'PLATFORM', value: kernel.platformLabel },
    { icon: <LayoutIcon width={15} height={15} />, label: 'ENGINES', value: kernel.engines.join(' + ') },
    { icon: <DiskIcon width={15} height={15} />, label: 'ROOT FS', value: '/workspace' },
    { icon: <UserIcon width={15} height={15} />, label: 'USER', value: 'hare_admin' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        addWallpaper(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      addWallpaper(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="app settings-app">
      <div className="settings-head">
        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            SYSTEM
          </button>
          <button 
            className={`settings-tab ${activeTab === 'wallpaper' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallpaper')}
          >
            WALLPAPER
          </button>
        </div>
      </div>
      
      {activeTab === 'system' && (
        <div className="settings-list">
          {rows.map((r) => (
            <div key={r.label} className="settings-row">
              <span className="settings-row-icon">{r.icon}</span>
              <span className="settings-row-label">{r.label}</span>
              <span className="settings-row-value">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'wallpaper' && (
        <div className="settings-wallpapers">
          <div className="settings-wallpapers-grid">
            <div className={`wallpaper-item ${wallpaper === null ? 'active' : ''}`}>
              <div className="wallpaper-preview" style={{ background: '#000000' }}>
                {wallpaper !== null && (
                  <button className="wallpaper-apply" onClick={() => setWallpaper(null)}>
                    Apply
                  </button>
                )}
              </div>
              <div className="wallpaper-label">Default (Black)</div>
            </div>
            
            {customWallpapers.map((url, i) => (
              <div key={i} className={`wallpaper-item ${wallpaper === url ? 'active' : ''}`}>
                <div className="wallpaper-preview" style={{ backgroundImage: `url(${url})` }}>
                  {wallpaper !== url && (
                    <button className="wallpaper-apply" onClick={() => setWallpaper(url)}>
                      Apply
                    </button>
                  )}
                  <button 
                    className="wallpaper-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWallpaper(url);
                    }}
                    title="Remove Wallpaper"
                  >
                    <CloseIcon width={12} height={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="settings-wallpapers-add">
            <h4>ADD NEW WALLPAPER</h4>
            <div className="settings-wallpapers-actions">
              <button 
                className="settings-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File...
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleFileUpload}
              />
              <span className="settings-wallpapers-or">OR</span>
              <form onSubmit={handleAddUrl} className="settings-url-form">
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="settings-input"
                />
                <button type="submit" className="settings-btn" disabled={!urlInput.trim()}>
                  Add URL
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="settings-stripes" />
    </div>
  );
}