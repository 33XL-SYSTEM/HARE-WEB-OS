import { kernel } from '../kernel/HareBridge';
import { Terminal } from '../components/Terminal';

interface TerminalAppProps {
  onCwdChange: (cwd: string) => void;
  onOpenFile: (path: string) => void;
}

export function TerminalApp({ onCwdChange, onOpenFile }: TerminalAppProps) {
  return (
    <div className="app terminal-app">
      <Terminal ready={kernel.ready} onCwdChange={onCwdChange} onOpenFile={onOpenFile} />
    </div>
  );
}