import { useEffect } from 'react';

/**
 * Global Security Enforcer
 * Implements client-side deterrents against piracy, downloading, and inspection.
 */
export function SecurityEnforcer() {
  useEffect(() => {
    // 1. Prevent Right-Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent common developer and save shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Shift+I / Cmd+Option+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }

      // Prevent Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }

      // Prevent Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
      }

      // Detect PrintScreen
      if (e.key === 'PrintScreen') {
        // We can't actually stop the OS from taking a screenshot, 
        // but we can clear the clipboard as a deterrent if it copies there
        navigator.clipboard.writeText('');
      }
    };

    // 3. Intercept Copy Events
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      // Optionally put a warning in the clipboard
      e.clipboardData?.setData('text/plain', 'Content protected by Stem Mantra LMS');
    };

    // 4. Intercept Aux clicks (middle mouse button for opening in new tab)
    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1) { // Middle click
        e.preventDefault();
      }
    };

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('auxclick', handleAuxClick);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('auxclick', handleAuxClick);
    };
  }, []);

  // This component doesn't render anything itself
  return null;
}
