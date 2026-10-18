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
  const accent = isSuccess ? '#7BD36B' : '#E5384A';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: 'linear-gradient(170deg, #3A1217 0%, #2A0C10 100%)',
        border: `1px solid ${accent}66`,
        borderLeft: `4px solid ${accent}`,
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(246, 235, 221, 0.1)',
        color: '#F6EBDD',
        fontSize: '13px',
        fontWeight: '600',
        animation: 'modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '420px'
      }}
    >
      {isSuccess ? (
        <CheckCircle2 style={{ color: '#7BD36B', flexShrink: 0 }} size={20} />
      ) : (
        <AlertCircle style={{ color: '#E5384A', flexShrink: 0 }} size={20} />
      )}
      <span style={{ flex: 1, lineHeight: '1.4' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#C9B4A6',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#F6EBDD'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#C9B4A6'}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
