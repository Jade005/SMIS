import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import {
  ArrowLeft, X, CheckCircle, Printer, AlertCircle, RotateCcw
} from 'lucide-react';
import { getDisplayName } from '../../utils/nameHelper';

/**
 * PaymentPanel (Cash-Only Payment Drawer)
 * Dedicated slide-over drawer handling cash payment, amount tendered input,
 * quick denominations, real-time change calculation, and keyboard navigation.
 */
const PaymentPanel = ({
  isOpen = false,
  onClose,
  onProcessSale,
  processing = false,
  lastCompletedSale = null,
  onPrintReceipt,
  onResetTerminal
}) => {
  const {
    cart,
    discount,
    total,
    activeOrder,
    amountTendered,
    setAmountTendered
  } = useCart();

  const [successView, setSuccessView] = useState(false);
  const inputRef = useRef(null);

  const roundedTotal = Number(total.toFixed(2));
  const roundedTendered = Number((Number(amountTendered) || 0).toFixed(2));

  // Validation: must be a valid number, tendered >= total, and > 0 if total > 0
  const isTenderedValid =
    !isNaN(roundedTendered) &&
    roundedTendered >= roundedTotal &&
    (roundedTotal === 0 || roundedTendered > 0);

  const changeDue = isTenderedValid
    ? Number((roundedTendered - roundedTotal).toFixed(2))
    : 0;

  const isShortage = roundedTendered < roundedTotal && roundedTendered > 0;
  const shortageAmount = isShortage
    ? Number((roundedTotal - roundedTendered).toFixed(2))
    : 0;

  // When drawer opens, initialize tender with exact total and auto-focus
  useEffect(() => {
    if (isOpen) {
      setSuccessView(false);
      if (!amountTendered || amountTendered < roundedTotal) {
        setAmountTendered(roundedTotal);
      }
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
    }
  }, [isOpen, roundedTotal]);

  // When sale completes successfully, show confirmation screen
  useEffect(() => {
    if (lastCompletedSale) {
      setSuccessView(true);
    }
  }, [lastCompletedSale]);

  // Keyboard navigation: Enter to confirm, Esc to close/cancel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (successView) {
          handleFinishAndReset();
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && !processing) {
        if (successView) {
          handleFinishAndReset();
        } else if (isTenderedValid) {
          handleConfirm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, successView, processing, isTenderedValid, roundedTendered]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isTenderedValid || processing) return;
    onProcessSale({
      paymentMethod: 'cash',
      amountTendered: roundedTendered
    });
  };

  const handleFinishAndReset = () => {
    setSuccessView(false);
    onResetTerminal();
    onClose();
  };

  // Quick cash denominations (sets the amount tendered)
  const quickCashOptions = [
    { label: 'Exact', value: roundedTotal },
    { label: '₱100', value: 100 },
    { label: '₱500', value: 500 },
    { label: '₱1,000', value: 1000 },
    { label: '₱2,000', value: 2000 }
  ];

  return (
    <div className="payment-drawer-overlay" onClick={onClose}>
      <div
        className="payment-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-drawer-title"
      >
        {/* ── DRAWER HEADER ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: '16px 20px',
          borderBottom: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={successView ? handleFinishAndReset : onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#0f172a',
              background: '#f1f5f9',
              borderColor: '#94a3b8',
              lineHeight: '1.2',
              minHeight: '34px',
              boxSizing: 'border-box'
            }}
          >
            <ArrowLeft size={14} color="#0f172a" /> Back to Billing
          </button>
          <span id="payment-drawer-title" style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
            {successView ? 'Transaction Complete' : 'Payment & Checkout'}
          </span>
          <button
            type="button"
            onClick={successView ? handleFinishAndReset : onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center'
            }}
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── SUCCESS CONFIRMATION VIEW ── */}
        {successView && lastCompletedSale ? (
          <div style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80',
              border: '2px solid rgba(74, 222, 128, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
            }}>
              <CheckCircle size={38} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FFF1F2', marginBottom: '8px' }}>
              Payment Successful!
            </h3>
            <p style={{ fontSize: '13px', color: '#E5D5C3', marginBottom: '24px' }}>
              Receipt <strong style={{ color: '#FFFFFF', fontWeight: '800' }}>{lastCompletedSale.receipt_no}</strong> processed successfully.
            </p>

            {/* Recap Card */}
            <div style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2f7', fontSize: '13px' }}>
                <span style={{ color: '#334155', fontWeight: '600' }}>Customer:</span>
                <strong style={{ color: '#0f172a' }}>{getDisplayName(lastCompletedSale) || lastCompletedSale.customer_name || 'Walk-in Customer'}</strong>
              </div>
              {lastCompletedSale.fulfilled_order_no && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2f7', fontSize: '13px' }}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Order Ref:</span>
                  <strong style={{ color: '#92400e' }}>#{lastCompletedSale.fulfilled_order_no}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2f7', fontSize: '13px' }}>
                <span style={{ color: '#334155', fontWeight: '600' }}>Payment:</span>
                <strong style={{ color: '#0f172a' }}>Cash</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2f7', fontSize: '13px' }}>
                <span style={{ color: '#334155', fontWeight: '600' }}>Amount Tendered:</span>
                <strong style={{ color: '#0f172a' }}>₱{Number(lastCompletedSale.amount_tendered || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2f7', fontSize: '14px' }}>
                <span style={{ color: '#334155', fontWeight: '700' }}>Total Paid:</span>
                <strong style={{ color: 'var(--primary-cashier)', fontSize: '16px', fontWeight: '800' }}>₱{Number(lastCompletedSale.total_amount).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span style={{ color: '#334155', fontWeight: '600' }}>Change:</span>
                <strong style={{ color: '#15803d', fontWeight: '800' }}>₱{Number(lastCompletedSale.change_amount || 0).toFixed(2)}</strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                onClick={() => onPrintReceipt(lastCompletedSale)}
              >
                <Printer size={18} /> Print Official Receipt
              </button>
              <button
                type="button"
                className="btn btn-cashier btn-lg"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                onClick={handleFinishAndReset}
              >
                <RotateCcw size={18} /> Done & Next Sale (Enter)
              </button>
            </div>
          </div>
        ) : (
          /* ── CASH PAYMENT FORM VIEW ── */
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 1. Read-Only Order Summary Recap */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                Order Summary Recap
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>Customer:</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {activeOrder ? activeOrder.customerName : 'Walk-in Customer'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>Order Type / #:</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: activeOrder ? '#92400e' : '#475569' }}>
                  {activeOrder ? `#${activeOrder.orderNo}` : 'Direct Sale'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>Items in Cart:</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''} ({cart.reduce((s, i) => s + (Number(i.weight_kg) || 0), 0).toFixed(2)} kg)
                </span>
              </div>
              {Number(discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--danger)' }}>Discount Applied:</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--danger)' }}>
                    -₱{Number(discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '2px solid #e2e8f0', paddingTop: '10px', marginTop: '4px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>TOTAL DUE:</span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary-cashier)' }}>
                  ₱{roundedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 2. Amount Tendered & Cash Calculation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#F6EBDD' }}>
                  Amount Tendered (₱):
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="form-control"
                  style={{
                    width: '100%',
                    fontSize: '22px',
                    fontWeight: '800',
                    textAlign: 'right',
                    padding: '12px 16px',
                    color: isShortage ? '#f87171' : '#ffffff'
                  }}
                  value={amountTendered === 0 ? '' : amountTendered}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setAmountTendered(val);
                  }}
                />
              </div>

              {/* Quick Cash Denominations */}
              <div>
                <div style={{ fontSize: '11px', color: '#E5D5C3', fontWeight: '700', marginBottom: '6px' }}>
                  Quick Cash Denominations:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {quickCashOptions.map((opt) => {
                    const isSelected = roundedTendered === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{
                          flex: 1, minWidth: '60px', padding: '8px 4px',
                          fontSize: '12px', fontWeight: '800',
                          borderColor: isSelected ? 'var(--primary-cashier)' : '#94a3b8',
                          background: isSelected ? 'var(--primary-cashier)' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#0f172a',
                          boxShadow: isSelected ? '0 2px 8px rgba(217, 119, 6, 0.4)' : '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        onClick={() => setAmountTendered(opt.value)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Insufficient amount hint */}
              {isShortage && (
                <div style={{
                  padding: '10px 12px', borderRadius: '8px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  fontSize: '12px', color: '#991b1b',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>Insufficient amount (Short by <strong>₱{shortageAmount.toFixed(2)}</strong>)</span>
                </div>
              )}

              {/* Change Due Display */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '16px', fontWeight: '800',
                padding: '14px 16px', background: '#f8fafc',
                borderRadius: '10px', border: '1px solid #cbd5e1'
              }}>
                <span style={{ color: '#0f172a' }}>Change Due:</span>
                <span style={{ color: isTenderedValid ? '#15803d' : '#64748b', fontSize: '20px', fontWeight: '800' }}>
                  ₱{changeDue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* 3. Confirm Payment Button */}
            <button
              type="button"
              className="btn btn-cashier btn-lg"
              style={{
                width: '100%', justifyContent: 'center',
                padding: '14px', fontSize: '15px', fontWeight: '800', gap: '8px'
              }}
              onClick={handleConfirm}
              disabled={!isTenderedValid || processing}
            >
              <CheckCircle size={20} />
              {processing
                ? 'Processing Sale...'
                : activeOrder
                  ? `Confirm Payment & Fulfill Order — ₱${roundedTotal.toFixed(2)}`
                  : `Confirm Payment & Complete Sale — ₱${roundedTotal.toFixed(2)}`}
            </button>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#E5D5C3' }}>
              Press <strong style={{ color: '#FFFFFF' }}>Enter</strong> to confirm payment, <strong style={{ color: '#FFFFFF' }}>Esc</strong> to cancel
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPanel;
