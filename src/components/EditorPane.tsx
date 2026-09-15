import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DocModel, type TextPosition } from '../editor/engine';
import { tokenizeLines, detectLang, type Lang, type Token } from '../editor/syntax';

interface EditorPaneProps {
  path: string;
  value: string;
  onChange: (v: string) => void;
  onCursor: (pos: TextPosition) => void;
  onSave: () => void;
}

const PAD_TOP = 8;
const PAD_LEFT = 12;

function renderTokens(tokens: Token[]): React.ReactNode[] {
  return tokens.map((t, i) => (
    <span key={i} className={`tok-${t.type}`}>{t.text}</span>
  ));
}

export function EditorPane({ path, value, onChange, onCursor, onSave }: EditorPaneProps) {
  const lang: Lang = useMemo(() => detectLang(path), [path]);
  const tokenLines = useMemo(() => tokenizeLines(value, lang), [value, lang]);

  const model = useMemo(() => new DocModel(value), [value]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const [charWidth, setCharWidth] = useState(8);
  const [cursor, setCursor] = useState<TextPosition>({ line: 0, col: 0 });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const comp = getComputedStyle(textarea);
    const sample = document.createElement('span');
    sample.style.font = comp.font;
    sample.style.fontSize = comp.fontSize;
    sample.textContent = 'mmmmmmmm';
    document.body.appendChild(sample);
    const w = sample.getBoundingClientRect().width / 8;
    document.body.removeChild(sample);
    setCharWidth(w);
  }, []);

  // Reset scroll on path change
  useEffect(() => {
    const t = textareaRef.current;
    if (t) {
      t.scrollTop = 0;
      t.scrollLeft = 0;
    }
  }, [path]);

  const syncScroll = useCallback(() => {
    const t = textareaRef.current;
    const code = codeRef.current;
    const gutter = gutterRef.current;
    if (!t || !code || !gutter) return;
    code.style.transform = `translate(${-t.scrollLeft}px, ${-t.scrollTop}px)`;
    gutter.style.transform = `translateY(${-t.scrollTop}px)`;
  }, []);

  const reportCursor = useCallback(() => {
    const t = textareaRef.current;
    if (!t) return;
    const pos = model.offsetToPos(t.selectionStart);
    setCursor(pos);
    onCursor(pos);
  }, [model, onCursor]);

  const handleInput = useCallback(() => {
    const t = textareaRef.current;
    if (!t) return;
    onChange(t.value);
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    },
    [onSave],
  );

  const lineCount = model.lineCount;
  const gutterWidth = 12 + String(lineCount).length * 8 + 8;
  const empty = lineCount === 1 && model.getLine(0) === '';

  return (
    <div className="editor-pane" data-lang={lang}>
      <div className="editor-statusline">
        <span className="es-left">
          <span className="es-file">{path}</span>
          <span className="es-lang">{lang}</span>
        </span>
        <span className="es-right">
          {empty ? 'EMPTY' : `${cursor.line + 1}:${cursor.col + 1}`}
        </span>
      </div>
      <div className="editor-scrollwrap">
        <div
          className="editor-gutter"
          ref={gutterRef}
          style={{ width: gutterWidth }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className={`gutter-line ${i === cursor.line ? 'active' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre
          ref={codeRef}
          className="editor-code"
          style={{
            paddingLeft: gutterWidth + PAD_LEFT,
            paddingTop: PAD_TOP,
            width: model.maxLineWidth * charWidth + gutterWidth + PAD_LEFT * 2,
          }}
        >
          {tokenLines.map((toks, i) => (
            <span key={i} className="code-line">
              {renderTokens(toks)}
            </span>
          ))}
        </pre>
        <textarea
          ref={textareaRef}
          className="editor-input"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={handleInput}
          onSelect={reportCursor}
          onClick={reportCursor}
          onKeyUp={reportCursor}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          style={{ paddingLeft: gutterWidth + PAD_LEFT, paddingTop: PAD_TOP }}
        />
      </div>
    </div>
  );
}