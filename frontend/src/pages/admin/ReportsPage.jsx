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
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const formatDateYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayStr = () => formatDateYMD(new Date());

const getCurrentMonthStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getLastMonthStr = () => {
  const now = new Date();
  let prevM = now.getMonth();
  let prevY = now.getFullYear();
  if (prevM === 0) {
    prevM = 12;
    prevY -= 1;
  }
  return `${prevY}-${String(prevM).padStart(2, '0')}`;
};

const getCurrentYearNum = () => new Date().getFullYear();

const getDailyPresetRange = (preset) => {
  const now = new Date();
  const toStr = formatDateYMD(now);
  const fromDate = new Date(now);

  if (preset === 'today') {
    return { from: toStr, to: toStr };
  }
  if (preset === 'yesterday') {
    fromDate.setDate(now.getDate() - 1);
    const yStr = formatDateYMD(fromDate);
    return { from: yStr, to: yStr };
  }
  if (preset === 'last7') {
    fromDate.setDate(now.getDate() - 6);
    return { from: formatDateYMD(fromDate), to: toStr };
  }
  if (preset === 'last14') {
    fromDate.setDate(now.getDate() - 13);
    return { from: formatDateYMD(fromDate), to: toStr };
  }
  if (preset === 'last30') {
    fromDate.setDate(now.getDate() - 29);
    return { from: formatDateYMD(fromDate), to: toStr };
  }
  return { from: toStr, to: toStr };
};

