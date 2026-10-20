import React from 'react';

const SIZE_MAP = {
  xs: 24,
  sm: 36, // sidebar, footer
  md: 40, // navbar
  lg: 56, // login, register, set-password
  xl: 96  // loading, splash
};

/**
 * SMIS Unified Logo Component
 * Single source of truth for the SMIS brand logo.
 *
 * @param {Object} props
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|number} [props.size='md'] - 'sm' (36px), 'md' (40px), 'lg' (56px), 'xl' (96px) or numeric px
 * @param {string} [props.className='']
 * @param {Object} [props.style={}]
 * @param {string} [props.alt='SMIS Logo']
 * @param {boolean} [props.inline=false] - Whether to render inline SVG instead of <img>
 */
export const Logo = ({
  size = 'md',
  className = '',
  style = {},
  alt = 'SMIS Logo',
  inline = false,
  ...rest
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 40;

  if (inline) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={pixelSize}
        height={pixelSize}
        className={`smis-unified-logo ${className}`.trim()}
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style
        }}
        aria-label={alt}
        role="img"
        {...rest}
      >
        <defs>
          <linearGradient id="smis-unified-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f43f5e" />
            <stop offset="1" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="smis-unified-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#smis-unified-bg)" />
        <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#smis-unified-shine)" />
        <path
          d="M256 104 L384 150 V252 C384 328 330 382 256 410 C182 382 128 328 128 252 V150 Z"
          fill="#ffffff"
          fillOpacity="0.14"
          stroke="#ffffff"
          strokeWidth="18"
          strokeLinejoin="round"
        />
        <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="256" cy="188" r="20" strokeWidth="12" />
          <path d="M256 208 V312" strokeWidth="14" />
          <path d="M224 244 H288" strokeWidth="12" />
          <path d="M256 312 C256 352 208 352 208 312" strokeWidth="14" />
          <path d="M208 312 L196 326" strokeWidth="12" />
        </g>
      </svg>
    );
  }

  return (
    <img
      src="/assets/logo.svg"
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      className={`smis-unified-logo ${className}`.trim()}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        userSelect: 'none',
        objectFit: 'contain',
        ...style
      }}
      draggable={false}
      {...rest}
    />
  );
};

export default Logo;
