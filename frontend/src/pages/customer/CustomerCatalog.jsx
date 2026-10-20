import React, { useEffect, useState, useMemo } from 'react';
import { getProductsApi, getCategoriesApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/meatImages';
import { ShoppingCart, Search, Plus, Minus, Check, AlertTriangle, XCircle, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../../components/common/PageLoader';

const CustomerCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [addedIds, setAddedIds] = useState({});
  const [quantities, setQuantities] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  // Load products and categories from backend API
  useEffect(() => {
    setLoading(true);
    Promise.all([getProductsApi({ is_active: 1 }), getCategoriesApi()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch((err) => {
        console.error('Failed to load catalog data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute category counts and filter out empty categories
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const catId = p.category_id;
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Available categories that have at least 1 product
  const visibleCategories = useMemo(() => {
    return categories.filter((c) => (categoryCounts[c.id] || 0) > 0);
  }, [categories, categoryCounts]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cut = (p.meat_cut || '').toLowerCase();
      const type = (p.meat_type || '').toLowerCase();
      const catName = (p.category_name || '').toLowerCase();

      const matchesSearch = !query ||
        name.includes(query) ||
        cut.includes(query) ||
        type.includes(query) ||
        catName.includes(query);

      const matchesCat = selectedCat === '' || String(p.category_id) === String(selectedCat);

      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCat]);

  // Quantity handlers
  const getQty = (productId) => quantities[productId] || 1;

  const handleQtyChange = (productId, newQty, maxStock) => {
    let parsed = Number(newQty);
    if (isNaN(parsed) || parsed < 1) parsed = 1;
    if (maxStock > 0 && parsed > maxStock) parsed = maxStock;
    setQuantities((prev) => ({ ...prev, [productId]: parsed }));
  };

  const handleIncrement = (productId, maxStock) => {
    const current = getQty(productId);
    if (maxStock > 0 && current >= maxStock) return;
    setQuantities((prev) => ({ ...prev, [productId]: current + 1 }));
  };

  const handleDecrement = (productId) => {
    const current = getQty(productId);
    if (current <= 1) return;
    setQuantities((prev) => ({ ...prev, [productId]: current - 1 }));
  };

  // Add to cart handler
  const handleAdd = (product) => {
    const stock = Number(product.total_available_stock_kg) || 0;
    if (stock <= 0) return;

    const requestedQty = getQty(product.id);
    const finalQty = Math.min(requestedQty, stock);

    addToCart({
      product_id: product.id,
      product_name: product.name,
      meat_cut: product.meat_cut,
      meat_type: product.meat_type,
      category_name: product.category_name,
      price_per_kg: Number(product.price_per_kg),
      weight_kg: finalQty,
      image_url: product.image_url
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  // Calculate total items in cart
  const cartItemCount = cart.reduce((acc, item) => acc + 1, 0);

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* ── Top Hero Banner ──────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(170deg, var(--ox3, #3a1219) 0%, var(--ox2, #2a0a0e) 100%)',
        color: '#fdf2e3',
        padding: '28px 32px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(246, 235, 221, 0.1)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(26, 10, 12, 0.7)',
            border: '1px solid rgba(229, 56, 74, 0.35)',
            color: '#FFD76B',
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px'
          }}>
            <Sparkles size={13} color="#FFD76B" /> Slaughterhouse Fresh Meat Direct
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#fdf2e3' }}>
            Fresh Meat Catalog & Cuts
          </h1>
          <p style={{ fontSize: '13px', margin: 0, color: '#e5d5c3', maxWidth: '560px', lineHeight: '1.5' }}>
            Browse prime cuts of Beef, Pork, Chicken, Goat, and Rabbit directly sourced from our slaughterhouse. Order fresh weights online for fast pickup.
          </p>
        </div>

        <button
          className="btn btn-lg"
          onClick={() => navigate('/customer/cart')}
          style={{
            background: 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '14px',
            padding: '12px 22px',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(193, 18, 31, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <ShoppingCart size={18} color="#ffffff" />
          <span>View Cart</span>
          {cartItemCount > 0 && (
            <span style={{
              background: 'rgba(0, 0, 0, 0.35)',
              color: '#ffffff',
              borderRadius: '100px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Search Bar & Category Filter Bar ──────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(170deg, var(--ox3, #3a1219) 0%, var(--ox2, #2a0a0e) 100%)',
        padding: '20px 22px',
        borderRadius: '16px',
        border: '1px solid rgba(246, 235, 221, 0.12)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(246, 235, 221, 0.08)',
        marginBottom: '28px'
      }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by meat name, cut, or type (e.g. Ribeye, Pork Belly, Chicken, Goat, Rabbit)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '42px',
              paddingRight: search ? '36px' : '14px',
              height: '46px',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(246, 235, 221, 0.15)',
              background: '#1a0a0c',
              color: '#F6EBDD',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#E5384A';
              e.target.style.boxShadow = '0 0 0 2px rgba(229, 56, 74, 0.35)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(246, 235, 221, 0.15)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#c9b4a6' }} />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#c9b4a6',
                cursor: 'pointer',
                padding: '4px',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills (Dynamic Filter) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#e5d5c3',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <Filter size={14} color="#e5d5c3" /> Categories:
          </div>

          {/* All Meats Pill */}
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setSelectedCat('')}
            style={{
              borderRadius: '100px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              background: selectedCat === '' ? 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)' : 'rgba(246, 235, 221, 0.05)',
              color: selectedCat === '' ? '#ffffff' : '#F6EBDD',
              border: selectedCat === '' ? '1px solid #E5384A' : '1px solid rgba(246, 235, 221, 0.18)',
              boxShadow: selectedCat === '' ? '0 2px 10px rgba(229, 56, 74, 0.35)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedCat !== '') e.currentTarget.style.background = 'rgba(246, 235, 221, 0.12)';
            }}
            onMouseLeave={(e) => {
              if (selectedCat !== '') e.currentTarget.style.background = 'rgba(246, 235, 221, 0.05)';
            }}
          >
            All Meats ({products.length})
          </button>

          {/* Individual Available Categories */}
          {visibleCategories.map((c) => {
            const isSelected = String(selectedCat) === String(c.id);
            const count = categoryCounts[c.id] || 0;
            return (
              <button
                key={c.id}
                type="button"
                className="btn btn-sm"
                onClick={() => setSelectedCat(String(c.id))}
                style={{
                  borderRadius: '100px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  background: isSelected ? 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)' : 'rgba(246, 235, 221, 0.05)',
                  color: isSelected ? '#ffffff' : '#F6EBDD',
                  border: isSelected ? '1px solid #E5384A' : '1px solid rgba(246, 235, 221, 0.18)',
                  boxShadow: isSelected ? '0 2px 10px rgba(229, 56, 74, 0.35)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(246, 235, 221, 0.12)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(246, 235, 221, 0.05)';
                }}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <PageLoader message="Loading Fresh Meat Catalog..." />
      )}

      {/* ── Product Catalog Grouped Layout ─────────────────────────────────────────── */}
      {!loading && (() => {
        // Canonical display order and display metadata per category
        const CATEGORY_ORDER = ['Beef', 'Pork', 'Chicken', 'Goat', 'Rabbit', 'Others'];
        const CATEGORY_META = {
          'Beef':    { emoji: '🥩' },
          'Pork':    { emoji: '🐷' },
          'Chicken': { emoji: '🍗' },
          'Goat':    { emoji: '🐐' },
          'Rabbit':  { emoji: '🐇' },
          'Others':  { emoji: '🥦' },
        };

        // Group products by normalized meat_type (Title Case)
        const grouped = filteredProducts.reduce((acc, p) => {
          // Normalize to Title Case so "PORK" and "Pork" are the same bucket
          const rawType = p.meat_type || 'Others';
          const normalized = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
          const type = CATEGORY_ORDER.includes(normalized) ? normalized : 'Others';
          if (!acc[type]) acc[type] = [];
          acc[type].push(p);
          return acc;
        }, {});

        // Sort by canonical order, only include buckets that have products
        const sortedEntries = CATEGORY_ORDER
          .filter(cat => grouped[cat] && grouped[cat].length > 0)
          .map(cat => [cat, grouped[cat]]);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {sortedEntries.map(([meatType, prods]) => {
              const meta = CATEGORY_META[meatType] || CATEGORY_META['Others'];
              return (
            <div key={meatType}>
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '2px solid rgba(248, 113, 113, 0.4)',
                paddingBottom: '14px',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '28px', lineHeight: 1 }}>{meta.emoji}</span>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fdf2e3', margin: 0, letterSpacing: '-0.01em' }}>
                  {meatType}
                </h2>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#F6EBDD',
                  background: 'rgba(26, 10, 12, 0.7)',
                  border: '1px solid rgba(246, 235, 221, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '100px'
                }}>
                  {prods.length} {prods.length === 1 ? 'product' : 'products'}
                </span>
              </div>
              {/* 3-column product grid (responsive: 1-col mobile, 2-col tablet, 3-col desktop) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {prods.map((p) => {
                  const stock = Number(p.total_available_stock_kg) || 0;
            const isOutOfStock = stock <= 0;
            const isLowStock = stock > 0 && stock <= 5;
            const currentQty = getQty(p.id);
            const isAdded = addedIds[p.id];
            const imgSrc = imageErrors[p.id] ? getProductImage({ ...p, image_url: null }) : getProductImage(p);

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: '16px',
                  border: '1px solid rgba(246, 235, 221, 0.12)',
                  background: 'linear-gradient(170deg, var(--ox3, #3a1219) 0%, var(--ox2, #2a0a0e) 100%)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(246, 235, 221, 0.08)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(229, 56, 74, 0.5)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 16px rgba(229, 56, 74, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(246, 235, 221, 0.12)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(246, 235, 221, 0.08)';
                }}
              >
                {/* Product Image Box */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '180px',
                  background: '#1a0a0c',
                  overflow: 'hidden'
                }}>
                  <img
                    src={imgSrc}
                    alt={p.name}
                    loading="lazy"
                    onError={() => setImageErrors((prev) => ({ ...prev, [p.id]: true }))}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />

                  {/* Category Pill Tag */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(18, 4, 6, 0.88)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(246, 235, 221, 0.2)',
                    color: '#F6EBDD',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '4px 10px',
                    borderRadius: '100px'
                  }}>
                    {p.category_name || p.meat_type}
                  </span>

                  {/* Stock Status Badge Overlay */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    background: isOutOfStock
                      ? '#ef4444'
                      : isLowStock
                      ? '#d97706'
                      : '#15803d',
                    color: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  {/* Cut / Type Hierarchy */}
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {p.meat_type} • Cut: {p.meat_cut}
                  </div>

                  {/* Product Title */}
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#fdf2e3',
                    margin: '0 0 6px 0',
                    lineHeight: '1.3'
                  }}>
                    {p.name}
                  </h3>

                  {/* Description */}
                  {p.description && (
                    <p style={{
                      fontSize: '12px',
                      color: '#d9c7b5',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {p.description}
                    </p>
                  )}

                  {/* Price and Stock Stats */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(246, 235, 221, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24' }}>
                        ₱{Number(p.price_per_kg).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px', color: '#c9b4a6', fontWeight: '600' }}> / kg</span>
                    </div>

                    {/* Stock Indicator */}
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: isOutOfStock ? '#f87171' : isLowStock ? '#fbbf24' : '#86efac',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isOutOfStock ? (
                        <><XCircle size={13} /> Out of Stock</>
                      ) : isLowStock ? (
                        <><AlertTriangle size={13} /> Low: {stock.toFixed(1)} kg</>
                      ) : (
                        `Available: ${stock.toFixed(1)} kg`
                      )}
                    </div>
                  </div>

                  {/* ── Quantity Stepper & Add to Cart Container ─────────── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {/* Stepper Controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#1a0a0c',
                      borderRadius: '10px',
                      border: '1px solid rgba(246, 235, 221, 0.15)',
                      padding: '4px'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleDecrement(p.id)}
                        disabled={isOutOfStock || currentQty <= 1}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          background: currentQty <= 1 || isOutOfStock ? 'transparent' : 'rgba(246, 235, 221, 0.08)',
                          color: currentQty <= 1 || isOutOfStock ? 'rgba(246, 235, 221, 0.2)' : '#F6EBDD',
                          boxShadow: 'none',
                          cursor: currentQty <= 1 || isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Minus size={14} />
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min={1}
                          max={stock > 0 ? stock : 1}
                          step={1}
                          disabled={isOutOfStock}
                          value={currentQty}
                          onChange={(e) => handleQtyChange(p.id, e.target.value, stock)}
                          style={{
                            width: '46px',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '14px',
                            color: '#F6EBDD',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#c9b4a6', fontWeight: '700' }}>kg</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleIncrement(p.id, stock)}
                        disabled={isOutOfStock || currentQty >= stock}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          background: currentQty >= stock || isOutOfStock ? 'transparent' : 'rgba(246, 235, 221, 0.08)',
                          color: currentQty >= stock || isOutOfStock ? 'rgba(246, 235, 221, 0.2)' : '#F6EBDD',
                          boxShadow: 'none',
                          cursor: currentQty >= stock || isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleAdd(p)}
                      disabled={isOutOfStock}
                      style={{
                        width: '100%',
                        height: '42px',
                        borderRadius: '10px',
                        background: isOutOfStock
                          ? 'rgba(246, 235, 221, 0.08)'
                          : isAdded
                          ? '#15803d'
                          : 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
                        color: isOutOfStock ? 'rgba(246, 235, 221, 0.3)' : '#ffffff',
                        border: isOutOfStock ? '1px solid rgba(246, 235, 221, 0.1)' : 'none',
                        fontWeight: '800',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s ease, transform 0.15s ease',
                        boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(193, 18, 31, 0.4)'
                      }}
                    >
                      {isAdded ? (
                        <><Check size={16} /> Added {currentQty} kg to Cart</>
                      ) : isOutOfStock ? (
                        'Out of Stock'
                      ) : (
                        <><ShoppingCart size={15} /> Add to Cart ({currentQty} kg)</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
                })}
              </div>
            </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!loading && filteredProducts.length === 0 && (
        <div style={{
          background: 'linear-gradient(170deg, var(--ox3, #3a1219) 0%, var(--ox2, #2a0a0e) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(246, 235, 221, 0.12)',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#e5d5c3',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥩</div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fdf2e3', marginBottom: '6px' }}>
            No Meat Products Found
          </h3>
          <p style={{ fontSize: '13px', color: '#d9c7b5', maxWidth: '420px', margin: '0 auto 18px auto' }}>
            We couldn't find any meat products matching your current category filter or search query "{search}".
          </p>
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearch('');
              setSelectedCat('');
            }}
            style={{
              borderRadius: '100px',
              fontWeight: '700',
              padding: '8px 20px',
              color: '#F6EBDD',
              borderColor: 'rgba(246, 235, 221, 0.3)',
              background: 'transparent'
            }}
          >
            Clear Filters & View All
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerCatalog;
