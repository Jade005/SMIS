import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setPasswordApi } from '../../api/authApi';
import { SmisLogoMark } from '../../components/common/SmisLogo';
import { ShieldCheck, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (!token) {
      setError('Activation token is missing. Please check the link in your email.');
    }
  }, [token]);

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Activation token is missing.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const allValid = Object.values(validations).every(Boolean);
    if (!allValid) {
      setError('Please ensure your password meets all security requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await setPasswordApi(token, password, confirmPassword);
      setSuccess(res.data.message || 'Password has been set successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password. Your token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', padding: '40px', border: '1px solid #e2e8f0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: '#f1f5f9', borderRadius: '16px', marginBottom: '16px' }}>
            <SmisLogoMark size={48} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Activate Account</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
            Set a secure password to activate your account and access the system.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>Success!</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>{success}</p>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type your password again"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Validation Rules */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password Requirements
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: 'length', text: 'At least 8 characters' },
                  { key: 'upper', text: 'One uppercase letter (A-Z)' },
                  { key: 'lower', text: 'One lowercase letter (a-z)' },
                  { key: 'number', text: 'One number (0-9)' },
                  { key: 'special', text: 'One special character (!@#$%)' }
                ].map(({ key, text }) => (
                  <li key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: validations[key] ? '#10b981' : '#94a3b8' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '8px', background: validations[key] ? '#d1fae5' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {validations[key] && <ShieldCheck size={10} color="#10b981" />}
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !token || !Object.values(validations).every(Boolean)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: loading || !token || !Object.values(validations).every(Boolean) ? 'not-allowed' : 'pointer',
                opacity: loading || !token || !Object.values(validations).every(Boolean) ? 0.7 : 1,
                marginTop: '8px',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {loading ? 'Activating...' : 'Activate Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
