import { useCallback, useEffect, useRef, type ReactNode, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { useWindowManager, type WindowState } from './WindowManager';

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const MIN_W = 320;
const MIN_H = 200;

interface AppWindowProps {
  win: WindowState;
  children: ReactNode;
  icon?: ReactNode;
}

interface DragState {
  mode: 'move' | 'resize';
  dir?: ResizeDir;
  startX: number;
  startY: number;
  startRect: { x: number; y: number; w: number; h: number };
}

export function AppWindow({ win, children, icon }: AppWindowProps) {
  const { focusedId, moveToFront, close, minimize, toggleMaximize, updateRect, activitiesOpen } = useWindowManager();
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const winRef = useRef(win);

  useEffect(() => {
    winRef.current = win;
  });

  const focused = focusedId === win.id;

  const beginMove = useCallback(
    (e: ReactMouseEvent) => {
      if (e.button !== 0 || win.maximized) return;
      e.preventDefault();
      moveToFront(win.id);
      dragRef.current = {
        mode: 'move',
        startX: e.clientX,
        startY: e.clientY,
        startRect: { x: win.x, y: win.y, w: win.w, h: win.h },
      };
      document.body.classList.add('wm-dragging');
    },
    [moveToFront, win.id, win.maximized, win.x, win.y, win.w, win.h],
  );

  const beginResize = useCallback(
    (e: ReactMouseEvent, dir: ResizeDir) => {
      if (e.button !== 0 || win.maximized) return;
      e.preventDefault();
      e.stopPropagation();
      moveToFront(win.id);
      dragRef.current = {
        mode: 'resize',
        dir,
        startX: e.clientX,
        startY: e.clientY,
        startRect: { x: win.x, y: win.y, w: win.w, h: win.h },
      };
      document.body.classList.add('wm-dragging');
    },
    [moveToFront, win.id, win.maximized, win.x, win.y, win.w, win.h],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (d.mode === 'move') {
        updateRect(win.id, {
          x: Math.max(-winRef.current.w + 80, d.startRect.x + dx),
          y: Math.max(0, d.startRect.y + dy),
        });
      } else {
        const dir = d.dir!;
        let x = d.startRect.x;
        let y = d.startRect.y;
        let w = d.startRect.w;
        let h = d.startRect.h;

        if (dir.includes('e')) w = d.startRect.w + dx;
        if (dir.includes('s')) h = d.startRect.h + dy;
        if (dir.includes('w')) {
          w = d.startRect.w - dx;
          x = d.startRect.x + dx;
          if (w < MIN_W) {
            x = d.startRect.x + d.startRect.w - MIN_W;
            w = MIN_W;
          }
        }
        if (dir.includes('n')) {
          h = d.startRect.h - dy;
          y = d.startRect.y + dy;
          if (h < MIN_H) {
            y = d.startRect.y + d.startRect.h - MIN_H;
            h = MIN_H;
          }
        }

        updateRect(win.id, {
          x,
          y: Math.max(0, y),
          w: Math.max(MIN_W, w),
          h: Math.max(MIN_H, h),
        });
      }
    };

    const onUp = () => {
      dragRef.current = null;
      document.body.classList.remove('wm-dragging');
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [win.id, updateRect]);

  const style: CSSProperties = {
    left: win.x,
    top: win.y,
    width: win.w,
    height: win.h,
    zIndex: win.z,
  };

  const resizeHandles: ResizeDir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <div
      ref={frameRef}
      className={`os-window ${focused ? 'focused' : ''} ${win.maximized ? 'maximized' : ''} ${win.minimized ? 'minimized' : ''}`}
      style={style}
      onMouseDown={() => {
        if (dragRef.current) return;
        if (win.minimized) return;
        moveToFront(win.id);
      }}
    >
      <div className="os-window-titlebar" onMouseDown={beginMove}>
        <div className="os-window-appicon">{icon}</div>
        <span className="os-window-title">{win.title}</span>
        <div className="os-window-controls">
          <button className="wm-btn" title="Minimize" onClick={() => minimize(win.id)}>
            <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 5.5h7" stroke="currentColor" strokeWidth="1.3" /></svg>
          </button>
          <button className="wm-btn" title="Maximize" onClick={() => toggleMaximize(win.id)}>
            <svg width="11" height="11" viewBox="0 0 11 11">
              {win.maximized ? (
                <path d="M2.5 4.5h5.5v4H2.5zM4.5 2.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.2" />
              ) : (
                <rect x="2.5" y="2.5" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
              )}
            </svg>
          </button>
          <button className="wm-btn wm-close" title="Close" onClick={() => close(win.id)}>
            <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 2l7 7M9 2L2 9" stroke="currentColor" strokeWidth="1.3" /></svg>
          </button>
        </div>
      </div>

      <div className="os-window-body">
        {win.minimized ? null : children}
      </div>

      {!win.maximized && !win.minimized && (
        <>
          {resizeHandles.map((dir) => (
            <div
              key={dir}
              className={`resize-handle h-${dir}`}
              onMouseDown={(e) => beginResize(e, dir)}
            />
          ))}
        </>
      )}

      {activitiesOpen && (
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', win.id);
            e.dataTransfer.effectAllowed = 'move';
            // Optional: set drag image to be the window frame itself
            if (frameRef.current) {
              e.dataTransfer.setDragImage(frameRef.current, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            }
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 9999, cursor: 'grab' }}
        />
      )}
    </div>
  );
}