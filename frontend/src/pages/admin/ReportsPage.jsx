import React, { useEffect, useState, useCallback } from 'react';
import {
  getSalesReportApi,
  getInventoryReportApi,
  getExpiryReportApi,
  getSupplierReportApi
} from '../../api/reportApi';
import { getDisposalsApi } from '../../api/inventoryApi';
import ReportBarChart from '../../components/reports/ReportBarChart';
import {
  Trophy,
  TrendingUp,
  Package,
  AlertTriangle,
  Truck,
  DollarSign,
  Receipt,
  Calendar,
  Trash2
} from 'lucide-react';

const formatDateYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = (granularity) => {
  const now = new Date();
  const toStr = formatDateYMD(now);
  const fromDate = new Date(now);

  if (granularity === 'daily') {
    fromDate.setDate(now.getDate() - 13); // 14 days
  } else if (granularity === 'monthly') {
    fromDate.setMonth(now.getMonth() - 11);
    fromDate.setDate(1); // 12 months
  } else if (granularity === 'yearly') {
    fromDate.setFullYear(now.getFullYear() - 4);
    fromDate.setMonth(0);
    fromDate.setDate(1); // 5 years
  }
  return { from: formatDateYMD(fromDate), to: toStr };
};

const formatPeso = (val) =>
  `₱${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatWeight = (val, decimals = 2) =>
  `${Number(val || 0).toFixed(decimals)} kg`;

/**
 * Merged Reports & Analytics Page
 * Contains 4 tabs: Sales Report, Inventory Report, Expiry Report, Suppliers Report.
 * Each tab contains exactly ONE bar graph and follows the shared date filter.
 */
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  // Shared Date Filter State
  const [granularity, setGranularity] = useState('daily');
  const defaultRange = getDefaultDateRange('daily');
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);

  // Sales metric toggle: 'revenue' | 'volume'
  const [salesMetric, setSalesMetric] = useState('revenue');

  // Data states
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState({ summary: {}, chartData: [], batches: [] });
  const [expiryReport, setExpiryReport] = useState({ summary: {}, chartData: [], batches: [] });
  const [supplierReport, setSupplierReport] = useState({ summary: {}, chartData: [], suppliers: [] });
  const [disposals, setDisposals] = useState([]);

  // Handle Granularity change
  const handleGranularityChange = (newGran) => {
    setGranularity(newGran);
    const range = getDefaultDateRange(newGran);
    setFromDate(range.from);
    setToDate(range.to);
  };

  // Fetch report for the currently active tab and filter
  const fetchReportData = useCallback(() => {
    setLoading(true);
    const params = {
      granularity,
      from: fromDate,
      to: toDate
    };

    if (activeTab === 'sales') {
      getSalesReportApi(params)
        .then((res) => setSalesReport(res.data || null))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'inventory') {
      getInventoryReportApi(params)
        .then((res) => setInventoryReport(res.data || { summary: {}, chartData: [], batches: [] }))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'expiry') {
      getExpiryReportApi(params)
        .then((res) => setExpiryReport(res.data || { summary: {}, chartData: [], batches: [] }))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'suppliers') {
      getSupplierReportApi(params)
        .then((res) => setSupplierReport(res.data || { summary: {}, chartData: [], suppliers: [] }))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'disposals') {
      getDisposalsApi()
        .then((res) => setDisposals(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab, granularity, fromDate, toDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Stacked datasets definition for Expiry Report
  const expiryStackedDatasets = [
    { key: 'expired', label: 'Expired', color: '#ef4444', hoverColor: '#dc2626' },
    { key: 'expiring_7d', label: 'Expiring ≤7d', color: '#f97316', hoverColor: '#ea580c' },
    { key: 'expiring_30d', label: 'Expiring ≤30d', color: '#eab308', hoverColor: '#ca8a04' },
    { key: 'safe', label: 'Safe', color: '#10b981', hoverColor: '#059669' }
  ];

  return (
    <div className="page-container">
      {/* ── Page Header & Top Tabs ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'sales', label: 'Sales Report', icon: DollarSign },
            { id: 'inventory', label: 'Inventory Report', icon: Package },
            { id: 'expiry', label: 'Expiry Report', icon: AlertTriangle },
            { id: 'suppliers', label: 'Suppliers Report', icon: Truck },
            { id: 'disposals', label: 'Disposed / Wasted Stock', icon: Trash2 }
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
      </div>

      {/* ── Shared Filter Bar (All 4 Tabs) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'rgba(42, 12, 16, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '24px'
        }}
      >
        {/* View By Toggle: Daily / Monthly / Yearly */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#e5d5c3', fontWeight: '700' }}>
            View by:
          </span>
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(20, 5, 8, 0.65)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' }
            ].map((g) => {
              const isSelected = granularity === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  style={{
                    border: 'none',
                    background: isSelected ? 'var(--primary-admin, #be123c)' : 'transparent',
                    color: isSelected ? '#ffffff' : '#d9c7b5',
                    fontWeight: '700',
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handleGranularityChange(g.id)}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range: From and To Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="#e5d5c3" />
            <span style={{ fontSize: '13px', color: '#e5d5c3', fontWeight: '600' }}>From:</span>
            <input
              type="date"
              className="form-control"
              style={{
                width: 'auto',
                minWidth: '140px',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'rgba(20, 5, 8, 0.7)',
                color: '#fdf2e3',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px'
              }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#e5d5c3', fontWeight: '600' }}>To:</span>
            <input
              type="date"
              className="form-control"
              style={{
                width: 'auto',
                minWidth: '140px',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'rgba(20, 5, 8, 0.7)',
                color: '#fdf2e3',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px'
              }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: SALES REPORT & ANALYTICS
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Summary KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">TOTAL REVENUE</div>
              <div className="kpi-value" style={{ color: 'var(--primary-admin, #f43f5e)' }}>
                {formatPeso(salesReport?.summary?.total_revenue)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">TOTAL TRANSACTIONS</div>
              <div className="kpi-value">
                {salesReport?.summary?.total_transactions || 0}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">AVG TRANSACTION VALUE</div>
              <div className="kpi-value">
                {formatPeso(salesReport?.summary?.average_transaction_value)}
              </div>
            </div>
          </div>

          {/* 2. ONE Single Bar Graph: Sales Over Time */}
          <div className="card" style={{ marginBottom: 0, width: '100%' }}>
            <div
              className="card-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="var(--primary-admin, #f43f5e)" />
                  Sales Volume &amp; Revenue Over Time
                </span>
                <div style={{ fontSize: '13px', color: '#e5d5c3', fontWeight: '600', marginTop: '3px' }}>
                  Total {salesMetric === 'revenue' ? 'Revenue' : 'Volume'}:{' '}
                  <span style={{ color: 'var(--primary-admin, #f43f5e)', fontWeight: '700' }}>
                    {salesMetric === 'revenue'
                      ? formatPeso(salesReport?.summary?.total_revenue)
                      : formatWeight(salesReport?.summary?.total_volume_kg)}
                  </span>
                </div>
              </div>

              {/* Metric Toggle: Revenue (₱) / Volume (kg) */}
              <div
                style={{
                  display: 'inline-flex',
                  background: 'rgba(20, 5, 8, 0.65)',
                  borderRadius: '8px',
                  padding: '3px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: salesMetric === 'revenue' ? 'var(--primary-admin, #be123c)' : 'transparent',
                    color: salesMetric === 'revenue' ? '#ffffff' : '#d9c7b5',
                    fontWeight: '700',
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setSalesMetric('revenue')}
                >
                  Revenue (₱)
                </button>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: salesMetric === 'volume' ? 'var(--primary-admin, #be123c)' : 'transparent',
                    color: salesMetric === 'volume' ? '#ffffff' : '#d9c7b5',
                    fontWeight: '700',
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setSalesMetric('volume')}
                >
                  Volume (kg)
                </button>
              </div>
            </div>

            <ReportBarChart
              data={salesReport?.chartData || []}
              type="standard"
              metricKey={salesMetric === 'revenue' ? 'revenue' : 'volume_kg'}
              labelKey="label"
              barLabel={salesMetric === 'revenue' ? 'Revenue (₱)' : 'Volume (kg)'}
              barColor={salesMetric === 'revenue' ? 'rgba(225, 29, 72, 0.85)' : 'rgba(245, 158, 11, 0.85)'}
              hoverColor={salesMetric === 'revenue' ? 'rgba(225, 29, 72, 1)' : 'rgba(245, 158, 11, 1)'}
              loading={loading}
              emptyMessage="No data for the selected period."
              formatValue={(val) =>
                salesMetric === 'revenue' ? formatPeso(val) : formatWeight(val)
              }
              height={280}
            />
          </div>

          {/* 3. Top Selling Meat Cuts Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--warning, #eab308)" />
                Top Selling Meat Cuts Summary
              </span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>PRODUCT</th>
                    <th>CUT</th>
                    <th>VOLUME SOLD</th>
                    <th>REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport?.topSellingCuts?.map((b, idx) => (
                    <tr key={idx}>
                      <td><strong>#{idx + 1}</strong></td>
                      <td><strong>{b.product_name}</strong></td>
                      <td>{b.meat_cut}</td>
                      <td>{formatWeight(b.volume_sold ?? b.total_kg_sold, 3)}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-admin, #f43f5e)' }}>
                        {formatPeso(b.revenue ?? b.total_revenue_generated)}
                      </td>
                    </tr>
                  ))}
                  {(!salesReport?.topSellingCuts || salesReport.topSellingCuts.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted, #d9c7b5)' }}>
                        No data for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Sales Transactions & Receipts Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="var(--primary-admin, #f43f5e)" />
                Sales Transactions &amp; Receipts ({salesReport?.transactions?.length || 0})
              </span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>RECEIPT NO.</th>
                    <th>CASHIER</th>
                    <th>SUBTOTAL</th>
                    <th>DISCOUNT</th>
                    <th>TOTAL AMOUNT</th>
                    <th>PAYMENT</th>
                    <th>DATE &amp; TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport?.transactions?.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.receipt_no}</strong></td>
                      <td>{t.cashier_name}</td>
                      <td>{formatPeso(t.subtotal)}</td>
                      <td>{formatPeso(t.discount)}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatPeso(t.total_amount)}</td>
                      <td>
                        <span className="badge badge-info">{t.payment_method?.toUpperCase()}</span>
                      </td>
                      <td>{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!salesReport?.transactions || salesReport.transactions.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted, #d9c7b5)' }}>
                        No data for the selected period.
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
          {/* Exactly ONE Bar Graph: Stock Received Over Time */}
          <div className="card" style={{ marginBottom: 0, width: '100%' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="#10b981" />
                Stock Received Over Time (kg)
              </span>
            </div>
            <ReportBarChart
              data={inventoryReport?.chartData || []}
              type="standard"
              metricKey="received_kg"
              labelKey="label"
              barLabel="Stock Received (kg)"
              barColor="rgba(16, 185, 129, 0.85)"
              hoverColor="rgba(16, 185, 129, 1)"
              loading={loading}
              emptyMessage="No data for the selected period."
              formatValue={(val) => formatWeight(val)}
              height={280}
            />
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
                    <th>BATCH</th>
                    <th>PRODUCT</th>
                    <th>CATEGORY</th>
                    <th>SUPPLIER</th>
                    <th>AVAILABLE STOCK</th>
                    <th>EXPIRY DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport?.batches?.map((i) => (
                    <tr key={i.id}>
                      <td>{i.batch_no}</td>
                      <td><strong>{i.product_name}</strong></td>
                      <td>{i.category_name}</td>
                      <td>{i.supplier_name}</td>
                      <td>{formatWeight(i.available_stock_kg, 3)}</td>
                      <td>{i.expiration_date}</td>
                      <td>
                        <span
                          className={`badge ${
                            i.status === 'available'
                              ? 'badge-success'
                              : i.status === 'low'
                                ? 'badge-warning'
                                : 'badge-danger'
                          }`}
                        >
                          {i.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!inventoryReport?.batches || inventoryReport.batches.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted, #d9c7b5)' }}>
                        No data for the selected period.
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
          {/* Exactly ONE Bar Graph (Stacked): Batches Expiring Over Time */}
          <div className="card" style={{ marginBottom: 0, width: '100%' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#eab308" />
                Batches Expiring Over Time
              </span>
            </div>
            <ReportBarChart
              data={expiryReport?.chartData || []}
              type="stacked"
              stackedDatasets={expiryStackedDatasets}
              labelKey="label"
              loading={loading}
              emptyMessage="No data for the selected period."
              formatValue={(val) => `${val} batch${val !== 1 ? 'es' : ''}`}
              height={280}
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
                    <th>BATCH</th>
                    <th>PRODUCT</th>
                    <th>SUPPLIER</th>
                    <th>STOCK REMAINING</th>
                    <th>EXPIRATION DATE</th>
                    <th>FLAG</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryReport?.batches?.map((e) => (
                    <tr key={e.id}>
                      <td>{e.batch_no}</td>
                      <td><strong>{e.product_name}</strong></td>
                      <td>{e.supplier_name}</td>
                      <td>{formatWeight(e.available_stock_kg, 3)}</td>
                      <td>{e.expiration_date}</td>
                      <td>
                        <span
                          className={`badge ${
                            e.expiry_flag === 'Expired'
                              ? 'badge-danger'
                              : e.expiry_flag === 'Expiring ≤7d'
                                ? 'badge-danger'
                                : e.expiry_flag === 'Expiring ≤30d'
                                  ? 'badge-warning'
                                  : 'badge-success'
                          }`}
                        >
                          {e.expiry_flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!expiryReport?.batches || expiryReport.batches.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted, #d9c7b5)' }}>
                        No data for the selected period.
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
          {/* Exactly ONE Bar Graph: Supply Volume Over Time */}
          <div className="card" style={{ marginBottom: 0, width: '100%' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#38bdf8" />
                Supply Volume Over Time (kg)
              </span>
            </div>
            <ReportBarChart
              data={supplierReport?.chartData || []}
              type="standard"
              metricKey="supply_volume_kg"
              labelKey="label"
              barLabel="Supply Volume (kg)"
              barColor="rgba(56, 189, 248, 0.85)"
              hoverColor="rgba(56, 189, 248, 1)"
              loading={loading}
              emptyMessage="No data for the selected period."
              formatValue={(val) => formatWeight(val)}
              height={280}
            />
          </div>

          {/* Supplier Activity & Volume Report Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title">Supplier Activity &amp; Volume Report</span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>SUPPLIER</th>
                    <th>CONTACT PERSON</th>
                    <th>PHONE</th>
                    <th>BATCHES DELIVERED</th>
                    <th>TOTAL WEIGHT DELIVERED</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierReport?.suppliers?.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.supplier_name}</strong></td>
                      <td>{s.contact_person || '—'}</td>
                      <td>{s.phone || '—'}</td>
                      <td>{s.total_batches_supplied} batch(es)</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-admin, #f43f5e)' }}>
                        {formatWeight(s.total_weight_supplied_kg, 3)}
                      </td>
                    </tr>
                  ))}
                  {(!supplierReport?.suppliers || supplierReport.suppliers.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted, #d9c7b5)' }}>
                        No data for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: DISPOSED / WASTED STOCK
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'disposals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Disposed Batches</div>
              <div className="kpi-value" style={{ color: 'var(--danger)' }}>
                {disposals.length}
              </div>
              <div className="kpi-sub" style={{ color: '#a89886' }}>Condemned / Soft-Removed</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Total Weight Disposed</div>
              <div className="kpi-value" style={{ color: 'var(--danger)' }}>
                {formatWeight(
                  disposals.reduce((sum, d) => sum + Number(d.weight_disposed_kg || 0), 0),
                  3
                )}
              </div>
              <div className="kpi-sub" style={{ color: '#a89886' }}>Wasted Meat Stock</div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Disposed / Wasted Inventory Audit Log</span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>DISPOSAL DATE</th>
                    <th>BATCH NO.</th>
                    <th>PRODUCT & CUT</th>
                    <th>WEIGHT DISPOSED</th>
                    <th>DISPOSED BY</th>
                    <th>REASON</th>
                  </tr>
                </thead>
                <tbody>
                  {disposals.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontSize: '13px', color: '#C9B4A6' }}>
                        {new Date(d.disposal_date).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td><strong>{d.batch_no}</strong></td>
                      <td>
                        <strong>{d.product_name}</strong>
                        {d.meat_cut && <span style={{ color: '#a89886', fontSize: '11px' }}> ({d.meat_cut})</span>}
                      </td>
                      <td style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                        {formatWeight(d.weight_disposed_kg, 3)}
                      </td>
                      <td>
                        <span className="badge badge-info">{d.disposed_by_name || 'Admin'}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#F6EBDD' }}>
                        {d.reason || 'Expired shelf life'}
                      </td>
                    </tr>
                  ))}
                  {disposals.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No stock disposal records found.
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
