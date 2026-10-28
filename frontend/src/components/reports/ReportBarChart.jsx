import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * ReportBarChart Component
 * Renders a responsive bar chart (standard or stacked) matching the SMIS dark maroon theme.
 */
const ReportBarChart = ({
  data = [],
  type = 'standard', // 'standard' | 'stacked'
  metricKey = 'value',
  labelKey = 'label',
  barLabel = 'Value',
  barColor = 'rgba(225, 29, 72, 0.85)',
  hoverColor = 'rgba(225, 29, 72, 1)',
  stackedDatasets = null, // Array of { key, label, color, hoverColor }
  loading = false,
  emptyMessage = 'No data for the selected period.',
  formatValue = (val) => val,
  height = 280,
  onBarClick = null,
  noRotateLabels = false,
  showZeroAxis = false
}) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  // Check if data is completely empty (all zeroes or 0 length)
  const isAllZero = () => {
    if (!data || data.length === 0) return true;
    if (showZeroAxis) return false;
    if (type === 'stacked' && stackedDatasets) {
      return data.every((row) =>
        stackedDatasets.every((ds) => Number(row[ds.key] || 0) === 0)
      );
    }
    return data.every((row) => Number(row[metricKey] || 0) === 0);
  };

  const empty = isAllZero();

  useEffect(() => {
    if (!canvasRef.current || loading || !data || data.length === 0 || empty) return;

    const ctx = canvasRef.current.getContext('2d');
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = data.map((d) => d[labelKey] || d.bucket_key || '');

    let datasets = [];

    if (type === 'stacked' && stackedDatasets) {
      datasets = stackedDatasets.map((ds) => ({
        label: ds.label,
        data: data.map((d) => Number(d[ds.key] || 0)),
        backgroundColor: ds.color,
        hoverBackgroundColor: ds.hoverColor || ds.color,
        borderRadius: 4,
        stack: 'combined',
        maxBarThickness: 36
      }));
    } else {
      datasets = [
        {
          label: barLabel,
          data: data.map((d) => Number(d[metricKey] || 0)),
          backgroundColor: barColor,
          hoverBackgroundColor: hoverColor,
          borderRadius: 4,
          maxBarThickness: 44
        }
      ];
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400
        },
        onClick: (event, elements, chart) => {
          if (!onBarClick) return;
          const pts =
            elements && elements.length > 0
              ? elements
              : chart.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
          if (pts && pts.length > 0) {
            const idx = pts[0].index;
            if (data[idx]) {
              onBarClick(data[idx], idx);
            }
          }
        },
        onHover: (event, chartElement, chart) => {
          if (!event.native?.target) return;
          if (!onBarClick) {
            event.native.target.style.cursor = 'default';
            return;
          }
          const pts =
            chartElement && chartElement.length > 0
              ? chartElement
              : chart.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
          event.native.target.style.cursor = pts && pts.length > 0 ? 'pointer' : 'default';
        },
        plugins: {
          legend: {
            display: type === 'stacked',
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              color: '#fdf2e3',
              font: { size: 11, weight: '600' },
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 10, 14, 0.95)',
            borderColor: 'rgba(225, 29, 72, 0.4)',
            borderWidth: 1,
            titleColor: '#fdf2e3',
            bodyColor: '#e5d5c3',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              title: (items) => {
                const idx = items[0]?.dataIndex;
                return data[idx]?.[labelKey] || items[0]?.label || '';
              },
              label: (context) => {
                const val = context.raw || 0;
                const formatted = formatValue(val);
                return ` ${context.dataset.label}: ${formatted}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: type === 'stacked',
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11 },
              color: '#e5d5c3',
              maxRotation: noRotateLabels ? 0 : 45,
              minRotation: 0
            }
          },
          y: {
            stacked: type === 'stacked',
            beginAtZero: true,
            suggestedMax: 10,
            grid: {
              color: 'rgba(255, 255, 255, 0.08)'
            },
            ticks: {
              font: { size: 11 },
              color: '#e5d5c3',
              callback: (val) => {
                if (typeof val === 'number') {
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return val;
                }
                return val;
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
  }, [
    data,
    empty,
    loading,
    type,
    metricKey,
    labelKey,
    barLabel,
    barColor,
    hoverColor,
    stackedDatasets,
    formatValue,
    onBarClick,
    noRotateLabels
  ]);

  if (loading) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', color: '#e5d5c3' }}>Loading chart data...</span>
      </div>
    );
  }

  if (empty) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e5d5c3',
          fontSize: '14px',
          background: 'rgba(0,0,0,0.15)',
          borderRadius: '8px',
          border: '1px dashed rgba(255,255,255,0.1)'
        }}
      >
        <span style={{ opacity: 0.85 }}>{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ReportBarChart;
