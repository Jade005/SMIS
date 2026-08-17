import React, { useState, useEffect, useRef } from 'react';
import { updateUserProfileApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Camera, X, Check, Loader2, AtSign, Trash2 } from 'lucide-react';
import Toast from '../common/Toast';

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

  // Prevent background page from scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const currentObj = initialData || user || {};
      const imgPath = currentObj.profile_picture || currentObj.profile_image || '';
      setFormData({
        first_name: currentObj.first_name || '',
        last_name: currentObj.last_name || '',
        username: currentObj.username || (currentObj.email ? currentObj.email.split('@')[0] : ''),
        email: currentObj.email || '',
        contact_number: currentObj.contact_number || currentObj.phone || '09000000000',
        profile_picture: imgPath
      });
      setAvatarPreview(resolveAvatarUrl(imgPath));
      setErrors({});
    }
  }, [isOpen, initialData, user]);

  if (!isOpen) return null;

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

  return (
    <>
      <div className="customer-modal-overlay" onClick={onClose}>
        <div className="customer-modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden' }}>
          
          {/* Modal Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            padding: '24px 28px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.4)',
                flexShrink: 0
              }}>
                <User size={22} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', letterSpacing: '-0.01em', color: '#ffffff' }}>
                  Edit Profile & Avatar
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', opacity: 0.9, color: '#f0fdf4' }}>
                  Update your personal details & permanent profile picture
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body Container */}
          <div style={{ padding: '24px 28px', background: '#ffffff' }}>
            <form onSubmit={handleSubmit}>
              
              {/* Avatar Upload Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '28px',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ position: 'relative', width: '98px', height: '98px' }}>
                  <div style={{
                    width: '98px',
                    height: '98px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '34px',
                    fontWeight: '800',
                    color: '#ffffff',
                    boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)',
                    border: '4px solid #ffffff'
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
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: '3px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    title="Upload profile picture"
                  >
                    <Camera size={16} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#16a34a',
                      background: '#dcfce7',
                      border: '1px solid #bbf7d0',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      cursor: 'pointer'
                    }}
                  >
                    Select Profile Picture (JPG, PNG)
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#dc2626',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '6px 14px',
                        borderRadius: '100px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* 2-column grid for First Name & Last Name */}
              <div className="profile-form-grid-2col" style={{ marginBottom: '18px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                    First Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`form-input ${errors.first_name ? 'is-invalid' : ''}`}
                      placeholder="First Name"
                      style={{
                        padding: '9px 12px 9px 38px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: errors.first_name ? '1px solid #ef4444' : '1px solid #cbd5e1',
                        fontSize: '13px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {errors.first_name && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.first_name}</span>}
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Last Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`form-input ${errors.last_name ? 'is-invalid' : ''}`}
                      placeholder="Last Name"
                      style={{
                        padding: '9px 12px 9px 38px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: errors.last_name ? '1px solid #ef4444' : '1px solid #cbd5e1',
                        fontSize: '13px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {errors.last_name && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.last_name}</span>}
                </div>
              </div>

              {/* Username */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Username <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <AtSign size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-input ${errors.username ? 'is-invalid' : ''}`}
                    placeholder="Username"
                    style={{
                      padding: '9px 12px 9px 38px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: errors.username ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '13px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {errors.username && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.username}</span>}
              </div>

              {/* Email Address */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Email Address"
                    style={{
                      padding: '9px 12px 9px 38px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: errors.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '13px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {errors.email && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>{errors.email}</span>}
              </div>

              {/* Contact Number */}
              <div style={{ marginBottom: '28px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Contact Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Contact Number (numbers only)"
                    style={{
                      padding: '9px 12px 9px 38px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '11px 26px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {loading ? <Loader2 className="spin" size={18} /> : <Check size={18} />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </>
  );
};

export default EditProfileModal;
