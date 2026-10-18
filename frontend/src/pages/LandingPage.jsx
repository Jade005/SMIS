import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale, Clock, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2,
  MapPin, Phone, Mail, ChevronRight, Package, BarChart3,
  Activity, Lock, Shield, Menu, X, Flame, Snowflake, Users
} from 'lucide-react';

/* ════════════════════════════════════════════════════════
   DESIGN TOKENS — oxblood + butcher-paper + steel hooks
   ════════════════════════════════════════════════════════ */
const OX      = '#1B0709';   // deep oxblood (page)
const OX2     = '#2A0C10';   // raised surface
const OX3     = '#3A1217';   // card
const MEAT    = '#C1121F';   // fresh-cut red
const MEAT_HI = '#E5384A';
const FAT     = '#F6EBDD';   // fat / cream
const KRAFT   = '#E6D3B3';   // butcher paper
const KRAFT_D = '#CDB48C';
const INK     = '#1E1412';
const STEEL   = '#9AA3AD';
const SAGE    = '#5F8A4E';
const AMBER   = '#D99A2B';
const MUTE    = '#C9B4A6';
const LINE    = 'rgba(246,235,221,0.10)';

const DISPLAY = "'Alfa Slab One','Rockwell','Georgia',serif";
const BODY    = "'Work Sans','Inter',system-ui,sans-serif";

/* marbled-meat texture (SVG turbulence, inlined) */
const MARBLE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='700' height='700'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.006 0.022' numOctaves='4' seed='11'/><feColorMatrix values='0 0 0 0 0.96  0 0 0 0 0.84  0 0 0 0 0.78  0 0 0 1.5 -0.72'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

/* kraft-paper grain */
const KRAFT_GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='k'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.15  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23k)'/></svg>")`;

/* ════════════════════════════════════════════════════════
   MEAT ILLUSTRATIONS (inline SVG)
   ════════════════════════════════════════════════════════ */
const Steak = () => (
  <svg viewBox="0 0 120 110" width="100%" aria-hidden="true">
    <defs>
      <radialGradient id="g-steak" cx="40%" cy="35%" r="80%">
        <stop offset="0" stopColor="#E9566A" />
        <stop offset=".6" stopColor="#B3162B" />
        <stop offset="1" stopColor="#6E0B1A" />
      </radialGradient>
    </defs>
    <path d="M18 40C10 18 45 6 70 12c32 6 46 32 34 58C94 94 58 106 34 92 16 82 24 56 18 40Z" fill="url(#g-steak)" stroke={FAT} strokeWidth="5" strokeLinejoin="round" />
    <g stroke={FAT} strokeOpacity=".6" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M30 36c16-8 28 8 50-4" />
      <path d="M26 56c18-10 30 6 52-6" />
      <path d="M40 78c14-8 26 4 40-6" />
      <path d="M52 22c6 8 14 6 22 14" />
    </g>
    <ellipse cx="78" cy="68" rx="9" ry="7" fill={FAT} />
    <ellipse cx="78" cy="68" rx="4" ry="3" fill="#6E0B1A" />
  </svg>
);

const Ham = () => (
  <svg viewBox="0 0 120 120" width="100%" aria-hidden="true">
    <defs>
      <radialGradient id="g-ham" cx="40%" cy="30%" r="85%">
        <stop offset="0" stopColor="#F0A3A3" />
        <stop offset=".55" stopColor="#CD6270" />
        <stop offset="1" stopColor="#8E2A39" />
      </radialGradient>
    </defs>
    <path d="M30 18l-10-8" stroke={FAT} strokeWidth="9" strokeLinecap="round" />
    <circle cx="16" cy="8" r="7" fill={FAT} />
    <circle cx="9" cy="14" r="6" fill={FAT} />
    <path d="M32 34C32 12 84 8 100 32c16 24 2 62-32 74C44 114 20 94 24 68c2-14 8-20 8-34Z" fill="url(#g-ham)" stroke="#F4D7C8" strokeWidth="4" />
    <g stroke="#6B1A28" strokeOpacity=".5" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M36 44c24 6 46 4 62 0" />
      <path d="M30 66c26 8 52 8 70-2" />
      <path d="M36 88c20 6 38 4 52-6" />
    </g>
  </svg>
);

