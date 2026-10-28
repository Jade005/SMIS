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
  Trash2
} from 'lucide-react';

const formatDateYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayStr = () => formatDateYMD(new Date());

const getCurrentYearNum = () => new Date().getFullYear();
const getCurrentMonthNum = () => new Date().getMonth() + 1;

const VIEW_BY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const getYearOptions = () => {
  const curY = new Date().getFullYear();
  const startY = 2023; // from earliest year with sales data (or 2023)
  const years = [];
  for (let y = curY; y >= startY; y--) {
    years.push(y);
  }
  return years;
};

const YEAR_OPTIONS = getYearOptions();

const YEAR_SELECT_OPTIONS = [
  { value: 'all', label: 'All Years' },
  ...YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))
];

const buildYearlyOverviewFromReport = (rawReport) => {
  if (!rawReport) return null;
  const startY = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] || 2023;
  const endY = YEAR_OPTIONS[0] || getCurrentYearNum();
  const years = [];
  for (let y = startY; y <= endY; y++) {
    years.push(y);
  }

  const rawBuckets = Array.isArray(rawReport.chartData) ? rawReport.chartData : [];
  const yearMap = {};
  for (const y of years) {
    yearMap[String(y)] = { revenue: 0, volume_kg: 0, transactions_count: 0 };
  }

  for (const b of rawBuckets) {
    const keyStr = String(b.key || b.bucket_key || b.label || '');
    const yMatch = keyStr.match(/^(\d{4})/);
    if (yMatch) {
      const yKey = yMatch[1];
      if (!yearMap[yKey]) {
        yearMap[yKey] = { revenue: 0, volume_kg: 0, transactions_count: 0 };
      }
      yearMap[yKey].revenue += Number(b.revenue) || 0;
      yearMap[yKey].volume_kg += Number(b.volume_kg) || 0;
      yearMap[yKey].transactions_count += Number(b.transactions_count) || 0;
    }
  }

  // Fallback to transactions list if chartData had no transaction counts
  if (
    Array.isArray(rawReport.transactions) &&
    Object.values(yearMap).every((v) => v.transactions_count === 0) &&
    rawReport.transactions.length > 0
  ) {
    for (const t of rawReport.transactions) {
      if (!t.created_at) continue;
      const yKey = String(new Date(t.created_at).getFullYear());
      if (yearMap[yKey]) {
        yearMap[yKey].transactions_count += 1;
      }
    }
  }

  const chartData = years.map((y) => {
    const yKey = String(y);
    const entry = yearMap[yKey] || { revenue: 0, volume_kg: 0, transactions_count: 0 };
    return {
      key: yKey,
      label: yKey,
      revenue: entry.revenue,
      volume_kg: entry.volume_kg,
      transactions_count: entry.transactions_count
    };
  });

  const yearComparison = chartData.map((b, idx) => {
    const rev = Number(b.revenue) || 0;
    const tx = Number(b.transactions_count) || 0;
    const vol = Number(b.volume_kg) || 0;
    const avg = tx > 0 ? rev / tx : 0;
    let growth_percent = null;
    if (idx > 0) {
      const prevRev = Number(chartData[idx - 1].revenue) || 0;
      if (prevRev > 0) {
        growth_percent = ((rev - prevRev) / prevRev) * 100;
      } else if (rev > 0) {
        growth_percent = 100;
      } else {
        growth_percent = null;
      }
    }
    return {
      year: Number(b.key),
      label: b.label,
      total_revenue: rev,
      total_transactions: tx,
      average_transaction_value: avg,
      total_volume_kg: vol,
      growth_percent
    };
  });

  return {
    ...rawReport,
    granularity: 'yearly',
    chartData,
    yearComparison
  };
};

const buildYearlyBucketsGeneric = (rawReport, metricKeys = []) => {
  if (!rawReport || !Array.isArray(rawReport.chartData)) return rawReport;
  const startY = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] || 2023;
  const endY = YEAR_OPTIONS[0] || getCurrentYearNum();
  const years = [];
  for (let y = startY; y <= endY; y++) {
    years.push(y);
  }

  const yearMap = {};
  for (const y of years) {
    const initObj = {};
    for (const k of metricKeys) initObj[k] = 0;
    yearMap[String(y)] = initObj;
  }

  for (const b of rawReport.chartData) {
    const keyStr = String(b.key || b.bucket_key || b.label || '');
    const yMatch = keyStr.match(/^(\d{4})/);
    if (yMatch && yearMap[yMatch[1]]) {
      for (const k of metricKeys) {
        yearMap[yMatch[1]][k] += Number(b[k]) || 0;
      }
    }
  }

  const chartData = years.map((y) => {
    const yKey = String(y);
    return {
      key: yKey,
      label: yKey,
      ...yearMap[yKey]
    };
  });

  return {
    ...rawReport,
    granularity: 'yearly',
    chartData
  };
};

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

