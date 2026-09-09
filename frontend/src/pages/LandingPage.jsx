import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale, Clock, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2,
  MapPin, Phone, Mail, ChevronRight, Zap, Package, BarChart3,
  Users, Activity, Lock, Star, Shield, Menu, X
} from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────── */
const pill = (text, color = '#E8452C') => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 14px', borderRadius: '100px',
    border: `1px solid ${color}44`, background: `${color}12`,
    color, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
    textTransform: 'uppercase'
  }}>{text}</span>
);

const Check = ({ color }) => (
  <span style={{
    width: '18px', height: '18px', borderRadius: '50%',
    background: `${color}20`, border: `1px solid ${color}60`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  }}>
    <CheckCircle2 size={11} color={color} />
  </span>
);

/* ─── main component ────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* shared tokens */
  const BG        = '#0A0E17';
  const CARD_BG   = '#0F1623';
  const CARD_BG2  = '#131B2B';
  const BORDER    = 'rgba(255,255,255,0.07)';
  const RED       = '#E8452C';
  const BLUE      = '#3B82F6';
  const GREEN     = '#22C55E';
  const GOLD      = '#F59E0B';
  const GRAY      = '#94A3B8';
  const WHITE     = '#F1F5F9';

  /* portal cards data */
  const portals = [
    {
      accent: RED, label: 'ADMINISTRATOR PORTAL',
      title: 'Management & Analytics',
      desc: 'Full-spectrum oversight of inventory batches, pricing, user accounts, and operational reporting.',
      items: ['Inventory Batch Management','User Account Approval','Sales & Revenue Reports','Product Catalog Control'],
      cta: 'Sign In as Administrator', path: '/admin/login'
    },
    {
      accent: BLUE, label: 'CASHIER TERMINAL',
      title: 'Point-of-Sale Terminal',
      desc: 'Weight-based POS with live batch lookup, FIFO rotation enforcement, and instant receipt generation.',
      items: ['Weight-Based Transaction Entry','Batch & Expiry Lookup','Order Queue Management','Daily Sales Summary'],
      cta: 'Sign In as Cashier', path: '/cashier/login'
    },
    {
      accent: GREEN, label: 'CUSTOMER ONLINE STORE',
      title: 'Catalog & Pre-Orders',
      desc: 'Browse real-time meat catalog, place pre-orders, and track delivery and fulfillment status.',
      items: ['Live Meat Catalog Browse','Pre-Order Placement','Order Status Tracking','Account Profile & History'],
      cta: 'Sign In as Customer', path: '/customer/login'
    },
  ];

  /* feature cards data */
  const features = [
    { icon: Scale, title: 'Weight-Based POS', desc: 'Transactions computed live per kilogram from batch weight entries.' },
    { icon: Clock, title: 'Per-Batch Expiration', desc: 'FIFO rotation enforced automatically by harvest and expiry dates.' },
    { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Admin approval gate controls every customer and cashier account.' },
    { icon: TrendingUp, title: 'Sales Analytics', desc: 'Batch-level traceability tied to every sale transaction record.' },
  ];

  /* stats */
  const stats = [
    { value: '100%', sub: 'Per-Batch Traceability', color: RED },
    { value: 'FIFO', sub: 'Freshness Stock Rotation', color: BLUE },
    { value: 'Real-Time', sub: 'POS Weight Calculation', color: GREEN },
    { value: 'RBAC', sub: 'Admin Account Approval', color: GOLD },
  ];

  return (
    <div style={{ background: BG, minHeight: '100vh', color: WHITE, fontFamily: "'Inter','Manrope',system-ui,sans-serif", overflowX: 'hidden', position: 'relative' }}>

      {/* ── keyframes + utility styles ─────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes glow-pulse {
          0%,100% { opacity:.18; transform:scale(1) translate(-50%,-50%); }
          50%      { opacity:.28; transform:scale(1.08) translate(-47%,-47%); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .smis-glow {
          position:absolute; top:30%; left:50%;
          width:800px; height:560px;
          background:radial-gradient(ellipse, rgba(232,69,44,0.32) 0%, rgba(232,69,44,0.1) 40%, transparent 70%);
          filter:blur(80px); pointer-events:none; z-index:0;
          animation: glow-pulse 9s ease-in-out infinite;
        }
        .smis-glow-blue {
          position:absolute; bottom:-10%; right:-15%;
          width:500px; height:400px;
          background:radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%);
          filter:blur(60px); pointer-events:none; z-index:0;
        }

        .dot-grid {
          position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .fade-up { animation: fade-up 0.7s ease both; }
        .fade-up-1 { animation: fade-up 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fade-up 0.7s 0.2s ease both; }
        .fade-up-3 { animation: fade-up 0.7s 0.35s ease both; }
        .fade-up-4 { animation: fade-up 0.7s 0.5s ease both; }

        .hover-lift { transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s ease, border-color .3s ease; }
        .hover-lift:hover { transform: translateY(-6px); }

        .portal-card { transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s ease; }
        .portal-card:hover { transform: translateY(-8px); }

        .btn-red {
          display:inline-flex; align-items:center; gap:8px;
          background: linear-gradient(135deg, #E8452C, #C73B24);
          color:#fff; border:none; padding:12px 24px; border-radius:8px;
          font-weight:700; font-size:14px; cursor:pointer;
          transition: all .25s ease; letter-spacing:.01em;
          box-shadow: 0 4px 16px rgba(232,69,44,0.35);
        }
        .btn-red:hover { background: linear-gradient(135deg, #F05540, #D84530); box-shadow: 0 6px 22px rgba(232,69,44,0.5); transform:translateY(-1px); }

        .btn-outline {
          display:inline-flex; align-items:center; gap:8px;
          background:transparent; color:${WHITE};
          border:1px solid rgba(255,255,255,0.18);
          padding:12px 24px; border-radius:8px;
          font-weight:600; font-size:14px; cursor:pointer;
          transition: all .25s ease;
        }
        .btn-outline:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.35); }

        .btn-blue {
          display:inline-flex; align-items:center; gap:8px;
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          color:#fff; border:none; padding:11px 22px; border-radius:8px;
          font-weight:700; font-size:13px; cursor:pointer;
          transition: all .25s ease; width:100%; justify-content:center;
          box-shadow: 0 4px 14px rgba(59,130,246,0.3);
        }
        .btn-blue:hover { background:linear-gradient(135deg,#5B9CF8,#3B82F6); transform:translateY(-1px); }

        .btn-green {
          display:inline-flex; align-items:center; gap:8px;
          background: linear-gradient(135deg, #22C55E, #16A34A);
          color:#fff; border:none; padding:11px 22px; border-radius:8px;
          font-weight:700; font-size:13px; cursor:pointer;
          transition: all .25s ease; width:100%; justify-content:center;
          box-shadow: 0 4px 14px rgba(34,197,94,0.3);
        }
        .btn-green:hover { background:linear-gradient(135deg,#34D374,#22C55E); transform:translateY(-1px); }

        .btn-red-full {
          display:inline-flex; align-items:center; gap:8px;
          background: linear-gradient(135deg, #E8452C, #C73B24);
          color:#fff; border:none; padding:11px 22px; border-radius:8px;
          font-weight:700; font-size:13px; cursor:pointer;
          transition: all .25s ease; width:100%; justify-content:center;
          box-shadow: 0 4px 14px rgba(232,69,44,0.3);
        }
        .btn-red-full:hover { background:linear-gradient(135deg,#F05540,#D84530); transform:translateY(-1px); }

        .nav-link {
          color:#94A3B8; font-size:14px; font-weight:500; cursor:pointer;
          text-decoration:none; transition:color .2s;
          background:none; border:none;
        }
        .nav-link:hover { color:#F1F5F9; }

        .grad-text {
          background: linear-gradient(90deg, #E8452C, #F97316, #FCD34D);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        .stat-card-inner { border-right: 1px solid rgba(255,255,255,0.06); }
        .stat-card-inner:last-child { border-right: none; }

        @media (max-width: 900px) {
          .portal-grid { grid-template-columns: 1fr !important; }
          .feature-grid { grid-template-columns: 1fr 1fr !important; }
          .stat-row { grid-template-columns: 1fr 1fr !important; }
          .stat-card-inner { border-right:none !important; border-bottom:1px solid rgba(255,255,255,0.06); }
          .stat-card-inner:last-child { border-bottom:none; }
          .footer-contact { grid-template-columns: 1fr !important; }
          .hero-btns { flex-direction:column; align-items:center; }
        }
        @media (max-width: 600px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .stat-row { grid-template-columns: 1fr !important; }
          .nav-center { display:none !important; }
          .nav-right-desktop { display:none !important; }
          .mobile-menu-btn { display:flex !important; }
        }
        .mobile-menu-btn { display:none; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background: scrolled ? 'rgba(10,14,23,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition:'all .3s ease'
      }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
            <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:'linear-gradient(135deg,#E8452C,#C73B24)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(232,69,44,0.4)' }}>
              <Shield size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize:'16px', fontWeight:'800', letterSpacing:'.04em', color:WHITE, lineHeight:1 }}>SMIS</div>
              <div style={{ fontSize:'9px', fontWeight:'600', color:'#64748B', letterSpacing:'.1em', lineHeight:1, marginTop:'2px' }}>SLAUGHTERHOUSE MIS</div>
            </div>
          </div>

          {/* Nav center */}
          <div className="nav-center" style={{ display:'flex', gap:'32px' }}>
            {['Capabilities','System Portals','Specifications'].map(t => (
              <button key={t} className="nav-link">{t}</button>
            ))}
          </div>

          {/* Nav right */}
          <div className="nav-right-desktop" style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <button className="btn-outline" style={{ padding:'8px 16px', fontSize:'13px' }} onClick={() => navigate('/admin/login')}>
              System Sign In <ArrowRight size={14} />
            </button>
            <button className="btn-red" style={{ padding:'8px 16px', fontSize:'13px' }} onClick={() => navigate('/register')}>
              Open Account <ChevronRight size={14} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" style={{ background:'none', border:'none', color:WHITE, cursor:'pointer', padding:'4px' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background:'rgba(10,14,23,0.98)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'16px 24px 24px' }}>
            {['Capabilities','System Portals','Specifications'].map(t => (
              <div key={t} style={{ padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', color:GRAY, fontSize:'14px', fontWeight:'500' }}>{t}</div>
            ))}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'16px' }}>
              <button className="btn-outline" style={{ width:'100%', justifyContent:'center' }} onClick={() => navigate('/admin/login')}>System Sign In</button>
              <button className="btn-red" style={{ width:'100%', justifyContent:'center' }} onClick={() => navigate('/register')}>Open Account</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ position:'relative', paddingTop:'140px', paddingBottom:'80px', overflow:'hidden' }}>
        <div className="dot-grid" />
        <div className="smis-glow" />
        <div className="smis-glow-blue" />

        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px', position:'relative', zIndex:2 }}>

          {/* Badge */}
          <div className="fade-up" style={{ textAlign:'center', marginBottom:'28px' }}>
            {pill('⚡  Slaughterhouse Meat Inventory & Sales Management System')}
          </div>

          {/* Headline */}
          <div className="fade-up-1" style={{ textAlign:'center', marginBottom:'20px' }}>
            <h1 style={{ fontSize:'clamp(32px,5vw,58px)', fontWeight:'900', lineHeight:1.12, letterSpacing:'-.03em', color:WHITE, marginBottom:'6px' }}>
              Precision Meat Batch Inventory
            </h1>
            <h1 style={{ fontSize:'clamp(32px,5vw,58px)', fontWeight:'900', lineHeight:1.12, letterSpacing:'-.03em' }}>
              &amp; <span className="grad-text">Point-of-Sale Terminal</span>
            </h1>
          </div>

          {/* Subtext */}
          <div className="fade-up-2" style={{ textAlign:'center', marginBottom:'36px' }}>
            <p style={{ color:GRAY, fontSize:'16px', lineHeight:1.7, maxWidth:'560px', margin:'0 auto' }}>
              End-to-end slaughterhouse operations platform — manage livestock batches, enforce freshness rotation, and process kilogram-based sales across every operational role.
            </p>
          </div>

          {/* CTAs */}
          <div className="fade-up-3 hero-btns" style={{ display:'flex', gap:'12px', justifyContent:'center', marginBottom:'64px', flexWrap:'wrap' }}>
            <button className="btn-red" style={{ padding:'13px 28px', fontSize:'14px' }} onClick={() => navigate('/admin/login')}>
              Access System Portal <ArrowRight size={16} />
            </button>
            <button className="btn-outline" style={{ padding:'13px 28px', fontSize:'14px' }} onClick={() => navigate('/register')}>
              Register Customer Account
            </button>
          </div>

          {/* Feature cards row */}
          <div className="fade-up-4 feature-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="hover-lift" style={{
                background: CARD_BG, border:`1px solid ${BORDER}`, borderRadius:'12px',
                padding:'20px', display:'flex', flexDirection:'column', gap:'12px'
              }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'8px', background:'rgba(232,69,44,0.12)', border:'1px solid rgba(232,69,44,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={18} color={RED} />
                </div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:WHITE, marginBottom:'4px' }}>{title}</div>
                  <div style={{ fontSize:'12px', color:GRAY, lineHeight:1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTAL SELECTION ────────────────────────────── */}
      <section style={{ padding:'80px 0', position:'relative' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>

          {/* Section badge + heading */}
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            {pill('Choose Your Portal', BLUE)}
            <h2 style={{ fontSize:'clamp(26px,3.5vw,40px)', fontWeight:'800', letterSpacing:'-.025em', color:WHITE, margin:'18px 0 12px' }}>
              Engineered for Every Operational Role
            </h2>
            <p style={{ color:GRAY, fontSize:'15px', maxWidth:'480px', margin:'0 auto', lineHeight:1.6 }}>
              Three purpose-built portals — each scoped to its exact operational context with no feature overlap.
            </p>
          </div>

          {/* Portal cards */}
          <div className="portal-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }}>
            {portals.map(({ accent, label, title, desc, items, cta, path }) => (
              <div key={title} className="portal-card" style={{
                background: CARD_BG, borderRadius:'14px',
                border:`1px solid ${BORDER}`,
                borderTop:`3px solid ${accent}`,
                padding:'28px', display:'flex', flexDirection:'column', gap:'18px',
                boxShadow:`0 0 0 1px transparent`,
              }}>
                {/* Badge */}
                <div style={{ display:'inline-flex', alignItems:'center' }}>
                  <span style={{ padding:'4px 10px', borderRadius:'6px', background:`${accent}18`, color:accent, fontSize:'10px', fontWeight:'800', letterSpacing:'.08em' }}>{label}</span>
                </div>
                {/* Title + desc */}
                <div>
                  <h3 style={{ fontSize:'20px', fontWeight:'800', color:WHITE, marginBottom:'8px', letterSpacing:'-.02em' }}>{title}</h3>
                  <p style={{ fontSize:'13px', color:GRAY, lineHeight:1.65 }}>{desc}</p>
                </div>
                {/* Divider */}
                <div style={{ height:'1px', background:BORDER }} />
                {/* Checklist */}
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'10px' }}>
                  {items.map(item => (
                    <li key={item} style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'13px', color:'#CBD5E1' }}>
                      <Check color={accent} />
                      {item}
                    </li>
                  ))}
                </ul>
                {/* CTA */}
                <button
                  onClick={() => navigate(path)}
                  style={{
                    marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    background:`linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    color:'#fff', border:'none', padding:'12px 20px', borderRadius:'8px',
                    fontWeight:'700', fontSize:'13px', cursor:'pointer',
                    transition:'all .25s ease',
                    boxShadow:`0 4px 14px ${accent}33`
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 6px 20px ${accent}55`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 4px 14px ${accent}33`; }}
                >
                  {cta} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS / TRUST ───────────────────────────────── */}
      <section style={{ padding:'80px 0' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
          {/* Heading */}
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <h2 style={{ fontSize:'clamp(24px,3vw,38px)', fontWeight:'800', letterSpacing:'-.025em', color:WHITE, marginBottom:'12px' }}>
              Enterprise-Grade Cold Chain &amp; Meat Management
            </h2>
            <p style={{ color:GRAY, fontSize:'15px', maxWidth:'500px', margin:'0 auto', lineHeight:1.65 }}>
              Built on proven inventory control principles — every figure a live operational guarantee, not a marketing estimate.
            </p>
          </div>

          {/* Stats card */}
          <div style={{ background:CARD_BG, border:`1px solid ${BORDER}`, borderRadius:'16px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="stat-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
              {stats.map(({ value, sub, color }) => (
                <div key={sub} className="stat-card-inner" style={{ padding:'36px 24px', textAlign:'center' }}>
                  <div style={{ fontSize:'clamp(28px,3vw,40px)', fontWeight:'900', color, letterSpacing:'-.02em', marginBottom:'8px' }}>{value}</div>
                  <div style={{ fontSize:'12px', color:GRAY, lineHeight:1.5, fontWeight:'500' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom feature highlights */}
          <div className="feature-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginTop:'20px' }}>
            {[
              { icon: Package, label:'Batch Tracking', color:RED },
              { icon: Activity, label:'Live Inventory', color:BLUE },
              { icon: Lock, label:'Access Control', color:GREEN },
              { icon: BarChart3, label:'Sales Reports', color:GOLD },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="hover-lift" style={{
                background:CARD_BG2, border:`1px solid ${BORDER}`, borderRadius:'10px',
                padding:'16px 20px', display:'flex', alignItems:'center', gap:'12px'
              }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'7px', background:`${color}15`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={15} color={color} />
                </div>
                <span style={{ fontSize:'13px', fontWeight:'600', color:'#CBD5E1' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid ${BORDER}`, paddingTop:'60px', paddingBottom:'32px', marginTop:'20px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>

          {/* Logo + tagline */}
          <div style={{ textAlign:'center', marginBottom:'20px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'7px', background:'linear-gradient(135deg,#E8452C,#C73B24)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(232,69,44,0.4)' }}>
                <Shield size={16} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize:'15px', fontWeight:'800', letterSpacing:'.04em', color:WHITE, lineHeight:1 }}>SMIS</div>
                <div style={{ fontSize:'8px', fontWeight:'600', color:'#64748B', letterSpacing:'.1em', lineHeight:1, marginTop:'2px' }}>SLAUGHTERHOUSE MIS</div>
              </div>
            </div>
            <p style={{ color:GRAY, fontSize:'13px', lineHeight:1.7, maxWidth:'420px', margin:'0 auto' }}>
              Integrated livestock batch management, cold-chain traceability, and weight-based point-of-sale operations — built for Philippine slaughterhouse enterprises.
            </p>
          </div>

          {/* Divider */}
          <div style={{ height:'1px', background:BORDER, margin:'28px 0' }} />

          {/* Contact row */}
          <div className="footer-contact" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px', marginBottom:'40px' }}>
            {[
              { icon: MapPin, label:'Facility Location', value:'Batangas Province, Philippines', color:RED },
              { icon: Phone, label:'Operations Line', value:'+63 (0) 912 345 6789', color:BLUE },
              { icon: Mail, label:'Enterprise Support', value:'support@smis.enterprise.ph', color:GREEN },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:`${color}15`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={15} color={color} />
                </div>
                <div>
                  <div style={{ fontSize:'11px', fontWeight:'700', color:GRAY, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:'3px' }}>{label}</div>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:WHITE }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ height:'1px', background:BORDER, marginBottom:'20px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
            <span style={{ fontSize:'12px', color:'#475569' }}>© 2026 SMIS — Slaughterhouse Meat Inventory & Sales Management System. All rights reserved.</span>
            <div style={{ display:'flex', gap:'20px' }}>
              {['Privacy Policy','Terms of Service','Compliance & Traceability'].map(t => (
                <button key={t} style={{ background:'none', border:'none', color:'#475569', fontSize:'12px', cursor:'pointer', transition:'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#94A3B8'}
                  onMouseLeave={e => e.currentTarget.style.color='#475569'}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
