import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Scale,
  Clock,
  ShieldCheck,
  TrendingUp,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Box,
  Layers,
  BarChart3,
  Cpu
} from 'lucide-react';
import { SmisLogo, SmisLogoMark } from '../components/common/SmisLogo';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: '#0B1220',
        minHeight: '100vh',
        color: '#F8FAFC',
        fontFamily: "'Inter', 'Sora', 'Manrope', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* --- INLINE STYLES FOR ANIMATIONS & INTERACTIONS --- */}
      <style>{`
        @keyframes subtlePulse {
          0%, 100% {
            transform: scale(1) translate(-50%, -50%);
            opacity: 0.14;
          }
          50% {
            transform: scale(1.1) translate(-45%, -45%);
            opacity: 0.22;
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(1deg);
          }
        }

        .smis-hero-glow {
          position: absolute;
          top: 35%;
          left: 50%;
          width: 680px;
          height: 480px;
          background: radial-gradient(circle, #E2493D 0%, rgba(226, 73, 61, 0.4) 40%, rgba(11, 18, 32, 0) 70%);
          filter: blur(70px);
          pointer-events: none;
          z-index: 1;
          animation: subtlePulse 8s ease-in-out infinite;
        }

        .smis-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .smis-card:hover {
          transform: translateY(-5px);
          border-color: rgba(226, 73, 61, 0.4) !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(226, 73, 61, 0.12) !important;
        }

        .smis-portal-card {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .smis-portal-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        }

        .smis-btn-primary {
          transition: all 0.25s ease;
        }
        .smis-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(226, 73, 61, 0.55) !important;
          filter: brightness(1.08);
        }

        .smis-btn-secondary {
          transition: all 0.25s ease;
        }
        .smis-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px);
        }

        /* Ambient grid pattern background */
        .smis-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        /* Cold-chain industrial dot matrix */
        .smis-dot-matrix {
          background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* --- NOISE & GRAIN OVERLAY --- */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 999,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* --- TOP NAVBAR --- */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(11, 18, 32, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Lockup */}
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <SmisLogo variant="full" size={38} theme="dark" />
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a
            href="#features"
            style={{
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'color 0.2s ease',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            Capabilities
          </a>
          <a
            href="#portals"
            style={{
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'color 0.2s ease',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            System Portals
          </a>
          <a
            href="#about"
            style={{
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'color 0.2s ease',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            Specifications
          </a>
        </nav>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/login"
            className="smis-btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#F8FAFC',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <LogIn size={15} /> System Sign In
          </Link>

          <Link
            to="/register"
            className="smis-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #E2493D 0%, #C52A1E 100%)',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(226, 73, 61, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <UserPlus size={15} /> Open Account
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION WITH LAYERED INDUSTRIAL TEXTURE --- */}
      <section
        style={{
          position: 'relative',
          padding: '100px 24px 110px',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {/* Layer 1: Data Grid Pattern */}
        <div
          className="smis-grid-pattern"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: 0.8
          }}
        />

        {/* Layer 2: Cold-Chain Racking & Scale Watermark Motif */}
        <div
          style={{
            position: 'absolute',
            top: '-5%',
            right: '-6%',
            width: '600px',
            height: '600px',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <SmisLogoMark size={600} />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-8%',
            width: '500px',
            height: '500px',
            opacity: 0.03,
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <Scale size={500} color="#94A3B8" />
        </div>

        {/* Layer 3: Red Warmth Radial Glow */}
        <div className="smis-hero-glow" />

        {/* Layer 4: Vignette Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 50% 30%, transparent 20%, #0B1220 85%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Hero Content Layer */}
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* Eyebrow Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '100px',
              background: 'rgba(226, 73, 61, 0.12)',
              border: '1px solid rgba(226, 73, 61, 0.35)',
              color: '#FF6B5E',
              fontSize: '12px',
              fontWeight: '800',
              marginBottom: '26px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 12px rgba(226, 73, 61, 0.15)'
            }}
          >
            <Sparkles size={14} color="#E2493D" /> SLAUGHTERHOUSE MEAT INVENTORY & SALES MANAGEMENT SYSTEM
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: '56px',
              fontWeight: '900',
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              maxWidth: '920px',
              margin: '0 auto 24px',
              color: '#F8FAFC',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.6)'
            }}
          >
            Precision Meat Batch Inventory &{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 20%, #FF8A7A 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Point-of-Sale Terminal
            </span>
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: '18px',
              color: '#94A3B8',
              maxWidth: '740px',
              margin: '0 auto 44px',
              lineHeight: '1.65',
              fontWeight: 400
            }}
          >
            Streamlining cold-chain slaughterhouse operations with per-batch delivery weight tracking, FIFO expiration control, integrated cashier POS, and direct customer online pre-ordering.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '18px',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={() => navigate('/login')}
              className="smis-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px 34px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #E2493D 0%, #B91C1C 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(226, 73, 61, 0.45)',
                letterSpacing: '-0.01em'
              }}
            >
              Access System Portal <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/register')}
              className="smis-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px 30px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                letterSpacing: '-0.01em'
              }}
            >
              Register Customer Account
            </button>
          </div>

          {/* 4 Feature Cards with Hover Border Glow */}
          <div
            id="features"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '22px',
              marginTop: '80px',
              textAlign: 'left'
            }}
          >
            {[
              {
                icon: Scale,
                title: 'Weight-Based POS',
                desc: 'Auto-calculates total price by weight (kg) with instant batch deduction.'
              },
              {
                icon: Clock,
                title: 'Per-Batch Expiration',
                desc: 'FIFO inventory tracking with low-stock & expiration date alerts.'
              },
              {
                icon: ShieldCheck,
                title: 'Role-Based Access',
                desc: 'Secure Admin, Cashier, and Customer access with account approval flow.'
              },
              {
                icon: TrendingUp,
                title: 'Sales Analytics',
                desc: 'Interactive revenue insights, top meat cuts, and inventory reporting.'
              }
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="smis-card"
                  style={{
                    background: 'linear-gradient(180deg, rgba(26, 34, 52, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle corner indicator */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(226, 73, 61, 0.16) 0%, rgba(226, 73, 61, 0.04) 100%)',
                      border: '1px solid rgba(226, 73, 61, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '18px',
                      color: '#FF6B5E'
                    }}
                  >
                    <IconComponent size={22} />
                  </div>

                  <h3
                    style={{
                      fontSize: '17px',
                      fontWeight: '700',
                      color: '#F8FAFC',
                      marginBottom: '8px',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '13.5px',
                      color: '#94A3B8',
                      lineHeight: '1.55',
                      margin: 0
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- SYSTEM PORTALS SECTION --- */}
      <section
        id="portals"
        style={{
          background: 'linear-gradient(180deg, #0B1220 0%, #111827 50%, #0B1220 100%)',
          padding: '100px 24px',
          position: 'relative',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div
          className="smis-dot-matrix"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.4,
            pointerEvents: 'none'
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#38BDF8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '4px 14px',
                borderRadius: '100px',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              CHOOSE YOUR PORTAL
            </span>
            <h2
              style={{
                fontSize: '38px',
                fontWeight: '800',
                color: '#F8FAFC',
                marginTop: '16px',
                letterSpacing: '-0.02em'
              }}
            >
              Engineered for Every Operational Role
            </h2>
            <p style={{ fontSize: '16px', color: '#94A3B8', marginTop: '10px' }}>
              Sign in to access specialized modules tailored with strict role-based controls.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px'
            }}
          >
            {/* Admin Portal Card */}
            <div
              className="smis-portal-card"
              style={{
                background: '#111827',
                borderRadius: '18px',
                border: '1px solid rgba(226, 73, 61, 0.35)',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(226, 73, 61, 0.14)',
                    color: '#FF6B5E',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    marginBottom: '20px'
                  }}
                >
                  <Cpu size={14} /> ADMINISTRATOR PORTAL
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#F8FAFC', marginBottom: '12px' }}>
                  Management & Analytics
                </h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '26px' }}>
                  Full control over product catalog, supplier directories, inventory delivery batches, user account approvals, and comprehensive financial reports.
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 32px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {[
                    'Product & Category Catalog CRUD',
                    'Supplier & Delivery Batch Management',
                    'Pending Customer Account Approvals',
                    'Sales, Stock, & Expiry Reports'
                  ].map((feat, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13.5px',
                        color: '#CBD5E1'
                      }}
                    >
                      <CheckCircle2 size={16} color="#E2493D" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="smis-btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#E2493D',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(226, 73, 61, 0.3)'
                }}
              >
                Sign In as Administrator
              </button>
            </div>

            {/* Cashier Terminal Card */}
            <div
              className="smis-portal-card"
              style={{
                background: '#111827',
                borderRadius: '18px',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.14)',
                    color: '#60A5FA',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    marginBottom: '20px'
                  }}
                >
                  <Box size={14} /> CASHIER TERMINAL
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#F8FAFC', marginBottom: '12px' }}>
                  Point-of-Sale Terminal
                </h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '26px' }}>
                  Fast weight-based sales processing screen with product tile search, automatic batch stock deduction, walk-in customer registration, and receipt generation.
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 32px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {[
                    'Interactive Meat Tile Grid POS',
                    'Automatic Weight-Based Pricing',
                    'Walk-in Customer Registration',
                    'Printable Sales Receipt Generation'
                  ].map((feat, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13.5px',
                        color: '#CBD5E1'
                      }}
                    >
                      <CheckCircle2 size={16} color="#3B82F6" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#3B82F6',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                Sign In as Cashier
              </button>
            </div>

            {/* Customer Store Card */}
            <div
              className="smis-portal-card"
              style={{
                background: '#111827',
                borderRadius: '18px',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.14)',
                    color: '#34D399',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    marginBottom: '20px'
                  }}
                >
                  <Layers size={14} /> CUSTOMER ONLINE STORE
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#F8FAFC', marginBottom: '12px' }}>
                  Catalog & Pre-Orders
                </h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '26px' }}>
                  Browse fresh slaughterhouse meats online, place pre-orders with custom instructions, and track order fulfillment statuses live.
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 32px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {[
                    'Filter Meat Cuts & Categories',
                    'Online Shopping Cart & Checkout',
                    'Special Preparation Instructions',
                    'Real-Time Order Status Tracker'
                  ].map((feat, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13.5px',
                        color: '#CBD5E1'
                      }}
                    >
                      <CheckCircle2 size={16} color="#10B981" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                Sign In as Customer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT & SYSTEM SPECIFICATIONS --- */}
      <section
        id="about"
        style={{
          padding: '90px 24px',
          maxWidth: '1140px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#F8FAFC', marginBottom: '16px' }}>
          Enterprise-Grade Cold Chain & Meat Management
        </h2>
        <p
          style={{
            fontSize: '15.5px',
            color: '#94A3B8',
            maxWidth: '760px',
            margin: '0 auto 44px',
            lineHeight: '1.65'
          }}
        >
          SMIS guarantees precision traceability from incoming live stock & delivery batches to customer checkout, enforcing strict FIFO rotation and hygiene compliance.
        </p>

        <div
          style={{
            background: '#111827',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '28px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#E2493D', marginBottom: '6px' }}>100%</div>
            <div style={{ fontSize: '13.5px', color: '#94A3B8', fontWeight: '600' }}>Per-Batch Traceability</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#3B82F6', marginBottom: '6px' }}>FIFO</div>
            <div style={{ fontSize: '13.5px', color: '#94A3B8', fontWeight: '600' }}>Freshness Stock Rotation</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#10B981', marginBottom: '6px' }}>Real-Time</div>
            <div style={{ fontSize: '13.5px', color: '#94A3B8', fontWeight: '600' }}>POS Weight Calculation</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#F59E0B', marginBottom: '6px' }}>RBAC</div>
            <div style={{ fontSize: '13.5px', color: '#94A3B8', fontWeight: '600' }}>Admin Account Approval</div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer
        style={{
          background: '#070C16',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '52px 24px 40px' }}>
          {/* Row 1 — Brand + Description */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '32px'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <SmisLogo variant="full" size={42} theme="dark" />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '13.5px',
                color: '#64748B',
                lineHeight: '1.65',
                maxWidth: '700px'
              }}
            >
              A specialized B2B slaughterhouse meat inventory and sales management system — orchestrating operations from batch receipt and weight calibration to customer POS checkout with strict FIFO compliance and real-time intelligence.
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', marginBottom: '32px' }} />

          {/* Row 2 — Contact Items */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '36px'
            }}
          >
            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: 'rgba(226, 73, 61, 0.1)',
                  border: '1px solid rgba(226, 73, 61, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <MapPin size={16} color="#E2493D" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#64748B',
                    marginBottom: '2px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  Facility Location
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                  Slaughterhouse District, City Municipal Area
                </div>
              </div>
            </div>

            {/* Dot separator */}
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155', flexShrink: 0 }} />

            {/* Phone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: 'rgba(226, 73, 61, 0.1)',
                  border: '1px solid rgba(226, 73, 61, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Phone size={16} color="#E2493D" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#64748B',
                    marginBottom: '2px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  Operations Line
                </div>
                <a
                  href="tel:+639158379629"
                  style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}
                >
                  +63 (0) 915-837-9629
                </a>
              </div>
            </div>

            {/* Dot separator */}
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155', flexShrink: 0 }} />

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: 'rgba(226, 73, 61, 0.1)',
                  border: '1px solid rgba(226, 73, 61, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Mail size={16} color="#E2493D" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#64748B',
                    marginBottom: '2px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  Enterprise Support
                </div>
                <a
                  href="mailto:slaughterhouse@gmail.com"
                  style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}
                >
                  slaughterhouse@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
            © {new Date().getFullYear()}{' '}
            <span style={{ color: '#94A3B8', fontWeight: '700' }}>SMIS</span> — Slaughterhouse Meat Inventory & Sales Management System. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '22px' }}>
            {['Privacy Policy', 'Terms of Service', 'Compliance & Traceability'].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: '12px',
                  color: '#475569',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#94A3B8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
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
