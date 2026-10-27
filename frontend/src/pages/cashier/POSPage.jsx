import React, { useEffect, useState, useCallback } from 'react';
import { getInventoryApi } from '../../api/inventoryApi';
import { getCategoriesApi } from '../../api/productApi';
import { getOrdersApi, getOrderByIdApi, updateOrderStatusApi } from '../../api/orderApi';
import { createSaleApi } from '../../api/saleApi';
import { useCart } from '../../context/CartContext';
import BillingPanel from '../../components/pos/BillingPanel';
import PaymentPanel from '../../components/pos/PaymentPanel';
import ReceiptModal from '../../components/pos/ReceiptModal';
import { getProductImage } from '../../utils/meatImages';
import { Search, RefreshCw } from 'lucide-react';
import PageLoader from '../../components/common/PageLoader';

/**
 * POSPage (Cashier POS Terminal)
 * Two-column layout:
 * - Left column: Meat products inventory grid with search & category filter.
 * - Right column: Modular BillingPanel (Step 1) and slide-over PaymentPanel (Step 2).
 */
const POSPage = () => {
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [unresolvedItems, setUnresolvedItems] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const {
    cart,
    addToCart,
    clearCart,
    discount,
    setDiscount,
    amountTendered,
    setAmountTendered,
    subtotal,
    total,
    activeOrder,
    loadOrderIntoCart,
    clearActiveOrder
  } = useCart();

  // ─── Data loaders ────────────────────────────────────────────────────────

  const loadInventory = useCallback(async () => {
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
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await getOrdersApi({ status: 'pending' });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
    loadOrders();
  }, [loadInventory, loadOrders]);

  // ─── Tile grid filtering & click ───────────────────────────────────────────

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.product_name.toLowerCase().includes(search.toLowerCase()) ||
      b.meat_cut.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat ? b.category_id === Number(selectedCat) : true;
    return matchesSearch && matchesCat;
  });

  const handleTileClick = (batch) => {
    const available = Number(batch.available_stock_kg) || 0;
    if (available <= 0) {
      alert(`Cannot add ${batch.product_name}: Batch has 0 kg available stock.`);
      return;
    }
    const currentInCart = cart.find((i) => i.inventory_id === batch.id);
    if (currentInCart && Number(currentInCart.weight_kg) >= available) {
      alert(`Cannot add more. All ${available.toFixed(3)} kg of this batch is already in your cart.`);
      return;
    }

    const effectivePrice = Number(
      batch.product_price_per_kg !== undefined && batch.product_price_per_kg !== null
        ? batch.product_price_per_kg
        : batch.price_per_kg
    );

    addToCart({
      inventory_id: batch.id,
      product_id: batch.product_id,
      product_name: batch.product_name,
      meat_cut: batch.meat_cut,
      price_per_kg: effectivePrice,
      available_stock_kg: available,
      weight_kg: 1.000,
      source: 'walkin'
    });
  };

  // ─── Customer order selection ─────────────────────────────────────────────

  const handleSelectOrder = async (order) => {
    try {
      const res = await getOrderByIdApi(order.id);
      const details = res.data;
      const unresolved = loadOrderIntoCart(details, batches);
      setUnresolvedItems(unresolved);
    } catch (err) {
      console.error('Failed to load order details', err);
      alert('Could not load order details. Please try again.');
    }
  };

  // ─── Checkout & Sale Processing ────────────────────────────────────────────

  const handleProcessSale = async (paymentDetails = {}) => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items before checking out.');
      return;
    }
    if (discount > subtotal) {
      alert(`Discount (₱${Number(discount).toFixed(2)}) cannot exceed the subtotal (₱${subtotal.toFixed(2)})`);
      return;
    }

    for (const item of cart) {
      if (Number(item.weight_kg) > Number(item.available_stock_kg)) {
        alert(`Cannot sell ${item.weight_kg} kg of ${item.product_name}. Available stock is only ${item.available_stock_kg} kg.`);
        return;
      }
    }

    const currentTendered = paymentDetails.amountTendered !== undefined ? paymentDetails.amountTendered : amountTendered;

    if (Number(currentTendered) < total) {
      alert(`Amount tendered (₱${currentTendered}) is less than total due (₱${total.toFixed(2)})`);
      return;
    }

    setProcessing(true);
    try {
      const salePayload = {
        items: cart.map((i) => ({
          inventory_id: i.inventory_id,
          weight_kg: i.weight_kg,
          price_per_kg: Number(i.price_per_kg)
        })),
        discount: Number(discount),
        payment_method: 'cash',
        amount_tendered: Number(currentTendered),
        notes: null,
        ...(activeOrder ? { customer_id: activeOrder.customerId } : {})
      };

      const res = await createSaleApi(salePayload);

      // If fulfilling a customer order, mark it completed in the orders table
      if (activeOrder) {
        try {
          await updateOrderStatusApi(activeOrder.orderId, 'completed');
        } catch (statusErr) {
          console.warn('Sale recorded but order status update failed:', statusErr);
        }
      }

      // Attach customer info for receipt printing and confirmation recap
      const saleRecord = {
        ...res.data.sale,
        ...(activeOrder ? {
          customer_name: activeOrder.customerName,
          fulfilled_order_no: activeOrder.orderNo
        } : {})
      };

      // Notify other views (like CashierDashboard) that a sale was completed
      try {
        localStorage.setItem('smis_sale_timestamp', Date.now().toString());
        window.dispatchEvent(new CustomEvent('sale-completed', { detail: saleRecord }));
      } catch (evtErr) {
        console.warn('Event dispatch error:', evtErr);
      }

      setLastSale(saleRecord);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process sale');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Resets the terminal for the next customer:
   * clears cart, active order, discount, tendered amounts, and refreshes orders + inventory.
   */
  const handleResetTerminal = () => {
    clearActiveOrder();
    clearCart();
    setDiscount(0);
    setAmountTendered(0);
    setUnresolvedItems([]);
    setLastSale(null);
    loadInventory();
    loadOrders();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="pos-container">

        {/* ── LEFT COLUMN: Product Catalog Grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Filter & Search Bar */}
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
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={loadInventory}
                title="Refresh Inventory"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Product Tiles */}
          <div className="product-tile-grid" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            {filteredBatches.map((b) => {
              const imgSrc = imageErrors[b.id]
                ? getProductImage({ ...b, name: b.product_name, image_url: null })
                : getProductImage({ ...b, name: b.product_name });
              const productTotal = Number(b.product_total_stock_kg !== undefined ? b.product_total_stock_kg : b.available_stock_kg) || 0;
              const threshold = Number(b.low_stock_threshold) || 15;
              const isOutOfStock = productTotal <= 0 || Number(b.available_stock_kg) <= 0;
              const isLow = !isOutOfStock && productTotal <= threshold;
              const meatCategory = b.category_name || b.meat_type || 'Fresh Meat';

              return (
                <div
                  key={b.id}
                  className="product-tile"
                  onClick={() => !isOutOfStock && handleTileClick(b)}
                  style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  title={isOutOfStock ? `${b.product_name} is out of stock` : `Click to add ${b.product_name} (${b.meat_cut}) to cart`}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '140px',
                    background: '#f1f5f9',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={imgSrc}
                      alt={b.product_name}
                      loading="lazy"
                      onError={() => setImageErrors((prev) => ({ ...prev, [b.id]: true }))}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.3s ease'
                      }}
                    />

                    {/* Category Pill Tag */}
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(15, 23, 42, 0.82)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {meatCategory}
                    </span>

                    {/* Available Stock Tag */}
                    <span style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: isOutOfStock ? 'rgba(100, 116, 139, 0.92)' : isLow ? 'rgba(239, 68, 68, 0.92)' : 'rgba(22, 163, 74, 0.92)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '5px'
                    }}>
                      {Number(b.available_stock_kg).toFixed(1)} kg
                    </span>
                  </div>

                  {/* Product Details */}
                  <div style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{
                      fontWeight: '800',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '36px'
                    }}>
                      {b.product_name}
                    </div>

                    <div style={{ fontSize: '12px', color: '#C9B4A6' }}>
                      Cut: <strong>{b.meat_cut}</strong>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginTop: '6px',
                      paddingTop: '6px',
                      borderTop: '1px solid rgba(246, 235, 221, 0.12)'
                    }}>
                      <div style={{ fontWeight: '800', color: 'var(--primary-cashier)', fontSize: '15px' }}>
                        ₱{Number(b.product_price_per_kg !== undefined && b.product_price_per_kg !== null ? b.product_price_per_kg : b.price_per_kg).toFixed(2)}<span style={{ fontSize: '11px', color: '#C9B4A6', fontWeight: '500' }}>/kg</span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: isOutOfStock ? '#FF4D4F' : isLow ? '#FFB800' : '#7BD36B',
                        fontWeight: '700'
                      }}>
                        {isOutOfStock ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredBatches.length === 0 && (
              loading ? (
                <div style={{ gridColumn: '1/-1' }}>
                  <PageLoader message="Loading POS inventory batches..." />
                </div>
              ) : (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#C9B4A6', marginBottom: 0 }}>
                  No available inventory batches found
                </div>
              )
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Step 1 Billing Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <BillingPanel
            orders={orders}
            ordersLoading={ordersLoading}
            onRefreshOrders={loadOrders}
            onSelectOrder={handleSelectOrder}
            unresolvedItems={unresolvedItems}
            onProceedToPayment={() => setIsPaymentOpen(true)}
          />
        </div>
      </div>

      {/* ── Step 2 Payment Slide-over Drawer ── */}
      <PaymentPanel
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onProcessSale={handleProcessSale}
        processing={processing}
        lastCompletedSale={lastSale}
        onPrintReceipt={(sale) => {
          setLastSale(sale);
          setShowReceipt(true);
        }}
        onResetTerminal={handleResetTerminal}
      />

      {/* ── Printable Official Receipt Modal ── */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        sale={lastSale}
      />
    </div>
  );
};

export default POSPage;
