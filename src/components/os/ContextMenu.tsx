/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label?: string;
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface ContextMenuContextValue {
  showContextMenu: (e: React.MouseEvent, items: ContextMenuItem[]) => void;
  hideContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  const showContextMenu = (e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure the menu doesn't go off screen
    let x = e.clientX;
    let y = e.clientY;
    
    // Simple heuristic, could use ref to measure actual size
    const estimatedWidth = 200;
    const estimatedHeight = items.length * 32;
    
    if (x + estimatedWidth > window.innerWidth) {
      x -= estimatedWidth;
    }
    if (y + estimatedHeight > window.innerHeight) {
      y -= estimatedHeight;
    }

    setMenu({ x, y, items });
  };

  const hideContextMenu = () => {
    setMenu(null);
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      setMenu(null);
    };
    const handleGlobalContextMenu = () => {
      setMenu(null);
    };

    if (menu) {
      window.addEventListener('click', handleGlobalClick);
      // Close custom menu if user right clicks somewhere else, or they can trigger another one.
      // But if they right click another custom element, it will stop propagation and call showContextMenu.
      // So we just listen on window to close if they right click empty space.
      window.addEventListener('contextmenu', handleGlobalContextMenu);
    }

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [menu]);

  return (
    <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
      {children}
      {menu && createPortal(
        <div 
          className="os-context-menu" 
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {menu.items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="os-context-menu-divider" />;
            }
            return (
              <button 
                key={i} 
                className={`os-context-menu-item ${item.disabled ? 'disabled' : ''}`}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                  }
                  hideContextMenu();
                }}
              >
                {item.icon && <span className="os-context-menu-icon">{item.icon}</span>}
                <span className="os-context-menu-label">{item.label}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error('useContextMenu must be used within ContextMenuProvider');
  return ctx;
}
