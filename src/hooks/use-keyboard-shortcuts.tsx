import { useEffect } from 'react';

interface KeyboardShortcuts {
  onF1?: () => void;
  onF2?: () => void;
  onF3?: () => void;
  onF4?: () => void;
  onF5?: () => void;
  onF6?: () => void;
  onF7?: () => void;
  onF8?: () => void;
  onF9?: () => void;
  onCtrlG?: () => void;
  onAltR?: () => void;
  onAltG?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser behavior for these keys
      if (
        e.key.startsWith('F') || 
        (e.ctrlKey && e.key === 'g') ||
        (e.altKey && (e.key === 'r' || e.key === 'G'))
      ) {
        e.preventDefault();
      }

      // Handle function keys
      switch (e.key) {
        case 'F1':
          shortcuts.onF1?.();
          break;
        case 'F2':
          shortcuts.onF2?.();
          break;
        case 'F3':
          shortcuts.onF3?.();
          break;
        case 'F4':
          shortcuts.onF4?.();
          break;
        case 'F5':
          shortcuts.onF5?.();
          break;
        case 'F6':
          shortcuts.onF6?.();
          break;
        case 'F7':
          shortcuts.onF7?.();
          break;
        case 'F8':
          shortcuts.onF8?.();
          break;
        case 'F9':
          shortcuts.onF9?.();
          break;
      }

      // Handle Ctrl+G
      if (e.ctrlKey && e.key === 'g') {
        shortcuts.onCtrlG?.();
      }

      // Handle Alt+R
      if (e.altKey && e.key === 'r') {
        shortcuts.onAltR?.();
      }

      // Handle Alt+G
      if (e.altKey && e.key === 'g') {
        shortcuts.onAltG?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}