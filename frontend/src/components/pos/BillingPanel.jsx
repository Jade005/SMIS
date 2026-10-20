import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import {
  Users, Search, RefreshCw, X, CheckCircle,
  AlertTriangle, Trash2, Tag, UserCheck, ArrowRight
} from 'lucide-react';

/**
 * BillingPanel (Order Summary Panel)
 * Displays customer info, pending customer orders, cart items,
 * and billing totals (subtotal, discount, total due).
 * Has a primary action "Proceed to Payment" to open the Payment Panel.
 */
const BillingPanel = ({
  orders = [],
  ordersLoading = false,
  onRefreshOrders,
  onSelectOrder,
  unresolvedItems = [],
  onProceedToPayment
}) => {
  const [pendingSearch, setPendingSearch] = useState('');

  const {
    cart,
    updateWeight,
    removeFromCart,
    clearCart,
    discount,
    setDiscount,
    subtotal,
    total,
    activeOrder,
    clearActiveOrder
  } = useCart();

  const preorderCount = cart.filter((i) => i.source === 'preorder').length;
  const walkinCount = cart.filter((i) => i.source === 'walkin').length;

  const formatOrderTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const searchTerm = pendingSearch.trim().toLowerCase();
  const filteredOrders = searchTerm
    ? orders.filter(
        (o) =>
          (o.customer_name || '').toLowerCase().includes(searchTerm) ||
          (o.order_no || '').toLowerCase().includes(searchTerm)
      )
    : orders;

  // Disabled if cart is empty (cannot proceed with 0 items)
  const isProceedDisabled = cart.length === 0;

  return (
    <div className="card" style={{ padding: '20px', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── 1. Selected Customer Card ── */}
      {activeOrder ? (
        <div style={{
          padding: '12px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
          border: '2px solid var(--primary-cashier)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <UserCheck size={22} color="var(--primary-cashier)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                {activeOrder.customerName}
              </div>
              {activeOrder.customerPhone && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  📞 {activeOrder.customerPhone}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '700', marginTop: '3px' }}>
                Order #{activeOrder.orderNo}
              </div>
              {preorderCount > 0 && walkinCount > 0 && (
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                  {preorderCount} pre-ordered · {walkinCount} walk-in added
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            title="Clear customer order — switch to walk-in"
            onClick={clearActiveOrder}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#ef4444', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
              👤 Walk-in Customer
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Select a pending order below or pick meat cuts directly.
            </div>
          </div>
          {cart.length > 0 && (
            <button
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--danger)', borderColor: '#fca5a5', padding: '4px 8px', fontSize: '11px' }}
              onClick={clearCart}
            >
              Clear Cart
            </button>
          )}
        </div>
      )}

      {/* ── Stock Resolution Warnings ── */}
      {unresolvedItems.length > 0 && (
        <div style={{
          padding: '10px 12px',
          borderRadius: '10px',
          background: '#fef9c3',
          border: '1px solid #fde047',
          fontSize: '12px',
          color: '#713f12'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '4px' }}>
            <AlertTriangle size={14} /> Stock not found for:
          </div>
          {unresolvedItems.map((name, i) => (
            <div key={i}>• {name}</div>
          ))}
          <div style={{ marginTop: '4px', color: '#92400e' }}>Add these items manually from the product grid.</div>
        </div>
      )}

      {/* ── 2. Pending Customer Orders Section ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: '#F6EBDD' }}>
            <Users size={15} color="var(--primary-cashier)" /> Pending Customer Orders
            {filteredOrders.length > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: '700', background: 'var(--primary-cashier)',
                color: '#fff', borderRadius: '10px', padding: '1px 7px', minWidth: '18px',
                textAlign: 'center', lineHeight: '16px'
              }}>{filteredOrders.length}</span>
            )}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onRefreshOrders}
            disabled={ordersLoading}
            title="Refresh pending orders"
            style={{ padding: '4px 8px' }}
          >
            <RefreshCw size={12} className={ordersLoading ? 'spin' : ''} />
          </button>
        </div>

        {/* Search input for pending orders */}
        {orders.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              placeholder="Search customer name or order #..."
              aria-label="Search pending customer orders"
              style={{
                width: '100%', padding: '7px 28px 7px 30px',
                fontSize: '12px', borderRadius: '8px',
                border: '1px solid #e2e8f0', background: '#f8fafc',
                outline: 'none', color: '#374151',
                boxSizing: 'border-box'
              }}
            />
            {pendingSearch && (
              <button
                type="button"
                onClick={() => setPendingSearch('')}
                title="Clear search"
                style={{
                  position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                  color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Orders scrollable list */}
        <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {ordersLoading && (
            <div style={{ textAlign: 'center', padding: '12px', color: '#C9B4A6', fontSize: '12px' }}>
              Loading orders...
            </div>
          )}
          {!ordersLoading && orders.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '14px',
              background: '#f8fafc', borderRadius: '8px',
              border: '1px dashed #e2e8f0',
              color: '#94a3b8', fontSize: '12px'
            }}>
              <div>No pending customer orders.</div>
            </div>
          )}
          {!ordersLoading && orders.length > 0 && filteredOrders.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '14px',
              background: '#f8fafc', borderRadius: '8px',
              border: '1px dashed #e2e8f0',
              color: '#94a3b8', fontSize: '12px'
            }}>
              <div>No matching pending orders found</div>
            </div>
          )}
          {!ordersLoading && filteredOrders.map((order) => {
            const isActive = activeOrder?.orderId === order.id;
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectOrder(order)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isActive ? '2px solid var(--primary-cashier)' : '1px solid #e2e8f0',
                  background: isActive ? '#fff7ed' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'border 0.15s, background 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>
                    {isActive && <CheckCircle size={12} color="var(--primary-cashier)" style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {order.customer_name}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatOrderTime(order.created_at)}</span>
                </div>
                <div style={{ marginTop: '2px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>#{order.order_no}</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary-cashier)' }}>₱{Number(order.total_amount).toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Cart Line Items ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F6EBDD' }}>
            Cart Line Items ({cart.length})
          </span>
          <span style={{ fontSize: '11px', color: '#C9B4A6' }}>
            Total Weight: {cart.reduce((sum, item) => sum + (Number(item.weight_kg) || 0), 0).toFixed(2)} kg
          </span>
        </div>

        <div style={{ maxHeight: '220px', overflowY: 'auto', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', paddingRight: '4px' }}>
          {cart.map((item) => (
            <div
              key={item.cart_item_id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 0', borderBottom: '1px solid #f1f5f9'
              }}
            >
              <div style={{ flex: 1, paddingRight: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#FFFFFF' }}>{item.product_name}</span>
                  {item.source === 'preorder' && (
                    <span style={{
                      fontSize: '9px', fontWeight: '700', padding: '1px 5px',
                      borderRadius: '4px', background: '#fed7aa', color: '#c2410c',
                      display: 'inline-flex', alignItems: 'center', gap: '2px'
                    }}>
                      <Tag size={8} /> Pre-order
                    </span>
                  )}
                  {item.source === 'walkin' && activeOrder && (
                    <span style={{
                      fontSize: '9px', fontWeight: '700', padding: '1px 5px',
                      borderRadius: '4px', background: '#d1fae5', color: '#065f46',
                      display: 'inline-flex', alignItems: 'center', gap: '2px'
                    }}>
                      + Added
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#C9B4A6' }}>
                  {item.meat_cut} · ₱{Number(item.price_per_kg).toFixed(2)}/kg
                  <strong style={{ marginLeft: '6px', color: '#F6EBDD' }}>
                    ₱{((Number(item.price_per_kg) || 0) * (Number(item.weight_kg) || 0)).toFixed(2)}
                  </strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={item.available_stock_kg || 9999}
                  className="form-control"
                  style={{ width: '64px', padding: '4px 6px', textAlign: 'center', fontSize: '12px', fontWeight: '800' }}
                  value={item.weight_kg}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value) || 0.1;
                    const max = Number(item.available_stock_kg) || 0;
                    if (max > 0 && parsed > max) {
                      updateWeight(item.cart_item_id, max);
                    } else {
                      updateWeight(item.cart_item_id, parsed);
                    }
                  }}
                />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#C9B4A6' }}>kg</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger)', padding: '5px 7px' }}
                  onClick={() => removeFromCart(item.cart_item_id)}
                  title="Remove item"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: '#C9B4A6', fontSize: '12px' }}>
              {activeOrder
                ? 'No items loaded for this order. Click any meat tile to add items.'
                : 'Cart is empty. Select a customer order above or click a meat tile to start.'}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Billing Totals ── */}
      <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C9B4A6' }}>
          <span>Subtotal:</span>
          <span style={{ fontWeight: '700', color: '#F6EBDD' }}>₱{subtotal.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#C9B4A6' }}>Discount (₱):</span>
            <div style={{ fontSize: '10px', color: '#C9B4A6' }}>Deduction from subtotal</div>
          </div>
          <input
            type="number"
            min="0"
            max={subtotal}
            placeholder="0.00"
            className="form-control"
            style={{ width: '100px', padding: '6px 10px', textAlign: 'right', fontSize: '14px', fontWeight: '700' }}
            value={discount === 0 ? '' : discount}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
              if (val > subtotal) {
                alert(`Discount cannot exceed the subtotal (₱${subtotal.toFixed(2)})`);
                setDiscount(subtotal);
              } else {
                setDiscount(val);
              }
            }}
          />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontWeight: '800', fontSize: '18px',
          borderTop: '2px solid var(--border-color)',
          paddingTop: '10px', color: '#FFFFFF', marginTop: '2px'
        }}>
          <span>TOTAL DUE:</span>
          <span style={{ color: 'var(--primary-cashier)' }}>₱{total.toFixed(2)}</span>
        </div>
      </div>

      {/* ── 5. Primary Action Button: Proceed to Payment ── */}
      <button
        type="button"
        className="btn btn-cashier btn-lg"
        style={{ width: '100%', justifyContent: 'center', marginTop: '4px', gap: '8px' }}
        onClick={onProceedToPayment}
        disabled={isProceedDisabled}
      >
        <span>Proceed to Payment — ₱{total.toFixed(2)}</span>
        <ArrowRight size={18} />
      </button>

      {isProceedDisabled && (
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#C9B4A6', marginTop: '-8px' }}>
          Add at least one item to proceed to payment
        </div>
      )}
    </div>
  );
};

export default BillingPanel;
