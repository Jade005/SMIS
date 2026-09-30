import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { groupUnderThreshold } from './chartConstants';

/**
 * DonutChart / PieChart Component
 * Renders a Chart.js pie or donut chart with grand total in the center,
 * a custom legend with values & percentage shares, and 3% threshold grouping.
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
  legendPosition = 'right' // 'right' | 'bottom'
}) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  const { items, total } = groupUnderThreshold(data, valueKey, labelKey, 3);

  useEffect(() => {
    if (!canvasRef.current || loading || items.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: isDoughnut ? 'doughnut' : 'pie',
      data: {
        labels: items.map((i) => i.label),
        datasets: [
          {
            data: items.map((i) => i.value),
            backgroundColor: items.map((i) => i.color),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 6
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
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: {
              label: function (context) {
                const val = context.raw || 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                const formatted = formatValue ? formatValue(val) : val;
                return ` ${context.label}: ${formatted} (${pct}%)`;
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
  }, [items, total, isDoughnut, loading]);

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
      <div style={{ height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8' }}>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>{emptyMessage}</span>
      </div>
    );
  }

  const isStacked = legendPosition === 'bottom';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isStacked ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '8px 0',
      minHeight: '250px'
    }}>
      {/* Canvas Box */}
      <div style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        flexShrink: 0
      }}>
        <canvas ref={canvasRef} />

        {/* Center Grand Total (for Doughnuts) */}
        {isDoughnut && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: '130px',
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
        flex: 1,
        width: '100%',
        maxWidth: isStacked ? '100%' : '260px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '220px',
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
              gap: '10px',
              fontSize: '12px',
              padding: '4px 6px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #f1f5f9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ color: '#64748b', fontSize: '11px' }}>
                {formatValue ? formatValue(item.value) : item.value}
              </span>
              <span style={{
                fontWeight: '700',
                color: '#0f172a',
                minWidth: '40px',
                textAlign: 'right',
                fontSize: '11px'
              }}>
                {item.percent.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
