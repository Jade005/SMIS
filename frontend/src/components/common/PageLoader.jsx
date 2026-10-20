import React from 'react';
import { SmisLogoMark } from './SmisLogo';
import './loading.css';

/**
 * Compact Inline Page Loader for Content Areas
 * Keeps the sidebar, header, and modals visible while loading tables or charts.
 *
 * @param {Object} props
 * @param {string} [props.message='Loading data...'] - Label to display
 * @param {number} [props.size=42] - Dimension of the logo tile
 * @param {string|number} [props.minHeight='220px'] - Minimum height of container
 * @param {string} [props.className=''] - Custom CSS class
 * @param {Object} [props.style={}] - Custom inline styles
 */
export const PageLoader = ({
  message = 'Loading data...',
  size = 42,
  minHeight = '220px',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`smis-page-loader ${className}`}
      style={{ minHeight, ...style }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div
        className="smis-page-loader-tile"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.28)}px`
        }}
      >
        <SmisLogoMark
          size={Math.round(size * 0.62)}
          accentColor="#FFFFFF"
          swingHook={true}
          whiteShield={true}
        />
      </div>

      <div className="smis-page-loader-spinner" />

      <div className="smis-page-loader-text">{message}</div>
    </div>
  );
};

export default PageLoader;
