import React, { useEffect, useState, useCallback } from 'react';
import {
  getPendingRegistrationsApi,
  approveRegistrationApi,
  rejectRegistrationApi
} from '../../api/userApi';
import {
  Clock,
  UserCheck,
  XCircle,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Loader2,
  X
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import { getDisplayName } from '../../utils/nameHelper';

const PendingAccounts = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Confirmation modal state
  // confirmModal: { type: 'register' | 'reject', item: object } | null
  const [confirmModal, setConfirmModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Success credentials modal after approving
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Notification toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadPendingAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingRegistrationsApi();
      setPendingList(res.data || []);
    } catch (err) {
      console.error('Failed to load pending accounts:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to load pending account applications.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingAccounts();
  }, [loadPendingAccounts]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleOpenConfirm = (item, type) => {
    setConfirmModal({ type, item });
    setRejectReason('');
  };

  const handleExecuteAction = async () => {
    if (!confirmModal) return;
    const { type, item } = confirmModal;
    setActionLoading(true);

    try {
      if (type === 'register') {
        const res = await approveRegistrationApi(item.id);
        const tempPassword = res.data?.temp_password;
        const approvedUser = res.data?.user;

        setConfirmModal(null);
        await loadPendingAccounts();

        setCreatedCredentials({
          fullName: getDisplayName(item) || approvedUser?.username,
          username: approvedUser?.username || item.username,
          email: item.email,
          tempPassword: tempPassword
        });

        setToast({
          message: res.data?.message || `Account for ${getDisplayName(item)} registered and activated successfully!`,
          type: 'success'
        });
      } else if (type === 'reject') {
        const res = await rejectRegistrationApi(item.id, { reason: rejectReason.trim() || undefined });
        setConfirmModal(null);
        setRejectReason('');
        await loadPendingAccounts();

        setToast({
          message: res.data?.message || `Account request for ${getDisplayName(item)} has been rejected.`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error(`Failed to ${type} account:`, err);
      setToast({
        message: err.response?.data?.message || `Failed to ${type} account request.`,
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredList = pendingList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const fullName = getDisplayName(item).toLowerCase();
    const rawNames = `${item.first_name || ''} ${item.middle_name || ''} ${item.last_name || ''}`.toLowerCase();
    const email = (item.email || '').toLowerCase();
    const phone = (item.phone || '').toLowerCase();
    const address = (item.address || '').toLowerCase();
    return (
      fullName.includes(q) ||
      rawNames.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      address.includes(q)
    );
  });

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #D99A2B, #8C6415)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(217, 154, 43, 0.35)'
            }}>
              <Clock size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{
                fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
                fontSize: '24px',
                fontWeight: 'normal',
                color: '#F6EBDD',
                margin: 0
              }}>
                Pending Accounts
              </h1>
              <p style={{ fontSize: '13px', color: '#C9B4A6', margin: '2px 0 0' }}>
                Review, register (approve), or reject public customer sign-up applications.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadPendingAccounts}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div style={{
        background: 'linear-gradient(175deg, #2A0C10 0%, #1D0608 100%)',
        border: '1px solid rgba(246, 235, 221, 0.16)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(217, 154, 43, 0.15)',
            border: '1px solid rgba(217, 154, 43, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFD76B', lineHeight: 1 }}>
              {pendingList.length}
            </div>
            <div style={{ fontSize: '11px', color: '#C9B4A6', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Sign-ups
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F6EBDD' }}>
              Instructor RBAC Workflow Protocol
            </div>
            <div style={{ fontSize: '12px', color: '#C9B4A6', lineHeight: 1.5 }}>
              Customers apply via <strong>"Open account"</strong>. Clicking <strong>"Register"</strong> approves the account, sets status to <strong>active</strong>, and enables customer portal login.
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: searchQuery ? '32px' : '12px',
              height: '38px',
              fontSize: '13px',
              background: '#1B0709',
              borderColor: 'rgba(246, 235, 221, 0.2)'
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C9B4A6' }} />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#C9B4A6',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{
        background: '#2A0C10',
        border: '1px solid rgba(246, 235, 221, 0.16)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0,0,0,0.45)'
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#C9B4A6' }}>
            <Loader2 className="spin" size={32} color="#D99A2B" style={{ margin: '0 auto 12px' }} />
            <div>Loading pending sign-up requests...</div>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#C9B4A6' }}>
            <CheckCircle size={44} color="#7BD36B" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '18px', color: '#F6EBDD', marginBottom: '6px' }}>
              {searchQuery ? 'No matching pending accounts' : 'Queue is all clear!'}
            </h3>
            <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto' }}>
              {searchQuery
                ? `No sign-up applications matched your search "${searchQuery}".`
                : 'There are currently no customer account requests waiting for administrator registration.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="user-mgmt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(246, 235, 221, 0.12)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#F6EBDD', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Customer Name
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#F6EBDD', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Email Address
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#F6EBDD', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Contact Phone
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#F6EBDD', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Delivery / Pickup Address
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#F6EBDD', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    Application Date
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#F6EBDD', textTransform: 'uppercase', letterSpacing: '0.04em', width: '220px' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    style={{
                      borderBottom: '1px solid rgba(246, 235, 221, 0.08)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(246, 235, 221, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Name */}
                    <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: '700', color: '#F6EBDD', fontSize: '14px' }}>
                        {getDisplayName(item)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#D99A2B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D99A2B', display: 'inline-block' }} />
                        Status: Pending Approval
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '16px 18px', verticalAlign: 'middle', fontSize: '13px', color: '#E2D3C0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#C9B4A6" />
                        <span>{item.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '16px 18px', verticalAlign: 'middle', fontSize: '13px', color: '#E2D3C0' }}>
                      {item.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#C9B4A6" />
                          <span>{item.phone}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#8A7A70' }}>—</span>
                      )}
                    </td>

                    {/* Address */}
                    <td style={{ padding: '16px 18px', verticalAlign: 'middle', fontSize: '13px', color: '#E2D3C0', maxWidth: '240px' }}>
                      {item.address ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={14} color="#C9B4A6" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ lineHeight: 1.4 }}>{item.address}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#8A7A70' }}>—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '16px 18px', verticalAlign: 'middle', fontSize: '12px', color: '#C9B4A6', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#C9B4A6" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8A7A70', marginTop: '2px' }}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions: Register (Approve) & Reject */}
                    <td style={{ padding: '16px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {/* Register Button: Green accent */}
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: 'linear-gradient(135deg, #5F8A4E 0%, #466938 100%)',
                            color: '#ffffff',
                            border: '1px solid #7BD36B',
                            fontWeight: '700',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(95, 138, 78, 0.4)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleOpenConfirm(item, 'register')}
                          title="Register (approve) account and set status to active"
                        >
                          <UserCheck size={14} />
                          <span>Register</span>
                        </button>

                        {/* Reject Button: Maroon/Red */}
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(193, 18, 31, 0.2)',
                            color: '#E5384A',
                            border: '1px solid rgba(229, 56, 74, 0.4)',
                            fontWeight: '600',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleOpenConfirm(item, 'reject')}
                          title="Reject account request and set status to rejected"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(175deg, #2A0C10 0%, #1D0608 100%)',
            border: confirmModal.type === 'register' ? '1px solid #5F8A4E' : '1px solid #C1121F',
            borderTop: confirmModal.type === 'register' ? '6px solid #7BD36B' : '6px solid #E5384A',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            color: '#F6EBDD',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: confirmModal.type === 'register' ? 'rgba(95, 138, 78, 0.2)' : 'rgba(193, 18, 31, 0.2)',
                border: confirmModal.type === 'register' ? '2px solid #7BD36B' : '2px solid #E5384A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                {confirmModal.type === 'register' ? (
                  <UserCheck size={28} color="#7BD36B" />
                ) : (
                  <AlertTriangle size={28} color="#E5384A" />
                )}
              </div>

              <h3 style={{
                fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
                fontSize: '20px',
                fontWeight: 'normal',
                color: '#F6EBDD',
                marginBottom: '8px'
              }}>
                {confirmModal.type === 'register' ? 'Register Customer Account?' : 'Reject Customer Request?'}
              </h3>

              <p style={{ fontSize: '13px', color: '#C9B4A6', lineHeight: 1.6, margin: 0 }}>
                {confirmModal.type === 'register' ? (
                  <>
                    Are you sure you want to register (approve) the account for{' '}
                    <strong style={{ color: '#F6EBDD' }}>
                      {getDisplayName(confirmModal.item)}
                    </strong>{' '}
                    ({confirmModal.item.email})?
                  </>
                ) : (
                  <>
                    Are you sure you want to reject the customer account application for{' '}
                    <strong style={{ color: '#F6EBDD' }}>
                      {getDisplayName(confirmModal.item)}
                    </strong>{' '}
                    ({confirmModal.item.email})?
                  </>
                )}
              </p>
            </div>

            {/* Explanatory badge */}
            <div style={{
              background: confirmModal.type === 'register' ? 'rgba(95, 138, 78, 0.14)' : 'rgba(193, 18, 31, 0.14)',
              border: confirmModal.type === 'register' ? '1px dashed #5F8A4E' : '1px dashed #C1121F',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: confirmModal.type === 'reject' ? '16px' : '22px',
              fontSize: '12px',
              color: '#E2D3C0',
              lineHeight: 1.5
            }}>
              {confirmModal.type === 'register' ? (
                <>
                  <strong style={{ color: '#7BD36B' }}>Action Result:</strong> Setting status to <strong>"active"</strong> authorizes the customer to log into the shop and place meat pre-orders immediately.
                </>
              ) : (
                <>
                  <strong style={{ color: '#E5384A' }}>Action Result:</strong> Setting status to <strong>"rejected"</strong> will deny login attempts with the message: <em>"Your account request was rejected. Please contact the administrator."</em>
                </>
              )}
            </div>

            {/* Optional Rejection Reason */}
            {confirmModal.type === 'reject' && (
              <div style={{ marginBottom: '22px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#F6EBDD', marginBottom: '6px' }}>
                  Rejection Reason <span style={{ color: '#C9B4A6', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g., Incomplete address, unable to verify identity, or duplicate application..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1B0709',
                    borderColor: 'rgba(246, 235, 221, 0.2)',
                    color: '#F6EBDD',
                    fontSize: '13px',
                    borderRadius: '8px',
                    padding: '10px',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            {/* Modal Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setConfirmModal(null)}
                disabled={actionLoading}
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  background: confirmModal.type === 'register'
                    ? 'linear-gradient(135deg, #5F8A4E, #466938)'
                    : 'linear-gradient(135deg, #E5384A, #A60E1A)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: confirmModal.type === 'register'
                    ? '0 4px 14px rgba(95, 138, 78, 0.4)'
                    : '0 4px 14px rgba(229, 56, 74, 0.4)'
                }}
                onClick={handleExecuteAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Processing...</span>
                  </>
                ) : confirmModal.type === 'register' ? (
                  <>
                    <UserCheck size={16} />
                    <span>Confirm Register (Approve)</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Confirm Reject</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Popup Modal after Admin Approval */}
      {createdCredentials && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(170deg, #2A0C10 0%, #1B0709 100%)',
            border: '1px solid rgba(246, 235, 221, 0.16)',
            borderTop: '6px solid #7BD36B',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            color: '#F6EBDD',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(95, 138, 78, 0.2)',
                border: '2px solid #7BD36B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle size={26} color="#7BD36B" />
              </div>

              <h3 style={{
                fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
                fontSize: '20px',
                fontWeight: 'normal',
                color: '#F6EBDD',
                marginBottom: '6px'
              }}>
                Account Registered & Active!
              </h3>
              <p style={{ fontSize: '13px', color: '#C9B4A6', margin: 0 }}>
                Customer <strong style={{ color: '#F6EBDD' }}>{createdCredentials.fullName}</strong> is now registered. Share these initial login credentials with the customer:
              </p>
            </div>

            <div style={{
              background: '#1B0709',
              border: '1px solid rgba(246, 235, 221, 0.12)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#C9B4A6', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Email Address / Login ID
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#F6EBDD' }}>{createdCredentials.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.email, 'email')}
                    style={{ background: 'none', border: 'none', color: copiedKey === 'email' ? '#7BD36B' : '#C9B4A6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    {copiedKey === 'email' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {createdCredentials.username && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#C9B4A6', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Username
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#F6EBDD' }}>{createdCredentials.username}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdCredentials.username, 'uname')}
                      style={{ background: 'none', border: 'none', color: copiedKey === 'uname' ? '#7BD36B' : '#C9B4A6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      {copiedKey === 'uname' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedKey === 'uname' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '11px', color: '#C9B4A6', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Temporary Password
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: '15px', fontWeight: '700', color: '#FFD76B', letterSpacing: '0.05em' }}>
                    {createdCredentials.tempPassword || 'Auto-generated on file'}
                  </code>
                  {createdCredentials.tempPassword && (
                    <button
                      type="button"
                      onClick={() => handleCopy(createdCredentials.tempPassword, 'pass')}
                      style={{ background: 'none', border: 'none', color: copiedKey === 'pass' ? '#7BD36B' : '#C9B4A6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      {copiedKey === 'pass' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedKey === 'pass' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #5F8A4E, #466938)',
                border: 'none',
                fontWeight: '700'
              }}
              onClick={() => setCreatedCredentials(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAccounts;
