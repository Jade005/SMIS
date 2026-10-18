import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { groupUnderThreshold } from './chartConstants';

/**
 * DonutChart / PieChart Component
 * Renders a Chart.js pie or donut chart with optional center label (for donuts),
 * responsive layout, custom legend with exact percentages, and clean hover tooltips.
 */
const DonutChart = ({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  title = '',
  centerValue = '',
  centerLabel = 'Grand Total',
  isDoughnut = true,
  formatValue = (v) => v,
  loading = false,
  emptyMessage = 'No data for this period',
  legendPosition = 'right', // 'right' | 'bottom'
  thresholdPercent = 3,
  fullWidth = false,
  chartSize = null
}) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  const { items, total } = groupUnderThreshold(data, valueKey, labelKey, thresholdPercent);
  const chartItems = items.filter((i) => i.value > 0);

  useEffect(() => {
    if (!canvasRef.current || loading || chartItems.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: isDoughnut ? 'doughnut' : 'pie',
      data: {
        labels: chartItems.map((i) => i.label),
        datasets: [
          {
            data: chartItems.map((i) => i.value),
            backgroundColor: chartItems.map((i) => i.color),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: isDoughnut ? '70%' : '0%',
        animation: {
          duration: 600
        },
        plugins: {
          legend: {
            display: false // Custom legend used for precise layout
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const val = context.raw || 0;
                const match = items.find((i) => i.label === label);
                const pct = match ? match.percentDisplay : `${total > 0 ? ((val / total) * 100).toFixed(1) : 0}%`;
                const formatted = formatValue ? formatValue(val) : val;
                return ` ${label}: ${formatted} (${pct})`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [items, chartItems, total, isDoughnut, loading]);

  if (loading) {
    return (
      <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '4px solid #f1f5f9',
          borderTopColor: 'var(--primary-admin)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Loading chart data...</span>
      </div>
    );
  }

  if (items.length === 0 || total === 0) {
    return (
      <div style={{
        height: fullWidth ? '260px' : '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        color: '#64748b',
        background: '#f8fafc',
        borderRadius: '10px',
        border: '1px dashed #cbd5e1',
        margin: '12px 0',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        </div>
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#334155' }}>
          {emptyMessage}
        </span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          No transactions recorded for the selected timeframe. Try switching the period dropdown.
        </span>
      </div>
    );
  }

  const isStacked = legendPosition === 'bottom';
  const size = chartSize || (fullWidth ? 260 : 200);

  return (
    <div style={{
      display: 'flex',
      flexDirection: isStacked ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: fullWidth ? '48px' : '24px',
      padding: fullWidth ? '16px 20px' : '8px 0',
      minHeight: fullWidth ? '280px' : '250px',
      flexWrap: 'wrap',
      width: '100%'
    }}>
      {/* Canvas Box */}
      <div style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0
      }}>
        <canvas ref={canvasRef} />

        {/* Center Grand Total (ONLY for Doughnuts) */}
        {isDoughnut && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: `${Math.round(size * 0.65)}px`,
            padding: '0 4px'
          }}>
            <div style={{
              fontSize: '10px',
              color: '#64748b',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '2px'
            }}>
              {centerLabel}
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '800',
              color: '#0f172a',
              lineHeight: '1.2'
            }}>
              {centerValue || (formatValue ? formatValue(total) : total)}
            </div>
          </div>
        )}
      </div>

      {/* Custom Legend */}
      <div style={{
        flex: fullWidth ? '1 1 320px' : 1,
        width: '100%',
        maxWidth: isStacked ? '100%' : (fullWidth ? '420px' : '260px'),
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: fullWidth ? '280px' : '220px',
        overflowY: 'auto',
        paddingRight: '6px'
      }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '12px',
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              transition: 'background-color 0.15s ease',
              opacity: item.value === 0 ? 0.6 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0,
                boxShadow: `0 0 0 2px ${item.color}22`
              }} />
              <span style={{
                fontWeight: '600',
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>
                {formatValue ? formatValue(item.value) : item.value}
              </span>
              <span style={{
                fontWeight: '700',
                color: item.value > 0 ? '#0f172a' : '#94a3b8',
                minWidth: '45px',
                textAlign: 'right',
                fontSize: '12px',
                background: item.value > 0 ? '#ffffff' : 'transparent',
                padding: '2px 6px',
                borderRadius: '4px',
                border: item.value > 0 ? '1px solid #e2e8f0' : 'none'
              }}>
                {item.percentDisplay}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
