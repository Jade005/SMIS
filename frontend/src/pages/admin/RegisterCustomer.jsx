import React, { useState } from 'react';
import { createUserApi } from '../../api/userApi';
import { UserPlus, CheckCircle, ShieldCheck, Eye, EyeOff, Mail, UserCheck } from 'lucide-react';

const RegisterCustomer = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    const first = (field === 'first_name' ? value : formData.first_name).trim().toLowerCase();
    const last = (field === 'last_name' ? value : formData.last_name).trim().toLowerCase();
    if (first || last) {
      const cleanFirst = first.replace(/[^a-z0-9]/g, '');
      const cleanLast = last.replace(/[^a-z0-9]/g, '');
      const uname = `${cleanFirst}${cleanLast ? '.' + cleanLast : ''}`;
      updated.email = `${uname}@smis.local`;
      updated.password = `${cleanFirst}${cleanLast}123`;
    } else {
      updated.email = '';
      updated.password = '';
    }
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const payload = { ...formData, role: 'customer' };
      const res = await createUserApi(payload);
      setSuccess(res.data);
      // Reset form after successful registration
      setFormData({ first_name: '', last_name: '', email: '', password: '', phone: '', address: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="var(--primary)" />
            Register Customer Account (Admin Direct)
          </span>
        </div>

        {/* Auto-Approval Admin Notice Banner */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}
        >
          <ShieldCheck size={20} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
            <strong>Instant Auto-Approval:</strong> Customer accounts registered directly by an Administrator are immediately <em>Active</em> with verified status and bypass the pending approval queue.
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}
          >
            <CheckCircle size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '800', color: '#065f46', fontSize: '14px', marginBottom: '2px' }}>
                Customer Account Created & Activated!
              </div>
              <div style={{ fontSize: '13px', color: '#047857' }}>
                Account for <strong>{success.user?.first_name} {success.user?.last_name}</strong> (<code>{success.user?.email}</code>) is active and ready for POS & online store orders.
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {/* Customer Registration Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label>First Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={(e) => handleNameChange('first_name', e.target.value)}
                placeholder="e.g. Juan"
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={(e) => handleNameChange('last_name', e.target.value)}
                placeholder="e.g. Dela Cruz"
                required
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label>Email Address <span style={{ color: 'var(--danger)' }}>*</span> <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>(auto-filled)</span></label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@email.com"
                style={{ background: formData.email ? '#f0fdf4' : undefined }}
                required
              />
            </div>

            <div className="form-group">
              <label>Password <span style={{ color: 'var(--danger)' }}>*</span> <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>(auto-filled)</span></label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  style={{ width: '100%', paddingRight: '40px', background: formData.password ? '#f0fdf4' : undefined }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set account password"
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
          </div>

          <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label>Contact Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09XX-XXX-XXXX"
              />
            </div>

            <div className="form-group">
              <label>Home / Delivery Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, Barangay, City"
              />
            </div>
          </div>

          {/* Email Notification Note */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Mail size={16} color="#64748b" />
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              The customer will receive an email confirmation containing their login credentials and portal access link.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Customer Account...' : 'Register Customer Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCustomer;
