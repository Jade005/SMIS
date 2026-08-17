import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePasswordApi } from '../../api/userApi';
import { KeyRound, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Toast from '../common/Toast';

const ForceChangePasswordModal = ({ isOpen }) => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      setErrorMessage('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  // Password strength checks
  const newPass = formData.new_password;
  const checks = {
    length: newPass.length >= 8,
    upper: /[A-Z]/.test(newPass),
    lower: /[a-z]/.test(newPass),
    number: /[0-9]/.test(newPass),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPass)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const strengthConfig = score >= 5
    ? { label: 'Strong', color: '#16a34a', bgColor: '#dcfce7' }
    : score >= 3
    ? { label: 'Medium', color: '#d97706', bgColor: '#fef3c7' }
    : { label: newPass.length > 0 ? 'Weak' : '', color: '#ef4444', bgColor: '#fee2e2' };

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

    if (formData.new_password !== formData.confirm_password) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await changePasswordApi(formData);
      setToast({ message: res.data?.message || 'Password updated successfully! Welcome to SMIS.', type: 'success' });
      
      // Clear temporary password flags in state
      setTimeout(() => {
        setUser((prev) => ({
          ...prev,
          must_change_password: false,
          is_temp_password: 0
        }));
      }, 900);
    } catch (err) {
      console.error('Failed to change temp password:', err);
      const msg = err.response?.data?.message || 'Failed to update password. Please verify your temporary password.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>

          {/* Top Warning Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            padding: '24px 28px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              flexShrink: 0
            }}>
              <ShieldAlert size={26} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                Temporary Password Change Required
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.95, color: '#fef3c7' }}>
                For security reasons, you must change your temporary password before accessing the system.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '24px 28px' }}>

            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Current (Temporary) Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Current (Temporary) Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your temporary password"
                    style={{ paddingLeft: '38px', paddingRight: '40px', background: '#f8fafc' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                  New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Create a strong new password"
                    style={{ paddingLeft: '38px', paddingRight: '40px', background: '#f8fafc' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Re-enter your new password"
                    style={{ paddingLeft: '38px', paddingRight: '40px', background: '#f8fafc' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {formData.confirm_password.length > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600',
                    color: formData.new_password === formData.confirm_password ? '#16a34a' : '#ef4444', marginTop: '6px'
                  }}>
                    {formData.new_password === formData.confirm_password
                      ? <><CheckCircle2 size={14} /> Passwords match</>
                      : <><AlertCircle size={14} /> Passwords do not match</>
                    }
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={loading}
              >
                {loading ? <Loader2 className="spin" size={18} /> : <KeyRound size={18} />}
                <span>{loading ? 'Updating Password...' : 'Save Permanent Password & Continue'}</span>
              </button>
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

export default ForceChangePasswordModal;
