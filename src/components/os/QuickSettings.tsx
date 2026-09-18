import { useState } from 'react';
import { WifiIcon, BluetoothIcon, SunIcon, MoonIcon, VolumeIcon, PowerIcon, SettingsIcon } from '../icons';
import { useWindowManager } from '../wm/WindowManager';
import { APP_REGISTRY } from '../appRegistry';

interface QuickSettingsProps {
  onClose: () => void;
}

export function QuickSettings({ onClose }: QuickSettingsProps) {
  const { open, windows, globalBrightness, setGlobalBrightness } = useWindowManager();
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [airplaneOn, setAirplaneOn] = useState(false);
  const [volume, setVolume] = useState(70);

  // Get unique running apps
  const runningApps = Array.from(new Set(windows.filter(w => !w.minimized).map(w => w.app)));

  return (
    <>
      <div className="quick-settings-overlay" onClick={onClose} />
      <div className="quick-settings-panel">
        <div className="qs-toggles">
          <button className={`qs-toggle ${wifiOn ? 'active' : ''}`} onClick={() => setWifiOn(!wifiOn)}>
            <div className="qs-icon-wrapper"><WifiIcon width={16} height={16} /></div>
            <div className="qs-toggle-text">
              <span className="qs-toggle-title">Wi-Fi</span>
              <span className="qs-toggle-subtitle">{wifiOn ? 'Hare Net' : 'Off'}</span>
            </div>
          </button>
          <button className={`qs-toggle ${btOn ? 'active' : ''}`} onClick={() => setBtOn(!btOn)}>
            <div className="qs-icon-wrapper"><BluetoothIcon width={16} height={16} /></div>
            <div className="qs-toggle-text">
              <span className="qs-toggle-title">Bluetooth</span>
              <span className="qs-toggle-subtitle">{btOn ? 'On' : 'Off'}</span>
            </div>
          </button>
          <button className={`qs-toggle ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(!darkMode)}>
            <div className="qs-icon-wrapper">{darkMode ? <MoonIcon width={16} height={16} /> : <SunIcon width={16} height={16} />}</div>
            <div className="qs-toggle-text">
              <span className="qs-toggle-title">Dark Mode</span>
              <span className="qs-toggle-subtitle">{darkMode ? 'On' : 'Off'}</span>
            </div>
          </button>
          <button className={`qs-toggle ${airplaneOn ? 'active' : ''}`} onClick={() => setAirplaneOn(!airplaneOn)}>
            <div className="qs-icon-wrapper"><WifiIcon width={16} height={16} /></div>
            <div className="qs-toggle-text">
              <span className="qs-toggle-title">Airplane</span>
              <span className="qs-toggle-subtitle">{airplaneOn ? 'On' : 'Off'}</span>
            </div>
          </button>
        </div>

        <div className="qs-sliders">
          <div className="qs-slider-row">
            <VolumeIcon width={16} height={16} />
            <input 
              type="range" 
              className="qs-slider" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ '--val': `${volume}%` } as React.CSSProperties}
            />
          </div>
          <div className="qs-slider-row">
            <SunIcon width={16} height={16} />
            <input 
              type="range" 
              className="qs-slider" 
              value={globalBrightness} 
              onChange={(e) => setGlobalBrightness(Number(e.target.value))}
              style={{ '--val': `${globalBrightness}%` } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="qs-footer">
          <div className="qs-running-apps">
            {runningApps.map(appId => {
              const meta = APP_REGISTRY.find(a => a.id === appId);
              return meta ? (
                <div key={appId} className="qs-running-icon" title={meta.name} onClick={() => { open(appId); onClose(); }}>
                  {meta.icon}
                </div>
              ) : null;
            })}
          </div>
          <div className="qs-actions">
            <button className="qs-action-btn" onClick={() => { open('settings'); onClose(); }} title="Settings">
              <SettingsIcon width={16} height={16} />
            </button>
            <button className="qs-action-btn" onClick={() => window.location.reload()} title="Restart">
              <PowerIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
