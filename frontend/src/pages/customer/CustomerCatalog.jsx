import React, { useEffect, useState, useMemo } from 'react';
import { getProductsApi, getCategoriesApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/meatImages';
import { ShoppingCart, Search, Plus, Minus, Check, AlertTriangle, XCircle, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../../components/common/PageLoader';
import QuantityInput from '../../components/common/QuantityInput';

// Product Card with independent quantity state and input handling
const ProductCard = ({ product: p, isAdded, onAddToCart }) => {
  const stock = Number(p.total_available_stock_kg ?? p.available_stock_kg) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const minQty = stock > 0 && stock < 1 ? stock : 1;

  // Independent string state for typing
  const [qtyInput, setQtyInput] = useState(() => (stock > 0 && stock < 1 ? String(stock) : '1'));
  const [imgError, setImgError] = useState(false);

  // Helper: validate and normalize on blur or submit
  const validateAndNormalize = (rawVal) => {
    const trimmed = String(rawVal ?? '').trim();
    if (!trimmed) return minQty;
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed) || parsed <= 0) return minQty;
    let clamped = Math.round(parsed * 100) / 100;
    if (stock > 0 && clamped > stock) clamped = stock;
    return clamped;
  };

  // Live parsed check
  const parsedVal = parseFloat(qtyInput);
  const isValid = !isNaN(parsedVal) && parsedVal > 0;
  const currentVal = isValid ? parsedVal : minQty;

  // Display quantity for the Add to Cart button
  const displayQty = stock > 0 && parsedVal > stock ? stock : qtyInput.replace(/\.$/, '');

  // Input change handler - allow clearing and digits with up to 2 decimal places
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setQtyInput('');
      return;
    }
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setQtyInput(val);
    }
  };

  // Blur handler: clamp and normalize
  const handleBlur = () => {
    if (isOutOfStock) return;
    const validated = validateAndNormalize(qtyInput);
    setQtyInput(String(validated));
  };

  // Minus stepper (step of 1, bounded by minQty)
  const canDecrement = !isOutOfStock && isValid && currentVal > minQty;
  const handleDecrement = () => {
    if (!canDecrement) return;
    const next = Math.max(minQty, Math.round((currentVal - 1) * 100) / 100);
    setQtyInput(String(next));
  };

  // Plus stepper (step of 1, bounded by stock)
  const canIncrement = !isOutOfStock && (stock <= 0 || currentVal < stock);
  const handleIncrement = () => {
    if (!canIncrement) return;
    const base = isValid ? currentVal : minQty;
    const next = Math.min(stock, Math.round((base + 1) * 100) / 100);
    setQtyInput(String(next));
  };

  // Quick add (+0.5, +1, +5 kg)
  const handleQuickAdd = (delta) => {
    if (isOutOfStock) return;
    const base = isValid ? currentVal : 0;
    const next = Math.min(stock, Math.round((base + delta) * 100) / 100);
    setQtyInput(String(next));
  };

  // Add to cart click
  const handleAddToCart = () => {
    if (isOutOfStock || !isValid) return;
    const finalQty = validateAndNormalize(qtyInput);
    setQtyInput(String(finalQty));
    onAddToCart(p, finalQty);
  };

  const isButtonDisabled = isOutOfStock || !isValid;
  const imgSrc = imgError ? getProductImage({ ...p, image_url: null }) : getProductImage(p);

  return (
    <div
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
          onError={() => setImgError(true)}
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
          
          {/* Quantity Input Controls */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <QuantityInput
              value={qtyInput}
              maxStock={stock}
              minAllowed={minQty}
              decimals={2}
              unit="kg"
              placeholder="1"
              disabled={isOutOfStock}
              style={{ width: '100%', alignItems: 'center' }}
              inputStyle={{ width: '54px' }}
              onChange={(val) => {
                setQtyInput(val !== null ? String(val) : '');
              }}
              onCommit={(val) => {
                setQtyInput(String(val));
              }}
            />
          </div>

          {/* Quick Add Buttons (+0.5, +1, +5 kg) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[0.5, 1, 5].map((amt) => {
              const isQuickDisabled = isOutOfStock || (stock > 0 && currentVal >= stock);
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  disabled={isQuickDisabled}
                  style={{
                    padding: '4px 0',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: '1px solid rgba(246, 235, 221, 0.12)',
                    background: isQuickDisabled ? 'transparent' : 'rgba(246, 235, 221, 0.05)',
                    color: isQuickDisabled ? 'rgba(246, 235, 221, 0.25)' : '#c9b4a6',
                    cursor: isQuickDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isQuickDisabled) {
                      e.currentTarget.style.background = 'rgba(246, 235, 221, 0.12)';
                      e.currentTarget.style.color = '#F6EBDD';
                      e.currentTarget.style.borderColor = 'rgba(246, 235, 221, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isQuickDisabled) {
                      e.currentTarget.style.background = 'rgba(246, 235, 221, 0.05)';
                      e.currentTarget.style.color = '#c9b4a6';
                      e.currentTarget.style.borderColor = 'rgba(246, 235, 221, 0.12)';
                    }
                  }}
                >
                  +{amt} kg
                </button>
              );
            })}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            className="btn"
            onClick={handleAddToCart}
            disabled={isButtonDisabled}
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '10px',
              background: isButtonDisabled
                ? 'rgba(246, 235, 221, 0.08)'
                : isAdded
                ? '#15803d'
                : 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
              color: isButtonDisabled ? 'rgba(246, 235, 221, 0.3)' : '#ffffff',
              border: isButtonDisabled ? '1px solid rgba(246, 235, 221, 0.1)' : 'none',
              fontWeight: '800',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease, transform 0.15s ease',
              boxShadow: isButtonDisabled ? 'none' : '0 4px 12px rgba(193, 18, 31, 0.4)'
            }}
          >
            {isAdded ? (
              <><Check size={16} /> Added {displayQty} kg to Cart</>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : !isValid ? (
              <><ShoppingCart size={15} /> Add to Cart</>
            ) : (
              <><ShoppingCart size={15} /> Add to Cart ({displayQty} kg)</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [addedIds, setAddedIds] = useState({});

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

  // Add to cart handler
  const handleAdd = (product, quantity) => {
    const stock = Number(product.total_available_stock_kg ?? product.available_stock_kg) || 0;
    if (stock <= 0) {
      alert(`"${product.name}" is currently out of stock.`);
      return;
    }

    const requestedQty = Number(quantity) || 1;
    const finalQty = Math.min(requestedQty, stock);

    const result = addToCart({
      product_id: product.id,
      product_name: product.name,
      meat_cut: product.meat_cut,
      meat_type: product.meat_type,
      category_name: product.category_name,
      price_per_kg: Number(product.price_per_kg),
      weight_kg: finalQty,
      available_stock_kg: stock,
      total_available_stock_kg: stock,
      image_url: product.image_url
    });

    if (result && result.success) {
      setAddedIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1400);
    } else {
      alert(result?.message || `Unable to add ${product.name} to cart.`);
    }
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
                {prods.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isAdded={Boolean(addedIds[p.id])}
                    onAddToCart={handleAdd}
                  />
                ))}
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
