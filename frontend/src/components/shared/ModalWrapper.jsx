import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Shared modal wrapper with:
 * - React portal to document.body (avoids parent transform/overflow clipping)
 * - Fixed centered backdrop with dark semi-transparent oxblood background and blur
 * - Click backdrop to close
 * - Escape key to close
 * - Scroll lock on document.body while open
 * - Responsive centering on mobile and desktop
 */
const ModalWrapper = ({ isOpen, onClose, maxWidth = '500px', children }) => {
  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-portal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(10, 2, 4, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="modal-portal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(170deg, var(--ox3, #3a1219) 0%, var(--ox2, #2a0a0e) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(246, 235, 221, 0.12)',
          color: 'var(--fat, #F6EBDD)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default ModalWrapper;
