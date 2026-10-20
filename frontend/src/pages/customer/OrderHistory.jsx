import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrdersApi, getOrderByIdApi, cancelOrderApi } from '../../api/orderApi';
import { getProductsApi } from '../../api/productApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Toast from '../../components/common/Toast';
import Logo from '../../components/common/Logo';
import {
  Eye,
  XCircle,
  RotateCcw,
  Printer,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  Package,
  FileText,
  Filter,
  ArrowUpDown
} from 'lucide-react';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest) | 'asc' (oldest)

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null); // Full order object with items
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cancel confirmation state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Receipt modal state
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Reorder loading state
  const [reorderLoadingId, setReorderLoadingId] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyOrdersApi();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load pre-orders:', err);
      setError(err.response?.data?.message || 'Failed to load pre-orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Keyboard Escape listener to close any active modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDetailsModal(false);
        setOrderToCancel(null);
        setShowReceiptModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & sorted orders
  const processedOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, statusFilter, sortOrder]);

  // Fetch full order details (with items)
  const fetchOrderDetails = async (orderId) => {
    const res = await getOrderByIdApi(orderId);
    return res.data;
  };

  // 1. VIEW ACTION
  const handleView = async (order) => {
    setDetailsLoading(true);
    setShowDetailsModal(true);
    setSelectedOrder(order); // Initial shallow data
    try {
      const fullOrder = await fetchOrderDetails(order.id);
      setSelectedOrder(fullOrder);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setToast({
        message: err.response?.data?.message || 'Could not load order details.',
        type: 'error'
      });
      setShowDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 2. CANCEL ACTION
  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelLoading(true);
    try {
      await cancelOrderApi(orderToCancel.id);
      // Update row in state without full page reload
      setOrders((prev) =>
        prev.map((o) => (o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o))
      );
      if (selectedOrder && selectedOrder.id === orderToCancel.id) {
        setSelectedOrder((prev) => ({ ...prev, status: 'cancelled' }));
      }
      setToast({ message: 'Order cancelled.', type: 'info' });
      setOrderToCancel(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      const msg = err.response?.data?.message || 'This order has already been confirmed and can no longer be cancelled';
      setToast({ message: msg, type: 'error' });
      setOrderToCancel(null);
    } finally {
      setCancelLoading(false);
    }
  };

  // 3. REORDER ACTION
  const handleReorder = async (order) => {
    setReorderLoadingId(order.id);
    try {
      // 1. Fetch order items
      const fullOrder = await fetchOrderDetails(order.id);
      const orderItems = fullOrder.items || [];

      if (orderItems.length === 0) {
        setToast({ message: 'No items found in this order to reorder.', type: 'error' });
        setReorderLoadingId(null);
        return;
      }

      // 2. Fetch current catalog of active products
      const productsRes = await getProductsApi();
      const allProducts = productsRes.data || [];

      let addedCount = 0;
      const skippedNames = [];
      const adjustedNames = [];

      for (const item of orderItems) {
        // Match active product by ID
        const currentProd = allProducts.find(
          (p) => p.id === item.product_id && Boolean(p.is_active)
        );

        if (!currentProd) {
          skippedNames.push(item.product_name || `Product #${item.product_id}`);
          continue;
        }

        const availableStock = Number(currentProd.available_stock_kg ?? currentProd.stock_kg ?? 0);
        if (availableStock <= 0) {
          skippedNames.push(currentProd.name);
          continue;
        }

        let finalWeight = Number(item.weight_kg) || 1;
        if (availableStock < finalWeight) {
          adjustedNames.push(`${currentProd.name} (reduced to ${availableStock} kg due to stock)`);
          finalWeight = availableStock;
        }

        // Add to cart with current live price and current product details
        addToCart({
          product_id: currentProd.id,
          product_name: currentProd.name,
          meat_cut: currentProd.meat_cut || item.meat_cut,
          price_per_kg: Number(currentProd.price_per_kg),
          available_stock_kg: availableStock,
          weight_kg: finalWeight,
          category: currentProd.category,
          source: 'preorder'
        });
        addedCount++;
      }

      if (addedCount === 0) {
        setToast({
          message: `Unable to reorder: The products (${skippedNames.join(', ')}) are currently out of stock or unavailable.`,
          type: 'error'
        });
      } else {
        let msg = `Added ${addedCount} item(s) from Order #${order.order_no} to your cart.`;
        if (skippedNames.length > 0) {
          msg += ` Skipped out-of-stock: ${skippedNames.join(', ')}.`;
        }
        if (adjustedNames.length > 0) {
          msg += ` ${adjustedNames.join(', ')}.`;
        }
        setToast({ message: msg, type: 'success' });
        // Navigate to Cart page
        setTimeout(() => {
          navigate('/customer/cart');
        }, 1200);
      }
    } catch (err) {
      console.error('Reorder error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to reorder items. Please try again.',
        type: 'error'
      });
    } finally {
      setReorderLoadingId(null);
    }
  };

  // 4. RECEIPT ACTION
  const handleOpenReceipt = async (order) => {
    setReceiptLoading(true);
    setShowReceiptModal(true);
    setReceiptOrder(order);
    try {
      const fullOrder = await fetchOrderDetails(order.id);
      setReceiptOrder(fullOrder);
    } catch (err) {
      console.error('Failed to load receipt details:', err);
      setToast({ message: 'Could not load receipt details.', type: 'error' });
      setShowReceiptModal(false);
    } finally {
      setReceiptLoading(false);
    }
  };

  // Helper for status badge styling
  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fde68a',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              fontWeight: '700',
              letterSpacing: '0.04em'
            }}
          >
            PENDING
          </span>
        );
      case 'confirmed':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#93c5fd',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              fontWeight: '700',
              letterSpacing: '0.04em'
            }}
          >
            CONFIRMED
          </span>
        );
      case 'ready':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#6ee7b7',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              fontWeight: '700',
              letterSpacing: '0.04em'
            }}
          >
            READY FOR PICKUP
          </span>
        );
      case 'completed':
        return (
          <span
            className="badge badge-success"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#86efac',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              fontWeight: '700',
              letterSpacing: '0.04em'
            }}
          >
            COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              fontWeight: '700',
              letterSpacing: '0.04em'
            }}
          >
            CANCELLED
          </span>
        );
      case 'rejected':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(220, 38, 38, 0.2)',
              color: '#f87171',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              fontWeight: '700',
              letterSpacing: '0.04em'
            }}
          >
            REJECTED
          </span>
        );
      default:
        return (
          <span className="badge badge-gray" style={{ fontWeight: '700' }}>
            {(status || 'UNKNOWN').toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      <style>{`
        .action-btn {
          height: 34px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 600;
          border-radius: 8px;
          flex-shrink: 0;
          box-sizing: border-box;
          line-height: 1;
          transition: all 0.2s ease;
          background: rgba(246, 235, 221, 0.05);
          color: #fdf2e3;
          border: 1px solid rgba(246, 235, 221, 0.25);
          cursor: pointer;
        }
        .action-btn:hover {
          background: rgba(246, 235, 221, 0.12);
          border-color: rgba(246, 235, 221, 0.5);
          color: #ffffff;
        }
        .action-btn-text {
          display: inline;
          white-space: nowrap;
        }
        .actions-cell-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }
        @media (max-width: 1024px) {
          .action-btn-text {
            display: none;
          }
          .action-btn {
            padding: 0 10px !important;
            width: 34px !important;
          }
          .actions-col-header,
          .actions-col-cell {
            min-width: 160px !important;
            width: 160px !important;
          }
        }

        /* Printable Receipt Styles */
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-customer-receipt,
          #printable-customer-receipt * {
            visibility: visible !important;
          }
          #printable-customer-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 480px !important;
            margin: 0 auto !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Order History Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px'
          }}
        >
          <div>
            <span
              className="card-title"
              style={{
                fontFamily: "var(--font-display, 'Alfa Slab One', 'Rockwell', 'Georgia', serif)",
                fontSize: '20px',
                color: '#fdf2e3',
                letterSpacing: '0.02em',
                lineHeight: 1.2
              }}
            >
              My Pre-Order History
            </span>
            <div style={{ fontSize: '13px', color: '#e5d5c3', marginTop: '4px' }}>
              View, track, reorder, or get receipts for your fresh meat pre-orders.
            </div>
          </div>

          {/* Controls: Filter & Sort */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="#e5d5c3" />
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  height: '36px',
                  fontSize: '12px',
                  background: '#140507',
                  color: '#fdf2e3',
                  border: '1px solid rgba(246, 235, 221, 0.25)',
                  borderRadius: '8px',
                  padding: '0 10px',
                  cursor: 'pointer'
                }}
                aria-label="Filter by order status"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="pending">Pending ({orders.filter((o) => o.status === 'pending').length})</option>
                <option value="confirmed">Confirmed ({orders.filter((o) => o.status === 'confirmed').length})</option>
                <option value="completed">Completed ({orders.filter((o) => o.status === 'completed').length})</option>
                <option value="cancelled">Cancelled ({orders.filter((o) => o.status === 'cancelled').length})</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              style={{
                height: '36px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#fdf2e3',
                borderColor: 'rgba(246, 235, 221, 0.25)'
              }}
              title="Toggle date sorting"
            >
              <ArrowUpDown size={13} />
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e5d5c3' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 14px', color: 'var(--meat-hi, #f43f5e)' }} />
            <div style={{ fontSize: '15px', fontWeight: '600' }}>Loading your pre-orders...</div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#fca5a5',
              margin: '10px 0'
            }}
          >
            <AlertTriangle size={32} style={{ margin: '0 auto 10px', color: '#ef4444' }} />
            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{error}</div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={loadOrders}
              style={{ marginTop: '10px', color: '#ffffff' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(246, 235, 221, 0.02)',
              borderRadius: '12px',
              border: '1px dashed rgba(246, 235, 221, 0.12)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <ShoppingBag size={30} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fdf2e3', marginBottom: '8px' }}>
              You have no pre-orders yet
            </h3>
            <p style={{ fontSize: '13px', color: '#e5d5c3', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Choose premium Batangas beef and pork cuts from our fresh slaughterhouse catalog and place your pre-order today.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/customer/catalog')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Package size={16} /> Browse Fresh Meats
            </button>
          </div>
        )}

        {/* Empty Filter Results */}
        {!loading && !error && orders.length > 0 && processedOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#e5d5c3' }}>
            <p>No orders match the selected status filter (<strong>{statusFilter.toUpperCase()}</strong>).</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setStatusFilter('all')}
              style={{ marginTop: '8px' }}
            >
              Show All Orders
            </button>
          </div>
        )}

        {/* Pre-Orders Table */}
        {!loading && !error && processedOrders.length > 0 && (
          <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', borderRadius: '12px' }}>
            <table style={{ width: '100%', minWidth: '880px', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>Order No.</th>
                  <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>Total Amount</th>
                  <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>Status</th>
                  <th className="actions-col-header" style={{ minWidth: '320px', width: '320px', textAlign: 'left' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.map((o) => {
                  const s = (o.status || '').toLowerCase();
                  const isPending = s === 'pending';
                  const isCompleted = s === 'completed';
                  const canReorder = s === 'completed' || s === 'cancelled' || s === 'rejected';

                  return (
                    <tr key={o.id}>
                      {/* Order No. */}
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <code
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fdf2e3',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '12.5px',
                            fontFamily: '"SFMono-Regular", Consolas, Menlo, monospace'
                          }}
                        >
                          {o.order_no}
                        </code>
                      </td>

                      {/* Date */}
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', color: '#e5d5c3', fontSize: '13px' }}>
                        {new Date(o.created_at).toLocaleString()}
                      </td>

                      {/* Total Amount */}
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', fontWeight: '800', color: '#fdf2e3', fontSize: '14px' }}>
                        ₱{Number(o.total_amount).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        {renderStatusBadge(o.status)}
                      </td>

                      {/* ACTIONS PER ROW */}
                      <td className="actions-col-cell" style={{ verticalAlign: 'middle', minWidth: '320px', width: '320px', textAlign: 'left' }}>
                        <div className="actions-cell-container">
                          {/* 1. View button (shown for all orders) */}
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleView(o)}
                            title={`View details for ${o.order_no}`}
                          >
                            <Eye size={13} color="#fdf2e3" />
                            <span className="action-btn-text">View</span>
                          </button>

                          {/* 2. Cancel button (shown only for PENDING orders) */}
                          {isPending && (
                            <button
                              type="button"
                              className="action-btn"
                              style={{
                                color: '#ef4444',
                                borderColor: 'rgba(239, 68, 68, 0.45)',
                                background: 'rgba(239, 68, 68, 0.08)'
                              }}
                              onClick={() => handleOpenCancelModal(o)}
                              title={`Cancel pending order ${o.order_no}`}
                            >
                              <XCircle size={13} color="#ef4444" />
                              <span className="action-btn-text">Cancel</span>
                            </button>
                          )}

                          {/* 3. Reorder button (shown for COMPLETED, CANCELLED, REJECTED) */}
                          {canReorder && (
                            <button
                              type="button"
                              className="action-btn"
                              style={{
                                color: '#38bdf8',
                                borderColor: 'rgba(56, 189, 248, 0.4)',
                                background: 'rgba(56, 189, 248, 0.08)'
                              }}
                              onClick={() => handleReorder(o)}
                              disabled={reorderLoadingId === o.id}
                              title={`Add items from ${o.order_no} to cart`}
                            >
                              {reorderLoadingId === o.id ? (
                                <Loader2 size={13} className="animate-spin" color="#38bdf8" />
                              ) : (
                                <RotateCcw size={13} color="#38bdf8" />
                              )}
                              <span className="action-btn-text">
                                {reorderLoadingId === o.id ? 'Adding...' : 'Reorder'}
                              </span>
                            </button>
                          )}

                          {/* 4. Receipt button (shown only for COMPLETED orders) */}
                          {isCompleted && (
                            <button
                              type="button"
                              className="action-btn"
                              style={{
                                color: '#fbbf24',
                                borderColor: 'rgba(251, 191, 36, 0.4)',
                                background: 'rgba(251, 191, 36, 0.08)'
                              }}
                              onClick={() => handleOpenReceipt(o)}
                              title={`View / Print receipt for ${o.order_no}`}
                            >
                              <Printer size={13} color="#fbbf24" />
                              <span className="action-btn-text">Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ORDER DETAILS MODAL                                      */}
      {/* ────────────────────────────────────────────────────────── */}
      {showDetailsModal && selectedOrder && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDetailsModal(false);
          }}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '680px',
              width: '95%',
              borderRadius: '16px',
              padding: '28px',
              background: 'linear-gradient(170deg, #2A0C10 0%, #1B0709 100%)',
              border: '1px solid rgba(246, 235, 221, 0.16)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#fdf2e3',
                      fontFamily: "var(--font-display, 'Alfa Slab One', 'Rockwell', 'Georgia', serif)",
                      letterSpacing: '0.02em'
                    }}
                  >
                    Order Details
                  </h3>
                  {renderStatusBadge(selectedOrder.status)}
                </div>
                <div style={{ fontSize: '13px', color: '#e5d5c3', marginTop: '6px' }}>
                  Order No:{' '}
                  <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                    {selectedOrder.order_no}
                  </strong>{' '}
                  • {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e5d5c3',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="Close (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Status Timeline */}
            <div
              style={{
                background: '#1a0a0c',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px 18px',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d9c7b5', fontWeight: '700', marginBottom: '14px' }}>
                Order Status Timeline
              </div>
              {(() => {
                const s = (selectedOrder.status || '').toLowerCase();
                const isCancelled = s === 'cancelled';
                const isRejected = s === 'rejected';

                const steps = isCancelled
                  ? [
                      { label: 'Pending Placed', active: true, done: true },
                      { label: 'Cancelled', active: true, done: true, danger: true }
                    ]
                  : isRejected
                  ? [
                      { label: 'Pending Placed', active: true, done: true },
                      { label: 'Rejected', active: true, done: true, danger: true }
                    ]
                  : [
                      { label: 'Pending', active: true, done: s !== 'pending' },
                      { label: 'Confirmed', active: s === 'confirmed' || s === 'ready' || s === 'completed', done: s === 'ready' || s === 'completed' },
                      { label: 'Completed', active: s === 'completed', done: s === 'completed' }
                    ];

                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {steps.map((st, idx) => (
                      <React.Fragment key={idx}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: st.danger
                                ? '#ef4444'
                                : st.done
                                ? '#22c55e'
                                : st.active
                                ? '#fbbf24'
                                : 'rgba(255, 255, 255, 0.15)',
                              color: st.danger || st.done ? '#ffffff' : '#1a0a0c',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '800',
                              boxShadow: st.active ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none'
                            }}
                          >
                            {st.done ? '✓' : idx + 1}
                          </div>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: st.active ? '700' : '500',
                              color: st.danger ? '#f87171' : st.active ? '#fdf2e3' : '#887b76',
                              marginTop: '6px',
                              textAlign: 'center'
                            }}
                          >
                            {st.label}
                          </span>
                        </div>
                        {idx < steps.length - 1 && (
                          <div
                            style={{
                              height: '2px',
                              flex: 1,
                              background: st.done
                                ? 'linear-gradient(90deg, #22c55e, #22c55e)'
                                : 'rgba(255, 255, 255, 0.15)',
                              marginTop: '-18px'
                            }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d9c7b5', fontWeight: '700', marginBottom: '8px' }}>
                Order Items ({selectedOrder.items?.length || 0})
              </div>

              {detailsLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#e5d5c3' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <div>Loading item specifications...</div>
                </div>
              ) : (
                <div
                  style={{
                    background: '#1a0a0c',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: '#d9c7b5', fontSize: '11px' }}>Product</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: '#d9c7b5', fontSize: '11px' }}>Cut</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#d9c7b5', fontSize: '11px' }}>Weight</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#d9c7b5', fontSize: '11px' }}>Price / kg</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#d9c7b5', fontSize: '11px' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((it, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: idx === selectedOrder.items.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.06)'
                            }}
                          >
                            <td style={{ padding: '10px 14px', color: '#ffffff', fontWeight: '700' }}>
                              {it.product_name}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#e5d5c3' }}>
                              <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                                {it.meat_cut || 'Standard'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fdf2e3', fontFamily: 'monospace' }}>
                              {Number(it.weight_kg).toFixed(2)} kg
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e5d5c3', fontFamily: 'monospace' }}>
                              ₱{Number(it.price_per_kg).toFixed(2)}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fdf2e3', fontWeight: '700', fontFamily: 'monospace' }}>
                              ₱{Number(it.subtotal).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                            No individual items registered for this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Customer Special Cutting / Packaging Instructions */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '18px',
                fontSize: '13px'
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#d9c7b5', fontWeight: '700', marginBottom: '4px' }}>
                Special Cutting &amp; Packaging Instructions:
              </div>
              <div style={{ color: selectedOrder.notes ? '#ffffff' : '#887b76', fontStyle: selectedOrder.notes ? 'normal' : 'italic' }}>
                {selectedOrder.notes || 'None specified.'}
              </div>
            </div>

            {/* Financial Summary */}
            <div
              style={{
                background: '#1a0a0c',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e5d5c3' }}>
                <span>Subtotal:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                  ₱{Number(selectedOrder.subtotal ?? selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>
              {Number(selectedOrder.discount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac' }}>
                  <span>Discount:</span>
                  <span style={{ fontFamily: 'monospace' }}>
                    -₱{Number(selectedOrder.discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
                  paddingTop: '8px',
                  marginTop: '2px',
                  fontWeight: '800',
                  fontSize: '16px',
                  color: '#fdf2e3'
                }}
              >
                <span>Total Amount:</span>
                <span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>
                  ₱{Number(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {selectedOrder.status === 'completed' && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenReceipt(selectedOrder);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}
                >
                  <Printer size={14} /> View Receipt
                </button>
              )}
              {selectedOrder.status === 'pending' && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenCancelModal(selectedOrder);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', borderColor: '#ef4444' }}
                >
                  <XCircle size={14} /> Cancel Order
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* CANCEL ORDER CONFIRMATION MODAL                            */}
      {/* ────────────────────────────────────────────────────────── */}
      {orderToCancel && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !cancelLoading) setOrderToCancel(null);
          }}
          style={{ zIndex: 1050 }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '440px',
              width: '92%',
              borderRadius: '16px',
              padding: '26px',
              background: 'linear-gradient(170deg, #2A0C10 0%, #1B0709 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '19px',
                fontWeight: '800',
                color: '#fdf2e3',
                fontFamily: "var(--font-display, 'Alfa Slab One', 'Rockwell', 'Georgia', serif)"
              }}
            >
              Cancel this pre-order?
            </h3>

            <p style={{ fontSize: '13px', color: '#e5d5c3', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to cancel order <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>#{orderToCancel.order_no}</strong> (₱{Number(orderToCancel.total_amount).toFixed(2)})? This cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setOrderToCancel(null)}
                disabled={cancelLoading}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* RECEIPT MODAL & PRINT VIEW                                */}
      {/* ────────────────────────────────────────────────────────── */}
      {showReceiptModal && receiptOrder && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowReceiptModal(false);
          }}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '460px',
              width: '95%',
              background: '#ffffff',
              color: '#111827',
              borderRadius: '12px',
              padding: '24px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)'
            }}
          >
            {/* Modal Screen-Only Controls */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pre-Order Receipt Preview
              </span>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  color: '#4b5563',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex'
                }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Printable Receipt Paper Container */}
            <div
              id="printable-customer-receipt"
              style={{
                background: '#ffffff',
                color: '#111827',
                fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                fontSize: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            >
              {/* Receipt Header */}
              <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1.5px dashed #111827' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                  <Logo size={32} inline={true} alt="SMIS Logo" />
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '0.05em' }}>
                  SMIS SLAUGHTERHOUSE
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                  Meat Inventory &amp; Sales Management System
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563' }}>
                  Official Pre-Order Customer Receipt
                </div>
              </div>

              {/* Order Meta */}
              <div style={{ padding: '10px 0', borderBottom: '1px dashed #9ca3af', fontSize: '11.5px', lineHeight: 1.6 }}>
                <div>Order Ref: <strong>#{receiptOrder.order_no}</strong></div>
                <div>Date &amp; Time: {new Date(receiptOrder.created_at).toLocaleString()}</div>
                <div>
                  Customer:{' '}
                  <strong>
                    {receiptOrder.customer_name || (user ? `${user.first_name} ${user.last_name}` : 'Customer')}
                  </strong>
                </div>
                {receiptOrder.customer_phone && (
                  <div>Phone: {receiptOrder.customer_phone}</div>
                )}
                <div>Status: <strong style={{ textTransform: 'uppercase' }}>{receiptOrder.status}</strong></div>
              </div>

              {/* Items Section */}
              <div style={{ padding: '10px 0', borderBottom: '1px dashed #9ca3af' }}>
                <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', color: '#374151' }}>
                  Order Items
                </div>
                {receiptLoading ? (
                  <div style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>
                    <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto 4px' }} />
                    Loading items...
                  </div>
                ) : receiptOrder.items && receiptOrder.items.length > 0 ? (
                  receiptOrder.items.map((it, idx) => (
                    <div key={idx} style={{ marginBottom: '8px', fontSize: '11.5px' }}>
                      <div style={{ fontWeight: '700' }}>
                        {it.product_name} {it.meat_cut ? `(${it.meat_cut})` : ''}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                        <span>
                          {Number(it.weight_kg).toFixed(2)} kg @ ₱{Number(it.price_per_kg).toFixed(2)}/kg
                        </span>
                        <span style={{ fontWeight: '700' }}>₱{Number(it.subtotal).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Items included in order total</div>
                )}
              </div>

              {/* Totals Section */}
              <div style={{ padding: '10px 0', borderBottom: '1.5px dashed #111827', fontSize: '12px', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₱{Number(receiptOrder.subtotal ?? receiptOrder.total_amount).toFixed(2)}</span>
                </div>
                {Number(receiptOrder.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857' }}>
                    <span>Discount:</span>
                    <span>-₱{Number(receiptOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '900',
                    fontSize: '14px',
                    marginTop: '4px',
                    paddingTop: '4px',
                    borderTop: '1px solid #e5e7eb'
                  }}
                >
                  <span>TOTAL AMOUNT:</span>
                  <span>₱{Number(receiptOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Special Instructions Note */}
              {receiptOrder.notes && (
                <div style={{ padding: '8px 0', borderBottom: '1px dashed #9ca3af', fontSize: '11px', color: '#4b5563' }}>
                  <strong>Customer Instructions:</strong> {receiptOrder.notes}
                </div>
              )}

              {/* Receipt Footer */}
              <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '11px', color: '#4b5563', lineHeight: 1.4 }}>
                Thank you for your pre-order!<br />
                Please keep this receipt for order verification and pickup.
              </div>
            </div>

            {/* Screen Action Buttons */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, borderColor: '#d1d5db', color: '#374151' }}
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Feedback */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      )}
    </div>
  );
};

export default OrderHistory;
