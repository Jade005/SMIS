import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { createOrderApi } from '../../api/orderApi';
import { getProductImage } from '../../utils/meatImages';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, CheckCircle, ArrowLeft, Plus, Minus } from 'lucide-react';

const CustomerCart = () => {
  const { cart, updateWeight, removeFromCart, clearCart, subtotal } = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
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

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Your Cart is Empty</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              You haven't added any fresh meat cuts to your cart yet.
            </p>
            <button className="btn btn-customer" onClick={() => navigate('/customer')} style={{ borderRadius: '100px', fontWeight: '700' }}>
              Browse Fresh Meats
            </button>
          </div>
        ) : !orderSuccess && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', padding: '20px' }}>
            
            {/* Cart Items List */}
            <div className="table-responsive">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price / kg</th>
                    <th style={{ textAlign: 'center' }}>Weight (kg)</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                    const itemKey = item.cart_item_id || item.product_id;
                    const itemImg = getProductImage(item);
                    const itemSubtotal = (item.price_per_kg * item.weight_kg);

                    return (
                      <tr key={itemKey}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={itemImg}
                              alt={item.product_name}
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: '#f1f5f9' }}
                            />
                            <div>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.product_name}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {item.meat_type} • Cut: {item.meat_cut}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: '600' }}>₱{Number(item.price_per_kg).toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => updateWeight(itemKey, Math.max(0.5, item.weight_kg - 0.5))}
                              style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              style={{ width: '56px', padding: '4px', textAlign: 'center', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                              value={item.weight_kg}
                              onChange={(e) => updateWeight(itemKey, parseFloat(e.target.value) || 0.5)}
                            />
                            <button
                              type="button"
                              onClick={() => updateWeight(itemKey, item.weight_kg + 0.5)}
                              style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: '800', textAlign: 'right', color: 'var(--primary-customer)' }}>
                          ₱{itemSubtotal.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '6px' }}
                            onClick={() => removeFromCart(itemKey)}
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

            {/* Checkout Card */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
                <span>Total Items:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{cart.length} item(s)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>₱{subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: '800', fontSize: '18px', borderTop: '1.5px solid #e2e8f0', paddingTop: '10px' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary-customer)' }}>₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>Special Cutting / Packaging Instructions</label>
                <textarea
                  className="form-control"
                  placeholder="e.g. Please slice into 1kg vacuum packs, remove excess fat"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
              </div>

              <button
                className="btn btn-customer btn-lg"
                style={{ width: '100%', justifyContent: 'center', borderRadius: '10px', fontWeight: '800' }}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                <CheckCircle size={18} />
                {loading ? 'Placing Pre-Order...' : 'Place Pre-Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCart;
