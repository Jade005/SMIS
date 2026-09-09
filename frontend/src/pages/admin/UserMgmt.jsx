import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUsersApi, createUserApi, toggleUserStatusApi, getPendingRegistrationsApi, approveRegistrationApi, rejectRegistrationApi } from '../../api/userApi';
import { Plus, ShieldCheck, Clock, CheckCircle, Mail, UserPlus, UserCheck, AlertCircle, Loader2, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Toast from '../../components/common/Toast';

const UserMgmt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') === 'pending' ? 'pending' : 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    role: 'cashier'
  });

  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const toggleReveal = (userId) => {
    setRevealedPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Auto-fill username (firstname.lastname) and email (firstname.lastname@smis.local)
  const handleNameChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    const first = (field === 'first_name' ? value : formData.first_name).trim().toLowerCase();
    const last = (field === 'last_name' ? value : formData.last_name).trim().toLowerCase();

    if (first || last) {
      const cleanFirst = first.replace(/[^a-z0-9]/g, '');
      const cleanLast = last.replace(/[^a-z0-9]/g, '');
      const uname = `${cleanFirst}${cleanLast ? '.' + cleanLast : ''}`;

      updated.username = uname;
      updated.email = `${uname}@smis.local`;
    } else {
      updated.username = '';
      updated.email = '';
    }
    setFormData(updated);
  };

  const loadUsers = useCallback(async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        getUsersApi(),
        getPendingRegistrationsApi()
      ]);
      setUsers(allRes.data || []);
      setPendingUsers(pendingRes.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pending') setActiveTab('pending');
    else if (tab === null) setActiveTab('all');
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'pending') setSearchParams({ tab: 'pending' });
    else setSearchParams({});
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserApi(formData);
      setShowModal(false);
      const generatedTemp = res.data?.temp_password || res.data?.user?.temp_password_plain;
      setCreatedCredentials({
        fullName: `${formData.first_name} ${formData.last_name}`,
        username: res.data?.user?.username || formData.username,
        email: res.data?.user?.email || formData.email,
        role: formData.role,
        tempPassword: generatedTemp
      });
      setFormData({ first_name: '', last_name: '', username: '', email: '', role: 'cashier' });
      setToast({
        message: res.data?.message || 'Account created successfully! Temporary password generated.',
        type: 'success'
      });
      loadUsers();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to create user account.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, is_active) => {
    try {
      await toggleUserStatusApi(id, !is_active);
      setToast({ message: `User account status updated.`, type: 'success' });
      loadUsers();
    } catch (err) {
      setToast({ message: 'Failed to update user status.', type: 'error' });
    }
  };

  const handleApprove = async (id, isReject = false) => {
    if (!window.confirm(isReject ? 'Are you sure you want to reject this registration application?' : 'Are you sure you want to approve this registration application?')) return;
    setApprovingId(id);
    try {
      if (isReject) {
        await rejectRegistrationApi(id);
        setToast({ message: 'Registration rejected successfully', type: 'success' });
        loadUsers();
      } else {
        const res = await approveRegistrationApi(id);
        const generatedPassword = res.data?.temp_password;
        const approvedUser = res.data?.user;

        loadUsers();

        // Show credentials popup so admin can share the password with the customer
        setCreatedCredentials({
          fullName: approvedUser ? `${approvedUser.first_name} ${approvedUser.last_name}` : '',
          username: approvedUser?.username || '',
          email: approvedUser?.email || '',
          role: 'customer',
          tempPassword: generatedPassword
        });
        setToast({
          message: res.data?.message || 'Customer approved! Share the generated password with the customer.',
          type: 'success'
        });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Action failed', type: 'error' });
    } finally {
      setApprovingId(null);
      setTimeout(() => setToast({ message: '', type: '' }), 5000);
    }
  };

  return (
    <div className="page-container">

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleTabChange('all')}
        >
          All Users ({users.length})
        </button>
        <button
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleTabChange('pending')}
          style={{ position: 'relative' }}
        >
          <Clock size={15} />
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff', borderRadius: '100px',
              fontSize: '10px', fontWeight: '800', padding: '2px 6px',
              marginLeft: '6px'
            }}>
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* ---- ALL USERS TAB ---- */}
      {activeTab === 'all' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span className="card-title" style={{ fontSize: '18px', fontWeight: '800' }}>
              Admin Account Management
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => navigate('/admin/register-customer')}
              >
                <UserCheck size={16} /> Register Customer Account
              </button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} /> Create User / Cashier
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.first_name} {u.last_name}</strong></td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{u.username || '—'}</code></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'cashier' ? 'badge-warning' : 'badge-gray'}`}>
                        {u.role === 'customer' ? 'USER' : u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-gray'}`}>
                          {u.is_active ? 'Active' : u.role === 'customer' ? 'Pending' : 'Inactive'}
                        </span>
                        {Boolean(u.is_temp_password) && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}>
                            <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700', fontFamily: 'monospace' }}>
                              ⚡ {revealedPasswords[u.id] ? (u.temp_password_plain || 'Temp Set') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleReveal(u.id)}
                              title={revealedPasswords[u.id] ? "Hide password" : "View temporary password"}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#b45309', display: 'flex', alignItems: 'center' }}
                            >
                              {revealedPasswords[u.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            {u.temp_password_plain && (
                              <button
                                type="button"
                                onClick={() => handleCopy(u.temp_password_plain, `user-${u.id}`)}
                                title="Copy temporary password"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#b45309', display: 'flex', alignItems: 'center' }}
                              >
                                {copiedKey === `user-${u.id}` ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {u.role === 'customer' && !u.is_active && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#16a34a', borderColor: '#16a34a' }}
                            onClick={() => handleApprove(u.id)}
                            disabled={approvingId === u.id}
                          >
                            <CheckCircle size={12} />
                            {approvingId === u.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}

                        <button
                          className={`btn btn-outline btn-sm ${u.is_active ? '' : 'btn-success'}`}
                          onClick={() => handleToggle(u.id, u.is_active)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- PENDING APPROVALS TAB ---- */}
      {activeTab === 'pending' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#d97706" />
              Pending Customer Account Approvals
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle size={40} color="#86efac" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 'bold' }}>All clear! No pending approvals.</p>
              <p style={{ fontSize: '12px' }}>All customer registrations have been reviewed.</p>
            </div>
          ) : (
            <>
              <div style={{ background: '#fffbeb', borderBottom: '1px solid #fcd34d', padding: '10px 16px', fontSize: '12px', color: '#92400e' }}>
                ⚠️ The following customer accounts are pending approval. Approved accounts will immediately be able to log in.
              </div>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Registered On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.first_name} {u.last_name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td>{u.address || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td>{new Date(u.created_at).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: '6px 12px', fontWeight: '700', fontSize: '12px' }}
                              onClick={() => handleApprove(u.id, false)}
                              disabled={approvingId === u.id}
                            >
                              <ShieldCheck size={14} />
                              {approvingId === u.id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: '6px 12px', fontWeight: '700', fontSize: '12px' }}
                              onClick={() => handleApprove(u.id, true)}
                              disabled={approvingId === u.id}
                            >
                              <AlertCircle size={14} />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- Add Account Modal ---- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Create Account (User / Cashier)
              </h3>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-grid" style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px' }}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John"
                    value={formData.first_name}
                    onChange={(e) => handleNameChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px' }}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Doe"
                    value={formData.last_name}
                    onChange={(e) => handleNameChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px' }}>Username <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. john.doe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="john.doe@smis.local"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px' }}>Role <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="cashier">Cashier</option>
                  <option value="customer">User (Customer)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Temporary Password Notice */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#166534',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Mail size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
                <div>
                  <strong>Automatic Password Generation & Email Notification</strong>
                  <p style={{ margin: '2px 0 0', opacity: 0.9 }}>
                    The system will automatically generate a <strong>temporary password</strong> and send an email notification containing the username, temporary password, and login instructions to the recipient's email address.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {loading ? <Loader2 className="spin" size={16} /> : <UserPlus size={16} />}
                  <span>{loading ? 'Creating...' : 'Create Account & Send Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Newly Created / Approved Credentials Popup Modal ---- */}
      {createdCredentials && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', borderRadius: '14px', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {createdCredentials.role === 'customer' ? 'Registration Approved!' : 'Account Created Successfully!'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                Credentials for <strong>{createdCredentials.fullName}</strong>
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Username:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <code style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    {createdCredentials.username}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.username, 'modal-username')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b', display: 'flex' }}
                    title="Copy Username"
                  >
                    {copiedKey === 'modal-username' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Email (Login ID):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '12px' }}>{createdCredentials.email}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.email, 'modal-email')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b', display: 'flex' }}
                    title="Copy Email"
                  >
                    {copiedKey === 'modal-email' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px dashed #cbd5e1',
                paddingTop: '10px',
                marginTop: '4px'
              }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700' }}>Generated Password:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <code style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '13px' }}>
                    {createdCredentials.tempPassword}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.tempPassword, 'modal-temp')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#b45309', display: 'flex' }}
                    title="Copy Password"
                  >
                    {copiedKey === 'modal-temp' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              background: createdCredentials.role === 'customer' ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${createdCredentials.role === 'customer' ? '#bbf7d0' : '#bfdbfe'}`,
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11px',
              color: createdCredentials.role === 'customer' ? '#166534' : '#1e40af',
              marginBottom: '16px'
            }}>
              {createdCredentials.role === 'customer'
                ? '✅ The customer can now log in using their Email and the generated password above. Please share these credentials with them directly.'
                : 'ℹ️ The user can log in with their credentials. They will be prompted to change their password on first login.'}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setCreatedCredentials(null)}
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default UserMgmt;
