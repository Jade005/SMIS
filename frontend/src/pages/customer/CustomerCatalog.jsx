import React, { useEffect, useState, useMemo } from 'react';
import { getProductsApi, getCategoriesApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/meatImages';
import { ShoppingCart, Search, Plus, Minus, Check, AlertTriangle, XCircle, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%)',
        color: '#ffffff',
        padding: '28px 32px',
        borderRadius: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            <Sparkles size={13} color="#fde047" /> Slaughterhouse Fresh Meat Direct
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Fresh Meat Catalog & Cuts
          </h1>
          <p style={{ fontSize: '13px', margin: 0, opacity: 0.9, maxWidth: '560px' }}>
            Browse prime cuts of Beef, Pork, Chicken, Goat, and Rabbit directly sourced from our slaughterhouse. Order fresh weights online for fast pickup.
          </p>
        </div>

        <button
          className="btn btn-lg"
          onClick={() => navigate('/customer/cart')}
          style={{
            background: '#ffffff',
            color: '#064e3b',
            fontWeight: '800',
            fontSize: '14px',
            padding: '12px 22px',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
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
          <ShoppingCart size={18} color="#047857" />
          <span>View Cart</span>
          {cartItemCount > 0 && (
            <span style={{
              background: '#047857',
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
      <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by meat name, cut, or type (e.g. Ribeye, Pork Belly, Chicken, Goat, Rabbit)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: search ? '36px' : '14px',
              height: '46px',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              background: '#f8fafc'
            }}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills (Dynamic Filter) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: '700', marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Filter size={14} /> Categories:
          </div>

          {/* All Meats Pill */}
          <button
            className={`btn btn-sm ${selectedCat === '' ? 'btn-customer' : 'btn-outline'}`}
            onClick={() => setSelectedCat('')}
            style={{
              borderRadius: '100px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              background: selectedCat === '' ? 'var(--primary-customer)' : '#ffffff',
              color: selectedCat === '' ? '#ffffff' : '#334155',
              borderColor: selectedCat === '' ? 'var(--primary-customer)' : '#cbd5e1'
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
                className={`btn btn-sm ${isSelected ? 'btn-customer' : 'btn-outline'}`}
                onClick={() => setSelectedCat(String(c.id))}
                style={{
                  borderRadius: '100px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  background: isSelected ? 'var(--primary-customer)' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  borderColor: isSelected ? 'var(--primary-customer)' : '#cbd5e1'
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
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ fontWeight: '700', fontSize: '15px' }}>Loading Fresh Meat Catalog...</p>
        </div>
      )}

      {/* ── Product Catalog Grid ─────────────────────────────────────────── */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '22px'
        }}>
          {filteredProducts.map((p) => {
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
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Product Image Box */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '180px',
                  background: '#f8fafc',
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
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
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
                      ? '#f59e0b'
                      : '#10b981',
                    color: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}>
                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  {/* Cut / Type Hierarchy */}
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-customer)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    {p.meat_type} • Cut: {p.meat_cut}
                  </div>

                  {/* Product Title */}
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#0f172a',
                    margin: '0 0 6px 0',
                    lineHeight: '1.3'
                  }}>
                    {p.name}
                  </h3>

                  {/* Description */}
                  {p.description && (
                    <p style={{
                      fontSize: '12px',
                      color: '#64748b',
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
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-customer)' }}>
                        ₱{Number(p.price_per_kg).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}> / kg</span>
                    </div>

                    {/* Stock Indicator */}
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleDecrement(p.id)}
                        disabled={isOutOfStock || currentQty <= 1}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          background: currentQty <= 1 || isOutOfStock ? 'transparent' : '#ffffff',
                          color: currentQty <= 1 || isOutOfStock ? '#cbd5e1' : '#0f172a',
                          boxShadow: currentQty > 1 && !isOutOfStock ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
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
                            color: '#0f172a',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>kg</span>
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
                          background: currentQty >= stock || isOutOfStock ? 'transparent' : '#ffffff',
                          color: currentQty >= stock || isOutOfStock ? '#cbd5e1' : '#0f172a',
                          boxShadow: currentQty < stock && !isOutOfStock ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
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
                          ? '#f1f5f9'
                          : isAdded
                          ? '#10b981'
                          : 'var(--primary-customer)',
                        color: isOutOfStock ? '#94a3b8' : '#ffffff',
                        borderColor: 'transparent',
                        fontWeight: '800',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s ease, transform 0.15s ease',
                        boxShadow: isOutOfStock ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)'
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
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!loading && filteredProducts.length === 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥩</div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            No Meat Products Found
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 18px auto' }}>
            We couldn't find any meat products matching your current category filter or search query "{search}".
          </p>
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearch('');
              setSelectedCat('');
            }}
            style={{ borderRadius: '100px', fontWeight: '700', padding: '8px 20px' }}
          >
            Clear Filters & View All
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerCatalog;
