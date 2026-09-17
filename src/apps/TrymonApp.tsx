export function TrymonApp() {
  return (
    <div className="app trymon-app" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      <iframe 
        src="https://trymon-os.vercel.app/" 
        title="Trymon OS Emulator"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
