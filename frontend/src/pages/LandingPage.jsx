import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Beef,
  ShieldCheck,
  Scale,
  Clock,
  ShoppingCart,
  LogIn,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  Monitor,
  MapPin,
  Phone,
  Mail,
  Globe,
  Send
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* --- TOP NAVBAR --- */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <Beef size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>SMIS</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.05em' }}>SLAUGHTERHOUSE MIS</div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>Features</a>
          <a href="#portals" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>System Portals</a>
          <a href="#about" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>About</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            background: 'rgba(255,255,255,0.05)'
          }}>
            <LogIn size={15} /> Sign In
          </Link>

          <Link to="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}>
            <UserPlus size={15} /> Create Account
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section style={{
        padding: '80px 24px 100px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '100px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#f87171',
          fontSize: '12px',
          fontWeight: '700',
          marginBottom: '24px',
          letterSpacing: '0.04em'
        }}>
          <Award size={14} /> SLAUGHTERHOUSE MEAT INVENTORY & SALES MANAGEMENT SYSTEM
        </div>

        <h1 style={{
          fontSize: '52px',
          fontWeight: '900',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '900px',
          margin: '0 auto 20px',
          background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Precision Meat Batch Inventory & Point-of-Sale Terminal
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          maxWidth: '720px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          Streamlining slaughterhouse operations with per-batch delivery weight tracking, FIFO expiration control, integrated cashier POS, and direct customer online pre-ordering.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)'
          }}>
            Access System Portal <ArrowRight size={18} />
          </button>

          <button onClick={() => navigate('/register')} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Register Customer Account
          </button>
        </div>

        {/* Feature Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '70px',
          textAlign: 'left'
        }}>
          {[
            { icon: Scale, title: 'Weight-Based POS', desc: 'Auto-calculates total price by weight (kg) with instant batch deduction.' },
            { icon: Clock, title: 'Per-Batch Expiration', desc: 'FIFO inventory tracking with low-stock & expiration date alerts.' },
            { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Secure Admin, Cashier, and Customer access with account approval flow.' },
            { icon: TrendingUp, title: 'Sales Analytics', desc: 'Interactive revenue insights, top meat cuts, and inventory reporting.' }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '24px',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#f87171'
                }}>
                  <IconComponent size={22} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- SYSTEM PORTALS SECTION --- */}
      <section id="portals" style={{ background: '#1e293b', padding: '90px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CHOOSE YOUR PORTAL</span>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>Designed for Every Operational Role</h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', marginTop: '8px' }}>Sign in to access specialized modules tailored to your permissions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {/* Admin Portal Card */}
            <div style={{
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  marginBottom: '16px'
                }}>
                  ADMINISTRATOR PORTAL
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>Management & Analytics</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
                  Full control over product catalog, supplier directories, inventory delivery batches, user account approvals, and comprehensive financial reports.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Product & Category Catalog CRUD', 'Supplier & Delivery Batch Management', 'Pending Customer Account Approvals', 'Sales, Stock, & Expiry Reports'].map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#ef4444" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => navigate('/login')} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Sign In as Administrator
              </button>
            </div>

            {/* Cashier Terminal Card */}
            <div style={{
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  marginBottom: '16px'
                }}>
                  CASHIER TERMINAL
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>Point-of-Sale Terminal</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
                  Fast weight-based sales processing screen with product tile search, automatic batch stock deduction, walk-in customer registration, and receipt generation.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Interactive Meat Tile Grid POS', 'Automatic Weight-Based Pricing', 'Walk-in Customer Registration', 'Printable Sales Receipt Generation'].map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#3b82f6" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => navigate('/login')} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Sign In as Cashier
              </button>
            </div>

            {/* Customer Store Card */}
            <div style={{
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  marginBottom: '16px'
                }}>
                  CUSTOMER ONLINE STORE
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>Catalog & Pre-Orders</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
                  Browse fresh slaughterhouse meats online, place pre-orders with custom instructions, and track order fulfillment statuses live.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Filter Meat Cuts & Categories', 'Online Shopping Cart & Checkout', 'Special Preparation Instructions', 'Real-Time Order Status Tracker'].map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => navigate('/login')} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Sign In as Customer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT & SYSTEM SPECIFICATIONS --- */}
      <section id="about" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Enterprise-Grade Slaughterhouse Management</h2>
        <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          SMIS ensures complete transparency from supplier delivery batches to final customer POS checkout, enforcing strict FIFO stock rotation and quality compliance.
        </p>

        <div style={{
          background: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444', marginBottom: '4px' }}>100%</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Per-Batch Traceability</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#3b82f6', marginBottom: '4px' }}>FIFO</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Freshness Stock Rotation</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981', marginBottom: '4px' }}>Real-Time</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>POS Weight Calculation</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b', marginBottom: '4px' }}>RBAC</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Admin Account Approval</div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{
        background: '#080c14',
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 40px' }}>

          {/* Row 1 — Brand + About (Centered) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', flexShrink: 0
              }}>
                <Beef size={21} color="#fff" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1 }}>SMIS</span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.06em' }}>SLAUGHTERHOUSE MIS</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6', maxWidth: '680px' }}>
              A comprehensive slaughterhouse meat inventory and sales management platform — streamlining operations from supplier batch delivery to customer POS checkout, with FIFO tracking, role-based access, and real-time analytics.
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '28px' }} />

          {/* Row 2 — Contact items in one landscape row (Centered) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '32px' }}>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <MapPin size={15} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Address</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Slaughterhouse District, City Municipal Area</div>
              </div>
            </div>

            {/* Dot separator */}
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155', flexShrink: 0 }} />

            {/* Phone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Phone size={15} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Phone</div>
                <a href="tel:+639158379629" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>+63 (0) 915-837-9629</a>
              </div>
            </div>

            {/* Dot separator */}
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155', flexShrink: 0 }} />

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Mail size={15} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</div>
                <a href="mailto:slaughterhouse@gmail.com" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>slaughterhouse@gmail.com</a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
            © {new Date().getFullYear()} <span style={{ color: '#475569', fontWeight: '700' }}>SMIS</span> — Slaughterhouse Meat Inventory & Sales Management System. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Service', 'Support'].map((item) => (
              <a
                key={item}
                href="#"
                style={{ fontSize: '12px', color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#334155'; }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