const getMonthRange = (yearMonthStr) => {
  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = now.getMonth() + 1;
  const currentD = now.getDate();

  const [y, m] = yearMonthStr.split('-').map(Number);
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();

  let endDay = lastDay;
  if (y === currentY && m === currentM) {
    endDay = Math.min(lastDay, currentD);
  }
  const to = `${y}-${String(m).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
  return { from, to };
};

const getYearRange = (yearNum) => {
  const now = new Date();
  const currentY = now.getFullYear();
  const y = Number(yearNum);
  const from = `${y}-01-01`;
  const to = y === currentY ? formatDateYMD(now) : `${y}-12-31`;
  return { from, to };
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
  const initialDaily = getDailyPresetRange('last14');
  const [fromDate, setFromDate] = useState(initialDaily.from);
  const [toDate, setToDate] = useState(initialDaily.to);

  // Month state for Monthly view
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr);

  // Year state for Yearly view
  const [selectedYear, setSelectedYear] = useState(getCurrentYearNum);

  // Sales metric toggle: 'revenue' | 'volume'
  const [salesMetric, setSalesMetric] = useState('revenue');

  // Data states
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState({ summary: {}, chartData: [], batches: [] });
  const [expiryReport, setExpiryReport] = useState({ summary: {}, chartData: [], batches: [] });
  const [supplierReport, setSupplierReport] = useState({ summary: {}, chartData: [], suppliers: [] });
  const [disposals, setDisposals] = useState([]);

  // Granularity change: auto-set defaults
  // Daily -> Last 14 days, Monthly -> current month, Yearly -> current year
  const handleGranularityChange = (newGran) => {
    setGranularity(newGran);
    if (newGran === 'daily') {
      const r = getDailyPresetRange('last14');
      setFromDate(r.from);
      setToDate(r.to);
    } else if (newGran === 'monthly') {
      const curM = getCurrentMonthStr();
      setSelectedMonth(curM);
      const r = getMonthRange(curM);
      setFromDate(r.from);
      setToDate(r.to);
    } else if (newGran === 'yearly') {
      const curY = getCurrentYearNum();
      setSelectedYear(curY);
      const r = getYearRange(curY);
      setFromDate(r.from);
      setToDate(r.to);
    }
  };

  const handleDailyPreset = (preset) => {
    const r = getDailyPresetRange(preset);
    setFromDate(r.from);
    setToDate(r.to);
  };

  const handleSelectMonth = (mStr) => {
    if (!mStr) return;
    const curMStr = getCurrentMonthStr();
    const finalMStr = mStr > curMStr ? curMStr : mStr;
    setSelectedMonth(finalMStr);
    const r = getMonthRange(finalMStr);
    setFromDate(r.from);
    setToDate(r.to);
  };

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    let prevY = y;
    let prevM = m - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    const newMonthStr = `${prevY}-${String(prevM).padStart(2, '0')}`;
    handleSelectMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const curMStr = getCurrentMonthStr();
    if (selectedMonth >= curMStr) return;
    const [y, m] = selectedMonth.split('-').map(Number);
    let nextY = y;
    let nextM = m + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    const newMonthStr = `${nextY}-${String(nextM).padStart(2, '0')}`;
    if (newMonthStr > curMStr) return;
    handleSelectMonth(newMonthStr);
  };

  const handleSelectYear = (yNum) => {
    const curY = getCurrentYearNum();
    const y = Math.min(Number(yNum), curY);
    setSelectedYear(y);
    const r = getYearRange(y);
    setFromDate(r.from);
    setToDate(r.to);
  };

  const handlePrevYear = () => {
    if (selectedYear <= 2020) return;
    handleSelectYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    const curY = getCurrentYearNum();
    if (selectedYear >= curY) return;
    handleSelectYear(selectedYear + 1);
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

        {/* Date Filter Controls based on Granularity */}
        {granularity === 'daily' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Quick Presets */}
            <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'last7', label: 'Last 7 Days' },
                { id: 'last14', label: 'Last 14 Days' },
                { id: 'last30', label: 'Last 30 Days' }
              ].map((p) => {
                const pRange = getDailyPresetRange(p.id);
                const isSelected = fromDate === pRange.from && toDate === pRange.to;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleDailyPreset(p.id)}
                    style={{
                      border: isSelected ? '1px solid var(--primary-admin, #be123c)' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: isSelected ? 'var(--primary-admin, #be123c)' : 'rgba(20, 5, 8, 0.65)',
                      color: isSelected ? '#ffffff' : '#d9c7b5',
                      fontWeight: '700',
                      fontSize: '11px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* From & To Inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#e5d5c3" />
                <span style={{ fontSize: '12px', color: '#e5d5c3', fontWeight: '600' }}>From:</span>
                <input
                  type="date"
                  max={getTodayStr()}
                  value={fromDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFromDate(val);
                    if (val > toDate) setToDate(val);
                  }}
                  style={{
                    padding: '5px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: 'rgba(20, 5, 8, 0.7)',
                    color: '#fdf2e3',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#e5d5c3', fontWeight: '600' }}>To:</span>
                <input
                  type="date"
                  max={getTodayStr()}
                  min={fromDate}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    padding: '5px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: 'rgba(20, 5, 8, 0.7)',
                    color: '#fdf2e3',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {granularity === 'monthly' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Monthly Presets */}
            <div style={{ display: 'inline-flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleSelectMonth(getCurrentMonthStr())}
                style={{
                  border: selectedMonth === getCurrentMonthStr() ? '1px solid var(--primary-admin, #be123c)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: selectedMonth === getCurrentMonthStr() ? 'var(--primary-admin, #be123c)' : 'rgba(20, 5, 8, 0.65)',
                  color: selectedMonth === getCurrentMonthStr() ? '#ffffff' : '#d9c7b5',
                  fontWeight: '700',
                  fontSize: '11px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => handleSelectMonth(getLastMonthStr())}
                style={{
                  border: selectedMonth === getLastMonthStr() ? '1px solid var(--primary-admin, #be123c)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: selectedMonth === getLastMonthStr() ? 'var(--primary-admin, #be123c)' : 'rgba(20, 5, 8, 0.65)',
                  color: selectedMonth === getLastMonthStr() ? '#ffffff' : '#d9c7b5',
                  fontWeight: '700',
                  fontSize: '11px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Last Month
              </button>
            </div>

            {/* Prev / Month Picker / Next */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(20, 5, 8, 0.7)',
                  color: '#fdf2e3',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <input
                type="month"
                max={getCurrentMonthStr()}
                value={selectedMonth}
                onChange={(e) => handleSelectMonth(e.target.value)}
                style={{
                  padding: '5px 12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  background: 'rgba(20, 5, 8, 0.7)',
                  color: '#fdf2e3',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              />

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={selectedMonth >= getCurrentMonthStr()}
                title="Next Month"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: selectedMonth >= getCurrentMonthStr() ? 'rgba(20, 5, 8, 0.3)' : 'rgba(20, 5, 8, 0.7)',
                  color: selectedMonth >= getCurrentMonthStr() ? 'rgba(255, 255, 255, 0.2)' : '#fdf2e3',
                  cursor: selectedMonth >= getCurrentMonthStr() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {granularity === 'yearly' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* This Year Preset */}
            <div style={{ display: 'inline-flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleSelectYear(getCurrentYearNum())}
                style={{
                  border: selectedYear === getCurrentYearNum() ? '1px solid var(--primary-admin, #be123c)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: selectedYear === getCurrentYearNum() ? 'var(--primary-admin, #be123c)' : 'rgba(20, 5, 8, 0.65)',
                  color: selectedYear === getCurrentYearNum() ? '#ffffff' : '#d9c7b5',
                  fontWeight: '700',
                  fontSize: '11px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                This Year
              </button>
            </div>

            {/* Prev / Year Dropdown / Next */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handlePrevYear}
                title="Previous Year"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(20, 5, 8, 0.7)',
                  color: '#fdf2e3',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <select
                value={selectedYear}
                onChange={(e) => handleSelectYear(Number(e.target.value))}
                style={{
                  padding: '5px 12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  background: 'rgba(20, 5, 8, 0.85)',
                  color: '#fdf2e3',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {(() => {
                  const curY = getCurrentYearNum();
                  const opts = [];
                  for (let y = curY; y >= 2023; y--) {
                    opts.push(y);
                  }
                  return opts.map((y) => (
                    <option key={y} value={y} style={{ background: '#1a0a0c', color: '#fdf2e3' }}>
                      {y}
                    </option>
                  ));
                })()}
              </select>

              <button
                type="button"
                onClick={handleNextYear}
                disabled={selectedYear >= getCurrentYearNum()}
                title="Next Year"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: selectedYear >= getCurrentYearNum() ? 'rgba(20, 5, 8, 0.3)' : 'rgba(20, 5, 8, 0.7)',
                  color: selectedYear >= getCurrentYearNum() ? 'rgba(255, 255, 255, 0.2)' : '#fdf2e3',
                  cursor: selectedYear >= getCurrentYearNum() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
