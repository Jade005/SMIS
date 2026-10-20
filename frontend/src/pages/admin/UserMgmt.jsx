import React, { useEffect, useState, useCallback } from 'react';
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  toggleUserStatusApi,
  deactivateUserApi,
  activateUserApi,
  deleteUserApi
} from '../../api/userApi';
import {
  Plus,
  ShieldCheck,
  CheckCircle,
  Mail,
  UserPlus,
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
  Trash2,
  Ban,
  Power
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const UserMgmt = () => {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
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

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    role: 'cashier'
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const toggleReveal = (userId) => {
    setRevealedPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
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
      const allRes = await getUsersApi();
      setUsers(allRes.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
    if (!window.confirm(isReject ? 'Are you sure you want to reject this registration application?' : 'Are you sure you want to register (approve) this customer account?')) return;
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
        .user-mgmt-table-responsive {
          width: 100%;
          overflow-x: auto;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: var(--ox2);
        }
        .user-mgmt-table {
          width: 100%;
          min-width: 1180px;
          border-collapse: separate;
          border-spacing: 0;
        }
        .user-mgmt-table th,
        .user-mgmt-table td {
          vertical-align: middle !important;
          padding: 12px 14px;
        }
        .action-btn {
          height: 35px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 600;
          border-radius: 8px;
          flex-shrink: 0;
          box-sizing: border-box;
          line-height: 1;
          transition: all 0.2s ease;
        }
        .action-btn-text {
          display: inline;
          white-space: nowrap;
        }
        .actions-cell-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }
        @media (max-width: 1280px) {
          .action-btn-text {
            display: none;
          }
          .action-btn {
            padding: 0 10px;
            width: 35px;
          }
          .actions-col-header,
          .actions-col-cell {
            min-width: 150px !important;
            width: 150px !important;
          }
          .user-mgmt-table {
            min-width: 980px;
          }
        }
      `}</style>

      {/* ---- ALL USERS LIST ---- */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="card-title" style={{ fontSize: '18px', fontWeight: '800' }}>
              All Users
            </span>
            <span style={{
              background: 'rgba(229, 56, 74, 0.18)',
              color: '#FF8A96',
              border: '1px solid rgba(229, 56, 74, 0.35)',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: '800',
              padding: '2px 9px'
            }}>
              {users.length}
            </span>
          </div>
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
              <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} /> Create User / Cashier
              </button>
            </div>
          </div>

          <div className="table-responsive user-mgmt-table-responsive">
            <table className="user-mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', minWidth: '60px' }}>ID</th>
                  <th style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>Full Name</th>
                  <th style={{ minWidth: '140px' }}>Username</th>
                  <th style={{ minWidth: '190px' }}>Email Address</th>
                  <th style={{ width: '80px', minWidth: '80px' }}>Role</th>
                  <th style={{ minWidth: '130px' }}>Status</th>
                  <th style={{ width: '110px', minWidth: '110px', whiteSpace: 'nowrap' }}>Registered</th>
                  <th className="actions-col-header" style={{ minWidth: '320px', width: '320px', textAlign: 'left' }}>Actions</th>
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
                      <td style={{ verticalAlign: 'middle' }}>#{u.id}</td>
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}><strong>{u.first_name} {u.last_name}</strong></td>
                      <td style={{ verticalAlign: 'middle' }}><code style={{ background: '#f1f5f9', color: '#111827', padding: '2px 6px', borderRadius: '4px' }}>{u.username || '—'}</code></td>
                      <td style={{ verticalAlign: 'middle' }}>{u.email}</td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'cashier' ? 'badge-warning' : 'badge-gray'}`}>
                          {u.role === 'customer' ? 'USER' : u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
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
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="actions-col-cell" style={{ minWidth: '320px', width: '320px', textAlign: 'left', verticalAlign: 'middle' }}>
                        <div className="actions-cell-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                          {u.status === 'pending' || u.is_pending ? (
                            <>
                              <button
                                className="btn btn-outline btn-sm action-btn"
                                onClick={() => handleOpenEdit(u)}
                                title={`Edit user #${u.id}`}
                              >
                                <Pencil size={12} />
                                <span className="action-btn-text">Edit</span>
                              </button>
                              <button
                                className="btn btn-sm action-btn"
                                style={{
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  fontWeight: '700'
                                }}
                                onClick={() => handleApprove(u.id, false)}
                                disabled={approvingId === u.id}
                                title="Approve registration"
                              >
                                <ShieldCheck size={14} />
                                <span className="action-btn-text">{approvingId === u.id ? 'Approving...' : 'Approve'}</span>
                              </button>
                              <button
                                className="btn btn-outline btn-sm action-btn"
                                style={{
                                  color: '#22c55e',
                                  borderColor: 'rgba(34, 197, 94, 0.4)',
                                  background: 'rgba(34, 197, 94, 0.08)'
                                }}
                                onClick={() => handleOpenActivate(u)}
                                title={`Activate user #${u.id}`}
                              >
                                <Power size={12} />
                                <span className="action-btn-text">Activate</span>
                              </button>
                              <button
                                className="btn btn-outline btn-sm action-btn"
                                style={{
                                  color: isSelf(u) || isLastAdmin(u) ? '#64748b' : '#ef4444',
                                  borderColor: isSelf(u) || isLastAdmin(u) ? 'rgba(100, 116, 139, 0.3)' : '#ef4444',
                                  opacity: isSelf(u) || isLastAdmin(u) ? 0.45 : 1,
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
                                <span className="action-btn-text">Delete</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-outline btn-sm action-btn"
                                onClick={() => handleOpenEdit(u)}
                                title={`Edit user #${u.id}`}
                              >
                                <Pencil size={12} />
                                <span className="action-btn-text">Edit</span>
                              </button>

                              {u.is_active ? (
                                <button
                                  className="btn btn-outline btn-sm action-btn"
                                  onClick={() => handleOpenDeactivate(u)}
                                  disabled={isSelf(u) || isLastAdmin(u)}
                                  style={{
                                    opacity: isSelf(u) || isLastAdmin(u) ? 0.45 : 1,
                                    cursor: isSelf(u) || isLastAdmin(u) ? 'not-allowed' : 'pointer',
                                    color: isSelf(u) || isLastAdmin(u) ? '#64748b' : undefined,
                                    borderColor: isSelf(u) || isLastAdmin(u) ? 'rgba(100, 116, 139, 0.3)' : undefined
                                  }}
                                  title={
                                    isSelf(u)
                                      ? 'You cannot deactivate your own account'
                                      : isLastAdmin(u)
                                      ? 'Cannot deactivate the last remaining administrator'
                                      : `Deactivate user #${u.id}`
                                  }
                                >
                                  <Ban size={12} />
                                  <span className="action-btn-text">Deactivate</span>
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline btn-sm action-btn"
                                  style={{
                                    color: '#22c55e',
                                    borderColor: 'rgba(34, 197, 94, 0.4)',
                                    background: 'rgba(34, 197, 94, 0.08)'
                                  }}
                                  onClick={() => handleOpenActivate(u)}
                                  title={`Activate user #${u.id}`}
                                >
                                  <Power size={12} />
                                  <span className="action-btn-text">Activate</span>
                                </button>
                              )}

                              <button
                                className="btn btn-outline btn-sm action-btn"
                                style={{
                                  color: isSelf(u) || isLastAdmin(u) ? '#64748b' : '#ef4444',
                                  borderColor: isSelf(u) || isLastAdmin(u) ? 'rgba(100, 116, 139, 0.3)' : '#ef4444',
                                  opacity: isSelf(u) || isLastAdmin(u) ? 0.45 : 1,
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
                                <span className="action-btn-text">Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>

      {/* ---- Add Account Modal ---- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#FFF1F2' }}>
                Create Account (User / Cashier)
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#e5d5c3', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-grid" style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
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
                  <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
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
                <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>Username <span style={{ color: '#ef4444' }}>*</span></label>
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
                <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
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
                <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>Role <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="cashier">Cashier</option>
                  <option value="customer">User (Customer)</option>
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
          <div className="modal-content" style={{ maxWidth: '460px', borderRadius: '16px', padding: '28px', background: 'linear-gradient(170deg, #2A0C10 0%, #1B0709 100%)', border: '1px solid rgba(246, 235, 221, 0.16)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
              }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#fdf2e3',
                fontFamily: "var(--font-display, 'Alfa Slab One', 'Rockwell', 'Georgia', serif)",
                letterSpacing: '0.02em',
                lineHeight: 1.2
              }}>
                {createdCredentials.role === 'customer' ? 'Registration Approved!' : 'Account Created Successfully!'}
              </h3>
              <p style={{ fontSize: '13px', color: '#e5d5c3', margin: '6px 0 0', lineHeight: 1.5 }}>
                Credentials for <strong style={{ color: '#ffffff', fontWeight: '700' }}>{createdCredentials.fullName}</strong>
              </p>
            </div>

            {/* Credentials Card (Dark Maroon-Black #1a0a0c) */}
            <div style={{
              background: '#1a0a0c',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px 18px',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '13px',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Username row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: '#d9c7b5', fontSize: '12px', fontWeight: '600' }}>Username:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fdf2e3',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                    wordBreak: 'break-all'
                  }}>
                    {createdCredentials.username}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.username, 'modal-username')}
                    style={{
                      background: copiedKey === 'modal-username' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid ' + (copiedKey === 'modal-username' ? 'rgba(134, 239, 172, 0.4)' : 'rgba(255, 255, 255, 0.15)'),
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      color: copiedKey === 'modal-username' ? '#86efac' : '#e5d5c3',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      transition: 'all 0.15s ease'
                    }}
                    title={copiedKey === 'modal-username' ? 'Copied!' : 'Copy Username'}
                    onMouseEnter={(e) => {
                      if (copiedKey !== 'modal-username') {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedKey !== 'modal-username') {
                        e.currentTarget.style.color = '#e5d5c3';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                  >
                    {copiedKey === 'modal-username' ? (
                      <>
                        <Check size={13} color="#86efac" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Email row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: '#d9c7b5', fontSize: '12px', fontWeight: '600' }}>Email (Login ID):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '100%' }}>
                  <code style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fdf2e3',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                    wordBreak: 'break-all',
                    maxWidth: '220px'
                  }}>
                    {createdCredentials.email}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.email, 'modal-email')}
                    style={{
                      background: copiedKey === 'modal-email' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid ' + (copiedKey === 'modal-email' ? 'rgba(134, 239, 172, 0.4)' : 'rgba(255, 255, 255, 0.15)'),
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      color: copiedKey === 'modal-email' ? '#86efac' : '#e5d5c3',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      transition: 'all 0.15s ease'
                    }}
                    title={copiedKey === 'modal-email' ? 'Copied!' : 'Copy Email'}
                    onMouseEnter={(e) => {
                      if (copiedKey !== 'modal-email') {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedKey !== 'modal-email') {
                        e.currentTarget.style.color = '#e5d5c3';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                  >
                    {copiedKey === 'modal-email' ? (
                      <>
                        <Check size={13} color="#86efac" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Password row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
                paddingTop: '12px',
                marginTop: '4px'
              }}>
                <span style={{ color: '#d9c7b5', fontSize: '12px', fontWeight: '700' }}>Generated Password:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{
                    background: '#fbbf24',
                    color: '#451a03',
                    border: '1px solid #f59e0b',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: '800',
                    fontSize: '14px',
                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                    letterSpacing: '0.12em',
                    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)',
                    userSelect: 'all'
                  }}>
                    {createdCredentials.tempPassword}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.tempPassword, 'modal-temp')}
                    style={{
                      background: copiedKey === 'modal-temp' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid ' + (copiedKey === 'modal-temp' ? 'rgba(134, 239, 172, 0.4)' : 'rgba(255, 255, 255, 0.15)'),
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      color: copiedKey === 'modal-temp' ? '#86efac' : '#e5d5c3',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      transition: 'all 0.15s ease'
                    }}
                    title={copiedKey === 'modal-temp' ? 'Copied!' : 'Copy Password'}
                    onMouseEnter={(e) => {
                      if (copiedKey !== 'modal-temp') {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedKey !== 'modal-temp') {
                        e.currentTarget.style.color = '#e5d5c3';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                  >
                    {copiedKey === 'modal-temp' ? (
                      <>
                        <Check size={13} color="#86efac" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              background: createdCredentials.role === 'customer' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(59, 130, 246, 0.12)',
              border: `1px solid ${createdCredentials.role === 'customer' ? 'rgba(134, 239, 172, 0.35)' : 'rgba(147, 197, 253, 0.35)'}`,
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '14px',
              lineHeight: 1.55,
              color: createdCredentials.role === 'customer' ? '#bbf7d0' : '#bfdbfe',
              marginBottom: '20px'
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
                    <option value="cashier">Cashier</option>
                    <option value="customer">User (Customer)</option>
                    {editingUser?.role === 'admin' && (
                      <option value="admin">Admin</option>
                    )}
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
