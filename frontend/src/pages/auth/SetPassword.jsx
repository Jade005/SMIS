import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { setPasswordApi } from '../../api/authApi';
import Logo from '../../components/common/Logo';
import { ShieldCheck, Eye, EyeOff, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

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

  // Embers animation
  const embers = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 3 + Math.random() * 6,
    dur: 8 + Math.random() * 8,
    delay: -Math.random() * 15,
    drift: (Math.random() - 0.5) * 100,
  })), []);

  useEffect(() => {
    if (!token) {
      setError('Activation token is missing. Please check the link in your notification email.');
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1B0709',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      color: '#F6EBDD'
    }}>
      <div className="marble-bg marble-drift" />
      {embers.map(e => (
        <span key={e.id} className="ember-particle" style={{
          left: `${e.left}%`, width: e.size, height: e.size,
          animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s`, '--dx': `${e.drift}px`
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 10 }}>
        <div className="tag-card slab-in" style={{
          background: 'linear-gradient(175deg, #2A0C10 0%, #1D0608 100%)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(246,235,221,0.1)',
          padding: '36px 32px',
          border: '1px solid rgba(246, 235, 221, 0.16)',
          borderTop: '6px solid #E5384A',
          position: 'relative'
        }}>
          {/* Back to Home Button */}
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#C9B4A6',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '18px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F6EBDD'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#C9B4A6'}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <Logo size={56} alt="SMIS Logo" />
            </div>
            <h1 style={{
              fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
              fontSize: '22px',
              fontWeight: 400,
              color: '#F6EBDD',
              margin: '0 0 6px 0',
              letterSpacing: '0.02em'
            }} className="meat-text">
              Activate Account
            </h1>
            <p style={{ margin: 0, color: '#C9B4A6', fontSize: '13px', lineHeight: '1.5' }}>
              Set a secure password to unlock system portal access.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(229, 56, 74, 0.18)',
              color: '#FF8A96',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid rgba(229, 56, 74, 0.4)'
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(95, 138, 78, 0.25)',
                border: '2px solid #7BD36B',
                color: '#7BD36B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                boxShadow: '0 0 20px rgba(123, 211, 107, 0.35)'
              }}>
                <ShieldCheck size={34} />
              </div>
              <h3 style={{
                fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
                fontSize: '18px',
                fontWeight: 400,
                color: '#F6EBDD',
                marginBottom: '10px'
              }}>
                Password Set Successfully!
              </h3>
              <p style={{ color: '#C9B4A6', fontSize: '13px', marginBottom: '20px' }}>{success}</p>
              <p style={{ color: '#FFD76B', fontSize: '12px', fontWeight: '600' }} className="blink">
                Redirecting you to portal sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="form-control"
                    style={{ paddingRight: '42px', height: '44px' }}
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
                      color: '#C9B4A6',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  className="form-control"
                  style={{ height: '44px' }}
                />
              </div>

              {/* Validation Rules */}
              <div style={{
                background: '#120406',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(246, 235, 221, 0.1)'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#C9B4A6',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '10px'
                }}>
                  Security Standards
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'length', text: 'At least 8 characters' },
                    { key: 'upper', text: 'One uppercase letter (A-Z)' },
                    { key: 'lower', text: 'One lowercase letter (a-z)' },
                    { key: 'number', text: 'One number (0-9)' },
                    { key: 'special', text: 'One special symbol (!@#$%)' }
                  ].map(({ key, text }) => (
                    <li key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: validations[key] ? '#7BD36B' : '#8C776B' }}>
                      <span style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: validations[key] ? 'rgba(95, 138, 78, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${validations[key] ? '#7BD36B' : 'rgba(255,255,255,0.15)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {validations[key] && <CheckCircle2 size={10} color="#7BD36B" />}
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !token || !Object.values(validations).every(Boolean)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Activating Account...' : 'Activate System Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
