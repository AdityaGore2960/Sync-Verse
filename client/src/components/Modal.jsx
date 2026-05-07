import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal: Reusable structural base for all platform dialogs.
 * Uses React Portals to ensure perfect centering and bypass layout constraints.
 */
export default function Modal({ children, onClose, isOpen }) {
  const overlayRef = useRef(null);

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle click on the overlay backdrop
  const handleOverlayClick = (e) => {
    if (overlayRef.current === e.target) {
      onClose();
    }
  };

  return createPortal(
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/40 dark:bg-gray-950/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
        {children}
      </div>
    </div>,
    document.body
  );
}
