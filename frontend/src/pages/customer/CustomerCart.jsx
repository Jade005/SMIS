import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { createOrderApi } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, CheckCircle } from 'lucide-react';

const CustomerCart = () => {
  const { cart, updateWeight, removeFromCart, clearCart, subtotal } = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
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
      alert('Order placed successfully! You can track its status under My Orders.');
      navigate('/customer/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place pre-order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Shopping Cart & Pre-Order Checkout</span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/customer')}>Back to Catalog</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
            Your cart is currently empty. <span style={{ color: 'var(--primary-customer)', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/customer')}>Browse meats</span> to add items.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price/kg</th>
                    <th>Weight (kg)</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.cart_item_id || item.product_id}>
                      <td>
                        <strong>{item.product_name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Cut: {item.meat_cut}</div>
                      </td>
                      <td>₱{item.price_per_kg.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          style={{ width: '70px', padding: '4px', textAlign: 'center' }}
                          value={item.weight_kg}
                          onChange={(e) => updateWeight(item.cart_item_id || item.product_id, parseFloat(e.target.value) || 0.1)}
                        />
                      </td>
                      <td style={{ fontWeight: 'bold' }}>₱{(item.price_per_kg * item.weight_kg).toFixed(2)}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeFromCart(item.cart_item_id || item.product_id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontWeight: 'bold', fontSize: '16px', borderTop: '1.5px solid var(--border-color)', paddingTop: '8px' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary-customer)' }}>₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Special Instructions</label>
                <textarea
                  className="form-control"
                  placeholder="e.g. Please slice into 1kg packs"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                className="btn btn-customer btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                <CheckCircle size={18} />
                {loading ? 'Submitting...' : 'Place Pre-Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCart;
