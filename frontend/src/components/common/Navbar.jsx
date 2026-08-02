import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ShieldAlert } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <div className="topbar">
      <div className="topbar-title">{title || 'Slaughterhouse MIS'}</div>
      <div className="topbar-right">
        {user && (
          <div className="user-badge">
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} color="#475569" />
            </div>
            <span>{user.first_name} {user.last_name}</span>
            <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'cashier' ? 'badge-warning' : 'badge-success'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
              {user.role}
            </span>
          </div>
        )}
        <button className="btn btn-outline btn-sm" onClick={logout} title="Logout" style={{ borderRadius: '100px' }}>
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
