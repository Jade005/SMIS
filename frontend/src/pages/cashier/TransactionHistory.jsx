import React, { useEffect, useState } from 'react';
import { getSalesApi, getReceiptApi } from '../../api/saleApi';
import ReceiptModal from '../../components/pos/ReceiptModal';
import { Printer } from 'lucide-react';

const TransactionHistory = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    getSalesApi().then(res => setSales(res.data || [])).catch(console.error);
  }, []);

  const handleReprint = async (id) => {
    try {
      const res = await getReceiptApi(id);
      setSelectedSale(res.data);
      setShowReceipt(true);
    } catch (err) {
      alert('Failed to load receipt details');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <span className="card-title">POS Transaction History</span>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Date & Time</th>
                <th>Cashier</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.receipt_no}</strong></td>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                  <td>{s.cashier_name}</td>
                  <td>₱{Number(s.subtotal).toFixed(2)}</td>
                  <td>₱{Number(s.discount).toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold' }}>₱{Number(s.total_amount).toFixed(2)}</td>
                  <td><span className="badge badge-info">{s.payment_method}</span></td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleReprint(s.id)}>
                      <Printer size={12} /> Reprint Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal isOpen={showReceipt} onClose={() => setShowReceipt(false)} sale={selectedSale} />
    </div>
  );
};

export default TransactionHistory;
