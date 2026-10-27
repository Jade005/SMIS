import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { registerApi, suggestEmailApi } from '../../api/authApi';
import { getMiddleInitial, formatMiddleNameInput, getDisplayName } from '../../utils/nameHelper';
import { UserPlus, Clock, CheckCircle, ArrowLeft, Package, Sparkles } from 'lucide-react';
import Logo from '../../components/common/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    middle_initial: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const suggestTimeoutRef = useRef(null);

  // Floating embers animation
  const embers = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 3 + Math.random() * 6,
    dur: 8 + Math.random() * 8,
    delay: -Math.random() * 15,
    drift: (Math.random() - 0.5) * 100,
  })), []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMiddleNameChange = (val) => {
    const formatted = formatMiddleNameInput(val);
    const initial = getMiddleInitial(formatted);
    setFormData((prev) => ({
      ...prev,
      middle_name: formatted,
      middle_initial: initial
    }));
    if (noMiddleName && formatted) {
      setNoMiddleName(false);
    }
  };

  const handleToggleNoMiddleName = (checked) => {
    setNoMiddleName(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        middle_name: '',
        middle_initial: ''
      }));
    }
  };

  const handleNameChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    const first = (field === 'first_name' ? value : formData.first_name).trim().toLowerCase();
    const last  = (field === 'last_name'  ? value : formData.last_name).trim().toLowerCase();
    if (first || last) {
      const cleanFirst = first.replace(/[^a-z0-9]/g, '');
      const cleanLast = last.replace(/[^a-z0-9]/g, '');
      const base = (cleanFirst && cleanLast) ? `${cleanFirst}.${cleanLast}` : (cleanFirst || cleanLast);
      updated.email = base ? `${base}@smis.local` : '';
    } else {
      updated.email = '';
    }
    setFormData(updated);

    // Debounce query suggest-email to ensure uniqueness if name exists
    if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
    const cleanF = (field === 'first_name' ? value : formData.first_name).trim();
    const cleanL = (field === 'last_name' ? value : formData.last_name).trim();
    if (cleanF && cleanL) {
      suggestTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await suggestEmailApi(cleanF, cleanL);
          if (res.data?.email) {
            setFormData((prev) => ({ ...prev, email: res.data.email }));
          }
        } catch (e) {
          // ignore fallback
        }
      }, 400);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerApi(formData);
      setSubmitted(true); // Show pending approval screen
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Pending Approval Screen ---
  if (submitted) {
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
        <div className="marble-bg marble-drift" />
        {embers.map(e => (
          <span key={e.id} className="ember-particle" style={{
            left: `${e.left}%`, width: e.size, height: e.size,
            animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s`, '--dx': `${e.drift}px`
          }} />
        ))}

        <div className="tag-card slab-in" style={{
          background: 'linear-gradient(175deg, #2A0C10 0%, #1D0608 100%)',
          border: '1px solid rgba(246, 235, 221, 0.16)',
          borderTop: '6px solid #D99A2B',
          borderRadius: '20px',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Punched hole */}
          <span style={{
            position: 'absolute', top: 10, left: '50%', width: 14, height: 14, marginLeft: -7,
            borderRadius: '50%', background: '#1B0709', border: '2px solid rgba(246, 235, 221, 0.25)'
          }} />

          {/* Stamp */}
          <span className="stamp-badge" style={{ position: 'absolute', top: 24, right: 20, color: '#D99A2B', borderColor: '#D99A2B' }}>
            Pending Gate
          </span>

          <div style={{
            width: '68px',
            height: '68px',
            background: 'rgba(217, 154, 43, 0.18)',
            border: '2px solid #D99A2B',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Clock size={32} color="#FFD76B" />
          </div>

          <h1 style={{
            fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
            fontSize: '22px',
            fontWeight: 400,
            color: '#F6EBDD',
            marginBottom: '12px'
          }}>
            Account Request Submitted
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#7BD36B',
            fontWeight: 600,
            lineHeight: '1.6',
            marginBottom: '20px',
            background: 'rgba(95, 138, 78, 0.15)',
            border: '1px solid rgba(123, 211, 107, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px'
          }}>
            Your account request was submitted. Please wait for admin approval.
          </p>
          <p style={{ fontSize: '13px', color: '#C9B4A6', lineHeight: '1.6', marginBottom: '22px' }}>
            Your customer application for <strong style={{ color: '#F6EBDD' }}>{getDisplayName(formData)}</strong> ({formData.email}) is currently pending administrator verification. Once registered and approved by an administrator, you will be able to log in to place orders.
          </p>

          <div style={{
            background: 'rgba(95, 138, 78, 0.16)',
            border: '1px dashed #5F8A4E',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '26px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            textAlign: 'left'
          }}>
            <CheckCircle size={20} color="#7BD36B" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: '#E2D3C0', lineHeight: 1.5 }}>
              <strong style={{ color: '#7BD36B' }}>Cold-Chain RBAC Protocol:</strong><br />
              Admin approval ensures accurate sales records, cold-chain pre-order validation, and fair stock distribution.
            </div>
          </div>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', textDecoration: 'none' }}
          >
            Return to Portal Sign In
          </Link>
        </div>
      </div>
    );
  }

  // --- Registration Form ---
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
      <div className="marble-bg marble-drift" />
      {embers.map(e => (
        <span key={e.id} className="ember-particle" style={{
          left: `${e.left}%`, width: e.size, height: e.size,
          animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s`, '--dx': `${e.drift}px`
        }} />
      ))}

      {/* Top Steel Rail */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        background: 'linear-gradient(180deg, #d7dde3, #6d7680 60%, #3b4249)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.6)'
      }} />

      <div style={{ width: '100%', maxWidth: '490px', position: 'relative', zIndex: 10 }}>
        {/* String from rail */}
        <div style={{
          position: 'absolute', top: -46, left: '50%', width: 2, height: 48,
          background: '#6b5a48', transform: 'translateX(-50%)', zIndex: 1
        }} />

        <div className="tag-card slab-in" style={{
          background: 'linear-gradient(175deg, #2A0C10 0%, #1D0608 100%)',
          border: '1px solid rgba(246, 235, 221, 0.16)',
          borderTop: '6px solid #5F8A4E',
          borderRadius: '20px',
          padding: '36px 32px 32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(246,235,221,0.1)',
          position: 'relative'
        }}>
          {/* Punched hole */}
          <span style={{
            position: 'absolute', top: 10, left: '50%', width: 14, height: 14, marginLeft: -7,
            borderRadius: '50%', background: '#1B0709', border: '2px solid rgba(246, 235, 221, 0.25)'
          }} />

          {/* Rubber Stamp */}
          <span className="stamp-badge" style={{ position: 'absolute', top: 24, right: 20, color: '#7BD36B', borderColor: '#7BD36B' }}>
            Online Shop
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
              marginBottom: '18px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F6EBDD'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#C9B4A6'}
          >
            <ArrowLeft size={14} /> Back to Showcase
          </Link>

          {/* Header */}
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
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
                  Customer Registration
                </h1>
                <div style={{ fontSize: '11px', color: '#C9B4A6', fontWeight: 600, marginTop: '4px' }}>
                  Slaughterhouse Pre-Order Account
                </div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#C9B4A6', margin: 0 }}>
              Order fresh-cut beef, pork, chicken, goat, and rabbit weights straight from the butcher room.
            </p>
          </div>

          <div style={{
            background: 'rgba(217, 154, 43, 0.14)',
            border: '1px dashed #D99A2B',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '18px',
            fontSize: '11px',
            color: '#FFD76B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={14} style={{ flexShrink: 0 }} />
            <span>New accounts are queued for administrator verification before login access.</span>
          </div>

          {error && (
            <div style={{
              background: 'rgba(229, 56, 74, 0.18)',
              borderLeft: '4px solid #E5384A',
              color: '#FF8A96',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '16px',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={(e) => handleNameChange('first_name', e.target.value)}
                placeholder="Juan"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>
                  Middle Name <span style={{ fontSize: '10px', color: '#C9B4A6', fontWeight: 'normal', textTransform: 'none' }}>(optional)</span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  color: '#C9B4A6',
                  textTransform: 'none',
                  fontWeight: 'normal',
                  cursor: 'pointer',
                  userSelect: 'none',
                  margin: 0
                }}>
                  <input
                    type="checkbox"
                    checked={noMiddleName}
                    onChange={(e) => handleToggleNoMiddleName(e.target.checked)}
                    style={{ accentColor: '#E5384A', cursor: 'pointer' }}
                  />
                  <span>No middle name</span>
                </label>
              </div>
              <input
                type="text"
                name="middle_name"
                className="form-control"
                value={formData.middle_name}
                onChange={(e) => handleMiddleNameChange(e.target.value)}
                placeholder="Santos"
                disabled={noMiddleName}
                maxLength={50}
                style={noMiddleName ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              />
              <div style={{
                fontSize: '11.5px',
                color: formData.middle_initial ? '#7BD36B' : '#8C776B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '2px'
              }}>
                <span>Middle Initial: <strong>{formData.middle_initial || (noMiddleName ? 'None' : '—')}</strong></span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={(e) => handleNameChange('last_name', e.target.value)}
                placeholder="Dela Cruz"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>System Email Address <span style={{ fontSize: '10px', color: '#C9B4A6', fontWeight: 'normal' }}>(auto-generated)</span></label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan.delacruz@smis.local"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>Contact Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="0917-123-4567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label>Delivery / Pickup Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Barangay, City, Province"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-customer btn-lg"
              style={{ width: '100%', marginBottom: '14px' }}
              disabled={loading}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Submitting Registration...' : 'Submit Customer Registration'}</span>
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '12px',
            color: '#C9B4A6',
            borderTop: '1px dashed rgba(246, 235, 221, 0.12)',
            paddingTop: '14px'
          }}>
            Already have an active account?{' '}
            <Link to="/login" style={{ color: '#7BD36B', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
