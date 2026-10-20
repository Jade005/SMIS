import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalesReportApi } from '../../api/reportApi';
import { getLowStockAlertsApi, getExpiredAlertsApi } from '../../api/inventoryApi';
import { getSalesApi } from '../../api/saleApi';
import { DollarSign, ShoppingBag, AlertTriangle, XCircle, TrendingUp, ArrowRight, PlusCircle } from 'lucide-react';
import PageLoader from '../../components/common/PageLoader';

const AdminDashboard = () => {
  const navigate = useNavigate();
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
          getLowStockAlertsApi(),
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

  if (loading) return (
    <div className="page-container">
      <PageLoader message="Loading Admin Dashboard..." />
    </div>
  );

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

        <div
          className="kpi-card"
          onClick={() => navigate('/admin/inventory?tab=low')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          title="Click to view low stock items"
        >
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value" style={{ color: lowStockAlerts.length > 0 ? 'var(--warning)' : 'inherit' }}>{lowStockAlerts.length}</div>
          <div className="kpi-sub" style={{ color: 'var(--warning)' }}>Products at or below threshold</div>
        </div>

        <div
          className="kpi-card"
          onClick={() => navigate('/admin/inventory?tab=expired')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          title="Click to view and dispose expired batches"
        >
          <div className="kpi-label">Expired Batches</div>
          <div className="kpi-value" style={{ color: expiredAlerts.length > 0 ? 'var(--danger)' : 'inherit' }}>{expiredAlerts.length}</div>
          <div className="kpi-sub" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Requires Removal <ArrowRight size={12} />
          </div>
        </div>
      </div>

      {expiredAlerts.length > 0 && (
        <div
          onClick={() => navigate('/admin/inventory?tab=expired')}
          style={{
            background: 'var(--danger-soft)',
            borderLeft: '4px solid var(--danger)',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 'bold',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          title="Click to review and dispose expired batches"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={18} />
            <span>{expiredAlerts.length} inventory batch(es) have reached expiration date. Review inventory immediately.</span>
          </div>
          <span style={{ fontSize: '12px', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Review Expired <ArrowRight size={14} />
          </span>
        </div>
      )}

      {lowStockAlerts.length > 0 && (
        <div
          onClick={() => navigate('/admin/inventory?tab=low')}
          style={{
            background: 'var(--warning-soft)',
            borderLeft: '4px solid var(--warning)',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 'bold',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          title="Click to view low stock products"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span>{lowStockAlerts.length} product(s) are running low on stock.</span>
          </div>
          <span style={{ fontSize: '12px', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Low Stock <ArrowRight size={14} />
          </span>
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
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Low Stock Monitor</span>
            <span style={{ fontSize: '11px', color: '#a89886' }}>Per-Product Thresholds</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Available</th>
                  <th>Threshold</th>
                  <th>Nearest Expiry</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.slice(0, 5).map((item) => (
                  <tr key={item.product_id}>
                    <td>
                      <strong>{item.product_name}</strong>
                      {item.meat_cut && (
                        <div style={{ fontSize: '11px', color: '#a89886' }}>{item.meat_cut}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        {Number(item.total_available_stock_kg).toFixed(3)} kg
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#F6EBDD' }}>
                      {Number(item.low_stock_threshold).toFixed(1)} kg
                    </td>
                    <td style={{ fontSize: '12px', color: item.nearest_expiry_date ? '#f87171' : 'inherit' }}>
                      {item.nearest_expiry_date || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => navigate(`/admin/inventory?restock=${item.product_id}`)}
                        title={`Add new batch for ${item.product_name}`}
                      >
                        <PlusCircle size={12} />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {lowStockAlerts.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--success)' }}>All product stock levels optimal</td></tr>
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
