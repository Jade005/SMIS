import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUsersApi, createUserApi, toggleUserStatusApi, getPendingUsersApi, approveUserApi } from '../../api/userApi';
import { Plus, ShieldCheck, Clock, CheckCircle, Eye, EyeOff } from 'lucide-react';

const UserMgmt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'pending' ? 'pending' : 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'cashier' });
  const [approvingId, setApprovingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-fill email (firstname.lastname@smis.local) and password (firstnamelastname123)
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

  const loadUsers = useCallback(async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        getUsersApi(),
        getPendingUsersApi()
      ]);
      setUsers(allRes.data || []);
      setPendingUsers(pendingRes.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    // Sync tab with URL query param
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
    try {
      await createUserApi(formData);
      setShowModal(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '', role: 'cashier' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggle = async (id, is_active) => {
    try {
      await toggleUserStatusApi(id, !is_active);
      loadUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await approveUserApi(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve account');
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
              marginLeft: '4px'
            }}>
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* ---- ALL USERS TAB ---- */}
      {activeTab === 'all' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">User Account Management</span>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add User Account
            </button>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
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
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'cashier' ? 'badge-warning' : 'badge-gray'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {u.is_active ? 'Active' : u.role === 'customer' ? 'Pending' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggle(u.id, u.is_active)}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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

      {/* ---- Add User Modal ---- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '16px' }}>Add User Account</h3>
            <form onSubmit={handleCreate}>
              <div className="form-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
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
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ background: formData.email ? '#f0fdf4' : undefined }}
                />
              </div>
              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-control" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Password <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>(auto-filled)</span></label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: '100%', paddingRight: '40px', background: formData.password ? '#f0fdf4' : undefined }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMgmt;
