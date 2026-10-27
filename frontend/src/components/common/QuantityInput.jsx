import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Minus, Scale } from 'lucide-react';

/**
 * QuantityInput
 * Shared weight and quantity input component with full support for:
 * - Free text typing without premature snapping or clearing issues
 * - inputMode="decimal" with type="text" (no browser spinners)
 * - Auto-select whole value on focus
 * - Enter to confirm, Escape to cancel and restore
 * - Real-time validation and clamping on blur / Enter
 * - Stock limit checks with inline hints ("Max 49.0 kg")
 * - Configurable decimals (2 for customer catalog/cart, 3 for POS scale precision)
 * - Quick add pills (+0.5, +1, +5) and Scale reading trigger
 */
const QuantityInput = ({
  value = 1,
  onChange,
  onCommit,
  maxStock = 0,
  minAllowed = 0.1,
  decimals = 3,
  unit = 'kg',
  placeholder = '1',
  allowQuickPills = false,
  showSteppers = true,
  hasScale = false,
  scaleReading = null,
  onUseScale = null,
  compact = false,
  disabled = false,
  style = {},
  inputStyle = {},
  ariaLabel = 'Weight in kilograms'
}) => {
  const [typedValue, setTypedValue] = useState(String(value ?? ''));
  const [inputWarning, setInputWarning] = useState(null);
  const lastValidWeightRef = useRef(Number(value) || minAllowed);
  const isFocusedRef = useRef(false);

  // Synchronize prop value when not actively typing/focused
  useEffect(() => {
    if (!isFocusedRef.current) {
      setTypedValue(String(value ?? ''));
      const num = Number(value);
      if (!isNaN(num) && num > 0) {
        lastValidWeightRef.current = num;
      }
      setInputWarning(null);
    }
  }, [value]);

  // Factor for rounding to configured decimals
  const factor = Math.pow(10, decimals);

  const commitAndClamp = useCallback(() => {
    let num = parseFloat(typedValue);

    // Empty, invalid, or non-positive -> restore last valid weight
    if (isNaN(num) || num <= 0) {
      num = lastValidWeightRef.current || minAllowed;
    }

    if (minAllowed !== undefined && num < minAllowed) {
      num = minAllowed;
    }

    if (maxStock > 0 && num > maxStock) {
      num = maxStock;
      setInputWarning(`Max ${Number(maxStock).toFixed(1)} ${unit}`);
    } else {
      setInputWarning(null);
    }

    const rounded = Math.round(num * factor) / factor;
    setTypedValue(String(rounded));
    lastValidWeightRef.current = rounded;

    if (onChange) {
      onChange(rounded, true, false);
    }
    if (onCommit) {
      onCommit(rounded);
    }
  }, [typedValue, maxStock, minAllowed, factor, unit, onChange, onCommit]);

  const handleInputChange = (e) => {
    const raw = e.target.value;

    // Allow user to completely clear the field to type freely
    if (raw === '') {
      setTypedValue('');
      setInputWarning(null);
      if (onChange) {
        onChange(null, false, false);
      }
      return;
    }

    // Only allow digits and at most one decimal point up to the specified decimal precision
    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`);
    if (!regex.test(raw)) {
      return;
    }

    setTypedValue(raw);

    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed <= 0) {
      setInputWarning(null);
      if (onChange) {
        onChange(null, false, false);
      }
    } else if (maxStock > 0 && parsed > maxStock) {
      setInputWarning(`Max ${Number(maxStock).toFixed(1)} ${unit}`);
      if (onChange) {
        // Exceeds stock: invalid for checkout, but pass parsed for warning visibility
        onChange(parsed, false, true);
      }
    } else {
      setInputWarning(null);
      lastValidWeightRef.current = parsed;
      if (onChange) {
        onChange(parsed, true, false);
      }
    }
  };

  const handleFocus = (e) => {
    isFocusedRef.current = true;
    e.target.select();
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    commitAndClamp();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitAndClamp();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const restored = lastValidWeightRef.current || minAllowed;
      setTypedValue(String(restored));
      setInputWarning(null);
      if (onChange) {
        onChange(restored, true, false);
      }
      if (onCommit) {
        onCommit(restored);
      }
      e.currentTarget.blur();
    }
  };

  const handleStep = (direction) => {
    let current = parseFloat(typedValue);
    if (isNaN(current) || current <= 0) {
      current = lastValidWeightRef.current || minAllowed;
    }

    const step = decimals === 3 ? (current <= 1 ? 0.1 : 0.5) : (current <= 1 ? 0.5 : 1);
    let next;
    if (direction < 0) {
      next = Math.max(minAllowed, Math.round((current - step) * factor) / factor);
    } else {
      next = Math.round((current + step) * factor) / factor;
      if (maxStock > 0 && next > maxStock) next = maxStock;
    }

    setTypedValue(String(next));
    setInputWarning(null);
    lastValidWeightRef.current = next;
    if (onChange) {
      onChange(next, true, false);
    }
    if (onCommit) {
      onCommit(next);
    }
  };

  const handleQuickAdd = (addAmount) => {
    let current = parseFloat(typedValue);
    if (isNaN(current) || current <= 0) {
      current = lastValidWeightRef.current || minAllowed;
    }
    let next = Math.round((current + addAmount) * factor) / factor;
    if (maxStock > 0 && next > maxStock) next = maxStock;

    setTypedValue(String(next));
    setInputWarning(null);
    lastValidWeightRef.current = next;
    if (onChange) {
      onChange(next, true, false);
    }
    if (onCommit) {
      onCommit(next);
    }
  };

  const handleApplyScale = () => {
    let targetReading = null;
    if (onUseScale) {
      targetReading = onUseScale();
    } else if (scaleReading !== null && scaleReading !== undefined) {
      targetReading = scaleReading;
    } else {
      // Realistic default scale simulation
      targetReading = 2.000;
    }

    if (targetReading !== null && targetReading !== undefined) {
      let finalVal = Number(targetReading);
      if (maxStock > 0 && finalVal > maxStock) finalVal = maxStock;
      const rounded = Math.round(finalVal * factor) / factor;
      setTypedValue(String(rounded));
      setInputWarning(null);
      lastValidWeightRef.current = rounded;
      if (onChange) {
        onChange(rounded, true, false);
      }
      if (onCommit) {
        onCommit(rounded);
      }
    }
  };

  const currentNumeric = parseFloat(typedValue) || lastValidWeightRef.current || value;
  const isAtMin = currentNumeric <= minAllowed;
  const isAtMax = maxStock > 0 && currentNumeric >= maxStock;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', ...style }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          background: '#1a0a0c',
          padding: compact ? '2px 4px' : '3px 6px',
          borderRadius: '7px',
          border: inputWarning
            ? '1px solid #ef4444'
            : isFocusedRef.current
            ? '1px solid #E5384A'
            : '1px solid rgba(246, 235, 221, 0.2)',
          boxShadow: isFocusedRef.current ? '0 0 0 2px rgba(229, 56, 74, 0.25)' : 'none',
          transition: 'border 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        {showSteppers && (
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={disabled || isAtMin}
            style={{
              width: compact ? '20px' : '22px',
              height: compact ? '20px' : '22px',
              borderRadius: '4px',
              border: '1px solid rgba(246, 235, 221, 0.15)',
              background: isAtMin ? 'transparent' : 'rgba(246, 235, 221, 0.08)',
              cursor: disabled || isAtMin ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isAtMin ? 'rgba(246, 235, 221, 0.25)' : '#F6EBDD',
              padding: 0
            }}
            title={isAtMin ? `Minimum ${minAllowed} ${unit}` : 'Decrease weight'}
            aria-label="Decrease weight"
          >
            <Minus size={11} />
          </button>
        )}

        <input
          type="text"
          inputMode="decimal"
          value={typedValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          style={{
            width: compact ? '48px' : '56px',
            padding: '2px 0',
            textAlign: 'center',
            fontWeight: '800',
            fontSize: compact ? '12px' : '13px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            color: inputWarning ? '#fbbf24' : '#FFFFFF',
            outline: 'none',
            ...inputStyle
          }}
        />

        <span
          style={{
            fontSize: '11px',
            color: '#C9B4A6',
            fontWeight: '700',
            userSelect: 'none',
            marginRight: '2px'
          }}
        >
          {unit}
        </span>

        {showSteppers && (
          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={disabled || isAtMax}
            style={{
              width: compact ? '20px' : '22px',
              height: compact ? '20px' : '22px',
              borderRadius: '4px',
              border: '1px solid rgba(246, 235, 221, 0.15)',
              background: isAtMax ? 'transparent' : 'rgba(246, 235, 221, 0.08)',
              cursor: disabled || isAtMax ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isAtMax ? 'rgba(246, 235, 221, 0.25)' : '#F6EBDD',
              padding: 0
            }}
            title={isAtMax ? `Max stock (${maxStock} ${unit}) reached` : 'Increase weight'}
            aria-label="Increase weight"
          >
            <Plus size={11} />
          </button>
        )}

        {(hasScale || onUseScale || scaleReading !== null) && (
          <button
            type="button"
            onClick={handleApplyScale}
            disabled={disabled}
            style={{
              height: compact ? '20px' : '22px',
              padding: '0 5px',
              borderRadius: '4px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              background: 'rgba(245, 158, 11, 0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: '#f59e0b',
              fontSize: '10px',
              fontWeight: '700'
            }}
            title="Read from scale"
            aria-label="Use scale reading"
          >
            <Scale size={11} />
            <span>Scale</span>
          </button>
        )}
      </div>

      {/* Inline Warning for exceeding stock */}
      {inputWarning && (
        <span
          style={{
            fontSize: '10px',
            color: '#fbbf24',
            fontWeight: '700',
            marginTop: '2px',
            textAlign: 'right'
          }}
        >
          {inputWarning}
        </span>
      )}

      {/* Optional Quick Add Pills */}
      {allowQuickPills && (
        <div style={{ display: 'flex', gap: '3px', marginTop: '4px', justifyContent: 'flex-end' }}>
          {[0.5, 1, 5].map((amt) => {
            const wouldExceed = maxStock > 0 && currentNumeric + amt > maxStock;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                disabled={disabled || wouldExceed}
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  border: '1px solid rgba(246, 235, 221, 0.15)',
                  background: wouldExceed ? 'transparent' : 'rgba(246, 235, 221, 0.05)',
                  color: wouldExceed ? 'rgba(246, 235, 221, 0.25)' : '#C9B4A6',
                  cursor: wouldExceed ? 'not-allowed' : 'pointer'
                }}
              >
                +{amt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuantityInput;