const Ribs = () => (
  <svg viewBox="0 0 110 120" width="100%" aria-hidden="true">
    <defs>
      <linearGradient id="g-ribs" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D8394B" />
        <stop offset="1" stopColor="#8C0F20" />
      </linearGradient>
    </defs>
    {[22, 38, 54, 70, 86].map(x => (
      <line key={x} x1={x} y1="58" x2={x} y2="108" stroke={FAT} strokeWidth="8" strokeLinecap="round" />
    ))}
    <path d="M8 10h94v44c0 10-12 14-47 14S8 64 8 54Z" fill="url(#g-ribs)" stroke={FAT} strokeWidth="4" strokeLinejoin="round" />
    {[30, 46, 62, 78].map(x => (
      <line key={x} x1={x} y1="16" x2={x} y2="62" stroke="#5E0813" strokeOpacity=".55" strokeWidth="2" />
    ))}
    <path d="M14 22h82" stroke={FAT} strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Sausages = () => (
  <svg viewBox="0 0 60 140" width="100%" aria-hidden="true">
    <defs>
      <linearGradient id="g-sau" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8E3523" />
        <stop offset=".4" stopColor="#C2603F" />
        <stop offset="1" stopColor="#7C2A1B" />
      </linearGradient>
    </defs>
    {[6, 48, 90].map(y => (
      <g key={y}>
        <rect x="8" y={y} width="44" height="38" rx="19" fill="url(#g-sau)" />
        <rect x="16" y={y + 6} width="6" height="22" rx="3" fill="#fff" opacity=".22" />
      </g>
    ))}
    <path d="M30 0v8M30 44v6M30 86v6" stroke="#CDB48C" strokeWidth="3" />
  </svg>
);

/* steel hook + chain, with a swaying piece of meat */
const HangingCut = ({ children, style, width = 92, chain = 70, dur = 5.5, delay = 0 }) => (
  <div className="sway" style={{
    position: 'absolute', top: 0, width, transformOrigin: '50% 0',
    animationDuration: `${dur}s`, animationDelay: `${delay}s`, ...style
  }}>
    <svg width="14" height={chain} viewBox={`0 0 14 ${chain}`} style={{ display: 'block', margin: '0 auto' }} aria-hidden="true">
      <line x1="7" y1="0" x2="7" y2={chain - 22} stroke={STEEL} strokeWidth="2" strokeDasharray="5 3" />
      <path d={`M7 ${chain - 22}C-2 ${chain - 22} -2 ${chain - 2} 7 ${chain - 2}`} stroke={STEEL} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
    <div style={{ marginTop: '-6px', filter: 'drop-shadow(0 14px 14px rgba(0,0,0,.55))' }}>{children}</div>
  </div>
);

/* cleaver illustration */
const Cleaver = () => (
  <svg viewBox="0 0 150 90" width="150" aria-hidden="true">
    <defs>
      <linearGradient id="g-blade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F4F6F8" />
        <stop offset=".5" stopColor="#B9C1C9" />
        <stop offset="1" stopColor="#7C858F" />
      </linearGradient>
    </defs>
    <path d="M6 12h84c16 0 28 10 28 26v22c0 6-4 10-10 10H6c-4 0-6-3-6-7V19c0-4 2-7 6-7Z" fill="url(#g-blade)" stroke="#59616B" strokeWidth="2" />
    <circle cx="20" cy="26" r="5" fill={OX} stroke="#59616B" strokeWidth="1.5" />
    <path d="M10 66h104" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
    <rect x="116" y="30" width="32" height="14" rx="7" fill="#4A2A1A" stroke="#2C170D" strokeWidth="2" />
    <circle cx="124" cy="37" r="2" fill={KRAFT_D} />
    <circle cx="140" cy="37" r="2" fill={KRAFT_D} />
  </svg>
);

/* ════════════════════════════════════════════════════════
   SMALL PIECES
   ════════════════════════════════════════════════════════ */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.18 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const Tag = ({ text, color = MEAT, light }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 14px 6px 12px', borderRadius: 6,
    background: light ? `${color}1c` : `${color}26`,
    border: `1px dashed ${color}99`, color: light ? color : FAT,
    fontSize: 13, fontWeight: 600, letterSpacing: '.02em'
  }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}33` }} />
    {text}
  </span>
);

const CheckDot = ({ color }) => (
  <span style={{
    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
    background: `${color}22`, border: `1.5px solid ${color}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <CheckCircle2 size={12} color={color} />
  </span>
);

