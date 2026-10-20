import React from 'react';

/**
 * SMIS Brand Logo Mark (SVG)
 * Features the signature shield geometry with the butcher meat hook and precision weighing scale lines.
 *
 * @param {Object} props
 * @param {number} [props.size=36] - Icon dimension in pixels
 * @param {string} [props.color='#E2493D'] - Shield base color if not using whiteShield
 * @param {string} [props.accentColor='#FFFFFF'] - Color of hook & scale markings
 * @param {boolean} [props.swingHook=false] - Whether the hook gently swings like a pendulum
 * @param {boolean} [props.whiteShield=false] - Whether to render a white shield outline & facet for dark tiles
 */
export const SmisLogoMark = ({
  size = 36,
  color = '#E2493D',
  accentColor = '#FFFFFF',
  swingHook = false,
  whiteShield = false
}) => {
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

      {whiteShield ? (
        <>
          {/* White Shield Contour */}
          <path
            d="M24 5L39 10.5V22C39 31.8 32.5 40 24 43.5C15.5 40 9 31.8 9 22V10.5L24 5Z"
            fill="rgba(255, 255, 255, 0.16)"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Internal facet curve */}
          <path
            d="M24 9.5L34 13.5V21.5C34 27.5 29.5 34 24 36.8C18.5 34 14 27.5 14 21.5V13.5L24 9.5Z"
            fill="rgba(0, 0, 0, 0.22)"
          />
        </>
      ) : (
        <>
          {/* Outer Geometric Cut Shield */}
          <path
            d="M24 4L40 10V22C40 31.8 33.2 40.8 24 44C14.8 40.8 8 31.8 8 22V10L24 4Z"
            fill="url(#smisRedGrad)"
          />
          {/* Internal Cut-Chamber facet */}
          <path
            d="M24 9L35 13.5V21.5C35 28.5 30.5 35 24 37.8C17.5 35 13 28.5 13 21.5V13.5L24 9Z"
            fill="#0B1220"
            fillOpacity="0.22"
          />
        </>
      )}

      {/* Meat Hook & Weighing Balance Geometry */}
      <g
        className={swingHook ? 'smis-pendulum-hook' : ''}
        style={{ transformOrigin: '24px 14px' }}
      >
        {/* Top Suspension Eyelet / Calibration Pivot */}
        <circle cx="24" cy="14" r="2.2" stroke={accentColor} strokeWidth="1.8" fill="none" />

        {/* Meat Hook Shank & Curved Hook Point */}
        <path
          d="M24 16.2V26.5C24 26.5 24 33.5 19 33.5C15.5 33.5 14 31 14 28.5C14 25.5 16.5 24.5 18 26"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Balance Scale Bar */}
        <path
          d="M15 17.5C15 16.67 15.67 16 16.5 16H31.5C32.33 16 33 16.67 33 17.5C33 18.33 32.33 19 31.5 19H16.5C15.67 19 15 18.33 15 17.5Z"
          fill={accentColor}
        />

        {/* Left Scale Pan */}
        <path d="M14 20L17 26H13L14 20Z" fill="url(#smisAccentGrad)" />
        <circle cx="15" cy="28.5" r="1.4" fill={accentColor} />

        {/* Right Scale Pan */}
        <path d="M34 20L35 26H31L34 20Z" fill="url(#smisAccentGrad)" />
        <circle cx="33" cy="28.5" r="1.4" fill={accentColor} />

        {/* Center Apex Indicator */}
        <polygon points="24,10 26.5,13.5 21.5,13.5" fill={accentColor} />
      </g>
    </svg>
  );
};

export const SmisLogoTile = ({
  size = 42,
  iconSize = 24,
  swingHook = false,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.25)}px`,
        background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(190, 18, 60, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
        flexShrink: 0,
        ...style
      }}
    >
      <SmisLogoMark
        size={iconSize}
        accentColor="#FFFFFF"
        swingHook={swingHook}
        whiteShield={true}
      />
    </div>
  );
};

/**
 * Reusable SMIS Logo Component
 * Supports 'stacked' (vertical lockup), 'full' (horizontal lockup), 'tile' and 'icon'.
 */
export const SmisLogo = ({
  variant = 'full',
  size = 40,
  theme = 'dark',
  swingHook = false,
  style = {},
  className = ''
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#E5384A' : '#C1121F';

  if (variant === 'icon') {
    return <SmisLogoMark size={size} swingHook={swingHook} whiteShield={false} />;
  }

  if (variant === 'tile') {
    return (
      <SmisLogoTile
        size={size}
        iconSize={Math.round(size * 0.62)}
        swingHook={swingHook}
        className={className}
        style={style}
      />
    );
  }

  if (variant === 'stacked') {
    const tileDim = size;
    const markDim = Math.round(tileDim * 0.6);
    return (
      <div
        className={`smis-logo-stacked ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          userSelect: 'none',
          ...style
        }}
      >
        <SmisLogoTile
          size={tileDim}
          iconSize={markDim}
          swingHook={swingHook}
        />
        <div
          style={{
            fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
            fontSize: `${Math.round(tileDim * 0.38)}px`,
            color: '#FDF2E3',
            letterSpacing: '0.05em',
            lineHeight: 1,
            marginTop: `${Math.round(tileDim * 0.2)}px`,
            marginBottom: `${Math.round(tileDim * 0.08)}px`,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
          }}
        >
          SMIS
        </div>
        <div
          style={{
            fontFamily: "'Work Sans', 'Inter', system-ui, sans-serif",
            fontSize: `${Math.max(9, Math.round(tileDim * 0.14))}px`,
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#F43F5E',
            lineHeight: 1
          }}
        >
          SLAUGHTERHOUSE MIS
        </div>
      </div>
    );
  }

  // Horizontal 'full' lockup
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
      <SmisLogoTile
        size={size}
        iconSize={Math.round(size * 0.62)}
        swingHook={swingHook}
      />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: `${Math.round(size * 0.48)}px`,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: textColor,
            lineHeight: 1,
            fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif"
          }}
        >
          SMIS
        </div>
        <div
          style={{
            fontSize: `${Math.max(9, Math.round(size * 0.22))}px`,
            color: subtextColor,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginTop: '3px',
            fontFamily: "'Work Sans', 'Inter', system-ui, sans-serif"
          }}
        >
          SLAUGHTERHOUSE MIS
        </div>
      </div>
    </div>
  );
};

export default SmisLogo;
