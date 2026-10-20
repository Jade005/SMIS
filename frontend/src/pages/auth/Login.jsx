import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Scale, Package, ChevronRight } from 'lucide-react';
import Logo from '../../components/common/Logo';

const Login = ({ defaultRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // If user is already logged in, redirect them to their respective dashboard
  useEffect(() => {
    if (user && user.role) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'cashier') navigate('/cashier', { replace: true });
      else navigate('/customer', { replace: true });
    }
  }, [user, navigate]);

  // Determine active portal based on prop, pathname, or state
  const currentRole = useMemo(() => {
    if (defaultRole) return defaultRole;
    if (location.pathname.includes('admin')) return 'admin';
    if (location.pathname.includes('cashier')) return 'cashier';
    if (location.pathname.includes('customer')) return 'customer';
    return 'admin';
  }, [defaultRole, location.pathname]);

  const [selectedRole, setSelectedRole] = useState(currentRole);

  useEffect(() => {
    setSelectedRole(currentRole);
    setError('');
  }, [currentRole]);

  const handleTabChange = (role) => {
    setSelectedRole(role);
    setError('');
  };

  // Floating embers animation
  const embers = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 3 + Math.random() * 6,
    dur: 8 + Math.random() * 8,
    delay: -Math.random() * 15,
    drift: (Math.random() - 0.5) * 100,
  })), []);

  const portals = {
    admin: {
      label: 'Administrator',
      stamp: 'Head office',
      accent: '#E5384A',
      icon: ShieldCheck,
      desc: 'Management, inventory batches, accounts & sales analytics.'
    },
    cashier: {
      label: 'Cashier',
      stamp: 'Counter',
      accent: '#D99A2B',
      icon: Scale,
      desc: 'Weighing scale terminal, POS checkout & FIFO order fulfilment.'
    },
    customer: {
      label: 'Customer',
      stamp: 'Online shop',
      accent: '#5F8A4E',
      icon: Package,
      desc: 'Fresh cuts catalog, online pre-orders & delivery tracking.'
    }
  };

  const portal = portals[selectedRole] || portals.admin;
  const PortalIcon = portal.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password, selectedRole);
      if (loggedInUser.role === 'admin') navigate('/admin', { replace: true });
      else if (loggedInUser.role === 'cashier') navigate('/cashier', { replace: true });
      else navigate('/customer', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      setPassword(''); // Clear password field after a failed attempt
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1B0709',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      color: '#F6EBDD'
    }}>
      {/* Background Marbling & Embers */}
      <div className="marble-bg marble-drift" />
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(193, 18, 31, 0.4) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {embers.map(e => (
        <span
          key={e.id}
          className="ember-particle"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            animationDuration: `${e.dur}s`,
            animationDelay: `${e.delay}s`,
            '--dx': `${e.drift}px`
          }}
        />
      ))}

      {/* Top Steel Rail Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        background: 'linear-gradient(180deg, #d7dde3, #6d7680 60%, #3b4249)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.6)'
      }} />

      {/* Tag Card Container with punched hole & hanging line */}
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        {/* String from rail */}
        <div style={{
          position: 'absolute',
          top: -46,
          left: '50%',
          width: 2,
          height: 48,
          background: '#6b5a48',
          transform: 'translateX(-50%)',
          zIndex: 1
        }} />

        <div className="tag-card slab-in" style={{
          background: 'linear-gradient(175deg, #2A0C10 0%, #1D0608 100%)',
          border: '1px solid rgba(246, 235, 221, 0.16)',
          borderTop: `6px solid ${portal.accent}`,
          borderRadius: '20px',
          padding: '36px 32px 32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(246,235,221,0.1)',
          position: 'relative'
        }}>
          {/* Punched hole */}
          <span style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            width: 14,
            height: 14,
            marginLeft: -7,
            borderRadius: '50%',
            background: '#1B0709',
            border: '2px solid rgba(246, 235, 221, 0.25)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
          }} />

          {/* Rubber Stamp Badge */}
          <span className="stamp-badge" style={{
            position: 'absolute',
            top: 26,
            right: 22,
            color: portal.accent,
            borderColor: portal.accent
          }}>
            {portal.stamp}
          </span>

          {/* Back to Home Button */}
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#C9B4A6',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '20px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F6EBDD'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#C9B4A6'}
          >
            <ArrowLeft size={14} /> Back to Showcase
          </Link>

          {/* Header & Logo */}
          <div style={{ textAlign: 'left', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <Logo size={56} alt="SMIS Logo" />
              <div>
                <h1 style={{
                  fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
                  fontSize: '22px',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                  margin: 0
                }} className="meat-text">
                  SMIS Sign In
                </h1>
                <div style={{ fontSize: '11px', color: '#C9B4A6', fontWeight: 600, marginTop: '4px' }}>
                  Slaughterhouse Management Portal
                </div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#C9B4A6', margin: 0, lineHeight: 1.5 }}>
              {portal.desc}
            </p>
          </div>

          {/* Portal Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            background: '#120406',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(246, 235, 221, 0.1)',
            marginBottom: '20px'
          }}>
            {[
              { id: 'admin', label: 'Admin', color: '#E5384A' },
              { id: 'cashier', label: 'Cashier', color: '#D99A2B' },
              { id: 'customer', label: 'Customer', color: '#5F8A4E' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: selectedRole === tab.id ? tab.color : 'transparent',
                  color: selectedRole === tab.id ? (tab.id === 'cashier' ? '#1E1412' : '#ffffff') : '#C9B4A6',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 0',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRole === tab.id ? `0 2px 8px ${tab.color}40` : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(229, 56, 74, 0.18)',
              borderLeft: '4px solid #E5384A',
              color: '#FF8A96',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '18px',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Email Address or Username</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '38px', height: '44px' }}
                  placeholder="user@smis.local or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C9B4A6' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label>Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', height: '44px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C9B4A6' }} />
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
                    cursor: 'pointer',
                    color: '#C9B4A6',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginBottom: '16px',
                background: `linear-gradient(135deg, ${portal.accent}, #A60E1A)`,
                boxShadow: `0 8px 22px ${portal.accent}55`
              }}
              disabled={loading}
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : `Enter as ${portal.label}`}</span>
              <ChevronRight size={14} className="arr" />
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '12px',
            color: '#C9B4A6',
            borderTop: '1px dashed rgba(246, 235, 221, 0.12)',
            paddingTop: '16px'
          }}>
            Need a fresh meat customer account?{' '}
            <Link to="/register" style={{ color: '#7BD36B', fontWeight: 'bold', textDecoration: 'none' }}>
              Open account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
