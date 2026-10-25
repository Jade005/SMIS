import React, { useEffect } from 'react';
import { X, Printer, Loader2 } from 'lucide-react';
import Logo from '../common/Logo';

const PreOrderReceiptModal = ({ isOpen, onClose, order, loading = false }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 1100 }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-customer-receipt,
          #printable-customer-receipt * {
            visibility: visible !important;
          }
          #printable-customer-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 480px !important;
            margin: 0 auto !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="modal-content"
        style={{
          maxWidth: '460px',
          width: '95%',
          background: '#ffffff',
          color: '#111827',
          borderRadius: '12px',
          padding: '24px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Modal Screen-Only Controls */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: '800',
              color: '#111827',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontFamily: 'sans-serif'
            }}
          >
            Pre-Order Receipt Preview
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              color: '#4b5563',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          id="printable-customer-receipt"
          style={{
            background: '#ffffff',
            color: '#111827',
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
            fontSize: '12px',
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        >
          {/* Receipt Header */}
          <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1.5px dashed #111827' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <Logo size={32} inline={true} alt="SMIS Logo" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '0.05em' }}>
              SMIS SLAUGHTERHOUSE
            </div>
            <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
              Meat Inventory &amp; Sales Management System
            </div>
            <div style={{ fontSize: '11px', color: '#4b5563' }}>
              Official Pre-Order Customer Receipt
            </div>
          </div>

          {/* Order Meta */}
          <div style={{ padding: '10px 0', borderBottom: '1px dashed #9ca3af', fontSize: '11.5px', lineHeight: 1.6 }}>
            <div>Order Ref: <strong>#{order.order_no}</strong></div>
            <div>Date &amp; Time: {new Date(order.created_at).toLocaleString()}</div>
            <div>
              Customer: <strong>{order.customer_name || 'Customer'}</strong>
            </div>
            {order.customer_phone && (
              <div>Phone: {order.customer_phone}</div>
            )}
            <div>Status: <strong style={{ textTransform: 'uppercase' }}>{order.status}</strong></div>
          </div>

          {/* Items Section */}
          <div style={{ padding: '10px 0', borderBottom: '1px dashed #9ca3af' }}>
            <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', color: '#374151' }}>
              Order Items
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>
                <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto 4px' }} />
                Loading items...
              </div>
            ) : order.items && order.items.length > 0 ? (
              order.items.map((it, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '11.5px' }}>
                  <div style={{ fontWeight: '700' }}>
                    {it.product_name} {it.meat_cut ? `(${it.meat_cut})` : ''}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                    <span>
                      {Number(it.weight_kg).toFixed(2)} kg @ ₱{Number(it.price_per_kg).toFixed(2)}/kg
                    </span>
                    <span style={{ fontWeight: '700' }}>₱{Number(it.subtotal).toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Items included in order total</div>
            )}
          </div>

          {/* Totals Section */}
          <div style={{ padding: '10px 0', borderBottom: '1.5px dashed #111827', fontSize: '12px', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>₱{Number(order.subtotal ?? order.total_amount).toFixed(2)}</span>
            </div>
            {Number(order.discount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857' }}>
                <span>Discount:</span>
                <span>-₱{Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: '900',
                fontSize: '14px',
                marginTop: '4px',
                paddingTop: '4px',
                borderTop: '1px solid #e5e7eb'
              }}
            >
              <span>TOTAL AMOUNT:</span>
              <span>₱{Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Special Instructions Note */}
          {order.notes && (
            <div style={{ padding: '8px 0', borderBottom: '1px dashed #9ca3af', fontSize: '11px', color: '#4b5563' }}>
              <strong>Customer Instructions:</strong> {order.notes}
            </div>
          )}

          {/* Receipt Footer */}
          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '11px', color: '#4b5563', lineHeight: 1.4 }}>
            Thank you for your pre-order!<br />
            Please keep this receipt for order verification and pickup.
          </div>
        </div>

        {/* Screen Action Buttons */}
        <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ flex: 1, borderColor: '#d1d5db', color: '#374151' }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              padding: '10px 16px',
              cursor: 'pointer'
            }}
            onClick={handlePrint}
          >
            <Printer size={15} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreOrderReceiptModal;
