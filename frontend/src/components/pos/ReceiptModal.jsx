import React from 'react';
import { Printer, X } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '360px', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontFamily: 'sans-serif', fontSize: '16px' }}>Sales Receipt</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div id="printable-receipt" style={{ textAlign: 'center', background: '#fff', padding: '16px', border: '1px solid #dde1ea', borderRadius: '6px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>SMIS SLAUGHTERHOUSE</div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Meat Inventory & Sales System</div>
          <div style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 10px' }}>
            {new Date(sale.created_at || Date.now()).toLocaleString()}
          </div>

          <div style={{ fontSize: '11px', textAlign: 'left', borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '8px' }}>
            <div>Receipt No: <strong>{sale.receipt_no}</strong></div>
            <div>Cashier: {sale.cashier_name || 'Cashier'}</div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px', textAlign: 'left' }}>
            {sale.items && sale.items.map((item, idx) => (
              <div key={idx} style={{ fontSize: '11px', marginBottom: '4px' }}>
                <div style={{ fontWeight: 'bold' }}>{item.product_name} ({item.meat_cut})</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.weight_kg} kg @ ₱{item.price_per_kg}/kg</span>
                  <span>₱{Number(item.subtotal).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>₱{Number(sale.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>₱{Number(sale.discount).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', margin: '6px 0' }}>
              <span>TOTAL:</span>
              <span>₱{Number(sale.total_amount).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment ({sale.payment_method}):</span>
              <span>₱{Number(sale.amount_tendered).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Change:</span>
              <span>₱{Number(sale.change_amount).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
            Thank you for your purchase!<br />Please keep this receipt for your records.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn btn-cashier" style={{ flex: 1 }} onClick={handlePrint}>
            <Printer size={14} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
