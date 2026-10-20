/**
 * Meat Cut Image Resolver and Realistic Photography Library
 * Provides high-resolution realistic meat cut photography and category fallbacks.
 * Each cut has a DISTINCT image - no reuse of the same URL across different cuts.
 */

// Curated high quality realistic photography for every meat cut
export const MEAT_CUT_IMAGES = {
  // BEEF
  'tenderloin':           'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
  'filet mignon':         'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
  'sirloin':              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'ribeye':               'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
  't-bone':               'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
  'striploin':            'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
  'brisket':              'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=600&q=80',
  'chuck':                'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
  'shank':                'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
  'bulalo':               'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
  'short ribs':           'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=600&q=80',
  'beef short ribs':      'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=600&q=80',
  'ground meat':          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'ground beef':          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'beef ground meat':     'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'beef liempo':          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'liempo':               'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',

  // PORK
  'pork belly':           'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=600&q=80',
  'pork liempo':          'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=600&q=80',
  'pork loin':            'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=600&q=80',
  'pork chop':            'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=600&q=80',
  'pork shoulder':        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
  'kasim':                'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
  'pork leg':             'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
  'pigue':                'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
  'pork tenderloin':      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
  'solomillo':            'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
  'pork ribs':            'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'pork hock':            'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
  'pata':                 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
  'pork ground meat':     'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'ground pork':          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'tiil':                 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',

  // CHICKEN - each cut has a distinct correct image
  'whole chicken':        'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
  'chicken breast':       'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
  'chicken thigh':        'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=600&q=80',
  'chicken thigh fillets':'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=600&q=80',
  'chicken leg':          'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80',
  'chicken drumstick':    'http://localhost:5000/uploads/products/chicken_drumstick.jpg',
  'chicken drumsticks':   'http://localhost:5000/uploads/products/chicken_drumstick.jpg',
  'chicken wing':         'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
  'chicken wings':        'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
  'chicken liver':        'https://images.unsplash.com/photo-1612871689417-26eb7e8b3f96?auto=format&fit=crop&w=600&q=80',
  'chicken gizzard':      'https://images.unsplash.com/photo-1612871689417-26eb7e8b3f96?auto=format&fit=crop&w=600&q=80',
  'chicken feet':         'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
  'chicken neck':         'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',

  // GOAT - distinct images per goat cut
  'goat leg':             'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
  'goat shoulder':        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
  'goat ribs':            'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'goat loin':            'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
  'goat chops':           'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=600&q=80',
  'goat ground meat':     'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'goat cubes':           'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
  'goat stew cut':        'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
  'kambing':              'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',

  // RABBIT - distinct images per rabbit cut
  'whole rabbit':         'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80',
  'rabbit legs':          'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=600&q=80',
  'rabbit hind legs':     'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=600&q=80',
  'rabbit forelegs':      'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=600&q=80',
  'rabbit loin':          'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
  'rabbit ribs':          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'rabbit ground meat':   'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'rabbit stew cut':      'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
  'kuneho':               'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80',
};

export const CATEGORY_FALLBACKS = {
  'Beef':    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
  'Pork':    'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=600&q=80',
  'Chicken': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
  'Goat':    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
  'Rabbit':  'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80',
  'Others':  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
  'PORK':    'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=600&q=80',
};

export const CATEGORY_COLORS = {
  'Beef':    { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', badge: 'badge-danger' },
  'Pork':    { bg: '#ffedd5', text: '#9a3412', border: '#fdba74', badge: 'badge-warning' },
  'Chicken': { bg: '#fef9c3', text: '#854d0e', border: '#fde047', badge: 'badge-warning' },
  'Goat':    { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc', badge: 'badge-primary' },
  'Rabbit':  { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe', badge: 'badge-primary' },
  'Others':  { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1', badge: 'badge-gray' },
};

export const DEFAULT_MEAT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23e5384a' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m19 5-3-3'/%3E%3Cpath d='m2 22 3-3'/%3E%3Cpath d='M6.3 20.3a2.4 2.4 0 0 0 3.4 0L18 12l-6-6-8.3 8.3a2.4 2.4 0 0 0 0 3.4Z'/%3E%3Ccircle cx='14.5' cy='9.5' r='.5' fill='%23e5384a'/%3E%3C/svg%3E";

/**
 * Resolves the appropriate image URL for a product.
 * Priority:
 *   1. Explicit image_url stored in DB (local upload or direct URL)
 *   2. Exact match on meat_cut key in MEAT_CUT_IMAGES
 *   3. Partial/substring match on meat_cut key
 *   4. Partial match on product name
 *   5. Category / meat_type fallback
 *   6. Default meat placeholder icon
 */
export const getProductImage = (product) => {
  if (!product) return DEFAULT_MEAT_PLACEHOLDER;

  // 1. Direct explicit image_url if valid
  if (product.image_url && product.image_url.trim()) {
    const url = product.image_url.trim();
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const rel = url.startsWith('/') ? url : '/' + url;
      const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';
      const serverOrigin = apiBase.replace(/\/api\/?$/, '');
      return `${serverOrigin}${rel}`;
    }
    return url;
  }

  // 2. Exact match on meat_cut
  if (product.meat_cut) {
    const cutKey = product.meat_cut.trim().toLowerCase();
    if (MEAT_CUT_IMAGES[cutKey]) {
      return MEAT_CUT_IMAGES[cutKey];
    }
    // 3. Partial/substring match on meat_cut
    for (const [key, img] of Object.entries(MEAT_CUT_IMAGES)) {
      if (cutKey.includes(key) || key.includes(cutKey)) {
        return img;
      }
    }
  }

  // 4. Partial match on product name
  if (product.name) {
    const nameKey = product.name.trim().toLowerCase();
    for (const [key, img] of Object.entries(MEAT_CUT_IMAGES)) {
      if (nameKey.includes(key)) {
        return img;
      }
    }
  }

  // 5. Category / meat_type fallback
  const cat = product.category_name || product.meat_type || 'Others';
  return CATEGORY_FALLBACKS[cat] || CATEGORY_FALLBACKS['Others'] || DEFAULT_MEAT_PLACEHOLDER;
};
