import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getSalesApi } from '../../api/saleApi';
import { getLowStockAlertsApi } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Monitor, Search, X } from 'lucide-react';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CashierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [todaySales, setTodaySales] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadShiftData = useCallback(() => {
    if (!user?.id) return;
    const today = getLocalDateString();
    getSalesApi({ cashier_id: user.id, date: today })
      .then((res) => setTodaySales(res.data || []))
      .catch(console.error);
    getLowStockAlertsApi(15)
      .then((res) => setLowStock(res.data || []))
      .catch(console.error);
  }, [user?.id]);

  // Re-fetch every time the dashboard is navigated to (route change) or user changes
  useEffect(() => {
    loadShiftData();
  }, [loadShiftData, location.key]);

  // Refresh when the browser tab regains focus
  useEffect(() => {
    const onFocus = () => loadShiftData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadShiftData]);

  // Listen for sale-completed events (same window) and storage events (cross-tab)
  useEffect(() => {
    const handleSaleCompleted = () => {
      loadShiftData();
    };

    const handleStorage = (e) => {
      if (e.key === 'smis_sale_timestamp') {
        loadShiftData();
      }
    };

    window.addEventListener('sale-completed', handleSaleCompleted);
    window.addEventListener('storage', handleStorage);

    // Periodic safety poll every 15 seconds
    const interval = setInterval(loadShiftData, 15000);

    return () => {
      window.removeEventListener('sale-completed', handleSaleCompleted);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [loadShiftData]);

  // Full shift statistics (not altered by table filtering)
  const totalShiftRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);

  // Filter sales by customer name or receipt # (case-insensitive, multi-word matching)
  const filteredSales = useMemo(() => {
    if (!debouncedSearch) return todaySales;
    const terms = debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);

    return todaySales.filter((s) => {
      const customer = (s.customer_name || 'Walk-in').toLowerCase();
      const receipt = (s.receipt_no || '').toLowerCase();
      const target = `${customer} ${receipt}`;
      return terms.every((term) => target.includes(term));
    });
  }, [todaySales, debouncedSearch]);

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
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="card-title" style={{ margin: 0 }}>My Recent Shift Sales</span>
            {debouncedSearch && (
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                ({filteredSales.length} of {todaySales.length} sales)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchTerm('');
                }}
                placeholder="Search customer name or receipt #..."
                aria-label="Search recent shift sales"
                className="form-control"
                style={{
                  width: '100%',
                  padding: '7px 28px 7px 32px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary-cashier)')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                  aria-label="Clear search input"
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button className="btn btn-outline btn-sm" onClick={() => navigate('/cashier/transactions')} style={{ whiteSpace: 'nowrap' }}>
              View History
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer</th>
                <th>Time</th>
                <th>Payment</th>
                <th>Subtotal</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.receipt_no}</strong></td>
                  <td>{s.customer_name || <span style={{ color: 'var(--text-muted)' }}>Walk-in</span>}</td>
                  <td>{new Date(s.created_at).toLocaleTimeString()}</td>
                  <td><span className="badge badge-info">{s.payment_method?.toUpperCase()}</span></td>
                  <td>₱{Number(s.subtotal).toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold' }}>₱{Number(s.total_amount).toFixed(2)}</td>
                </tr>
              ))}
              {todaySales.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales processed yet in this shift</td></tr>
              )}
              {todaySales.length > 0 && filteredSales.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-muted)' }}>
                    <div>No sales found for "<strong>{debouncedSearch}</strong>"</div>
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-cashier)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '700',
                        fontSize: '12px',
                        marginTop: '6px'
                      }}
                    >
                      Clear search
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
