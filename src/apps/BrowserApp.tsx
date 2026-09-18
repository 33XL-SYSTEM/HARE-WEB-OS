import { useState, useRef } from 'react';
import type { FormEvent } from 'react';

export function BrowserApp() {
  const [urlInput, setUrlInput] = useState('https://duckduckgo.com');
  const [currentUrl, setCurrentUrl] = useState('https://duckduckgo.com');
  const [history, setHistory] = useState<string[]>(['https://duckduckgo.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const parseUrl = (input: string) => {
    let finalUrl = input.trim();
    if (!finalUrl.includes('.') && !finalUrl.startsWith('http')) {
      finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
    } else if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }
    return finalUrl;
  };

  const navigate = (url: string) => {
    const finalUrl = parseUrl(url);
    setUrlInput(finalUrl);
    setCurrentUrl(finalUrl);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setIsLoading(true);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(urlInput);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevUrl = history[historyIndex - 1];
      setUrlInput(prevUrl);
      setCurrentUrl(prevUrl);
      setIsLoading(true);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextUrl = history[historyIndex + 1];
      setUrlInput(nextUrl);
      setCurrentUrl(nextUrl);
      setIsLoading(true);
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      // Small hack to force iframe reload by resetting src
      iframeRef.current.src += '';
      setIsLoading(true);
    }
  };

  const goHome = () => {
    navigate('https://duckduckgo.com');
  };

  const getProxyUrl = (url: string) => {
    // Return our Vite backend proxy URL
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="app browser-app">
      <div className="browser-toolbar">
        <div className="browser-nav-btns">
          <button onClick={goBack} disabled={historyIndex === 0}>◀</button>
          <button onClick={goForward} disabled={historyIndex === history.length - 1}>▶</button>
          <button onClick={reload}>↻</button>
          <button onClick={goHome}>⌂</button>
        </div>
        
        <form className="browser-omnibox" onSubmit={onSubmit}>
          <input 
            type="text" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Search DuckDuckGo or enter URL"
          />
        </form>
      </div>

      <div className="browser-content">
        {isLoading && <div className="browser-loader">Loading...</div>}
        <iframe 
          ref={iframeRef}
          src={getProxyUrl(currentUrl)} 
          title="Hare Browser Sandbox"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
