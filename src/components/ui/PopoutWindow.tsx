import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PopoutWindowProps {
  children: React.ReactNode;
  title?: string;
  onClose: () => void;
}

export const PopoutWindow: React.FC<PopoutWindowProps> = ({ children, title = 'Popout Window', onClose }) => {
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const externalWindow = useRef<Window | null>(null);

  useEffect(() => {
    // Open new window
    const newWindow = window.open('', '', 'width=600,height=400,left=200,top=200');
    externalWindow.current = newWindow;

    if (newWindow) {
      newWindow.document.title = title;
      
      // Copy styles from main window to keep theming
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const newLink = newWindow.document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = styleSheet.href;
            newWindow.document.head.appendChild(newLink);
          } else if (styleSheet.cssRules) {
            const newStyle = newWindow.document.createElement('style');
            Array.from(styleSheet.cssRules).forEach((rule) => {
              newStyle.appendChild(newWindow.document.createTextNode(rule.cssText));
            });
            newWindow.document.head.appendChild(newStyle);
          }
        } catch (e) {
          console.warn('Could not copy stylesheet', e);
        }
      });
      
      // Inject Tailwind base styles manually if needed (often handled by the copied stylesheets)
      newWindow.document.body.className = "bg-background text-foreground dark"; // Force dark mode class if that's the theme
      
      const el = newWindow.document.createElement('div');
      el.style.height = '100%';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      newWindow.document.body.appendChild(el);
      setContainerEl(el);

      newWindow.addEventListener('beforeunload', onClose);
    }

    return () => {
      if (externalWindow.current) {
        externalWindow.current.close();
        externalWindow.current = null;
      }
    };
  }, []); // Run once on mount

  return containerEl ? createPortal(children, containerEl) : null;
};
