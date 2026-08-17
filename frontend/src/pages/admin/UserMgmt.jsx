import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUsersApi, createUserApi, toggleUserStatusApi, getPendingUsersApi, approveUserApi, resetPasswordApi } from '../../api/userApi';
import { Plus, ShieldCheck, Clock, CheckCircle, KeyRound, Mail, UserPlus, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import Toast from '../../components/common/Toast';

const UserMgmt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'pending' ? 'pending' : 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [resetModalUser, setResetModalUser] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    role: 'cashier'
  });

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Auto-fill username (firstname.lastname) and email (firstname.lastname@smis.local)
  const handleNameChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    const first = (field === 'first_name' ? value : formData.first_name).trim().toLowerCase();
    const last  = (field === 'last_name'  ? value : formData.last_name).trim().toLowerCase();
    
    if (first || last) {
      const cleanFirst = first.replace(/[^a-z0-9]/g, '');
      const cleanLast  = last.replace(/[^a-z0-9]/g, '');
      const uname = `${cleanFirst}${cleanLast ? '.' + cleanLast : ''}`;
      
      updated.username = uname;
      updated.email    = `${uname}@smis.local`;
    } else {
      updated.username = '';
      updated.email    = '';
    }
    setFormData(updated);
  };

  const loadUsers = useCallback(async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        getUsersApi(),
        getPendingUsersApi()
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
      setFormData({ first_name: '', last_name: '', username: '', email: '', role: 'cashier' });
      setToast({
        message: res.data?.message || 'Account created successfully! Temporary password emailed to user.',
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

  const handleResetPassword = async () => {
    if (!resetModalUser) return;
    setResetLoading(true);
    try {
      const res = await resetPasswordApi(resetModalUser.id);
      setToast({
        message: res.data?.message || `Temporary password reset for ${resetModalUser.first_name} and emailed.`,
        type: 'success'
      });
      setResetModalUser(null);
      loadUsers();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to reset password.',
        type: 'error'
      });
    } finally {
      setResetLoading(false);
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

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await approveUserApi(id);
      setToast({ message: 'Account approved successfully.', type: 'success' });
      loadUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to approve account.', type: 'error' });
    } finally {
      setApprovingId(null);
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
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ fontSize: '18px', fontWeight: '800' }}>
              Admin Account & Password Management
            </span>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <UserPlus size={16} /> Create User / Cashier Account
            </button>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-gray'}`}>
                          {u.is_active ? 'Active' : u.role === 'customer' ? 'Pending' : 'Inactive'}
                        </span>
                        {Boolean(u.is_temp_password) && (
                          <span style={{ fontSize: '10px', color: '#d97706', fontWeight: '700' }}>
                            ⚡ Temp Password
                          </span>
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
                          className="btn btn-outline btn-sm"
                          onClick={() => setResetModalUser(u)}
                          title="Reset user password"
                          style={{ borderColor: '#3b82f6', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <KeyRound size={13} /> Reset Password
                        </button>

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
                          <button
                            className="btn btn-sm"
                            style={{ background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: '6px 12px', fontWeight: '700', fontSize: '12px' }}
                            onClick={() => handleApprove(u.id)}
                            disabled={approvingId === u.id}
                          >
                            <ShieldCheck size={14} />
                            {approvingId === u.id ? 'Approving...' : 'Approve Account'}
                          </button>
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

      {/* ---- Reset Password Modal ---- */}
      {resetModalUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
              }}>
                <KeyRound size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Reset Account Password</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                For <strong>{resetModalUser.first_name} {resetModalUser.last_name}</strong> ({resetModalUser.email})
              </p>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#92400e', marginBottom: '20px' }}>
              <AlertCircle size={16} style={{ float: 'left', marginRight: '8px', marginTop: '2px' }} />
              A new <strong>temporary password</strong> will be generated automatically and emailed to <strong>{resetModalUser.email}</strong>. The user will be required to change it upon their next login.
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setResetModalUser(null)}
                disabled={resetLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResetPassword}
                disabled={resetLoading}
                style={{ background: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {resetLoading ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}
                <span>{resetLoading ? 'Resetting & Sending...' : 'Reset & Send New Credentials'}</span>
              </button>
            </div>
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
