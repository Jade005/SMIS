import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { createOrderApi } from '../../api/orderApi';
import { getProductImage } from '../../utils/meatImages';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Trash2, CheckCircle, ArrowLeft, Plus, Minus, Loader2 } from 'lucide-react';
import Toast from '../../components/common/Toast';

const CustomerCart = () => {
  const { cart, updateWeight, removeFromCart, clearCart, subtotal } = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const orderPayload = {
        items: cart.map((i) => ({
          product_id: i.product_id,
          weight_kg: i.weight_kg
        })),
        notes
      };

      await createOrderApi(orderPayload);
      clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/customer/orders');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place pre-order');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (itemKey, productName) => {
    if (window.confirm(`Remove "${productName || 'this item'}" from your cart?`)) {
      removeFromCart(itemKey);
      setToast({ message: `Removed "${productName || 'Item'}" from cart.`, type: 'info' });
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1140px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="card" style={{ borderRadius: '16px', border: '1px solid rgba(246, 235, 221, 0.12)', boxShadow: '0 16px 36px rgba(0,0,0,0.5)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <span className="card-title" style={{ fontSize: '18px', fontWeight: '800' }}>
            Shopping Cart & Pre-Order Checkout
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/customer')} style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '100px' }}>
            <ArrowLeft size={14} /> Continue Shopping
          </button>
        </div>

        {orderSuccess && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '24px', textAlign: 'center', margin: '20px' }}>
            <CheckCircle size={44} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#166534', marginBottom: '6px' }}>Pre-Order Placed Successfully!</h3>
            <p style={{ fontSize: '13px', color: '#166534' }}>Redirecting to your Order History...</p>
          </div>
        )}

        {!orderSuccess && cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e5d5c3' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#E5384A',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <ShoppingCart size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fdf2e3', marginBottom: '6px' }}>Your Cart is Empty</h3>
            <p style={{ fontSize: '13px', color: '#e5d5c3', marginBottom: '20px' }}>
              You haven't added any fresh meat cuts to your cart yet.
            </p>
            <button className="btn btn-customer" onClick={() => navigate('/customer')} style={{ borderRadius: '100px', fontWeight: '700' }}>
              Browse Fresh Meats
            </button>
          </div>
        ) : !orderSuccess && (
          <div className="cart-layout-grid" style={{ padding: '20px' }}>
            
            {/* Cart Items List Container */}
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Desktop Table View */}
              <div className="table-responsive cart-desktop-table" style={{ width: '100%', overflowX: 'auto', background: 'var(--ox2)', borderRadius: '12px', border: '1px solid rgba(246, 235, 221, 0.12)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40%', padding: '14px 18px', textAlign: 'left', whiteSpace: 'nowrap' }}>PRODUCT</th>
                      <th style={{ width: '18%', padding: '14px 18px', textAlign: 'left', whiteSpace: 'nowrap' }}>PRICE / KG</th>
                      <th style={{ width: '22%', padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>WEIGHT (KG)</th>
                      <th style={{ width: '12%', padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>SUBTOTAL</th>
                      <th style={{ width: '8%', padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>REMOVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const itemKey = item.cart_item_id || item.product_id;
                      const itemImg = getProductImage(item);
                      const itemSubtotal = (item.price_per_kg * item.weight_kg);
                      const maxStock = Number(item.available_stock_kg ?? item.total_available_stock_kg) || 0;
                      const isAtMax = maxStock > 0 && item.weight_kg >= maxStock;

                      return (
                        <tr key={itemKey} style={{ borderBottom: '1px solid rgba(246, 235, 221, 0.08)' }}>
                          <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <img
                                src={itemImg}
                                alt={item.product_name}
                                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', background: '#1a0a0c', flexShrink: 0, border: '1px solid rgba(246, 235, 221, 0.15)' }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#fdf2e3', lineHeight: '1.3' }}>
                                  {item.product_name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#d9c7b5', marginTop: '3px', fontWeight: '500' }}>
                                  {item.meat_type} • Cut: {item.meat_cut}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap', fontWeight: '600', color: '#fdf2e3' }}>
                            ₱{Number(item.price_per_kg).toFixed(2)}
                          </td>
                          <td style={{ padding: '16px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#1a0a0c', padding: '3px 6px', borderRadius: '8px', border: '1px solid rgba(246, 235, 221, 0.15)' }}>
                              <button
                                type="button"
                                onClick={() => updateWeight(itemKey, Math.max(0.5, item.weight_kg - 0.5))}
                                disabled={item.weight_kg <= 0.5}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(246, 235, 221, 0.18)',
                                  background: 'rgba(246, 235, 221, 0.06)',
                                  cursor: item.weight_kg <= 0.5 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: item.weight_kg <= 0.5 ? 'rgba(246, 235, 221, 0.2)' : '#fdf2e3',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Decrease weight"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                max={maxStock > 0 ? maxStock : undefined}
                                style={{
                                  width: '54px',
                                  padding: '2px',
                                  textAlign: 'center',
                                  fontWeight: '800',
                                  fontSize: '13px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#fdf2e3',
                                  outline: 'none'
                                }}
                                value={item.weight_kg}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val)) {
                                    const clamped = maxStock > 0 ? Math.min(maxStock, Math.max(0.5, val)) : Math.max(0.5, val);
                                    updateWeight(itemKey, clamped);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => updateWeight(itemKey, maxStock > 0 ? Math.min(maxStock, item.weight_kg + 0.5) : item.weight_kg + 0.5)}
                                disabled={isAtMax}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(246, 235, 221, 0.18)',
                                  background: isAtMax ? 'transparent' : 'rgba(246, 235, 221, 0.06)',
                                  cursor: isAtMax ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: isAtMax ? 'rgba(246, 235, 221, 0.2)' : '#fdf2e3',
                                  transition: 'all 0.15s ease'
                                }}
                                title={isAtMax ? `Maximum available stock (${maxStock} kg) reached` : "Increase weight"}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            {maxStock > 0 && (
                              <div style={{ fontSize: '10px', color: isAtMax ? '#fbbf24' : '#c9b4a6', marginTop: '4px', fontWeight: '600' }}>
                                Stock: {maxStock.toFixed(1)} kg
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px 18px', verticalAlign: 'middle', fontWeight: '800', textAlign: 'right', whiteSpace: 'nowrap', color: '#fbbf24', fontSize: '15px' }}>
                            ₱{itemSubtotal.toFixed(2)}
                          </td>
                          <td style={{ padding: '16px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                              onClick={() => handleRemoveItem(itemKey, item.product_name)}
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Items View (Visible <= 680px) */}
              <div className="cart-mobile-cards">
                {cart.map((item) => {
                  const itemKey = item.cart_item_id || item.product_id;
                  const itemImg = getProductImage(item);
                  const itemSubtotal = (item.price_per_kg * item.weight_kg);
                  const maxStock = Number(item.available_stock_kg ?? item.total_available_stock_kg ?? item.stock) || 0;
                  const isAtMax = maxStock > 0 && item.weight_kg >= maxStock;

                  return (
                    <div
                      key={itemKey}
                      style={{
                        background: 'var(--ox2)',
                        borderRadius: '14px',
                        border: '1px solid rgba(246, 235, 221, 0.12)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img
                          src={itemImg}
                          alt={item.product_name}
                          style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', background: '#1a0a0c', border: '1px solid rgba(246, 235, 221, 0.15)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#fdf2e3', lineHeight: '1.3' }}>
                            {item.product_name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#d9c7b5', marginTop: '2px' }}>
                            {item.meat_type} • Cut: {item.meat_cut}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24', marginTop: '4px' }}>
                            ₱{Number(item.price_per_kg).toFixed(2)} / kg
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(itemKey, item.product_name)}
                          style={{
                            color: '#ef4444',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(246, 235, 221, 0.08)' }}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1a0a0c', padding: '3px 6px', borderRadius: '8px', border: '1px solid rgba(246, 235, 221, 0.15)' }}>
                            <button
                              type="button"
                              onClick={() => updateWeight(itemKey, Math.max(0.5, item.weight_kg - 0.5))}
                              disabled={item.weight_kg <= 0.5}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                border: '1px solid rgba(246, 235, 221, 0.18)',
                                background: 'rgba(246, 235, 221, 0.06)',
                                color: item.weight_kg <= 0.5 ? 'rgba(246, 235, 221, 0.2)' : '#fdf2e3',
                                cursor: item.weight_kg <= 0.5 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              max={maxStock > 0 ? maxStock : undefined}
                              style={{
                                width: '50px',
                                padding: '2px',
                                textAlign: 'center',
                                fontWeight: '800',
                                fontSize: '13px',
                                border: 'none',
                                background: 'transparent',
                                color: '#fdf2e3',
                                outline: 'none'
                              }}
                              value={item.weight_kg}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  const clamped = maxStock > 0 ? Math.min(maxStock, Math.max(0.5, val)) : Math.max(0.5, val);
                                  updateWeight(itemKey, clamped);
                                }
                              }}
                            />
                            <span style={{ fontSize: '11px', color: '#c9b4a6', fontWeight: '700' }}>kg</span>
                            <button
                              type="button"
                              onClick={() => updateWeight(itemKey, maxStock > 0 ? Math.min(maxStock, item.weight_kg + 0.5) : item.weight_kg + 0.5)}
                              disabled={isAtMax}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                border: '1px solid rgba(246, 235, 221, 0.18)',
                                background: isAtMax ? 'transparent' : 'rgba(246, 235, 221, 0.06)',
                                color: isAtMax ? 'rgba(246, 235, 221, 0.2)' : '#fdf2e3',
                                cursor: isAtMax ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={isAtMax ? `Maximum available stock (${maxStock} kg) reached` : "Increase weight"}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          {maxStock > 0 && (
                            <div style={{ fontSize: '10px', color: isAtMax ? '#fbbf24' : '#c9b4a6', marginTop: '4px', fontWeight: '600' }}>
                              Stock: {maxStock.toFixed(1)} kg
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#c9b4a6', textTransform: 'uppercase', fontWeight: '600' }}>Subtotal</div>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#fbbf24' }}>₱{itemSubtotal.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Sticky Order Summary Card */}
            <div style={{
              background: 'linear-gradient(170deg, var(--ox3, #3a1219) 0%, var(--ox2, #2a0a0e) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(246, 235, 221, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              position: 'sticky',
              top: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#fdf2e3', letterSpacing: '-0.01em' }}>
                Order Summary
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', color: '#d9c7b5' }}>
                <span>Total Items:</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>{cart.length} item(s)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', color: '#d9c7b5' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>₱{subtotal.toFixed(2)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '14px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#fdf2e3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  TOTAL AMOUNT:
                </span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24' }}>
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#fdf2e3',
                  marginBottom: '8px'
                }}>
                  Special Cutting / Packaging Instructions
                </label>
                <textarea
                  className="form-control"
                  placeholder="e.g. Please slice into 1kg vacuum packs, remove excess fat"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#1a0a0c',
                    border: '1px solid rgba(246, 235, 221, 0.15)',
                    color: '#F6EBDD',
                    fontSize: '12px',
                    resize: 'vertical',
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
              </div>

              <button
                type="button"
                className="btn btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '12px',
                  background: (loading || cart.length === 0)
                    ? 'rgba(246, 235, 221, 0.1)'
                    : 'linear-gradient(135deg, #E5384A 0%, #C1121F 100%)',
                  color: (loading || cart.length === 0) ? 'rgba(246, 235, 221, 0.35)' : '#ffffff',
                  border: (loading || cart.length === 0) ? '1px solid rgba(246, 235, 221, 0.15)' : 'none',
                  boxShadow: (loading || cart.length === 0) ? 'none' : '0 4px 14px rgba(193, 18, 31, 0.4)',
                  cursor: (loading || cart.length === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
              >
                {loading ? <Loader2 className="spin" size={18} /> : <CheckCircle size={18} />}
                <span>{loading ? 'Placing Pre-Order...' : 'Place Pre-Order'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default CustomerCart;

