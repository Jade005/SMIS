import React, { useState, useEffect, useRef } from 'react';
import { updateUserProfileApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Camera, X, Check, Loader2, AtSign, Trash2 } from 'lucide-react';
import Toast from '../common/Toast';
import ModalWrapper from './ModalWrapper';

const resolveAvatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const EditProfileModal = ({ isOpen, onClose, initialData, onProfileUpdated }) => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    contact_number: '',
    profile_picture: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (isOpen) {
      const currentObj = initialData || user || {};
      const imgPath = currentObj.profile_picture || currentObj.profile_image || '';
      setFormData({
        first_name: currentObj.first_name || '',
        last_name: currentObj.last_name || '',
        username: currentObj.username || (currentObj.email ? currentObj.email.split('@')[0] : ''),
        email: currentObj.email || '',
        contact_number: currentObj.contact_number || currentObj.phone || '',
        profile_picture: imgPath
      });
      setAvatarPreview(resolveAvatarUrl(imgPath));
      setErrors({});
    }
  }, [isOpen, initialData, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contact_number') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: onlyNums }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setToast({ message: 'Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.', type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image size should be less than 5MB', type: 'error' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData((prev) => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setFormData((prev) => ({ ...prev, profile_picture: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = 'First name is required';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required';
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Invalid email address format';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please fix highlighted errors before saving.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await updateUserProfileApi(formData);
      const updated = res.data.profile || res.data.user;

      // Update AuthContext so Navbar and all pages immediately update
      if (user) {
        setUser((prev) => ({
          ...prev,
          ...updated,
          profile_picture: updated.profile_picture || updated.profile_image,
          profile_image: updated.profile_picture || updated.profile_image
        }));
      }

      setToast({ message: 'Profile picture & details saved successfully!', type: 'success' });
      if (onProfileUpdated) onProfileUpdated(updated);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update profile picture:', err);
      const msg = err.response?.data?.message || 'Failed to update profile picture. Please try again.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const initials = `${formData.first_name?.[0] || 'U'}${formData.last_name?.[0] || ''}`.toUpperCase();
  const currentRole = initialData?.role || user?.role;
  const avatarRingColor = currentRole === 'cashier' ? '#D99A2B' : '#E5384A';

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '10px 14px 10px 38px',
    borderRadius: '10px',
    background: '#1a0a0c',
    border: hasError ? '1px solid #ef4444' : '1px solid rgba(246, 235, 221, 0.15)',
    color: '#F6EBDD',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.15s ease'
  });

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#F6EBDD',
    marginBottom: '6px'
  };

  return (
    <>
      <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="500px">
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(246, 235, 221, 0.08)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(229, 56, 74, 0.15)',
              border: '1px solid rgba(229, 56, 74, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E5384A',
              flexShrink: 0
            }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fdf2e3', letterSpacing: '-0.01em' }}>
                Edit Profile & Avatar
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#c9b4a6' }}>
                Update your personal details & permanent profile picture
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(246, 235, 221, 0.06)',
              border: '1px solid rgba(246, 235, 221, 0.12)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#c9b4a6',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(246, 235, 221, 0.15)';
              e.currentTarget.style.color = '#fdf2e3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(246, 235, 221, 0.06)';
              e.currentTarget.style.color = '#c9b4a6';
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            
            {/* Avatar Upload Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '22px',
              padding: '18px',
              background: 'rgba(26, 10, 12, 0.6)',
              borderRadius: '14px',
              border: '1px solid rgba(246, 235, 221, 0.1)'
            }}>
              <div style={{ position: 'relative', width: '92px', height: '92px' }}>
                <div style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                  border: `3px solid ${avatarRingColor}`
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#E5384A',
                    color: '#ffffff',
                    border: '2px solid #2a0a0e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  title="Upload profile picture"
                >
                  <Camera size={15} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#F6EBDD',
                    background: 'rgba(246, 235, 221, 0.06)',
                    border: '1px solid rgba(246, 235, 221, 0.2)',
                    padding: '6px 14px',
                    borderRadius: '100px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(246, 235, 221, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(246, 235, 221, 0.06)'}
                >
                  Select Profile Picture (JPG, PNG)
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* First Name & Last Name (With gap between first name input and last name label) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={labelStyle}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#c9b4a6' }} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    style={inputStyle(!!errors.first_name)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E5384A';
                      e.target.style.boxShadow = '0 0 0 2px rgba(229, 56, 74, 0.35)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.first_name ? '#ef4444' : 'rgba(246, 235, 221, 0.15)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {errors.first_name && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.first_name}</span>}
              </div>

              <div>
                <label style={labelStyle}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#c9b4a6' }} />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    style={inputStyle(!!errors.last_name)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E5384A';
                      e.target.style.boxShadow = '0 0 0 2px rgba(229, 56, 74, 0.35)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.last_name ? '#ef4444' : 'rgba(246, 235, 221, 0.15)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {errors.last_name && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.last_name}</span>}
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                Username <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <AtSign size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#c9b4a6' }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  style={inputStyle(!!errors.username)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E5384A';
                    e.target.style.boxShadow = '0 0 0 2px rgba(229, 56, 74, 0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.username ? '#ef4444' : 'rgba(246, 235, 221, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.username && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.username}</span>}
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#c9b4a6' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  style={inputStyle(!!errors.email)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E5384A';
                    e.target.style.boxShadow = '0 0 0 2px rgba(229, 56, 74, 0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(246, 235, 221, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.email && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.email}</span>}
            </div>

            {/* Contact Number */}
            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>
                Contact Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#c9b4a6' }} />
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="09123456789"
                  style={inputStyle(false)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E5384A';
                    e.target.style.boxShadow = '0 0 0 2px rgba(229, 56, 74, 0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(246, 235, 221, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

          </div>

          {/* Modal Footer (Always visible) */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid rgba(246, 235, 221, 0.08)',
            background: 'rgba(26, 8, 12, 0.5)',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(246, 235, 221, 0.2)',
                color: '#f6ebdd',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(246, 235, 221, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(193, 18, 31, 0.4)',
                opacity: loading ? 0.8 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </ModalWrapper>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </>
  );
};

export default EditProfileModal;
