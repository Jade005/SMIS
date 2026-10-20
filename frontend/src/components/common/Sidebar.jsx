import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { SmisLogoMark } from './SmisLogo';
import {
  LayoutDashboard,
  Beef,
  Package,
  Truck,
  ShoppingCart,
  Users,
  FileText,
  Monitor,
  CheckCircle,
  History,
  UserPlus,
  Clock
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  const role = user?.role || 'admin';

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products & Cuts', icon: Beef },
    { to: '/admin/inventory', label: 'Inventory Batches', icon: Package },
    { to: '/admin/suppliers', label: 'Suppliers & Delivery', icon: Truck },
    { to: '/admin/pending-accounts', label: 'Pending Accounts', icon: Clock },
    { to: '/admin/users', label: 'User Accounts', icon: Users },
    { to: '/admin/register-customer', label: 'Register Customer', icon: UserPlus },
    { to: '/admin/reports', label: 'Sales & Analytics', icon: FileText }
  ];

  const cashierLinks = [
    { to: '/cashier', label: 'Counter Dashboard', icon: LayoutDashboard, end: true },
    { to: '/cashier/pos', label: 'Point of Sale (POS)', icon: Monitor },
    { to: '/cashier/orders', label: 'Customer Orders', icon: ShoppingCart },
    { to: '/cashier/availability', label: 'Live Stock Lookup', icon: CheckCircle },
    { to: '/cashier/transactions', label: 'Sales History', icon: History }
  ];

  const customerLinks = [
    { to: '/customer', label: 'Meat Cuts Catalog', icon: Beef, end: true },
    { to: '/customer/cart', label: 'Cart & Pre-Order', icon: ShoppingCart, badge: cart.length },
    { to: '/customer/orders', label: 'Order History', icon: History }
  ];

  const links = role === 'admin' ? adminLinks : role === 'cashier' ? cashierLinks : customerLinks;

  const roleAccent = role === 'admin' ? '#E5384A' : role === 'cashier' ? '#D99A2B' : '#5F8A4E';
  const roleStamp = role === 'admin' ? 'Head office' : role === 'cashier' ? 'Counter' : 'Online shop';

  return (
    <aside style={{
      width: '250px',
      minWidth: '250px',
      background: '#1B0709',
      borderRight: '1px solid rgba(246, 235, 221, 0.11)',
      color: '#F6EBDD',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0,0,0,0.45)',
      zIndex: 20,
      position: 'relative'
    }}>
      {/* Sidebar Header with Slaughterhouse Brand Lockup */}
      <div style={{ padding: '24px 20px', borderBottom: '1px dashed rgba(246, 235, 221, 0.14)' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: '6px',
          background: `${roleAccent}1c`,
          border: `1px dashed ${roleAccent}99`,
          color: '#F6EBDD',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '14px'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleAccent, boxShadow: `0 0 0 3px ${roleAccent}33` }} />
          {role} · {roleStamp}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #E5384A, #C1121F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(193, 18, 31, 0.5)',
            flexShrink: 0
          }}>
            <SmisLogoMark size={22} accentColor="#FFFFFF" />
          </div>
          <div>
            <div style={{
              fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
              fontSize: '18px',
              letterSpacing: '.04em',
              lineHeight: 1,
              color: '#F6EBDD'
            }}>
              SMIS
            </div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#C9B4A6', lineHeight: 1, marginTop: '4px', letterSpacing: '0.03em' }}>
              Slaughterhouse MIS
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
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
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: '10px',
                color: isActive ? '#FFFFFF' : '#C9B4A6',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(229, 56, 74, 0.28) 0%, rgba(193, 18, 31, 0.14) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #E5384A' : '3px solid transparent',
                fontWeight: isActive ? '700' : '500',
                fontSize: '13px',
                textDecoration: 'none',
                boxShadow: isActive ? 'inset 1px 1px 2px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} />
                <span>{link.label}</span>
              </div>
              {link.badge > 0 && (
                <span style={{
                  background: '#5F8A4E',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  boxShadow: '0 2px 8px rgba(95, 138, 78, 0.5)'
                }}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Info */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px dashed rgba(246, 235, 221, 0.12)',
        fontSize: '11px',
        color: '#C9B4A6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>FIFO Rotation Active</span>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7BD36B', boxShadow: '0 0 6px #7BD36B' }} />
      </div>
    </aside>
  );
};

export default Sidebar;
