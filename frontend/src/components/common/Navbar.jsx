import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Lock, ChevronDown } from 'lucide-react';
import EditProfileModal from '../customer/EditProfileModal';
import ChangePasswordModal from '../customer/ChangePasswordModal';

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

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{title || 'Slaughterhouse MIS'}</div>
        <div className="topbar-right">
          {user && (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              {/* Clickable Profile Badge Section (Avatar + Name + CUSTOMER Badge) */}
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
                  background: dropdownOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  boxShadow: dropdownOpen ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {/* Circular Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#fff',
                  boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.4)',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.8)'
                }}>
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="User Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <span style={{ fontWeight: '600', fontSize: '13px' }}>
                  {user.first_name} {user.last_name}
                </span>

                <span
                  className={`badge ${
                    user.role === 'admin' ? 'badge-danger' :
                    user.role === 'cashier' ? 'badge-warning' : 'badge-success'
                  }`}
                  style={{ textTransform: 'uppercase', fontSize: '10px', padding: '2px 8px', borderRadius: '100px' }}
                >
                  {user.role}
                </span>

                <ChevronDown
                  size={14}
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#64748b'
                  }}
                />
              </div>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    padding: '6px',
                    zIndex: 99999,
                    animation: 'dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
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
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} style={{ color: '#16a34a' }} />
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
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Lock size={16} style={{ color: '#0284c7' }} />
                    <span>Change Password</span>
                  </button>

                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

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
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} style={{ color: '#dc2626' }} />
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
