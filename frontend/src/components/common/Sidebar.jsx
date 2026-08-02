import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Beef,
  Package,
  Truck,
  ShoppingCart,
  Users,
  FileText,
  TrendingUp,
  Monitor,
  CheckCircle,
  History,
  UserPlus
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Beef },
    { to: '/admin/inventory', label: 'Inventory', icon: Package },
    { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const cashierLinks = [
    { to: '/cashier', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/cashier/pos', label: 'Point of Sale', icon: Monitor },
    { to: '/cashier/availability', label: 'Stock Lookup', icon: CheckCircle },
    { to: '/cashier/transactions', label: 'History', icon: History },
    { to: '/cashier/register-customer', label: 'Register Customer', icon: UserPlus }
  ];

  const customerLinks = [
    { to: '/customer', label: 'Catalog', icon: Beef, end: true },
    { to: '/customer/cart', label: 'Cart & Pre-Order', icon: ShoppingCart },
    { to: '/customer/orders', label: 'My Orders', icon: History }
  ];

  const links = role === 'admin' ? adminLinks : role === 'cashier' ? cashierLinks : customerLinks;
  const sidebarBg = role === 'admin' ? 'var(--bg-sidebar-admin)' : role === 'cashier' ? 'var(--bg-sidebar-cashier)' : 'var(--bg-sidebar-customer)';

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      background: sidebarBg,
      color: '#cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      zIndex: 20
    }}>
      {/* Sidebar Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '800',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          {role} PORTAL
        </div>
        <h2 style={{ color: '#fff', fontSize: '17px', fontWeight: '800', margin: 0, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Beef size={20} color="#f87171" /> SMIS Terminal
        </h2>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)'
                  : 'transparent',
                fontWeight: isActive ? '800' : '600',
                fontSize: '13px',
                textDecoration: 'none',
                boxShadow: isActive ? 'inset 1px 1px 2px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
        Slaughterhouse MIS v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
