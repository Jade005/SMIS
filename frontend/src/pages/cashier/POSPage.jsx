import React, { useEffect, useState } from 'react';
import { getInventoryApi } from '../../api/inventoryApi';
import { getCategoriesApi } from '../../api/productApi';
import { createSaleApi } from '../../api/saleApi';
import { useCart } from '../../context/CartContext';
import ReceiptModal from '../../components/pos/ReceiptModal';
import { Search, ShoppingCart, Trash2, CheckCircle } from 'lucide-react';

const POSPage = () => {
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredBatches = batches.filter((b) => {
    const matchesSearch = b.product_name.toLowerCase().includes(search.toLowerCase()) || b.meat_cut.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process POS sale');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '16px' }}>
      <div className="pos-container">
        {/* LEFT: Item Selection & Catalog Grid */}
        <div style={{ display: 'flex', flexDirect: 'column', gap: '12px', overflow: 'hidden' }}>
          <div className="card" style={{ marginBottom: 0, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search meat products by name or cut..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              </div>
            </div>
          </div>

          <div className="product-tile-grid" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {filteredBatches.map((b) => (
              <div key={b.id} className="product-tile" onClick={() => handleTileClick(b)}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>🥩</div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#0f172a', lineHeight: '1.2' }}>{b.product_name}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Cut: {b.meat_cut}</div>
                <div style={{ fontWeight: '800', color: 'var(--primary-cashier)', fontSize: '13px', marginTop: '4px' }}>
                  ₱{Number(b.price_per_kg).toFixed(2)}/kg
                </div>
                <div style={{ fontSize: '10px', color: Number(b.available_stock_kg) <= 10 ? 'var(--warning)' : '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>
                  {Number(b.available_stock_kg).toFixed(3)} kg avail.
                </div>
              </div>
            ))}
            {filteredBatches.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '13px' }}>
                No active inventory batches match your search
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Live Cart & Transaction Total */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0, padding: '16px', overflow: 'hidden' }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={18} /> POS Cart
              </span>
              {cart.length > 0 && (
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={clearCart}>
                  Clear Cart
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', borderBottom: '1px solid var(--border-color)', marginBottom: '12px', paddingRight: '4px' }}>
              {cart.map((item) => (
                <div key={item.inventory_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{item.product_name} ({item.meat_cut})</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>₱{item.price_per_kg}/kg</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      style={{ width: '64px', padding: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}
                      value={item.weight_kg}
                      onChange={(e) => updateWeight(item.inventory_id, parseFloat(e.target.value) || 0.1)}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>kg</span>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', padding: '4px 6px' }} onClick={() => removeFromCart(item.inventory_id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: '12px' }}>
                  Cart is empty. Tap a product tile to add items.
                </div>
              )}
            </div>

            {/* Totals & Calculations */}
            <div style={{ fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span>Discount (₱):</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '80px', padding: '4px', textAlign: 'right', fontSize: '12px' }}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '16px', borderTop: '2px solid var(--border-color)', paddingTop: '8px', color: '#0f172a' }}>
                <span>TOTAL DUE:</span>
                <span style={{ color: 'var(--primary-cashier)' }}>₱{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Panel */}
          <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b' }}>Payment Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
              {['cash', 'gcash', 'card'].map((method) => (
                <button
                  key={method}
                  className={`btn ${paymentMethod === method ? 'btn-cashier' : 'btn-outline'}`}
                  style={{ fontSize: '11px', textTransform: 'uppercase', padding: '6px' }}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Tendered (₱):</span>
              <input
                type="number"
                className="form-control"
                style={{ width: '120px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}
                value={amountTendered}
                onChange={(e) => setAmountTendered(Number(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>
              <span>Change:</span>
              <span style={{ color: 'var(--success)' }}>₱{change.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-cashier btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleProcessSale}
              disabled={processing || cart.length === 0}
            >
              <CheckCircle size={18} />
              {processing ? 'Processing Sale...' : 'Process Sale & Print Receipt'}
            </button>
          </div>
        </div>
      </div>

      <ReceiptModal isOpen={showReceipt} onClose={() => setShowReceipt(false)} sale={lastSale} />
    </div>
  );
};

export default POSPage;
