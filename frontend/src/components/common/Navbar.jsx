import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Lock, ChevronDown } from 'lucide-react';
import EditProfileModal from '../shared/EditProfileModal';
import ChangePasswordModal from '../shared/ChangePasswordModal';
import { resolveAvatarUrl } from '../../utils/urlHelper';
import { getDisplayName } from '../../utils/nameHelper';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Single active modal state ensures ONLY ONE modal is ever open at a time
  const [activeModal, setActiveModal] = useState(null); // null | 'edit_profile' | 'change_password'

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleOpenEditProfile = () => {
    setDropdownOpen(false);
    setActiveModal('edit_profile');
  };

  const handleOpenChangePassword = () => {
    setDropdownOpen(false);
    setActiveModal('change_password');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const initials = user
    ? `${user.first_name?.[0] || 'U'}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'U';

  const avatarUrl = resolveAvatarUrl(user);

  const roleAccent = user?.role === 'admin' ? '#E5384A' : user?.role === 'cashier' ? '#D99A2B' : '#5F8A4E';

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="topbar-title">{title || 'Slaughterhouse MIS'}</div>
        </div>

        <div className="topbar-right">
          {user && (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              {/* Clickable Profile Badge Section (Avatar + Name + ROLE Tag) */}
              <div
                className="user-badge"
                onClick={() => setDropdownOpen((prev) => !prev)}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: dropdownOpen ? 'rgba(229, 56, 74, 0.15)' : 'rgba(246, 235, 221, 0.05)',
                  border: dropdownOpen ? '1px dashed #E5384A' : '1px dashed rgba(246, 235, 221, 0.2)',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Circular Avatar with Meat Gradient */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#fff',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: `2px solid ${roleAccent}`,
                  boxShadow: '0 2px 8px rgba(193, 18, 31, 0.4)'
                }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <span style={{ fontWeight: '600', fontSize: '13px', color: '#F6EBDD' }}>
                  {getDisplayName(user)}
                </span>

                <span
                  className={`badge ${
                    user.role === 'admin' ? 'badge-danger' :
                    user.role === 'cashier' ? 'badge-warning' : 'badge-success'
                  }`}
                  style={{ textTransform: 'uppercase', fontSize: '10px', padding: '2px 8px' }}
                >
                  {user.role}
                </span>

                <ChevronDown
                  size={14}
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#C9B4A6'
                  }}
                />
              </div>

              {/* Profile Dropdown Menu in Slaughterhouse Oxblood */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    background: '#2A0C10',
                    borderRadius: '14px',
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(246, 235, 221, 0.1)',
                    border: '1px solid rgba(246, 235, 221, 0.15)',
                    padding: '8px',
                    zIndex: 99999,
                    animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px dashed rgba(246, 235, 221, 0.1)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '11px', color: '#C9B4A6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed in as</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#F6EBDD', marginTop: '2px' }}>{user.email || user.username}</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#F6EBDD',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(246, 235, 221, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} style={{ color: '#7BD36B' }} />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenChangePassword}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#F6EBDD',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(246, 235, 221, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Lock size={16} style={{ color: '#FFD76B' }} />
                    <span>Change Password</span>
                  </button>

                  <div style={{ height: '1px', background: 'rgba(246, 235, 221, 0.1)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={logout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#E5384A',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229, 56, 74, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} style={{ color: '#E5384A' }} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <button
              className="btn btn-outline btn-sm"
              onClick={logout}
              title="Logout"
              style={{ borderRadius: '100px' }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Mutually Exclusive Modals - Only ONE can be open at a time */}
      <EditProfileModal
        isOpen={activeModal === 'edit_profile'}
        onClose={handleCloseModal}
        initialData={user}
      />

      <ChangePasswordModal
        isOpen={activeModal === 'change_password'}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Navbar;
