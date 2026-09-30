import React, { useEffect, useState, useMemo } from 'react';
import {
  getSalesReportApi,
  getInventoryReportApi,
  getExpiryReportApi,
  getSupplierReportApi
} from '../../api/reportApi';
import {
  getRevenueTrendsApi,
  getBestSellersApi,
  getSalesByCategoryApi
} from '../../api/analyticsApi';
import DonutChart from '../../components/reports/DonutChart';
import RevenueTrendChart from '../../components/reports/RevenueTrendChart';
import {
  Trophy,
  PieChart as PieChartIcon,
  TrendingUp,
  Package,
  AlertTriangle,
  Truck,
  DollarSign,
  Receipt
} from 'lucide-react';

/**
 * Merged Reports & Analytics Page
 * Combines high-level visual charts (pie/donut/trends) and detailed data tables across:
 * - Sales Report (revenue metrics, meat category donut, best sellers pie, daily trends, receipt table)
 * - Inventory Report (category stock donut, stock status donut, inventory table)
 * - Expiry Report (expiry flag pie, monitor table)
 * - Suppliers Report (supplier volume pie, activity table)
 */
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [categoryMetric, setCategoryMetric] = useState('revenue'); // 'revenue' | 'volume'
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [expiryReport, setExpiryReport] = useState([]);
  const [supplierReport, setSupplierReport] = useState([]);

  // Analytics States (for Sales Report tab)
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  // Days for revenue trend based on selected period
  const trendDays = salesPeriod === 'daily' ? 7 : salesPeriod === 'weekly' ? 14 : 30;

  // ── Data Fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);

    if (activeTab === 'sales') {
      Promise.all([
        getSalesReportApi({ period: salesPeriod }),
        getRevenueTrendsApi(trendDays),
        getBestSellersApi(5),
        getSalesByCategoryApi()
      ])
        .then(([salesRes, revRes, sellersRes, catRes]) => {
          setSalesReport(salesRes.data || null);
          setRevenueTrends(revRes.data || []);
          setBestSellers(sellersRes.data || []);
          setCategorySales(catRes.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'inventory') {
      getInventoryReportApi()
        .then((res) => setInventoryReport(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'expiry') {
      getExpiryReportApi()
        .then((res) => setExpiryReport(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'suppliers') {
      getSupplierReportApi()
        .then((res) => setSupplierReport(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab, salesPeriod, trendDays]);

  // ── Derived Data for Charts ───────────────────────────────────────────────

  // 1. Inventory Chart: Stock (kg) by Category
  const inventoryByCategory = useMemo(() => {
    const map = {};
    inventoryReport.forEach((item) => {
      const cat = item.category_name || 'Uncategorized';
      map[cat] = (map[cat] || 0) + (Number(item.available_stock_kg) || 0);
    });
    return Object.entries(map).map(([label, value]) => ({
      label,
      value: Number(value.toFixed(2))
    }));
  }, [inventoryReport]);

  const totalInventoryKg = useMemo(() => {
    return inventoryReport.reduce((sum, item) => sum + (Number(item.available_stock_kg) || 0), 0);
  }, [inventoryReport]);

  // 2. Inventory Chart: Stock Status (In Stock, Low Stock, Depleted)
  const inventoryByStatus = useMemo(() => {
    const map = { 'In Stock': 0, 'Low Stock': 0, 'Out of Stock': 0 };
    inventoryReport.forEach((item) => {
      const status = (item.status || '').toLowerCase();
      if (status === 'available') map['In Stock'] += 1;
      else if (status === 'low') map['Low Stock'] += 1;
      else if (status === 'depleted') map['Out of Stock'] += 1;
      else map['In Stock'] += 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [inventoryReport]);

  // 3. Expiry Chart: Items by status flag (Expired, Expiring Soon, Fresh)
  const expiryByFlag = useMemo(() => {
    const map = { Expired: 0, 'Expiring Soon': 0, Fresh: 0 };
    expiryReport.forEach((item) => {
      const flag = item.expiry_flag || 'Valid';
      if (flag === 'Expired') map['Expired'] += 1;
      else if (flag === 'Expiring Soon') map['Expiring Soon'] += 1;
      else map['Fresh'] += 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [expiryReport]);

  // 4. Supplier Chart: Supply volume (kg) per supplier
  const supplierVolumeData = useMemo(() => {
    return supplierReport.map((s) => ({
      label: s.supplier_name,
      value: Number(Number(s.total_weight_supplied_kg || 0).toFixed(2))
    }));
  }, [supplierReport]);

  const totalSuppliedKg = useMemo(() => {
    return supplierReport.reduce((sum, s) => sum + (Number(s.total_weight_supplied_kg) || 0), 0);
  }, [supplierReport]);

  // 5. Best Sellers Pie Data
  const bestSellersPieData = useMemo(() => {
    return bestSellers.map((b) => ({
      label: `${b.product_name} (${b.meat_cut})`,
      value: Number(b.total_revenue_generated || 0)
    }));
  }, [bestSellers]);

  // 6. Category Sales Donut Data (toggled between Revenue and Volume)
  const categorySalesDonutData = useMemo(() => {
    return categorySales.map((c) => ({
      label: c.category_name,
      value: categoryMetric === 'revenue' ? Number(c.total_revenue || 0) : Number(c.total_kg_sold || 0)
    }));
  }, [categorySales, categoryMetric]);

  const totalCategoryDonut = useMemo(() => {
    return categorySalesDonutData.reduce((sum, i) => sum + i.value, 0);
  }, [categorySalesDonutData]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      {/* ── Page Header & Top Tabs ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'sales', label: 'Sales Report', icon: DollarSign },
            { id: 'inventory', label: 'Inventory Report', icon: Package },
            { id: 'expiry', label: 'Expiry Report', icon: AlertTriangle },
            { id: 'suppliers', label: 'Suppliers Report', icon: Truck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '700',
                  padding: '8px 16px'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Period Selector (for Sales tab) */}
        {activeTab === 'sales' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Period:</span>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '130px', fontWeight: '700' }}
              value={salesPeriod}
              onChange={(e) => setSalesPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (Last 7d)</option>
              <option value="monthly">Monthly (Last 30d)</option>
            </select>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: SALES REPORT & ANALYTICS
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 1. Summary Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value" style={{ color: 'var(--primary-admin)' }}>
                ₱{Number(salesReport?.summary?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Transactions</div>
              <div className="kpi-value">
                {salesReport?.summary?.total_transactions || 0}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Avg Transaction Value</div>
              <div className="kpi-value">
                ₱{Number(salesReport?.summary?.average_transaction_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* 2. Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>

            {/* Chart 1: Sales Volume by Meat Category (Donut with Toggle) */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChartIcon size={18} color="var(--primary-admin)" />
                  Sales Volume by Meat Category
                </span>
                {/* Metric Toggle */}
                <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: categoryMetric === 'revenue' ? '#ffffff' : 'transparent',
                      color: categoryMetric === 'revenue' ? 'var(--primary-admin)' : '#64748b',
                      fontWeight: '700',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: categoryMetric === 'revenue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onClick={() => setCategoryMetric('revenue')}
                  >
                    Revenue (₱)
                  </button>
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: categoryMetric === 'volume' ? '#ffffff' : 'transparent',
                      color: categoryMetric === 'volume' ? 'var(--primary-admin)' : '#64748b',
                      fontWeight: '700',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: categoryMetric === 'volume' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onClick={() => setCategoryMetric('volume')}
                  >
                    Volume (kg)
                  </button>
                </div>
              </div>

              <DonutChart
                data={categorySalesDonutData}
                isDoughnut={true}
                loading={loading}
                centerLabel={categoryMetric === 'revenue' ? 'Total Sales' : 'Total Kg'}
                centerValue={
                  categoryMetric === 'revenue'
                    ? `₱${Number(totalCategoryDonut).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : `${Number(totalCategoryDonut).toFixed(1)} kg`
                }
                formatValue={(val) =>
                  categoryMetric === 'revenue'
                    ? `₱${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `${Number(val).toFixed(2)} kg`
                }
              />
            </div>

            {/* Chart 2: Top Selling Meat Cuts (Pie Chart) */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={18} color="var(--warning)" />
                  Top Selling Meat Cuts (by Revenue)
                </span>
              </div>

              <DonutChart
                data={bestSellersPieData}
                isDoughnut={false}
                loading={loading}
                formatValue={(val) =>
                  `₱${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
              />
            </div>
          </div>

          {/* 3. Top Selling Meat Cuts (Table) */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--warning)" />
                Top Selling Meat Cuts Summary
              </span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Cut</th>
                    <th>Volume Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map((b, idx) => (
                    <tr key={idx}>
                      <td><strong>#{idx + 1}</strong></td>
                      <td><strong>{b.product_name}</strong></td>
                      <td>{b.meat_cut}</td>
                      <td>{Number(b.total_kg_sold).toFixed(3)} kg</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-admin)' }}>
                        ₱{Number(b.total_revenue_generated).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {bestSellers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No sales analytics available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Daily Revenue Trends */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--success)" />
                Daily Revenue Trends ({salesPeriod === 'daily' ? 'Last 7 Days' : salesPeriod === 'weekly' ? 'Last 14 Days' : 'Last 30 Days'})
              </span>
            </div>

            {/* Bar/Line Trend Chart */}
            <div style={{ marginBottom: '20px' }}>
              <RevenueTrendChart data={revenueTrends} loading={loading} />
            </div>

            {/* Trends Table */}
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transactions Count</th>
                    <th>Daily Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueTrends.map((t, idx) => (
                    <tr key={idx}>
                      <td>{t.date}</td>
                      <td>{t.total_sales_count} sale(s)</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                        ₱{Number(t.daily_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {revenueTrends.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No trend data recorded for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Sales Receipts Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="var(--primary-admin)" />
                Sales Transactions &amp; Receipts ({salesReport?.transactions?.length || 0})
              </span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Cashier</th>
                    <th>Subtotal</th>
                    <th>Discount</th>
                    <th>Total Amount</th>
                    <th>Payment</th>
                    <th>Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport?.transactions?.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.receipt_no}</strong></td>
                      <td>{t.cashier_name}</td>
                      <td>₱{Number(t.subtotal).toFixed(2)}</td>
                      <td>₱{Number(t.discount).toFixed(2)}</td>
                      <td style={{ fontWeight: 'bold' }}>₱{Number(t.total_amount).toFixed(2)}</td>
                      <td>
                        <span className="badge badge-info">{t.payment_method?.toUpperCase()}</span>
                      </td>
                      <td>{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!salesReport?.transactions || salesReport.transactions.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No sales transactions found for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: INVENTORY REPORT
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Inventory Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>

            {/* Donut of Stock by Meat Category */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <span className="card-title">Stock Volume by Meat Category</span>
              </div>
              <DonutChart
                data={inventoryByCategory}
                isDoughnut={true}
                loading={loading}
                centerLabel="Total Stock"
                centerValue={`${Number(totalInventoryKg).toFixed(1)} kg`}
                formatValue={(val) => `${Number(val).toFixed(2)} kg`}
              />
            </div>

            {/* Donut of Stock Status */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <span className="card-title">Stock Status Breakdown</span>
              </div>
              <DonutChart
                data={inventoryByStatus}
                isDoughnut={true}
                loading={loading}
                centerLabel="Total Batches"
                centerValue={`${inventoryReport.length} batches`}
                formatValue={(val) => `${val} batch${val !== 1 ? 'es' : ''}`}
              />
            </div>
          </div>

          {/* Current Inventory Status Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title">Current Inventory Status Report</span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Supplier</th>
                    <th>Available Stock</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.map((i) => (
                    <tr key={i.id}>
                      <td>{i.batch_no}</td>
                      <td><strong>{i.product_name}</strong></td>
                      <td>{i.category_name}</td>
                      <td>{i.supplier_name}</td>
                      <td>{Number(i.available_stock_kg).toFixed(3)} kg</td>
                      <td>{i.expiration_date}</td>
                      <td>
                        <span className={`badge ${
                          i.status === 'available'
                            ? 'badge-success'
                            : i.status === 'low'
                              ? 'badge-warning'
                              : 'badge-danger'
                        }`}>
                          {i.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {inventoryReport.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No inventory batches recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 3: EXPIRY REPORT
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'expiry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Expiry Status Pie Chart */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <span className="card-title">Batches by Expiry Status</span>
            </div>
            <DonutChart
              data={expiryByFlag}
              isDoughnut={false}
              loading={loading}
              centerLabel="Monitored"
              centerValue={`${expiryReport.length} batches`}
              formatValue={(val) => `${val} batch${val !== 1 ? 'es' : ''}`}
            />
          </div>

          {/* Product Expiry Monitor Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title">Product Expiry Monitor Report</span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Stock Remaining</th>
                    <th>Expiration Date</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryReport.map((e) => (
                    <tr key={e.id}>
                      <td>{e.batch_no}</td>
                      <td><strong>{e.product_name}</strong></td>
                      <td>{e.supplier_name}</td>
                      <td>{Number(e.available_stock_kg).toFixed(3)} kg</td>
                      <td>{e.expiration_date}</td>
                      <td>
                        <span className={`badge ${
                          e.expiry_flag === 'Expired'
                            ? 'badge-danger'
                            : e.expiry_flag === 'Expiring Soon'
                              ? 'badge-warning'
                              : 'badge-success'
                        }`}>
                          {e.expiry_flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {expiryReport.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No batches near expiration or expired
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 4: SUPPLIERS REPORT
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Supply Volume Pie Chart */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <span className="card-title">Supply Volume by Supplier (kg)</span>
            </div>
            <DonutChart
              data={supplierVolumeData}
              isDoughnut={true}
              loading={loading}
              centerLabel="Total Supplied"
              centerValue={`${Number(totalSuppliedKg).toFixed(1)} kg`}
              formatValue={(val) => `${Number(val).toFixed(2)} kg`}
            />
          </div>

          {/* Supplier Activity Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title">Supplier Activity &amp; Volume Report</span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Batches Delivered</th>
                    <th>Total Weight Delivered (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierReport.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.supplier_name}</strong></td>
                      <td>{s.contact_person || '—'}</td>
                      <td>{s.phone || '—'}</td>
                      <td>{s.total_batches_supplied} batch(es)</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-admin)' }}>
                        {Number(s.total_weight_supplied_kg).toFixed(3)} kg
                      </td>
                    </tr>
                  ))}
                  {supplierReport.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No supplier activity recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