const formatPeso = (val) =>
  `₱${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatWeight = (val, decimals = 2) =>
  `${Number(val || 0).toFixed(decimals)} kg`;

/**
 * Merged Reports & Analytics Page
 * Contains 5 tabs: Sales Report, Inventory Report, Expiry Report, Suppliers Report, Disposed / Wasted Stock.
 * Each report tab follows the shared date filter.
 */
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  // Shared Date Filter State
  // viewBy controls the "View by" dropdown ('daily' | 'monthly' | 'yearly')
  // granularity controls the API bucket grouping ('daily' | 'monthly' | 'yearly')
  const [viewBy, setViewBy] = useState('daily');
  const [granularity, setGranularity] = useState('daily');
  const initialDaily = getDailyPresetRange('last14');
  const [fromDate, setFromDate] = useState(initialDaily.from);
  const [toDate, setToDate] = useState(initialDaily.to);

  // Active preset state: 'today' | 'yesterday' | 'last7' | 'last14' | 'last30' | 'custom' | null
  // Default on page load: Last 14 Days preset active, with the Custom dropdowns showing the current month and year.
  const [activePreset, setActivePreset] = useState('last14');

  // Custom month & year dropdown states: default to current month and year (e.g. October 2026)
  // When in All Years overview, customYear is 'all' and customMonth is 'all'.
  const [customMonth, setCustomMonth] = useState(() => String(getCurrentMonthNum()));
  const [customYear, setCustomYear] = useState(() => String(getCurrentYearNum()));

  // Sales metric toggle: 'revenue' | 'volume'
  const [salesMetric, setSalesMetric] = useState('revenue');

  // Data states
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState({ summary: {}, chartData: [], batches: [] });
  const [expiryReport, setExpiryReport] = useState({ summary: {}, chartData: [], batches: [] });
  const [supplierReport, setSupplierReport] = useState({ summary: {}, chartData: [], suppliers: [] });
  const [disposals, setDisposals] = useState([]);

  const earliestYear = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] || 2023;
  const latestYear = YEAR_OPTIONS[0] || getCurrentYearNum();
  const allYearsRangeLabel = `(${earliestYear} - ${latestYear})`;

  const isYearlyOverview = granularity === 'yearly' && customYear === 'all';
  const isSingleYearDetail = customYear !== 'all' && customMonth === 'all' && activePreset === 'custom';

  // Helper to compute date range & granularity from Custom Month + Year selection
  const getCustomRange = (mVal, yVal) => {
    const nowDate = new Date();
    const curY = nowDate.getFullYear();
    const curM = nowDate.getMonth() + 1;
    const curD = nowDate.getDate();

    if (yVal === 'all') {
      const startYear = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] || 2023;
      return {
        from: `${startYear}-01-01`,
        to: formatDateYMD(nowDate),
        granularity: 'yearly'
      };
    }

    const y = Number(yVal);
    if (mVal === 'all') {
      // "All Months" + single Year selected: range = Jan 1 to Dec 31 (or today if current year)
      // Granularity = 'monthly' -> groups by month ('%Y-%m'), 1 bar per month (Jan-Dec)
      const from = `${y}-01-01`;
      const to = y === curY ? formatDateYMD(nowDate) : `${y}-12-31`;
      return {
        from,
        to,
        granularity: 'monthly'
      };
    } else {
      // Specific Month + single Year selected: range = 1st to last day of that month (or today if current month)
      // Granularity = 'daily' -> groups by day, 1 bar per day in that month
      const m = Number(mVal);
      const from = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      let endDay = lastDay;
      if (y === curY && m === curM) {
        endDay = Math.min(lastDay, curD);
      }
      const to = `${y}-${String(m).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
      return {
        from,
        to,
        granularity: 'daily'
      };
    }
  };

  // Granularity ("View by") change handler:
  // - Daily: one bar per day (defaults to Last 14 Days preset & current month/year in Custom)
  // - Monthly: one bar per month for the selected year (or current year if All Years was active)
  // - Yearly: All Years overview (one bar per year: 2023..currentYear, Custom Year = All Years, Month = All Months disabled)
  const handleGranularityChange = (newGran) => {
    setViewBy(newGran);
    if (newGran === 'daily') {
      setGranularity('daily');
      setActivePreset('last14');
      setCustomMonth(String(getCurrentMonthNum()));
      setCustomYear(String(getCurrentYearNum()));
      const r = getDailyPresetRange('last14');
      setFromDate(r.from);
      setToDate(r.to);
    } else if (newGran === 'monthly') {
      const targetYear =
        customYear === 'all' ? String(getCurrentYearNum()) : String(customYear);
      setGranularity('monthly');
      setActivePreset('custom');
      setCustomMonth('all');
      setCustomYear(targetYear);
      const r = getCustomRange('all', targetYear);
      setFromDate(r.from);
      setToDate(r.to);
    } else if (newGran === 'yearly') {
      setGranularity('yearly');
      setActivePreset('custom');
      setCustomMonth('all');
      setCustomYear('all');
      const startYear = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] || 2023;
      setFromDate(`${startYear}-01-01`);
      setToDate(getTodayStr());
    }
  };

  const handleDailyPreset = (preset) => {
    setActivePreset(preset);
    setViewBy('daily');
    setGranularity('daily');
    const r = getDailyPresetRange(preset);
    setFromDate(r.from);
    setToDate(r.to);
    // Reset custom dropdowns to their default state (current month & year)
    setCustomMonth(String(getCurrentMonthNum()));
    setCustomYear(String(getCurrentYearNum()));
  };

  // Drill into a single year (from clicking a year bar, a Year Comparison table row, or the Year dropdown)
  const handleSelectSingleYear = (yearVal) => {
    const yStr = String(yearVal);
    setActivePreset('custom');
    setCustomYear(yStr);
    setCustomMonth('all');
    const r = getCustomRange('all', yStr);
    setGranularity(r.granularity);
    setFromDate(r.from);
    setToDate(r.to);
  };

  const handleReturnToAllYears = () => {
    handleGranularityChange('yearly');
  };

  const handleCustomMonthChange = (newMonth) => {
    if (customYear === 'all') return;
    setActivePreset('custom');
    setCustomMonth(newMonth);
    const r = getCustomRange(newMonth, customYear);
    setGranularity(r.granularity);
    if (newMonth !== 'all') {
      setViewBy('daily');
    } else if (viewBy === 'daily') {
      setViewBy('monthly');
    }
    setFromDate(r.from);
    setToDate(r.to);
  };

  const handleCustomYearChange = (newYear) => {
    if (newYear === 'all') {
      handleGranularityChange('yearly');
      return;
    }
    const yStr = String(newYear);
    setActivePreset('custom');
    setCustomYear(yStr);

    // If coming from All Years overview (or All Months), show monthly chart for that single year
    const effectiveMonth = customYear === 'all' ? 'all' : customMonth;
    setCustomMonth(effectiveMonth);
    const r = getCustomRange(effectiveMonth, yStr);
    setGranularity(r.granularity);
    setFromDate(r.from);
    setToDate(r.to);
  };

  // Fetch report for the currently active tab and filter
  const fetchReportData = useCallback(() => {
    setLoading(true);
    const params = {
      granularity,
      from: fromDate,
      to: toDate,
      start_date: fromDate,
      end_date: toDate
    };

    // Pass explicit year & month when a single custom year is selected so backend scopes strictly to that year
    if (activePreset === 'custom' && customYear !== 'all') {
      params.year = customYear;
      params.month = customMonth;
    }

    if (activeTab === 'sales') {
      getSalesReportApi(params)
        .then((res) => {
          const data = res.data || null;
          if (data && granularity === 'yearly' && customYear === 'all') {
            setSalesReport(buildYearlyOverviewFromReport(data));
          } else {
            setSalesReport(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'inventory') {
      getInventoryReportApi(params)
        .then((res) => {
          const data = res.data || { summary: {}, chartData: [], batches: [] };
          setInventoryReport(
            granularity === 'yearly' && customYear === 'all'
              ? buildYearlyBucketsGeneric(data, ['received_kg', 'batches_count'])
              : data
          );
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'expiry') {
      getExpiryReportApi(params)
        .then((res) => {
          const data = res.data || { summary: {}, chartData: [], batches: [] };
          setExpiryReport(
            granularity === 'yearly' && customYear === 'all'
              ? buildYearlyBucketsGeneric(data, ['expired', 'expiring_7d', 'expiring_30d', 'safe', 'total_batches'])
              : data
          );
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'suppliers') {
      getSupplierReportApi(params)
        .then((res) => {
          const data = res.data || { summary: {}, chartData: [], suppliers: [] };
          setSupplierReport(
            granularity === 'yearly' && customYear === 'all'
              ? buildYearlyBucketsGeneric(data, ['supply_volume_kg', 'batches_count'])
              : data
          );
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'disposals') {
      getDisposalsApi()
        .then((res) => setDisposals(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab, granularity, fromDate, toDate, activePreset, customYear, customMonth]);

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

      {/* ── Shared Filter Bar (All Report Tabs) ── */}
      <div className="report-filter-bar">
        {/* View By Dropdown: Daily / Monthly / Yearly */}
        <div className="report-filter-viewby">
          <span
            style={{
              fontSize: '13px',
              color: '#e5d5c3',
              fontWeight: '700',
              whiteSpace: 'nowrap'
            }}
          >
            View by:
          </span>
          <select
            aria-label="View by"
            value={viewBy}
            onChange={(e) => handleGranularityChange(e.target.value)}
            autoComplete="off"
            className="report-filter-select"
          >
            {VIEW_BY_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  background: '#1B0709',
                  color: '#ffffff'
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Presets (Hidden when View by = Yearly so they never conflict with the year view) */}
        {viewBy !== 'yearly' && (
          <div className="report-filter-presets">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'last14', label: 'Last 14 Days' },
              { id: 'last30', label: 'Last 30 Days' }
            ].map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDailyPreset(p.id)}
                  style={{
                    border: isSelected
                      ? '1px solid var(--primary-admin, #be123c)'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    background: isSelected
                      ? 'var(--primary-admin, #be123c)'
                      : 'rgba(20, 5, 8, 0.65)',
                    color: isSelected ? '#ffffff' : '#d9c7b5',
                    fontWeight: '700',
                    fontSize: '11px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 10px rgba(190, 18, 60, 0.4)' : 'none'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Month + Year Dropdowns */}
        <div
          className="report-filter-custom"
          style={{
            border: activePreset === 'custom'
              ? '1px solid var(--primary-admin, #be123c)'
              : '1px solid rgba(255, 255, 255, 0.12)',
            background: activePreset === 'custom'
              ? 'rgba(190, 18, 60, 0.28)'
              : 'rgba(20, 5, 8, 0.65)',
            boxShadow: activePreset === 'custom'
              ? '0 0 12px rgba(190, 18, 60, 0.35)'
              : 'none'
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: activePreset === 'custom' ? '#ffffff' : '#e5d5c3',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}
          >
            Custom:
          </span>

          {/* Month Dropdown (Disabled when Year = All Years) */}
          <select
            value={customMonth}
            onChange={(e) => handleCustomMonthChange(e.target.value)}
            disabled={customYear === 'all'}
            autoComplete="off"
            className="report-filter-select"
            style={{
              color: activePreset === 'custom' ? '#ffffff' : '#fdf2e3',
              borderColor: activePreset === 'custom'
                ? 'rgba(225, 29, 72, 0.6)'
                : 'rgba(255, 255, 255, 0.15)',
              opacity: customYear === 'all' ? 0.45 : 1,
              cursor: customYear === 'all' ? 'not-allowed' : 'pointer'
            }}
            aria-label="Select custom month"
            title={
              customYear === 'all'
                ? 'Select a specific year first to filter by month'
                : 'Select custom month'
            }
          >
            {MONTH_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  background: '#1B0709',
                  color: '#ffffff'
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Year Dropdown (Includes "All Years" at the top) */}
          <select
            value={String(customYear)}
            onChange={(e) => handleCustomYearChange(e.target.value)}
            autoComplete="off"
            className="report-filter-select"
            style={{
              color: activePreset === 'custom' ? '#ffffff' : '#fdf2e3',
              borderColor: activePreset === 'custom'
                ? 'rgba(225, 29, 72, 0.6)'
                : 'rgba(255, 255, 255, 0.15)'
            }}
            aria-label="Select custom year"
          >
            {YEAR_SELECT_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{ background: '#1B0709', color: '#ffffff' }}
              >
                {opt.label}
              </option>
            ))}
          </select>
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
              <div className="kpi-label">
                TOTAL REVENUE
                {isYearlyOverview
                  ? ` ${allYearsRangeLabel}`
                  : isSingleYearDetail
                    ? ` (${customYear})`
                    : ''}
              </div>
              <div className="kpi-value" style={{ color: 'var(--primary-admin, #f43f5e)' }}>
                {formatPeso(salesReport?.summary?.total_revenue)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">
                TOTAL TRANSACTIONS
                {isYearlyOverview
                  ? ` ${allYearsRangeLabel}`
                  : isSingleYearDetail
                    ? ` (${customYear})`
                    : ''}
              </div>
              <div className="kpi-value">
                {salesReport?.summary?.total_transactions || 0}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">
                AVG TRANSACTION VALUE
                {isYearlyOverview
                  ? ` ${allYearsRangeLabel}`
                  : isSingleYearDetail
                    ? ` (${customYear})`
                    : ''}
              </div>
              <div className="kpi-value">
                {formatPeso(salesReport?.summary?.average_transaction_value)}
              </div>
            </div>
          </div>

          {/* 2. ONE Single Bar Graph: Sales Over Time */}
          <div className="card" style={{ marginBottom: 0, width: '100%' }}>
            {/* Single-Year Breadcrumb ("All Years > 2026") */}
            {isSingleYearDetail && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '10px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(20, 5, 8, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  width: 'fit-content'
                }}
              >
                <button
                  type="button"
                  onClick={handleReturnToAllYears}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-admin, #f43f5e)',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px'
                  }}
                >
                  All Years
                </button>
                <span style={{ color: '#a89886' }}>&gt;</span>
                <span style={{ color: '#fdf2e3' }}>{customYear}</span>
              </div>
            )}

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
                  {isYearlyOverview
                    ? ` ${allYearsRangeLabel}`
                    : isSingleYearDetail
                      ? ` (${customYear})`
                      : ''}
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
              noRotateLabels={granularity === 'yearly' || granularity === 'monthly'}
              showZeroAxis={granularity === 'yearly' || granularity === 'monthly'}
              onBarClick={
                isYearlyOverview
                  ? (item) => handleSelectSingleYear(item.key || item.label)
                  : null
              }
            />
          </div>

          {/* 2b. Year Comparison Table (Shown under the chart in Yearly Overview) */}
          {isYearlyOverview && (
            <div className="card" style={{ marginBottom: 0 }}>
              <div
                className="card-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="var(--primary-admin, #f43f5e)" />
                  Year Comparison
                </span>
                <span style={{ fontSize: '11px', color: '#c9b4a6', fontWeight: '600' }}>
                  Click a year row or bar to view monthly details
                </span>
              </div>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>YEAR</th>
                      <th>TOTAL REVENUE</th>
                      <th>TOTAL TRANSACTIONS</th>
                      <th>AVG TRANSACTION VALUE</th>
                      <th>VOLUME (KG)</th>
                      <th>GROWTH %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(salesReport?.yearComparison || []).map((row, idx) => {
                      const isFirst = idx === 0;
                      const g = row.growth_percent;
                      return (
                        <tr
                          key={row.year}
                          onClick={() => handleSelectSingleYear(row.year)}
                          style={{ cursor: 'pointer' }}
                          title={`Click to view ${row.year} monthly breakdown`}
                        >
                          <td>
                            <strong style={{ color: '#fdf2e3' }}>{row.year}</strong>
                          </td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary-admin, #f43f5e)' }}>
                            {formatPeso(row.total_revenue)}
                          </td>
                          <td>{row.total_transactions}</td>
                          <td>{formatPeso(row.average_transaction_value)}</td>
                          <td>{formatWeight(row.total_volume_kg, 2)}</td>
                          <td>
                            {isFirst || g === null || g === undefined ? (
                              <span style={{ color: '#a89886' }}>-</span>
                            ) : g > 0 ? (
                              <span style={{ color: '#10b981', fontWeight: '700' }}>
                                ▲ +{g.toFixed(1)}%
                              </span>
                            ) : g < 0 ? (
                              <span style={{ color: '#ef4444', fontWeight: '700' }}>
                                ▼ {g.toFixed(1)}%
                              </span>
                            ) : (
                              <span style={{ color: '#a89886', fontWeight: '600' }}>0.0%</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Top Selling Meat Cuts Table */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--warning, #eab308)" />
                Top Selling Meat Cuts Summary
                {isYearlyOverview
                  ? ` ${allYearsRangeLabel}`
                  : isSingleYearDetail
                    ? ` (${customYear})`
                    : ''}
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
              noRotateLabels={granularity === 'yearly' || granularity === 'monthly'}
              showZeroAxis={granularity === 'yearly' || granularity === 'monthly'}
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
              noRotateLabels={granularity === 'yearly' || granularity === 'monthly'}
              showZeroAxis={granularity === 'yearly' || granularity === 'monthly'}
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
              noRotateLabels={granularity === 'yearly' || granularity === 'monthly'}
              showZeroAxis={granularity === 'yearly' || granularity === 'monthly'}
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
