import React, { useState, useEffect } from 'react';
import { changeCustomerPasswordApi } from '../../api/customerApi';
import { Lock, Eye, EyeOff, X, ShieldCheck, Loader2, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import Toast from '../common/Toast';
import ModalWrapper from './ModalWrapper';

const PasswordField = ({ label, name, value, onChange, show, onToggle, placeholder }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{
      display: 'block',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: '#F6EBDD',
      marginBottom: '6px'
    }}>
      {label} <span style={{ color: '#ef4444' }}>*</span>
    </label>
    <div style={{ position: 'relative' }}>
      <Lock
        size={15}
        style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#c9b4a6', pointerEvents: 'none' }}
      />
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 42px 10px 38px',
          borderRadius: '10px',
          background: '#1a0a0c',
          border: '1px solid rgba(246, 235, 221, 0.15)',
          color: '#F6EBDD',
          fontSize: '13px',
          boxSizing: 'border-box',
          outline: 'none',
          transition: 'all 0.15s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#E5384A';
          e.target.style.boxShadow = '0 0 0 2px rgba(229, 56, 74, 0.35)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(246, 235, 221, 0.15)';
          e.target.style.boxShadow = 'none';
        }}
      />
      <button
        type="button"
        onClick={onToggle}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#c9b4a6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
          borderRadius: '6px',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#F6EBDD'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#c9b4a6'; }}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  // Password strength checks
  const newPass = formData.new_password;
  const checks = {
    length:  newPass.length >= 8,
    upper:   /[A-Z]/.test(newPass),
    lower:   /[a-z]/.test(newPass),
    number:  /[0-9]/.test(newPass),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPass)
  };

  const score = Object.values(checks).filter(Boolean).length;

  const strengthConfig = score >= 5
    ? { label: 'Strong', color: '#7BD36B', bgColor: 'rgba(95, 138, 78, 0.25)', segments: 5 }
    : score >= 3
    ? { label: 'Medium', color: '#FFD76B', bgColor: 'rgba(217, 154, 43, 0.25)', segments: score }
    : { label: newPass.length > 0 ? 'Weak' : '', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.25)', segments: Math.max(1, score) };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      setErrorMessage('Please fill in all password fields.');
      return;
    }

    if (!checks.length) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (!checks.upper || !checks.lower || !checks.number || !checks.special) {
      setErrorMessage('Password must contain uppercase, lowercase, number, and special character.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setErrorMessage('Confirm password does not match new password.');
      return;
    }

    try {
      setLoading(true);
      const res = await changeCustomerPasswordApi(formData);
      const successText = res.data?.message || 'Password updated successfully.';
      setToast({ message: successText, type: 'success' });
      setTimeout(() => { onClose(); }, 800);
    } catch (err) {
      console.error('Failed to change password:', err);
      const msg = err.response?.data?.message || 'Failed to update password. Please check your current password.';
      setErrorMessage(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="500px">
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(246, 235, 221, 0.08)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(229, 56, 74, 0.15)',
              border: '1px solid rgba(229, 56, 74, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E5384A',
              flexShrink: 0
            }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fdf2e3', letterSpacing: '-0.01em' }}>
                Change Password
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#c9b4a6' }}>
                Keep your account secure with a strong password
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(246, 235, 221, 0.06)',
              border: '1px solid rgba(246, 235, 221, 0.12)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#c9b4a6',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(246, 235, 221, 0.15)';
              e.currentTarget.style.color = '#fdf2e3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(246, 235, 221, 0.06)';
              e.currentTarget.style.color = '#c9b4a6';
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            
            {/* Error Alert */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '18px'
              }}>
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px', color: '#ef4444' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Current Password */}
            <PasswordField
              label="Current Password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              placeholder="Enter your current password"
            />

            {/* New Password */}
            <PasswordField
              label="New Password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              placeholder="Create a strong new password"
            />

            {/* Password Strength Meter */}
            {newPass.length > 0 && (
              <div style={{
                marginBottom: '18px',
                padding: '14px 16px',
                background: 'rgba(26, 10, 12, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(246, 235, 221, 0.1)'
              }}>
                {/* Strength label & score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c9b4a6' }}>
                    Password Strength
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: strengthConfig.color,
                    background: strengthConfig.bgColor,
                    padding: '2px 8px',
                    borderRadius: '100px'
                  }}>
                    {strengthConfig.label}
                  </span>
                </div>

                {/* Segmented bar */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map((seg) => (
                    <div
                      key={seg}
                      style={{
                        flex: 1,
                        height: '5px',
                        borderRadius: '3px',
                        background: seg <= score ? strengthConfig.color : 'rgba(246, 235, 221, 0.12)',
                        transition: 'background 0.3s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Criteria checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                  {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'upper',  label: 'Uppercase letter (A-Z)' },
                    { key: 'lower',  label: 'Lowercase letter (a-z)' },
                    { key: 'number', label: 'At least one number' },
                    { key: 'special', label: 'Special character (!@#$)' }
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: checks[key] ? '#7BD36B' : '#786b64'
                      }}
                    >
                      {checks[key]
                        ? <CheckCircle2 size={13} style={{ color: '#7BD36B', flexShrink: 0 }} />
                        : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid rgba(246, 235, 221, 0.2)', flexShrink: 0 }} />
                      }
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm New Password */}
            <PasswordField
              label="Confirm New Password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              placeholder="Re-enter your new password"
            />

            {/* Confirm match indicator */}
            {formData.confirm_password.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: formData.new_password === formData.confirm_password ? '#7BD36B' : '#ef4444',
                marginTop: '-8px',
                marginBottom: '8px'
              }}>
                {formData.new_password === formData.confirm_password
                  ? <><CheckCircle2 size={13} /> <span>Passwords match</span></>
                  : <><AlertCircle size={13} /> <span>Passwords do not match</span></>
                }
              </div>
            )}

          </div>

          {/* Modal Footer (Always visible) */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid rgba(246, 235, 221, 0.08)',
            background: 'rgba(26, 8, 12, 0.5)',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(246, 235, 221, 0.2)',
                color: '#f6ebdd',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(246, 235, 221, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(193, 18, 31, 0.4)',
                opacity: loading ? 0.8 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? <Loader2 className="spin" size={16} /> : <ShieldCheck size={16} />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </ModalWrapper>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </>
  );
};

export default ChangePasswordModal;
