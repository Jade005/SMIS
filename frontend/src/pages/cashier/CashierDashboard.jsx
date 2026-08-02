import React, { useEffect, useState } from 'react';
import { getSalesApi } from '../../api/saleApi';
import { getLowStockAlertsApi } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Monitor, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react';

const CashierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todaySales, setTodaySales] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    getSalesApi({ cashier_id: user?.id, date: today }).then(res => setTodaySales(res.data || [])).catch(console.error);
    getLowStockAlertsApi(15).then(res => setLowStock(res.data || [])).catch(console.error);
  }, [user]);

  const totalShiftRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);

  return (
    <div className="page-container">
      <div style={{ background: 'var(--primary-cashier)', color: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Cashier Terminal Shift Overview</h2>
          <p style={{ fontSize: '13px', opacity: 0.9 }}>Welcome back, {user?.first_name}! Ready to process sales transactions.</p>
        </div>
        <button className="btn btn-outline" style={{ background: '#fff', color: 'var(--primary-cashier)', fontWeight: 'bold' }} onClick={() => navigate('/cashier/pos')}>
          <Monitor size={16} /> Open POS Terminal
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Shift Sales Volume</div>
          <div className="kpi-value">₱{totalShiftRevenue.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Completed Transactions</div>
          <div className="kpi-value">{todaySales.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value" style={{ color: lowStock.length > 0 ? 'var(--warning)' : 'inherit' }}>{lowStock.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">My Recent Shift Sales</span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/cashier/transactions')}>View History</button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Time</th>
                <th>Payment</th>
                <th>Subtotal</th>
                <th>Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {todaySales.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.receipt_no}</strong></td>
                  <td>{new Date(s.created_at).toLocaleTimeString()}</td>
                  <td><span className="badge badge-info">{s.payment_method}</span></td>
                  <td>₱{Number(s.subtotal).toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold' }}>₱{Number(s.total_amount).toFixed(2)}</td>
                </tr>
              ))}
              {todaySales.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales processed yet in this shift</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
