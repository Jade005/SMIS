import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../../api/authApi';
import { UserPlus, Clock, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    const first = (field === 'first_name' ? value : formData.first_name).trim().toLowerCase();
    const last  = (field === 'last_name'  ? value : formData.last_name).trim().toLowerCase();
    if (first || last) {
      updated.email    = `${first}${last ? '.' + last : ''}@smis.local`;
      updated.password = `${first}${last}123`;
    } else {
      updated.email    = '';
      updated.password = '';
    }
    setFormData(updated);
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.35)', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Clock size={36} color="#d97706" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Registration Submitted!</h1>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
            Your account for <strong>{formData.first_name} {formData.last_name}</strong> has been submitted and is awaiting admin approval.
            <br /><br />
            You will be able to log in once an administrator reviews and approves your account.
          </p>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left' }}>
            <CheckCircle size={18} color="#16a34a" style={{ marginTop: '1px', flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: '#166534' }}>
              <strong>What happens next?</strong><br />
              An administrator will review your registration and activate your account. This typically takes less than 24 hours.
            </div>
          </div>

          <Link
            to="/login"
            style={{ display: 'block', background: '#0f172a', color: '#fff', borderRadius: '8px', padding: '12px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  // --- Registration Form ---
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        {/* Back to Home Button */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '16px',
            transition: 'color 0.2s'
          }}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>🛒</div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Customer Registration</h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Create an account to order fresh meats online</p>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '11px', color: '#92400e' }}>
          ⚠️ <strong>Note:</strong> New accounts require admin approval before you can log in.
        </div>

        {error && (
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '12px' }}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={(e) => handleNameChange('first_name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={(e) => handleNameChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Email Address <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>(auto-filled)</span></label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              style={{ background: formData.email ? '#f0fdf4' : undefined }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Password <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>(auto-filled)</span></label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                style={{ width: '100%', paddingRight: '40px', background: formData.password ? '#f0fdf4' : undefined }}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Phone Number</label>
            <input type="tel" name="phone" className="form-control" placeholder="09XX-XXX-XXXX" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Address</label>
            <input type="text" name="address" className="form-control" placeholder="Delivery address" value={formData.address} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-customer btn-lg" style={{ width: '100%' }} disabled={loading}>
            <UserPlus size={16} />
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
