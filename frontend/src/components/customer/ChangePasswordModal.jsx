import React, { useState, useEffect } from 'react';
import { changeCustomerPasswordApi } from '../../api/customerApi';
import { Lock, Eye, EyeOff, X, ShieldCheck, Loader2, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import Toast from '../common/Toast';

// Top-level component definition so React maintains DOM focus and cursor state across re-renders
const PasswordField = ({ label, name, value, onChange, show, onToggle, placeholder }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
      {label} <span style={{ color: '#ef4444' }}>*</span>
    </label>
    <div style={{ position: 'relative' }}>
      <Lock
        size={16}
        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}
      />
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className="form-input"
        placeholder={placeholder}
        style={{
          padding: '9px 44px 9px 38px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          fontSize: '13px',
          width: '100%',
          boxSizing: 'border-box'
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
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
          borderRadius: '6px',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#475569'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
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

  // Prevent background page from scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    ? { label: 'Strong', color: '#16a34a', bgColor: '#dcfce7', segments: 5 }
    : score >= 3
    ? { label: 'Medium', color: '#d97706', bgColor: '#fef3c7', segments: score }
    : { label: newPass.length > 0 ? 'Weak' : '', color: '#ef4444', bgColor: '#fee2e2', segments: Math.max(1, score) };

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
      setTimeout(() => { onClose(); }, 900);
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
      <div className="customer-modal-overlay" onClick={onClose}>
        <div
          className="customer-modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{ padding: '0', overflow: 'hidden' }}
        >
          {/* Enhanced Top Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            padding: '24px 28px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.4)',
                flexShrink: 0
              }}>
                <KeyRound size={22} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', letterSpacing: '-0.01em', color: '#ffffff' }}>
                  Change Password
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', opacity: 0.9, color: '#dbeafe' }}>
                  Keep your account secure with a strong password
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <div style={{ padding: '24px 28px', background: '#ffffff' }}>

            {/* Error Alert */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  {/* Strength label & bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Password Strength</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: strengthConfig.color,
                      background: strengthConfig.bgColor,
                      padding: '2px 10px',
                      borderRadius: '100px'
                    }}>
                      {strengthConfig.label}
                    </span>
                  </div>

                  {/* Segmented strength bar */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {[1, 2, 3, 4, 5].map((seg) => (
                      <div
                        key={seg}
                        style={{
                          flex: 1,
                          height: '6px',
                          borderRadius: '3px',
                          background: seg <= score ? strengthConfig.color : '#e2e8f0',
                          transition: 'background 0.3s ease'
                        }}
                      />
                    ))}
                  </div>

                  {/* Criteria checklist */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
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
                          color: checks[key] ? '#16a34a' : '#94a3b8',
                          gridColumn: key === 'special' ? 'span 2' : undefined
                        }}
                      >
                        {checks[key]
                          ? <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                          : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #cbd5e1', flexShrink: 0 }} />
                        }
                        {label}
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
                  color: formData.new_password === formData.confirm_password ? '#16a34a' : '#ef4444',
                  marginTop: '-10px',
                  marginBottom: '18px'
                }}>
                  {formData.new_password === formData.confirm_password
                    ? <><CheckCircle2 size={14} /> Passwords match</>
                    : <><AlertCircle size={14} /> Passwords do not match</>
                  }
                </div>
              )}

              {/* Actions Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid #f1f5f9',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={loading}
                  style={{
                    padding: '11px 26px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
                    opacity: loading ? 0.8 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {loading ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </>
  );
};

export default ChangePasswordModal;
