import React, { useEffect, useState } from 'react';
import { getSalesReportApi } from '../../api/reportApi';
import { getLowStockAlertsApi, getExpiredAlertsApi } from '../../api/inventoryApi';
import { getSalesApi } from '../../api/saleApi';
import { DollarSign, ShoppingBag, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [salesSummary, setSalesSummary] = useState({ total_revenue: 0, total_transactions: 0 });
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiredAlerts, setExpiredAlerts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, lowRes, expRes, salesRes] = await Promise.all([
          getSalesReportApi({ period: 'daily' }),
          getLowStockAlertsApi(15),
          getExpiredAlertsApi(),
          getSalesApi()
        ]);

        setSalesSummary(reportRes.data.summary || {});
        setLowStockAlerts(lowRes.data || []);
        setExpiredAlerts(expRes.data || []);
        setRecentSales((salesRes.data || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="page-container">Loading Admin Dashboard...</div>;

  return (
    <div className="page-container">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Today's Revenue</div>
          <div className="kpi-value">₱{Number(salesSummary.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="kpi-sub" style={{ color: 'var(--success)' }}>↑ Live Sales Data</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Transactions Today</div>
          <div className="kpi-value">{salesSummary.total_transactions || 0}</div>
          <div className="kpi-sub" style={{ color: 'var(--primary-admin)' }}>Completed POS Sales</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value" style={{ color: lowStockAlerts.length > 0 ? 'var(--warning)' : 'inherit' }}>{lowStockAlerts.length}</div>
          <div className="kpi-sub" style={{ color: 'var(--warning)' }}>Batches ≤ 15 kg</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Expired Batches</div>
          <div className="kpi-value" style={{ color: expiredAlerts.length > 0 ? 'var(--danger)' : 'inherit' }}>{expiredAlerts.length}</div>
          <div className="kpi-sub" style={{ color: 'var(--danger)' }}>Requires Removal</div>
        </div>
      </div>

      {expiredAlerts.length > 0 && (
        <div style={{ background: 'var(--danger-soft)', borderLeft: '4px solid var(--danger)', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <XCircle size={18} />
          <span>{expiredAlerts.length} inventory batch(es) have reached expiration date. Review inventory immediately.</span>
        </div>
      )}

      {lowStockAlerts.length > 0 && (
        <div style={{ background: 'var(--warning-soft)', borderLeft: '4px solid var(--warning)', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>{lowStockAlerts.length} product batch(es) are running low on available weight.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Transactions</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Cashier</th>
                  <th>Total</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td><strong>{sale.receipt_no}</strong></td>
                    <td>{sale.cashier_name}</td>
                    <td style={{ fontWeight: 'bold' }}>₱{Number(sale.total_amount).toFixed(2)}</td>
                    <td><span className="badge badge-info">{sale.payment_method}</span></td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales recorded today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Low Stock Monitor</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Product</th>
                  <th>Available</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.slice(0, 5).map((batch) => (
                  <tr key={batch.id}>
                    <td>{batch.batch_no}</td>
                    <td><strong>{batch.product_name}</strong></td>
                    <td><span className="badge badge-warning">{batch.available_stock_kg} kg</span></td>
                    <td>{batch.expiration_date}</td>
                  </tr>
                ))}
                {lowStockAlerts.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--success)' }}>All inventory stock levels optimal</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
