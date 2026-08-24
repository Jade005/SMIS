import React from 'react';

/**
 * SMIS Brand Logo Mark & Lockup
 * Fuses precision weighing scale / data calibration lines with abstract cut-of-meat / shield geometry.
 *
 * @param {Object} props
 * @param {'full' | 'icon' | 'tile' | 'stacked'} [props.variant='full'] - Lockup variant
 * @param {'dark' | 'light'} [props.theme='dark'] - Color scheme
 * @param {number} [props.size=40] - Icon height/width in px
 * @param {string} [props.className=''] - Custom CSS class
 * @param {Object} [props.style={}] - Custom styles
 */
export const SmisLogoMark = ({ size = 36, color = '#E2493D', accentColor = '#FFFFFF' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="SMIS Logo Mark"
    >
      <defs>
        <linearGradient id="smisRedGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF5C4D" />
          <stop offset="100%" stopColor="#C52A1E" />
        </linearGradient>
        <linearGradient id="smisAccentGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Outer Geometric Cut Shield / Precision Calibrated Contour */}
      <path
        d="M24 4L40 10V22C40 31.8 33.2 40.8 24 44C14.8 40.8 8 31.8 8 22V10L24 4Z"
        fill="url(#smisRedGrad)"
      />

      {/* Internal Cut-Chamber facet creating the organic cut-of-meat & weighing pan curve */}
      <path
        d="M24 9L35 13.5V21.5C35 28.5 30.5 35 24 37.8C17.5 35 13 28.5 13 21.5V13.5L24 9Z"
        fill="#0B1220"
        fillOpacity="0.22"
      />

      {/* Precision Weighing Scale Beam & Calibration Diamond */}
      {/* Central Pillar */}
      <rect x="22.5" y="14" width="3" height="19" rx="1.5" fill={accentColor} />

      {/* Top Balance Bar */}
      <path
        d="M15 17.5C15 16.6716 15.6716 16 16.5 16H31.5C32.3284 16 33 16.6716 33 17.5C33 18.3284 32.3284 19 31.5 19H16.5C15.6716 19 15 18.3284 15 17.5Z"
        fill={accentColor}
      />

      {/* Left Weighing Scale Pan & Precision Line */}
      <path
        d="M14 20L17 26H13L14 20Z"
        fill="url(#smisAccentGrad)"
      />
      <circle cx="15" cy="28.5" r="1.5" fill={accentColor} />

      {/* Right Weighing Scale Pan & Precision Line */}
      <path
        d="M34 20L35 26H31L34 20Z"
        fill="url(#smisAccentGrad)"
      />
      <circle cx="33" cy="28.5" r="1.5" fill={accentColor} />

      {/* Digital Calibration Indicator Notch at center apex */}
      <polygon points="24,10 26.5,13.5 21.5,13.5" fill={accentColor} />
    </svg>
  );
};

export const SmisLogoTile = ({ size = 42, iconSize = 24 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #E2493D 0%, #B91C1C 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(226, 73, 61, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        flexShrink: 0
      }}
    >
      <SmisLogoMark size={iconSize} accentColor="#FFFFFF" />
    </div>
  );
};

export const SmisLogo = ({
  variant = 'full',
  size = 40,
  theme = 'dark',
  style = {},
  className = ''
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';

  if (variant === 'icon') {
    return <SmisLogoMark size={size} />;
  }

  if (variant === 'tile') {
    return <SmisLogoTile size={size} iconSize={Math.round(size * 0.65)} />;
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
        ...style
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '11px',
          background: 'linear-gradient(135deg, rgba(226, 73, 61, 0.15) 0%, rgba(226, 73, 61, 0.05) 100%)',
          border: '1px solid rgba(226, 73, 61, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(226, 73, 61, 0.18)',
          flexShrink: 0
        }}
      >
        <SmisLogoMark size={Math.round(size * 0.72)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: `${Math.round(size * 0.48)}px`,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: textColor,
            lineHeight: 1,
            fontFamily: "'Inter', 'Sora', 'Manrope', system-ui, sans-serif"
          }}
        >
          SMIS
        </div>
        <div
          style={{
            fontSize: `${Math.max(9, Math.round(size * 0.22))}px`,
            color: subtextColor,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: '3px',
            fontFamily: "'Inter', 'Manrope', system-ui, sans-serif"
          }}
        >
          SLAUGHTERHOUSE MIS
        </div>
      </div>
    </div>
  );
};

export default SmisLogo;
