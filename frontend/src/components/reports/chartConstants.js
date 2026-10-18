/**
 * Shared color constants and helpers for Reports & Analytics charts.
 * Maintains brand consistency across all pie/donut and trend charts.
 */

// Consistent color per meat category across all charts
export const MEAT_CATEGORY_COLORS = {
  Beef: '#ef4444',     // Red
  Pork: '#ec4899',     // Pink
  Goat: '#f59e0b',     // Amber
  Chicken: '#eab308',  // Yellow
  Rabbit: '#a855f7',   // Purple
  Others: '#94a3b8'    // Slate Gray
};

// Stock and Expiry status colors
export const STATUS_COLORS = {
  // Inventory status
  available: '#10b981',    // Green (In Stock)
  'In Stock': '#10b981',
  low: '#f59e0b',          // Amber (Low Stock)
  'Low Stock': '#f59e0b',
  depleted: '#ef4444',     // Red (Out of Stock)
  'Out of Stock': '#ef4444',

  // Expiry status
  Valid: '#10b981',        // Green (Fresh)
  Fresh: '#10b981',
  'Expiring Soon': '#f59e0b', // Amber
  Expired: '#ef4444',       // Red

  Others: '#94a3b8'
};

// Default high-contrast palette for suppliers & best sellers
export const GENERAL_PALETTE = [
  '#ea580c', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
  '#ec4899', '#06b6d4', '#64748b', '#14b8a6', '#f97316'
];

/**
 * Resolves color for a slice based on category, status, or fallback index
 */
export const resolveColor = (label, index = 0) => {
  if (label === 'Others') return '#94a3b8';
  if (MEAT_CATEGORY_COLORS[label]) return MEAT_CATEGORY_COLORS[label];
  if (STATUS_COLORS[label]) return STATUS_COLORS[label];
  return GENERAL_PALETTE[index % GENERAL_PALETTE.length];
};

/**
 * Groups any slice under thresholdPercent (default: 3%) into "Others"
 */
export function groupUnderThreshold(
  dataItems = [],
  valueKey = 'value',
  labelKey = 'label',
  thresholdPercent = 3
) {
  const total = dataItems.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
  if (total <= 0) return { items: [], total: 0 };

  let regular = [];
  let othersSum = 0;

  if (thresholdPercent <= 0) {
    // Keep all items intact, including items with 0 value
    regular = dataItems.map((item) => {
      const val = Math.max(0, Number(item[valueKey]) || 0);
      return {
        label: item[labelKey],
        value: val,
        rawPct: total > 0 ? (val / total) * 100 : 0,
        original: item
      };
    });
  } else {
    dataItems.forEach((item) => {
      const val = Number(item[valueKey]) || 0;
      if (val <= 0) return;
      const pct = (val / total) * 100;
      if (pct < thresholdPercent) {
        othersSum += val;
      } else {
        regular.push({
          label: item[labelKey],
          value: val,
          rawPct: pct,
          original: item
        });
      }
    });

    if (othersSum > 0) {
      regular.push({
        label: 'Others',
        value: othersSum,
        rawPct: (othersSum / total) * 100,
        isOthers: true
      });
    }
  }

  // Calculate formatted percentages with Largest Remainder Method (Hare-Niemeyer)
  // so that the 1-decimal-place numbers add up to exactly 100.0%
  const nonZeroItems = regular.filter((r) => r.value > 0);
  const scaled = nonZeroItems.map((item, idx) => {
    const raw = (item.value / total) * 100;
    const x = raw * 10;
    const floor = Math.floor(x);
    return {
      idx,
      floor,
      rem: x - floor
    };
  });

  const sumFloor = scaled.reduce((acc, s) => acc + s.floor, 0);
  const diff = Math.max(0, 1000 - sumFloor);
  const sorted = [...scaled].sort((a, b) => b.rem - a.rem);
  for (let k = 0; k < diff && k < sorted.length; k++) {
    sorted[k].floor += 1;
  }

  const assignedMap = new Map();
  scaled.forEach((s) => {
    assignedMap.set(s.idx, (s.floor / 10).toFixed(1));
  });

  let nonZeroCount = 0;
  const items = regular.map((r, idx) => {
    let pctDisplay = '0.0';
    if (r.value > 0) {
      pctDisplay = assignedMap.get(nonZeroCount) || ((r.value / total) * 100).toFixed(1);
      nonZeroCount++;
    }
    return {
      ...r,
      percent: parseFloat(pctDisplay),
      percentDisplay: `${pctDisplay}%`,
      color: r.isOthers ? '#94a3b8' : resolveColor(r.label, idx)
    };
  });

  return { items, total };
}
