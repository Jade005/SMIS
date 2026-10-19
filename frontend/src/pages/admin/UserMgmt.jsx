import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  toggleUserStatusApi,
  deactivateUserApi,
  activateUserApi,
  deleteUserApi,
  getPendingRegistrationsApi,
  approveRegistrationApi,
  rejectRegistrationApi
} from '../../api/userApi';
import {
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle,
  Mail,
  UserPlus,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  X,
  Pencil,
  Trash2
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const UserMgmt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentAdmin } = useAuth();
  const initialTab = searchParams.get('tab') === 'pending' ? 'pending' : 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Edit User state
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    role: 'customer',
    is_active: true,
    password: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Deactivate Modal state
  const [deactivateModalUser, setDeactivateModalUser] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  // Activate Modal state
  const [activateModalUser, setActivateModalUser] = useState(null);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateError, setActivateError] = useState('');

  // Delete Modal state
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteHasHistory, setDeleteHasHistory] = useState(false);

  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Safeguards
  const isSelf = (targetUser) => {
    if (!currentAdmin || !targetUser) return false;
    return String(currentAdmin.id) === String(targetUser.id) || currentAdmin.username === targetUser.username;
  };

  const activeAdminsCount = users.filter((u) => u.role === 'admin' && Boolean(u.is_active)).length;
  const isLastAdmin = (targetUser) => {
    return Boolean(targetUser?.role === 'admin' && targetUser?.is_active && activeAdminsCount <= 1);
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'active' && !u.is_active) return false;
    if (statusFilter === 'inactive' && u.is_active) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const id = String(u.id ?? '').toLowerCase();
    const statusText = u.is_active ? 'active' : 'inactive';
    return (
      fullName.includes(q) ||
      username.includes(q) ||
      email.includes(q) ||
      id.includes(q) ||
      `#${id}`.includes(q) ||
      statusText.includes(q)
    );
  });

  const filteredPendingUsers = pendingUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const id = String(u.id ?? '').toLowerCase();
    return (
      fullName.includes(q) ||
      username.includes(q) ||
      email.includes(q) ||
      id.includes(q) ||
      `#${id}`.includes(q)
    );
  });

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

  const handleOpenDeactivate = (user) => {
    if (isSelf(user)) {
      setToast({ message: 'You cannot deactivate your own account.', type: 'error' });
      return;
    }
    if (isLastAdmin(user)) {
      setToast({ message: 'Cannot deactivate the last remaining active administrator.', type: 'error' });
      return;
    }
    setDeactivateModalUser(user);
    setDeactivateError('');
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateModalUser) return;
    setDeactivateLoading(true);
    setDeactivateError('');
    try {
      await deactivateUserApi(deactivateModalUser.id);
      setDeactivateModalUser(null);
      setToast({ message: 'User deactivated.', type: 'success' });
      await loadUsers();
    } catch (err) {
      console.error('Failed to deactivate user:', err);
      setDeactivateError(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleOpenActivate = (user) => {
    setActivateModalUser(user);
    setActivateError('');
  };

  const handleConfirmActivate = async () => {
    if (!activateModalUser) return;
    setActivateLoading(true);
    setActivateError('');
    try {
      await activateUserApi(activateModalUser.id);
      setActivateModalUser(null);
      setToast({ message: 'User reactivated.', type: 'success' });
      await loadUsers();
    } catch (err) {
      console.error('Failed to reactivate user:', err);
      setActivateError(err.response?.data?.message || 'Failed to reactivate user.');
    } finally {
      setActivateLoading(false);
    }
  };

  const handleOpenDelete = (user) => {
    if (isSelf(user)) {
      setToast({ message: 'You cannot delete your own account.', type: 'error' });
      return;
    }
    if (isLastAdmin(user)) {
      setToast({ message: 'Cannot delete the last remaining active administrator.', type: 'error' });
      return;
    }
    setDeleteModalUser(user);
    setDeleteConfirmationInput('');
    setDeleteError('');
    setDeleteHasHistory(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;
    setDeleteLoading(true);
    setDeleteError('');
    setDeleteHasHistory(false);
    try {
      await deleteUserApi(deleteModalUser.id);
      setDeleteModalUser(null);
      setDeleteConfirmationInput('');
      setToast({ message: 'User deleted.', type: 'success' });
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      if (err.response?.status === 409) {
        setDeleteHasHistory(true);
        setDeleteError(
          err.response?.data?.message ||
          'This user has related sales/order history and cannot be deleted. Deactivate the account instead.'
        );
      } else {
        setDeleteError(err.response?.data?.message || 'Failed to delete user.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (id, is_active) => {
    try {
      if (is_active) {
        await deactivateUserApi(id);
        setToast({ message: 'User deactivated.', type: 'success' });
      } else {
        await activateUserApi(id);
        setToast({ message: 'User reactivated.', type: 'success' });
      }
      loadUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update user status.', type: 'error' });
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

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      role: user.role === 'customer' ? 'customer' : user.role,
      is_active: Boolean(user.is_active),
      password: ''
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const fName = editFormData.first_name.trim();
    const lName = editFormData.last_name.trim();
    const uName = editFormData.username.trim();
    const mail = editFormData.email.trim();

    if (!fName || !lName || !uName || !mail) {
      setEditError('All required fields (First Name, Last Name, Username, Email) must be filled.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      setEditError('Please enter a valid email address.');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const payload = {
        first_name: fName,
        last_name: lName,
        username: uName,
        email: mail,
        role: editFormData.role,
        is_active: editFormData.is_active ? 1 : 0
      };

      if (editFormData.password && editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }

      await updateUserApi(editingUser.id, payload);

      setShowEditModal(false);
      setEditingUser(null);
      setToast({ message: 'User updated successfully', type: 'success' });
      await loadUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      setEditError(err.response?.data?.message || 'Failed to update user. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const renderSearchBar = () => (
    <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        className="form-control user-search-input"
        placeholder="Search by name, username, email, or ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          paddingLeft: '34px',
          paddingRight: searchQuery ? '32px' : '12px',
          height: '38px',
          fontSize: '13px',
          background: '#140507',
          color: '#F6EBDD',
          border: '1px solid rgba(246, 235, 221, 0.2)',
          borderRadius: '8px'
        }}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          title="Clear search"
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <style>{`
        .user-search-input::placeholder {
          color: #94a3b8 !important;
        }
      `}</style>

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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {renderSearchBar()}
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  height: '38px',
                  fontSize: '13px',
                  background: '#140507',
                  color: '#F6EBDD',
                  border: '1px solid rgba(246, 235, 221, 0.2)',
                  borderRadius: '8px',
                  width: 'auto',
                  cursor: 'pointer',
                  padding: '0 12px'
                }}
                title="Filter by status"
              >
                <option value="all">All Statuses ({users.length})</option>
                <option value="active">Active ({users.filter((u) => Boolean(u.is_active)).length})</option>
                <option value="inactive">Inactive ({users.filter((u) => !u.is_active).length})</option>
              </select>
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
                      No users match your search
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.first_name} {u.last_name}</strong></td>
                      <td><code style={{ background: '#f1f5f9', color: '#111827', padding: '2px 6px', borderRadius: '4px' }}>{u.username || '—'}</code></td>
                      <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'cashier' ? 'badge-warning' : 'badge-gray'}`}>
                        {u.role === 'customer' ? 'USER' : u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`} style={{ letterSpacing: '0.04em' }}>
                          {u.is_active ? 'ACTIVE' : 'INACTIVE'}
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
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleOpenEdit(u)}
                          title={`Edit user #${u.id}`}
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        {u.is_active ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenDeactivate(u)}
                            disabled={isSelf(u) || isLastAdmin(u)}
                            title={
                              isSelf(u)
                                ? 'You cannot deactivate your own account'
                                : isLastAdmin(u)
                                ? 'Cannot deactivate the last remaining administrator'
                                : `Deactivate user #${u.id}`
                            }
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline btn-sm btn-success"
                            onClick={() => handleOpenActivate(u)}
                            title={`Activate user #${u.id}`}
                          >
                            Activate
                          </button>
                        )}

                        <button
                          className="btn btn-outline btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isSelf(u) || isLastAdmin(u) ? '#64748b' : '#ef4444',
                            borderColor: isSelf(u) || isLastAdmin(u) ? 'rgba(100, 116, 139, 0.3)' : '#ef4444',
                            opacity: isSelf(u) || isLastAdmin(u) ? 0.5 : 1,
                            cursor: isSelf(u) || isLastAdmin(u) ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleOpenDelete(u)}
                          disabled={isSelf(u) || isLastAdmin(u)}
                          title={
                            isSelf(u)
                              ? 'You cannot delete your own account'
                              : isLastAdmin(u)
                              ? 'Cannot delete the last remaining administrator'
                              : `Delete user #${u.id}`
                          }
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- PENDING APPROVALS TAB ---- */}
      {activeTab === 'pending' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#d97706" />
              Pending Customer Account Approvals
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {renderSearchBar()}
            </div>
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
                    {filteredPendingUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
                          No users match your search
                        </td>
                      </tr>
                    ) : (
                      filteredPendingUsers.map((u) => (
                        <tr key={u.id}>
                        <td><strong>{u.first_name} {u.last_name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td>{u.address || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td>{new Date(u.created_at).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleOpenEdit(u)}
                              title={`Edit user #${u.id}`}
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
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
                    )))}
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

      {/* ---- Edit User Modal ---- */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--fat)' }}>
                Edit User
              </h3>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditError(''); }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit}>
              <div className="form-grid" style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px' }}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px' }}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Doe"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
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
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="john.doe@smis.local"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid" style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px' }}>Role <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="form-control"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="customer">User</option>
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px' }}>Status</label>
                  <select
                    className="form-control"
                    value={editFormData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditFormData({ ...editFormData, is_active: val === 'active' });
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px' }}>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password (optional)"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  autoComplete="new-password"
                />
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Leave blank to keep the current password
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowEditModal(false); setEditError(''); }}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {editLoading ? <Loader2 className="spin" size={16} /> : null}
                  <span>{editLoading ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Deactivate Confirmation Modal ---- */}
      {deactivateModalUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--fat)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#f59e0b" />
                Deactivate User?
              </h3>
              <button
                type="button"
                onClick={() => { setDeactivateModalUser(null); setDeactivateError(''); }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {deactivateError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{deactivateError}</span>
              </div>
            )}

            <p style={{ fontSize: '14px', color: 'var(--mute)', lineHeight: '1.6', marginBottom: '24px' }}>
              <strong style={{ color: 'var(--fat)' }}>
                {deactivateModalUser.first_name} {deactivateModalUser.last_name}
              </strong> ({deactivateModalUser.username}) will no longer be able to log in. Their sales and order history will be kept. You can reactivate them anytime.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { setDeactivateModalUser(null); setDeactivateError(''); }}
                disabled={deactivateLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmDeactivate}
                disabled={deactivateLoading}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {deactivateLoading ? <Loader2 className="spin" size={16} /> : null}
                <span>{deactivateLoading ? 'Deactivating...' : 'Yes, Deactivate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Activate Confirmation Modal ---- */}
      {activateModalUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--fat)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#22c55e" />
                Activate User?
              </h3>
              <button
                type="button"
                onClick={() => { setActivateModalUser(null); setActivateError(''); }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {activateError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{activateError}</span>
              </div>
            )}

            <p style={{ fontSize: '14px', color: 'var(--mute)', lineHeight: '1.6', marginBottom: '24px' }}>
              Are you sure you want to reactivate <strong style={{ color: 'var(--fat)' }}>
                {activateModalUser.first_name} {activateModalUser.last_name}
              </strong> ({activateModalUser.username})? They will be able to log in again.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { setActivateModalUser(null); setActivateError(''); }}
                disabled={activateLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmActivate}
                disabled={activateLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {activateLoading ? <Loader2 className="spin" size={16} /> : null}
                <span>{activateLoading ? 'Activating...' : 'Yes, Activate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Delete Permanently Confirmation Modal ---- */}
      {deleteModalUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--fat)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={20} color="#ef4444" />
                Delete User Permanently?
              </h3>
              <button
                type="button"
                onClick={() => {
                  setDeleteModalUser(null);
                  setDeleteConfirmationInput('');
                  setDeleteError('');
                  setDeleteHasHistory(false);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {deleteError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{deleteError}</span>
              </div>
            )}

            {deleteHasHistory ? (
              <div>
                <p style={{ fontSize: '14px', color: 'var(--fat)', lineHeight: '1.6', marginBottom: '16px' }}>
                  This user has related sales/order history and cannot be deleted. Deactivate the account instead.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setDeleteModalUser(null);
                      setDeleteConfirmationInput('');
                      setDeleteError('');
                      setDeleteHasHistory(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => {
                      const target = deleteModalUser;
                      setDeleteModalUser(null);
                      setDeleteConfirmationInput('');
                      setDeleteError('');
                      setDeleteHasHistory(false);
                      handleOpenDeactivate(target);
                    }}
                    style={{ background: '#d97706', borderColor: '#d97706', color: '#fff' }}
                  >
                    Deactivate Instead
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', color: 'var(--mute)', lineHeight: '1.6', marginBottom: '16px' }}>
                  This will permanently remove <strong style={{ color: 'var(--fat)' }}>
                    {deleteModalUser.first_name} {deleteModalUser.last_name}
                  </strong>. This action cannot be undone.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                    Type <code style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 5px', borderRadius: '4px' }}>{deleteModalUser.username || 'DELETE'}</code> or <code style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 5px', borderRadius: '4px' }}>DELETE</code> to confirm:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Type ${deleteModalUser.username || 'DELETE'} or DELETE`}
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                    style={{
                      background: '#140507',
                      color: '#F6EBDD',
                      border: '1px solid rgba(246, 235, 221, 0.2)',
                      borderRadius: '8px'
                    }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setDeleteModalUser(null);
                      setDeleteConfirmationInput('');
                      setDeleteError('');
                      setDeleteHasHistory(false);
                    }}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleConfirmDelete}
                    disabled={
                      deleteLoading ||
                      !(
                        deleteConfirmationInput.trim() === (deleteModalUser.username || '') ||
                        deleteConfirmationInput.trim().toUpperCase() === 'DELETE'
                      )
                    }
                    style={{
                      background:
                        deleteConfirmationInput.trim() === (deleteModalUser.username || '') ||
                        deleteConfirmationInput.trim().toUpperCase() === 'DELETE'
                          ? '#ef4444'
                          : 'rgba(239, 68, 68, 0.3)',
                      color: '#fff',
                      border: 'none',
                      cursor:
                        deleteConfirmationInput.trim() === (deleteModalUser.username || '') ||
                        deleteConfirmationInput.trim().toUpperCase() === 'DELETE'
                          ? 'pointer'
                          : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {deleteLoading ? <Loader2 className="spin" size={16} /> : <Trash2 size={15} />}
                    <span>{deleteLoading ? 'Deleting...' : 'Delete Permanently'}</span>
                  </button>
                </div>
              </div>
            )}
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
