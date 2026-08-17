import React, { useEffect, useState } from 'react';
import { getCustomerProfileApi } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Edit2, Lock, AtSign, Clock } from 'lucide-react';
import EditProfileModal from '../../components/customer/EditProfileModal';
import ChangePasswordModal from '../../components/customer/ChangePasswordModal';

const resolveAvatarUrl = (userObj) => {
  if (!userObj) return null;
  const path = userObj.profile_picture || userObj.profile_image;
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const CustomerProfile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Single active modal state ensures ONLY ONE modal is open at a time
  const [activeModal, setActiveModal] = useState(null); // null | 'edit_profile' | 'change_password'

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getCustomerProfileApi();
      setProfile(res.data.profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Fallback to auth user object if API call fails
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <Clock size={32} className="spin" style={{ margin: '0 auto 12px', color: '#16a34a' }} />
          <p style={{ fontWeight: '600' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  const activeProfile = profile || user || {};
  const initials = `${activeProfile.first_name?.[0] || 'C'}${activeProfile.last_name?.[0] || 'U'}`.toUpperCase();
  const avatarUrl = resolveAvatarUrl(activeProfile);

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      
      {/* Banner Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: '#ffffff',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.3)',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.8)'
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
              {activeProfile.first_name} {activeProfile.last_name}
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AtSign size={14} />
              <span>{activeProfile.username || (activeProfile.email ? activeProfile.email.split('@')[0] : 'user')}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveModal('edit_profile')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#16a34a',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('change_password')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Lock size={16} />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Profile Details Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
          Personal Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
            <User style={{ color: '#16a34a', flexShrink: 0 }} size={22} />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                {activeProfile.first_name} {activeProfile.last_name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
            <AtSign style={{ color: '#16a34a', flexShrink: 0 }} size={22} />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Username</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                {activeProfile.username || 'Not set'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
            <Mail style={{ color: '#16a34a', flexShrink: 0 }} size={22} />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                {activeProfile.email || 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
            <Phone style={{ color: '#16a34a', flexShrink: 0 }} size={22} />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Contact Number</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                {activeProfile.contact_number || activeProfile.phone || 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mutually Exclusive Modals */}
      <EditProfileModal
        isOpen={activeModal === 'edit_profile'}
        onClose={() => setActiveModal(null)}
        initialData={activeProfile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />

      <ChangePasswordModal
        isOpen={activeModal === 'change_password'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};

export default CustomerProfile;
