import React, { useState } from 'react';
import { createUserApi } from '../../api/userApi';
import { UserPlus, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';

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
    setSuccess(null);
    setLoading(true);

    try {
      const payload = { ...formData, role: 'customer' };
      const res = await createUserApi(payload);
      setSuccess(res.data);
      // Reset form for next registration
      setFormData({ first_name: '', last_name: '', email: '', password: '', phone: '', address: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            Register New Customer
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Create a customer account on behalf of a walk-in client. The account will require admin approval before the customer can log in.
          </p>
        </div>

        {/* Approval Notice Banner */}
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Clock size={18} color="#d97706" style={{ marginTop: '1px', flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#92400e' }}>
            <strong>Pending Admin Approval Required</strong><br />
            Accounts registered here will be <em>inactive</em> until an administrator approves them from the Admin Portal → User Management → Pending Approvals tab.
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <CheckCircle size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '14px', marginBottom: '4px' }}>
                Customer Registered Successfully!
              </div>
              <div style={{ fontSize: '12px', color: '#166534' }}>
                Account for <strong>{success.user?.first_name} {success.user?.last_name}</strong> ({success.user?.email}) has been created and is pending admin approval.
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Registration Form Card */}
        <div className="card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label>First Name <span style={{ color: '#ef4444' }}>*</span></label>
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
                <label>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
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

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Email Address <span style={{ color: '#ef4444' }}>*</span> <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>(auto-filled)</span></label>
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

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Password <span style={{ color: '#ef4444' }}>*</span> <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>(auto-filled)</span></label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  style={{ width: '100%', paddingRight: '40px', background: formData.password ? '#f0fdf4' : undefined }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set a password for the customer"
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

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09XX-XXX-XXXX"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
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

            <button
              type="submit"
              className="btn btn-cashier btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <UserPlus size={18} />
              {loading ? 'Registering Customer...' : 'Register Customer Account'}
            </button>
          </form>
        </div>

        <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '12px' }}>
          After registering, remind the admin to approve the account in the Admin Portal.
        </p>
      </div>
    </div>
  );
};

export default RegisterCustomer;
