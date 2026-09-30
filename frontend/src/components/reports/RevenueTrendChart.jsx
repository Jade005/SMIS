import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * RevenueTrendChart Component
 * Renders a bar/line chart for daily revenue time-series data.
 */
const RevenueTrendChart = ({ data = [], loading = false }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || loading || data.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = data.map((d) => {
      const parts = (d.date || '').split('-');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}`; // MM/DD
      }
      return d.date;
    });

    const values = data.map((d) => Number(d.daily_revenue || 0));

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily Revenue',
            data: values,
            backgroundColor: 'rgba(22, 163, 74, 0.75)',
            hoverBackgroundColor: 'rgba(22, 163, 74, 1)',
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 32
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              title: (items) => {
                const idx = items[0]?.dataIndex;
                return data[idx]?.date || items[0]?.label;
              },
              label: (context) => {
                const val = context.raw || 0;
                const idx = context.dataIndex;
                const count = data[idx]?.total_sales_count || 0;
                return [
                  ` Revenue: ₱${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  ` Transactions: ${count} sale(s)`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11 },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9'
            },
            ticks: {
              font: { size: 11 },
              color: '#64748b',
              callback: (val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
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
  }, [data, loading]);

  if (loading) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Loading revenue trends...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
        No revenue trends recorded for this period
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '240px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default RevenueTrendChart;
