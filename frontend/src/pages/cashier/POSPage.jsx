import React, { useEffect, useState } from 'react';
import { getInventoryApi } from '../../api/inventoryApi';
import { getCategoriesApi } from '../../api/productApi';
import { getOrdersApi, getOrderByIdApi, updateOrderStatusApi } from '../../api/orderApi';
import { createSaleApi } from '../../api/saleApi';
import { useCart } from '../../context/CartContext';
import ReceiptModal from '../../components/pos/ReceiptModal';
import { Search, ShoppingCart, Trash2, CheckCircle, RefreshCw, CreditCard, Users } from 'lucide-react';

const POSPage = () => {
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [processing, setProcessing] = useState(false);

  const {
    cart,
    addToCart,
    updateWeight,
    removeFromCart,
    clearCart,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    amountTendered,
    setAmountTendered,
    subtotal,
    total,
    change
  } = useCart();

  const loadInventory = async () => {
    try {
      const [invRes, catRes] = await Promise.all([
        getInventoryApi({ status: 'available' }),
        getCategoriesApi()
      ]);
      setBatches(invRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await getOrdersApi({ status: 'pending' });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  const loadOrderDetails = async (orderId) => {
    try {
      const res = await getOrderByIdApi(orderId);
      setOrderDetails(res.data || null);
    } catch (err) {
      console.error('Failed to load order details', err);
    }
  };

  useEffect(() => {
    loadInventory();
    loadOrders();
  }, []);

  const filteredBatches = batches.filter((b) => {
    const matchesSearch = b.product_name.toLowerCase().includes(search.toLowerCase()) || b.meat_cut.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat ? b.category_id === Number(selectedCat) : true;
    return matchesSearch && matchesCat;
  });

  const handleTileClick = (batch) => {
    addToCart({
      inventory_id: batch.id,
      product_id: batch.product_id,
      product_name: batch.product_name,
      meat_cut: batch.meat_cut,
      price_per_kg: Number(batch.price_per_kg),
      available_stock_kg: Number(batch.available_stock_kg),
      weight_kg: 1.000
    });
  };

  const handleProcessSale = async () => {
    if (selectedOrder) {
      if (!orderDetails) {
        alert('Please wait until order details have loaded.');
        return;
      }

      const dueAmount = Number(orderDetails.total_amount);
      if (amountTendered < dueAmount && paymentMethod === 'cash') {
        alert(`Amount tendered (₱${amountTendered}) is less than total amount due (₱${dueAmount.toFixed(2)})`);
        return;
      }

      setProcessing(true);
      try {
        await updateOrderStatusApi(selectedOrder.id, 'completed');
        alert(`Payment processed for ${orderDetails.customer_name}. Order #${orderDetails.order_no} is now completed.`);
        setSelectedOrder(null);
        setOrderDetails(null);
        setAmountTendered(0);
        setDiscount(0);
        loadOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to process order payment');
      } finally {
        setProcessing(false);
      }
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (amountTendered < total && paymentMethod === 'cash') {
      alert(`Amount tendered (₱${amountTendered}) is less than total amount due (₱${total.toFixed(2)})`);
      return;
    }

    setProcessing(true);
    try {
      const salePayload = {
        items: cart.map((i) => ({
          inventory_id: i.inventory_id,
          weight_kg: i.weight_kg
        })),
        discount: Number(discount),
        payment_method: paymentMethod,
        amount_tendered: Number(amountTendered)
      };

      const res = await createSaleApi(salePayload);
      setLastSale(res.data.sale);
      setShowReceipt(true);
      clearCart();
      loadInventory(); // Refresh stock after auto-deduction
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process POS sale');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="pos-container">
        
        {/* LEFT COLUMN: Search, Filters & Product Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Filter & Search Bar Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search meat products or cut..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>

              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '150px' }}
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button className="btn btn-outline btn-sm" onClick={loadInventory} title="Refresh Inventory">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Catalog Tiles Grid */}
          <div className="product-tile-grid" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            {filteredBatches.map((b) => (
              <div key={b.id} className="product-tile" onClick={() => handleTileClick(b)}>
                <div style={{ fontSize: '32px', marginBottom: '6px' }}>🥩</div>
                <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', lineHeight: '1.2' }}>{b.product_name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Cut: {b.meat_cut}</div>
                <div style={{ fontWeight: '800', color: 'var(--primary-cashier)', fontSize: '14px', marginTop: '6px' }}>
                  ₱{Number(b.price_per_kg).toFixed(2)}<span style={{ fontSize: '10px', color: '#64748b' }}>/kg</span>
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span className={`badge ${Number(b.available_stock_kg) <= 10 ? 'badge-warning' : 'badge-success'}`}>
                    {Number(b.available_stock_kg).toFixed(2)} kg avail.
                  </span>
                </div>
              </div>
            ))}
            {filteredBatches.length === 0 && (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b', marginBottom: 0 }}>
                {loading ? 'Loading inventory...' : 'No available inventory batches found'}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: POS Cart & Checkout Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Shopping Cart Card */}
          <div className="card" style={{ marginBottom: 0, padding: '20px' }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={18} color="var(--primary-cashier)" /> Current Cart ({cart.length})
              </span>
              {cart.length > 0 && (
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: '#fca5a5' }} onClick={clearCart}>
                  Clear Cart
                </button>
              )}
            </div>

            {/* Pending Orders List */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700' }}><Users size={16} /> Pending Customer Orders</span>
              </div>
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '12px' }}>
                    No pending customer orders.
                  </div>
                ) : orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrder(order);
                      loadOrderDetails(order.id);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      marginBottom: '8px',
                      borderRadius: '12px',
                      border: selectedOrder?.id === order.id ? '2px solid var(--primary-cashier)' : '1px solid #e2e8f0',
                      background: selectedOrder?.id === order.id ? '#fff7ed' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>#{order.order_no}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569' }}>
                      {order.customer_name} • ₱{Number(order.total_amount).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Order Details */}
            {selectedOrder && orderDetails && (
              <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px' }}>Order Details</div>
                <div style={{ fontSize: '12px', marginBottom: '8px' }}><strong>Customer:</strong> {orderDetails.customer_name}</div>
                <div style={{ fontSize: '12px', marginBottom: '8px' }}><strong>Email:</strong> {orderDetails.customer_email || 'N/A'}</div>
                <div style={{ fontSize: '12px', marginBottom: '12px' }}><strong>Phone:</strong> {orderDetails.customer_phone || 'N/A'}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Items</div>
                <div style={{ maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
                  {orderDetails.items.map((item) => (
                    <div key={`${item.product_id}-${item.weight_kg}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '700' }}>{item.product_name}</div>
                        <div style={{ color: '#64748b' }}>{item.meat_cut} • {item.weight_kg} kg</div>
                      </div>
                      <div style={{ fontWeight: '700' }}>₱{Number(item.subtotal).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div style={{ maxHeight: '240px', overflowY: 'auto', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingRight: '4px' }}>
              {cart.map((item) => (
                <div key={item.inventory_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>{item.product_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.meat_cut} • ₱{item.price_per_kg}/kg</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      className="form-control"
                      style={{ width: '70px', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: '800' }}
                      value={item.weight_kg}
                      onChange={(e) => updateWeight(item.inventory_id, parseFloat(e.target.value) || 0.1)}
                    />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>kg</span>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', padding: '6px 8px' }} onClick={() => removeFromCart(item.inventory_id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: '12px' }}>
                  Cart is empty. Click any meat tile to add to sale.
                </div>
              )}
            </div>

            {/* Subtotal & Discount Calculation */}
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>₱{selectedOrder && orderDetails ? Number(orderDetails.subtotal || orderDetails.total_amount).toFixed(2) : subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Discount (₱):</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '90px', padding: '6px 10px', textAlign: 'right', fontSize: '13px', fontWeight: '700' }}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', borderTop: '2px solid var(--border-color)', paddingTop: '10px', color: '#0f172a', marginTop: '4px' }}>
                <span>TOTAL DUE:</span>
                <span style={{ color: 'var(--primary-cashier)' }}>₱{selectedOrder && orderDetails ? Number(orderDetails.total_amount).toFixed(2) : total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Checkout Card */}
          <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', color: '#64748b' }}>
              Payment Method
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {['cash', 'gcash', 'card'].map((method) => (
                <button
                  key={method}
                  className={`btn ${paymentMethod === method ? 'btn-cashier' : 'btn-outline'}`}
                  style={{ fontSize: '12px', textTransform: 'uppercase', padding: '8px' }}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>Amount Tendered:</span>
              <input
                type="number"
                className="form-control"
                style={{ width: '130px', fontSize: '15px', fontWeight: '800', textAlign: 'right' }}
                value={amountTendered}
                onChange={(e) => setAmountTendered(Number(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', marginBottom: '18px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: '#64748b' }}>Change:</span>
              <span style={{ color: 'var(--success)' }}>₱{change.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-cashier btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleProcessSale}
              disabled={processing || (!selectedOrder && cart.length === 0)}
            >
              <CheckCircle size={18} />
              {processing ? 'Processing...' : selectedOrder ? 'Process Payment' : 'Process Sale & Print Receipt'}
            </button>
          </div>
        </div>

      </div>

      <ReceiptModal isOpen={showReceipt} onClose={() => setShowReceipt(false)} sale={lastSale} />
    </div>
  );
};

export default POSPage;