/* live scale — the POS idea, shown rather than described */
const ScaleWidget = () => {
  const PRICE = 285;
  const [w, setW] = useState(0);
  const [stable, setStable] = useState(false);

  useEffect(() => {
    let target = 12.45, t = 0;
    const id = setInterval(() => {
      t += 1;
      if (t < 22) { setStable(false); setW(target * (0.35 + Math.random() * 0.8)); }
      else if (t < 23) { setW(target); setStable(true); }
      if (t > 70) { t = 0; target = 6 + Math.random() * 18; }
    }, 90);
    return () => clearInterval(id);
  }, []);

  const total = w * PRICE;
  return (
    <div className="scale-card" style={{
      width: '100%', maxWidth: 520, margin: '0 auto', textAlign: 'left',
      background: `linear-gradient(180deg, ${OX3}, ${OX2})`,
      border: `1px solid ${LINE}`, borderRadius: 18, padding: 22,
      boxShadow: '0 30px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTE, fontSize: 13, fontWeight: 600 }}>
          <Scale size={16} color={AMBER} /> Cashier scale · Batch B-0418
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: stable ? '#7BD36B' : AMBER, transition: 'color .3s' }}>
          <span className={stable ? '' : 'blink'} style={{ width: 8, height: 8, borderRadius: '50%', background: stable ? '#7BD36B' : AMBER }} />
          {stable ? 'Weight locked' : 'Weighing…'}
        </div>
      </div>

      <div style={{
        background: '#0D0405', border: '1px solid rgba(0,0,0,.6)', borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        boxShadow: 'inset 0 4px 14px rgba(0,0,0,.7)'
      }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(38px,7vw,54px)', color: stable ? '#FFD76B' : '#B9923F', letterSpacing: '.02em', textShadow: '0 0 18px rgba(255,200,80,.35)', transition: 'color .3s', fontVariantNumeric: 'tabular-nums' }}>
          {w.toFixed(3)}
        </span>
        <span style={{ color: MUTE, fontWeight: 700, fontSize: 18 }}>kg</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
        {[
          { l: 'Price per kg', v: `₱${PRICE.toFixed(2)}` },
          { l: 'Total', v: `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, hi: true },
          { l: 'Rotation', v: 'FIFO · oldest first' },
        ].map(({ l, v, hi }) => (
          <div key={l} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${LINE}` }}>
            <div style={{ fontSize: 11, color: MUTE, marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: hi ? '#FFD76B' : FAT, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* rising embers / steam particles — generated once */
  const embers = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 3 + Math.random() * 7,
    dur: 9 + Math.random() * 10,
    delay: -Math.random() * 18,
    drift: (Math.random() - 0.5) * 120,
  })), []);

  const goTo = id => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navItems = [
    { t: 'Capabilities', id: 'capabilities' },
    { t: 'System portals', id: 'portals' },
    { t: 'Specifications', id: 'specs' },
  ];

  const portals = [
    {
      accent: MEAT, icon: ShieldCheck, label: 'Administrator',
      title: 'Management & Analytics', stamp: 'Head office',
      desc: 'Oversee inventory batches, pricing, user accounts, and operational reports from one desk.',
      items: ['Inventory batch management', 'User account approval', 'Sales & revenue reports', 'Product catalog control'],
      cta: 'Sign in as Administrator', path: '/admin/login'
    },
    {
      accent: AMBER, icon: Scale, label: 'Cashier',
      title: 'Point-of-Sale Terminal', stamp: 'Counter',
      desc: 'Weigh, price, and ring up sales with live batch lookup, FIFO rotation, and instant receipts.',
      items: ['Weight-based transaction entry', 'Batch & expiry lookup', 'Order queue management', 'Daily sales summary'],
      cta: 'Sign in as Cashier', path: '/cashier/login'
    },
    {
      accent: SAGE, icon: Package, label: 'Customer',
      title: 'Catalog & Pre-Orders', stamp: 'Online shop',
      desc: 'Browse the live meat catalog, place a pre-order, and follow it through to delivery.',
      items: ['Live meat catalog', 'Pre-order placement', 'Order status tracking', 'Account profile & history'],
      cta: 'Sign in as Customer', path: '/customer/login'
    },
  ];

  const features = [
    { icon: Scale, title: 'Weight-based POS', desc: 'Every sale is priced per kilogram straight from the batch weight entry.', color: AMBER },
    { icon: Clock, title: 'Per-batch expiration', desc: 'FIFO rotation is enforced automatically from harvest and expiry dates.', color: MEAT_HI },
    { icon: ShieldCheck, title: 'Role-based access', desc: 'An admin approval gate controls every customer and cashier account.', color: SAGE },
    { icon: TrendingUp, title: 'Sales analytics', desc: 'Each sale record links back to the batch the meat came from.', color: '#5AA0D8' },
  ];

  const stats = [
    { value: '100%', sub: 'Per-batch traceability', color: MEAT_HI, fill: 100 },
    { value: 'FIFO', sub: 'Freshness stock rotation', color: '#5AA0D8', fill: 86 },
    { value: 'Live', sub: 'POS weight calculation', color: SAGE, fill: 94 },
    { value: 'RBAC', sub: 'Admin account approval', color: AMBER, fill: 78 },
  ];

  const ticker = ['Prime beef', 'Fresh pork', 'Native chicken', 'Goat & lamb', 'Sausage & longganisa', 'Batch-tagged cuts', 'Cold-chain verified'];

  return (
    <div style={{ background: OX, minHeight: '100vh', color: FAT, fontFamily: BODY, overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        button{font-family:inherit}
        :focus-visible{outline:2px solid ${AMBER};outline-offset:3px}

        /* ── hanging meat sway ── */
        @keyframes sway{0%,100%{transform:rotate(-4.5deg)}50%{transform:rotate(4.5deg)}}
        .sway{animation:sway 5.5s ease-in-out infinite}

        /* ── hero entrance: one orchestrated sequence ── */
        @keyframes slab-in{from{opacity:0;transform:translateY(40px) scale(.97);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
        @keyframes fade-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .h-1{animation:slab-in .9s .15s cubic-bezier(.16,1,.3,1) both}
        .h-2{animation:slab-in .9s .32s cubic-bezier(.16,1,.3,1) both}
        .h-3{animation:fade-in .8s .6s ease both}
        .h-4{animation:fade-in .8s .75s ease both}
        .h-5{animation:fade-in .9s .95s ease both}

        /* ── sheen sweeping across the headline ── */
        @keyframes sheen{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .meat-text{
          background:linear-gradient(100deg,${MEAT_HI} 0%,#FF8A5B 30%,${FAT} 48%,#FF8A5B 66%,${MEAT_HI} 100%);
          background-size:200% 100%;
          -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
          animation:sheen 6s linear infinite;
        }

        /* ── marbling drift + ember glow ── */
        @keyframes marble-drift{0%{background-position:0 0}100%{background-position:700px 350px}}
        .marble{position:absolute;inset:0;pointer-events:none;background-image:${MARBLE};background-size:700px 700px;opacity:.16;mix-blend-mode:screen;animation:marble-drift 90s linear infinite}
        @keyframes glow{0%,100%{opacity:.55;transform:translate(-50%,0) scale(1)}50%{opacity:.85;transform:translate(-50%,-14px) scale(1.07)}}
        .hero-glow{position:absolute;left:50%;top:18%;width:900px;height:520px;pointer-events:none;
          background:radial-gradient(ellipse,rgba(193,18,31,.55) 0%,rgba(193,18,31,.18) 45%,transparent 70%);
          filter:blur(70px);animation:glow 8s ease-in-out infinite}

        @keyframes ember{0%{transform:translate(0,0) scale(1);opacity:0}12%{opacity:.9}100%{transform:translate(var(--dx),-110vh) scale(.2);opacity:0}}
        .ember{position:absolute;bottom:-20px;border-radius:50%;pointer-events:none;
          background:radial-gradient(circle,#FFB36B 0%,#E5384A 55%,transparent 72%);animation:ember linear infinite}

        /* ── meat rail ── */
        .rail{position:absolute;left:0;right:0;top:64px;height:8px;z-index:3;
          background:linear-gradient(180deg,#d7dde3,#6d7680 60%,#3b4249);box-shadow:0 6px 14px rgba(0,0,0,.5)}

        /* ── ticker ── */
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ticker-track{display:flex;width:max-content;animation:marquee 38s linear infinite}
        .ticker:hover .ticker-track{animation-play-state:paused}

        /* ── scroll reveal ── */
        .reveal{opacity:0;transform:translateY(34px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .reveal.in{opacity:1;transform:none}

        /* ── cleaver chop divider ── */
        .chop{position:relative;height:120px;display:flex;align-items:center;justify-content:center}
        .chop-line{position:absolute;top:50%;height:3px;width:0;background:linear-gradient(90deg,transparent,${MEAT_HI});transition:width .7s .55s cubic-bezier(.16,1,.3,1)}
        .chop-line.r{background:linear-gradient(270deg,transparent,${MEAT_HI})}
        .chop.in .chop-line{width:calc(50% - 110px)}
        .chop-line.l{right:50%;margin-right:90px}
        .chop-line.r{left:50%;margin-left:90px}
        .cleaver{transform-origin:100% 100%;transform:rotate(-72deg) translateY(-40px);opacity:0;transition:transform .5s cubic-bezier(.6,-0.2,.4,1.4),opacity .25s}
        .chop.in .cleaver{transform:rotate(0) translateY(0);opacity:1}
        @keyframes flash{0%{opacity:0;transform:scale(.2)}35%{opacity:1}100%{opacity:0;transform:scale(1.6)}}
        .chop-flash{position:absolute;width:90px;height:90px;border-radius:50%;pointer-events:none;opacity:0;
          background:radial-gradient(circle,rgba(255,220,170,.9),rgba(229,56,74,.5) 40%,transparent 70%)}
        .chop.in .chop-flash{animation:flash .55s .42s ease-out both}

        /* ── cards ── */
        .cut-card{transition:transform .35s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .35s}
        .cut-card:hover{transform:translateY(-8px) rotate(-.6deg);border-color:rgba(246,235,221,.28);box-shadow:0 24px 40px rgba(0,0,0,.45)}
        .cut-card:hover .cut-icon{transform:rotate(-10deg) scale(1.12)}
        .cut-icon{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}

        @keyframes tag-swing{0%{transform:rotate(0)}25%{transform:rotate(2.4deg)}55%{transform:rotate(-1.6deg)}80%{transform:rotate(.8deg)}100%{transform:rotate(0)}}
        .tag-card{transform-origin:50% 0;transition:box-shadow .35s}
        .tag-card:hover{animation:tag-swing 1.1s ease-out;box-shadow:0 30px 50px rgba(60,30,10,.35)}
        .tag-card:hover .tag-cta{transform:translateY(-2px)}
        .tag-cta{transition:transform .25s,box-shadow .25s,filter .25s}
        .tag-cta:hover{filter:brightness(1.1)}
        .tag-cta:active{transform:translateY(1px) scale(.98)}
        .tag-cta .arr{transition:transform .25s}
        .tag-cta:hover .arr{transform:translateX(4px)}

        /* ── stamp ── */
        @keyframes stamp{0%{opacity:0;transform:rotate(-14deg) scale(2.2)}60%{opacity:1;transform:rotate(-14deg) scale(.94)}100%{opacity:.9;transform:rotate(-14deg) scale(1)}}
        .stamp{opacity:0}
        .reveal.in .stamp{animation:stamp .5s .5s cubic-bezier(.2,.8,.3,1) both}

        /* ── stat bars ── */
        .bar>i{display:block;height:100%;width:0;border-radius:4px;transition:width 1.4s .3s cubic-bezier(.16,1,.3,1)}
        .reveal.in .bar>i{width:var(--w)}

        /* ── buttons ── */
        .btn{display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer;font-weight:700;border-radius:10px;transition:transform .25s cubic-bezier(.16,1,.3,1),box-shadow .25s,background .25s,border-color .25s}
        .btn .arr{transition:transform .25s}
        .btn:hover .arr{transform:translateX(4px)}
        .btn-primary{background:linear-gradient(135deg,${MEAT_HI},${MEAT});color:#fff;box-shadow:0 8px 22px rgba(193,18,31,.45)}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(229,56,74,.55)}
        .btn-ghost{background:rgba(246,235,221,.04);color:${FAT};border:1px solid rgba(246,235,221,.25)}
        .btn-ghost:hover{background:rgba(246,235,221,.10);border-color:rgba(246,235,221,.5);transform:translateY(-2px)}
        .nav-link{color:${MUTE};font-size:14px;font-weight:500;background:none;border:none;cursor:pointer;position:relative;padding:6px 0;transition:color .2s}
        .nav-link::after{content:'';position:absolute;left:0;bottom:0;height:2px;width:100%;background:${MEAT_HI};transform:scaleX(0);transform-origin:left;transition:transform .3s}
        .nav-link:hover{color:${FAT}}
        .nav-link:hover::after{transform:scaleX(1)}
        .blink{animation:blink 1s steps(2) infinite}
        @keyframes blink{50%{opacity:.25}}
        .mobile-menu-btn{display:none}

        @media (max-width:1180px){.hang-side{display:none !important}}
        @media (max-width:900px){
          .portal-grid{grid-template-columns:1fr !important}
          .feature-grid{grid-template-columns:1fr 1fr !important}
          .stat-row{grid-template-columns:1fr 1fr !important}
          .footer-contact{grid-template-columns:1fr !important}
          .hero-btns{flex-direction:column;align-items:stretch}
          .hero-btns .btn{justify-content:center}
          .scale-grid{grid-template-columns:1fr !important}
        }
        @media (max-width:600px){
          .feature-grid,.stat-row{grid-template-columns:1fr !important}
          .nav-center,.nav-right-desktop{display:none !important}
          .mobile-menu-btn{display:flex !important}
        }
        @media (prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:.001s !important;animation-iteration-count:1 !important;transition-duration:.001s !important}
          .reveal{opacity:1;transform:none}
          .cleaver{opacity:1;transform:none}
          .chop .chop-line{width:calc(50% - 110px)}
          .stamp{opacity:.9}
          .bar>i{width:var(--w)}
        }
      `}</style>

      {/* ── NAV ───────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(27,7,9,.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? `1px solid ${LINE}` : '1px solid transparent',
        transition: 'all .3s ease'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${MEAT_HI},${MEAT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(193,18,31,.5)' }}>
              <Shield size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 18, letterSpacing: '.04em', lineHeight: 1 }}>SMIS</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: MUTE, lineHeight: 1, marginTop: 3 }}>Slaughterhouse MIS</div>
            </div>
          </div>

          <div className="nav-center" style={{ display: 'flex', gap: 32 }}>
            {navItems.map(({ t, id }) => (
              <button key={t} className="nav-link" onClick={() => goTo(id)}>{t}</button>
            ))}
          </div>

          <div className="nav-right-desktop" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-ghost" style={{ padding: '9px 16px', fontSize: 13 }} onClick={() => navigate('/admin/login')}>
              System sign in
            </button>
            <button className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13 }} onClick={() => navigate('/register')}>
              Open account <ChevronRight size={14} className="arr" />
            </button>
          </div>

          <button className="mobile-menu-btn" aria-label="Toggle menu" style={{ background: 'none', border: 'none', color: FAT, cursor: 'pointer', padding: 4 }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div style={{ background: 'rgba(27,7,9,.98)', borderTop: `1px solid ${LINE}`, padding: '16px 24px 24px' }}>
            {navItems.map(({ t, id }) => (
              <div key={t} onClick={() => goTo(id)} style={{ padding: '12px 0', borderBottom: `1px solid ${LINE}`, color: MUTE, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>{t}</div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={() => navigate('/admin/login')}>System sign in</button>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={() => navigate('/register')}>Open account</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────── */}
      <section style={{ position: 'relative', paddingTop: 150, paddingBottom: 90, overflow: 'hidden' }}>
        <div className="marble" />
        <div className="hero-glow" />
        {embers.map(e => (
          <span key={e.id} className="ember" style={{
            left: `${e.left}%`, width: e.size, height: e.size,
            animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s`, '--dx': `${e.drift}px`
          }} />
        ))}

        {/* steel rail with hanging cuts */}
        <div className="rail" />
        <div className="hang-side" style={{ position: 'absolute', inset: 0, top: 72, zIndex: 3, pointerEvents: 'none' }}>
          <HangingCut width={96} chain={60} dur={5.2} delay={-1} style={{ left: '4%' }}><Ham /></HangingCut>
          <HangingCut width={70} chain={120} dur={6.4} delay={-3} style={{ left: '14%' }}><Sausages /></HangingCut>
          <HangingCut width={92} chain={90} dur={5.8} delay={-2} style={{ right: '14%' }}><Ribs /></HangingCut>
          <HangingCut width={104} chain={50} dur={6} delay={-4} style={{ right: '3.5%' }}><Steak /></HangingCut>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 4, textAlign: 'center' }}>
          <div className="h-3" style={{ marginBottom: 26 }}>
            <Tag text="Slaughterhouse Meat Inventory & Sales Management System" color={AMBER} />
          </div>

          <h1 className="h-1" style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(36px,6.4vw,74px)', lineHeight: 1.06, letterSpacing: '-.01em', textShadow: '0 6px 30px rgba(0,0,0,.5)' }}>
            Every batch weighed,
          </h1>
          <h1 className="h-2 meat-text" style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(36px,6.4vw,74px)', lineHeight: 1.06, letterSpacing: '-.01em', marginBottom: 24, paddingBottom: 6 }}>
            tagged, and sold fresh.
          </h1>

          <p className="h-3" style={{ color: MUTE, fontSize: 17, lineHeight: 1.7, maxWidth: 580, margin: '0 auto 34px' }}>
            Manage livestock batches, enforce first-in-first-out rotation, and ring up kilogram-based sales — all from one system, for every role in the shop.
          </p>

          <div className="h-4 hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 64, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '15px 30px', fontSize: 15 }} onClick={() => goTo('portals')}>
              Choose your portal <ArrowRight size={16} className="arr" />
            </button>
            <button className="btn btn-ghost" style={{ padding: '15px 30px', fontSize: 15 }} onClick={() => navigate('/register')}>
              Register customer account
            </button>
          </div>

          <div className="h-5">
            <ScaleWidget />
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────── */}
      <div className="ticker" style={{ background: MEAT, borderTop: '2px dashed rgba(255,255,255,.35)', borderBottom: '2px dashed rgba(255,255,255,.35)', overflow: 'hidden', padding: '14px 0', position: 'relative', zIndex: 4 }}>
        <div className="ticker-track">
          {[0, 1].map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {ticker.map(t => (
                <span key={t + k} style={{ display: 'inline-flex', alignItems: 'center', gap: 22, padding: '0 22px', fontFamily: DISPLAY, fontSize: 19, color: FAT, whiteSpace: 'nowrap' }}>
                  {t}
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: FAT, opacity: .7 }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── CAPABILITIES ──────────────────────────────── */}
      <section id="capabilities" style={{ padding: '100px 0 40px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="reveal" style={{ maxWidth: 620, marginBottom: 44 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.1, marginBottom: 14 }}>
              From the cutting floor to the counter
            </h2>
            <p style={{ color: MUTE, fontSize: 16, lineHeight: 1.7 }}>
              Four tools keep stock fresh, sales accurate, and every kilogram traceable.
            </p>
          </div>

          <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="cut-card" style={{
                  height: '100%', position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(170deg,${OX3},${OX2})`, border: `1px solid ${LINE}`,
                  borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 16
                }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle,${color}30,transparent 70%)` }} />
                  <div className="cut-icon" style={{ width: 46, height: 46, borderRadius: 12, background: `${color}1f`, border: `1.5px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 19, marginBottom: 8, lineHeight: 1.2 }}>{title}</div>
                    <div style={{ fontSize: 14, color: MUTE, lineHeight: 1.65 }}>{desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLEAVER CHOP DIVIDER ──────────────────────── */}
      <div className="chop reveal" aria-hidden="true">
        <div className="chop-line l" />
        <div className="chop-line r" />
        <div className="chop-flash" />
        <div className="cleaver"><Cleaver /></div>
      </div>

      {/* ── PORTALS (butcher paper) ───────────────────── */}
      <section id="portals" style={{ position: 'relative', background: KRAFT, color: INK, padding: '90px 0 110px' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: KRAFT_GRAIN, opacity: .55, pointerEvents: 'none' }} />
        {/* torn paper edges */}
        <svg viewBox="0 0 1440 30" preserveAspectRatio="none" style={{ position: 'absolute', top: -1, left: 0, width: '100%', height: 26 }} aria-hidden="true">
          <path d="M0 0h1440v8l-40 10-60-8-70 12-80-10-90 12-70-10-90 12-80-8-90 10-70-12-90 12-80-10-90 12-70-8-90 10-60-6-60 8z" fill={OX} />
        </svg>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <Tag text="Choose your portal" color={MEAT} light />
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.1, margin: '18px 0 12px' }}>
              One shop, three counters
            </h2>
            <p style={{ color: '#5B4636', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              Each portal shows only what that role needs — nothing more.
            </p>
          </div>

          <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, paddingTop: 30 }}>
            {portals.map(({ accent, icon: Icon, label, title, stamp, desc, items, cta, path }, i) => (
              <div key={title} className="reveal" style={{ transitionDelay: `${i * 140}ms`, position: 'relative' }}>
                {/* string + hook */}
                <div style={{ position: 'absolute', left: '50%', top: -34, width: 2, height: 40, background: '#6b5a48', transform: 'translateX(-50%)', zIndex: 2 }} />
                <div className="tag-card" style={{
                  background: '#FBF4E6', borderRadius: 16, padding: '34px 28px 28px', position: 'relative',
                  display: 'flex', flexDirection: 'column', gap: 18, height: '100%',
                  border: `1px solid ${KRAFT_D}`, borderTop: `6px solid ${accent}`,
                  boxShadow: '0 14px 28px rgba(60,30,10,.2)'
                }}>
                  {/* punched hole */}
                  <span style={{ position: 'absolute', top: 10, left: '50%', width: 16, height: 16, marginLeft: -8, borderRadius: '50%', background: KRAFT, border: `2px solid ${KRAFT_D}`, boxShadow: 'inset 0 2px 3px rgba(0,0,0,.25)' }} />
                  {/* rubber stamp */}
                  <span className="stamp" style={{
                    position: 'absolute', top: 30, right: 18, padding: '3px 10px', borderRadius: 6,
                    border: `2px solid ${accent}`, color: accent, fontFamily: DISPLAY, fontSize: 13, background: 'transparent'
                  }}>{stamp}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="cut-icon" style={{ width: 44, height: 44, borderRadius: 11, background: `${accent}1c`, border: `1.5px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={21} color={accent} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#6b5a48' }}>{label}</span>
                  </div>

                  <div>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 23, lineHeight: 1.2, marginBottom: 8 }}>{title}</h3>
                    <p style={{ fontSize: 14, color: '#5B4636', lineHeight: 1.65 }}>{desc}</p>
                  </div>

                  <div style={{ borderTop: `2px dashed ${KRAFT_D}` }} />

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
                    {items.map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: INK, fontWeight: 500 }}>
                        <CheckDot color={accent} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button className="btn tag-cta" onClick={() => navigate(path)} style={{
                    marginTop: 'auto', justifyContent: 'center', padding: '13px 20px', fontSize: 14,
                    background: `linear-gradient(135deg,${accent},${accent}d0)`, color: '#fff',
                    boxShadow: `0 8px 18px ${accent}55`
                  }}>
                    {cta} <ArrowRight size={15} className="arr" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS / STATS ─────────────────────────────── */}
      <section id="specs" style={{ padding: '100px 0 70px', position: 'relative', overflow: 'hidden' }}>
        <div className="marble" style={{ opacity: .1 }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(26px,3.6vw,42px)', lineHeight: 1.12, marginBottom: 14 }}>
              Cold-chain control you can check
            </h2>
            <p style={{ color: MUTE, fontSize: 16, maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
              Built on proven inventory control principles — each figure describes how the system works, not a marketing estimate.
            </p>
          </div>

          <div className="stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {stats.map(({ value, sub, color, fill }, i) => (
              <div key={sub} className="reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="cut-card" style={{ background: `linear-gradient(170deg,${OX3},${OX2})`, border: `1px solid ${LINE}`, borderRadius: 14, padding: '28px 24px' }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(32px,3.4vw,44px)', color, lineHeight: 1, marginBottom: 10 }}>{value}</div>
                  <div style={{ fontSize: 14, color: MUTE, marginBottom: 18, fontWeight: 500 }}>{sub}</div>
                  <div className="bar" style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <i style={{ '--w': `${fill}%`, background: `linear-gradient(90deg,${color}99,${color})` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 18 }}>
            {[
              { icon: Package, label: 'Batch tracking', color: MEAT_HI },
              { icon: Activity, label: 'Live inventory', color: '#5AA0D8' },
              { icon: Lock, label: 'Access control', color: SAGE },
              { icon: BarChart3, label: 'Sales reports', color: AMBER },
            ].map(({ icon: Icon, label, color }, i) => (
              <div key={label} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="cut-card" style={{ background: OX2, border: `1px solid ${LINE}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="cut-icon" style={{ width: 34, height: 34, borderRadius: 9, background: `${color}1f`, border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer style={{ borderTop: `2px dashed rgba(246,235,221,.18)`, paddingTop: 60, paddingBottom: 32, marginTop: 20, background: OX2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg,${MEAT_HI},${MEAT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(193,18,31,.5)' }}>
                <Shield size={16} color="#fff" strokeWidth={2.5} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 17, letterSpacing: '.04em', lineHeight: 1 }}>SMIS</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: MUTE, lineHeight: 1, marginTop: 3 }}>Slaughterhouse MIS</div>
              </div>
            </div>
            <p style={{ color: MUTE, fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
              Integrated livestock batch management, cold-chain traceability, and weight-based point-of-sale operations — built for Philippine slaughterhouse enterprises.
            </p>
          </div>

          <div style={{ height: 1, background: LINE, margin: '28px 0' }} />

          <div className="footer-contact" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 40 }}>
            {[
              { icon: MapPin, label: 'Facility location', value: 'Batangas Province, Philippines', color: MEAT_HI },
              { icon: Phone, label: 'Operations line', value: '+63 (0) 912 345 6789', color: AMBER },
              { icon: Mail, label: 'Enterprise support', value: 'support@smis.enterprise.ph', color: SAGE },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}1c`, border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: MUTE, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: LINE, marginBottom: 20 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#9C8678' }}>© 2026 SMIS — Slaughterhouse Meat Inventory & Sales Management System. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Service', 'Compliance & Traceability'].map(t => (
                <button key={t} style={{ background: 'none', border: 'none', color: '#9C8678', fontSize: 12, cursor: 'pointer', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = FAT)}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9C8678')}
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