import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: isSuccess ? '#ecfdf5' : '#fef2f2',
        border: `1px solid ${isSuccess ? '#a7f3d0' : '#fecaca'}`,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        color: isSuccess ? '#065f46' : '#991b1b',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '420px'
      }}
    >
      {isSuccess ? (
        <CheckCircle2 style={{ color: '#10b981', flexShrink: 0 }} size={20} />
      ) : (
        <AlertCircle style={{ color: '#ef4444', flexShrink: 0 }} size={20} />
      )}
      <span style={{ flex: 1, lineHeight: '1.4' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: isSuccess ? '#047857' : '#b91c1c',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          transition: 'opacity 0.2s'
        }}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
