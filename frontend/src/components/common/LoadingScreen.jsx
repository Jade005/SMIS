import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { SmisLogoMark } from './SmisLogo';
import './loading.css';

const DEFAULT_MESSAGES = [
  'Preparing your workspace...',
  'Checking cold-chain stock...',
  'Syncing fresh batches...',
  'Verifying inventory rotation...',
  'Connecting to meat terminal...'
];

/**
 * Branded Full-Screen Loading Screen for SMIS
 *
 * @param {Object} props
 * @param {boolean} [props.show=true] - Whether the loading screen should be active
 * @param {string|null} [props.error=null] - Server connection error message if any
 * @param {Function} [props.onRetry] - Retry callback function
 * @param {number} [props.minDuration=600] - Minimum display duration in ms to avoid flicker
 * @param {number} [props.timeoutDuration=15000] - Timeout threshold in ms
 * @param {string} [props.customMessage] - Override message if specified
 */
export const LoadingScreen = ({
  show = true,
  error = null,
  onRetry,
  minDuration = 600,
  timeoutDuration = 15000,
  customMessage
}) => {
  // Mounting & fade-out lifecycle states
  const [mounted, setMounted] = useState(show || Boolean(error));
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Status message rotation
  const [msgIndex, setMsgIndex] = useState(0);
  const [textAnim, setTextAnim] = useState('text-fade-in');

  const mountTimestampRef = useRef(Date.now());
  const messages = useMemo(() => DEFAULT_MESSAGES, []);

  // Floating red embers (generated once per mount)
  const embers = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 5,
      dur: 7 + Math.random() * 7,
      delay: -(Math.random() * 10),
      drift: (Math.random() - 0.5) * 80
    }));
  }, []);

  // Handle aria-busy on the app root
  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (mounted && !isFadingOut) {
      rootEl?.setAttribute('aria-busy', 'true');
    } else {
      rootEl?.removeAttribute('aria-busy');
    }
    return () => {
      rootEl?.removeAttribute('aria-busy');
    };
  }, [mounted, isFadingOut]);

  // Track mount time when show changes to true
  useEffect(() => {
    if (show || error) {
      setMounted(true);
      setIsFadingOut(false);
      mountTimestampRef.current = Date.now();
    }
  }, [show, error]);

  // Handle minimum display time and fade-out when loading completes
  useEffect(() => {
    if (!show && !error && mounted && !isFadingOut) {
      const elapsed = Date.now() - mountTimestampRef.current;
      const remainingTime = Math.max(0, minDuration - elapsed);

      const delayTimer = setTimeout(() => {
        setIsFadingOut(true);
        const unmountTimer = setTimeout(() => {
          setMounted(false);
          setIsFadingOut(false);
        }, 300); // 300ms fade-out transition
        return () => clearTimeout(unmountTimer);
      }, remainingTime);

      return () => clearTimeout(delayTimer);
    }
  }, [show, error, mounted, isFadingOut, minDuration]);

  // Rotating messages every 1.5 seconds
  useEffect(() => {
    if (!mounted || isFadingOut || error || isTimedOut) return;

    const interval = setInterval(() => {
      setTextAnim('text-fade-out');
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
        setTextAnim('text-fade-in');
      }, 240);
    }, 1500);

    return () => clearInterval(interval);
  }, [mounted, isFadingOut, error, isTimedOut, messages.length]);

  // 15-second timeout detector
  useEffect(() => {
    if (!mounted || isFadingOut || error) return;

    const timeoutTimer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeoutDuration);

    return () => clearTimeout(timeoutTimer);
  }, [mounted, isFadingOut, error, timeoutDuration]);

  if (!mounted) return null;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const isErrorState = Boolean(error);

  return (
    <aside
      className={`smis-loading-overlay ${isFadingOut ? 'smis-loading-fade-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading SMIS"
      aria-busy={!isFadingOut}
    >
      {/* Background Embers */}
      <div className="smis-ember-container" aria-hidden="true">
        {embers.map((e) => (
          <span
            key={e.id}
            className="smis-ember-dot"
            style={{
              left: `${e.left}%`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              '--ember-drift': `${e.drift}px`
            }}
          />
        ))}
      </div>

      {/* Center Branded Lockup */}
      <div className="smis-loading-content">
        {/* Red Rounded Logo Tile with Shield & Meat Hook */}
        <div
          className="smis-loading-logo-tile"
          style={isErrorState ? { background: 'linear-gradient(135deg, #e11d48 0%, #881337 100%)' } : {}}
        >
          {isErrorState ? (
            <AlertTriangle size={36} color="#FFFFFF" strokeWidth={2.4} />
          ) : (
            <SmisLogoMark
              size={46}
              accentColor="#FFFFFF"
              swingHook={true}
              whiteShield={true}
            />
          )}
        </div>

        {/* Wordmark */}
        <div className="smis-loading-wordmark">SMIS</div>

        {/* Tagline */}
        <div className="smis-loading-tagline">SLAUGHTERHOUSE MIS</div>

        {/* State Display: Error, Timeout, or Normal Loading */}
        {isErrorState ? (
          <>
            <div className="smis-loading-error-title">Can't connect to the server</div>
            <div className="smis-loading-error-sub">
              {error === true || typeof error !== 'string'
                ? 'The SMIS backend service is unreachable. Please verify that the server is running.'
                : error}
            </div>
            <button
              type="button"
              className="smis-loading-retry-btn"
              onClick={handleRetry}
            >
              <RefreshCw size={15} /> Retry Connection
            </button>
          </>
        ) : isTimedOut ? (
          <>
            <div className="smis-loading-bar-track">
              <div
                className="smis-loading-bar-fill"
                style={{
                  width: '100%',
                  left: 0,
                  animation: 'none',
                  background: '#f43f5e'
                }}
              />
            </div>
            <div className="smis-loading-status-text" style={{ color: '#fca5a5' }}>
              This is taking longer than usual...
            </div>
            <button
              type="button"
              className="smis-loading-retry-btn"
              onClick={handleRetry}
            >
              <RefreshCw size={15} /> Retry
            </button>
          </>
        ) : (
          <>
            {/* Smooth Red-to-Gold Loading Bar */}
            <div className="smis-loading-bar-track">
              <div className="smis-loading-bar-fill" />
            </div>

            {/* Rotating Status Text */}
            <div className={`smis-loading-status-text ${textAnim}`}>
              {customMessage || messages[msgIndex]}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default LoadingScreen;
