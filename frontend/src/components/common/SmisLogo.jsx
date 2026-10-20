import React from 'react';
import { Logo } from './Logo';

export { Logo } from './Logo';

/**
 * Backward-compatible SmisLogoMark wrapping the unified Logo.
 */
export const SmisLogoMark = ({
  size = 36,
  className = '',
  style = {},
  ...rest
}) => {
  return <Logo size={size} className={className} style={style} {...rest} />;
};

/**
 * Backward-compatible SmisLogoTile wrapping the unified Logo.
 */
export const SmisLogoTile = ({
  size = 40,
  className = '',
  style = {},
  ...rest
}) => {
  return <Logo size={size} className={className} style={style} {...rest} />;
};

/**
 * Reusable SMIS Logo Component
 * Supports 'stacked' (vertical lockup), 'full' (horizontal lockup), 'tile' and 'icon'.
 */
export const SmisLogo = ({
  variant = 'full',
  size = 40,
  theme = 'dark',
  style = {},
  className = '',
  ...rest
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#E5384A' : '#C1121F';
  const pixelSize = typeof size === 'number' ? size : size === 'sm' ? 36 : size === 'lg' ? 56 : size === 'xl' ? 96 : 40;

  if (variant === 'icon' || variant === 'tile') {
    return (
      <Logo
        size={pixelSize}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  if (variant === 'stacked') {
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
        {...rest}
      >
        <Logo size={pixelSize} />
        <div
          style={{
            fontFamily: "'Alfa Slab One', 'Rockwell', 'Georgia', serif",
            fontSize: `${Math.round(pixelSize * 0.38)}px`,
            color: '#FDF2E3',
            letterSpacing: '0.05em',
            lineHeight: 1,
            marginTop: `${Math.round(pixelSize * 0.2)}px`,
            marginBottom: `${Math.round(pixelSize * 0.08)}px`,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
          }}
        >
          SMIS
        </div>
        <div
          style={{
            fontFamily: "'Work Sans', 'Inter', system-ui, sans-serif",
            fontSize: `${Math.max(9, Math.round(pixelSize * 0.14))}px`,
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
      {...rest}
    >
      <Logo size={pixelSize} />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: `${Math.round(pixelSize * 0.48)}px`,
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
            fontSize: `${Math.max(9, Math.round(pixelSize * 0.22))}px`,
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
