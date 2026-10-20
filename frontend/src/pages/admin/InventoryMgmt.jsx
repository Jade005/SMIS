import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getInventoryApi,
  addBatchApi,
  getInventoryCountsApi,
  disposeBatchApi,
  disposeAllExpiredApi
} from '../../api/inventoryApi';
import { getProductsApi } from '../../api/productApi';
import { getSuppliersApi } from '../../api/supplierApi';
import {
  Plus,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Package,
  Layers,
  Archive,
  AlertCircle
} from 'lucide-react';
import PageLoader from '../../components/common/PageLoader';

const InventoryMgmt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const restockProductId = searchParams.get('restock');

  const [activeTab, setActiveTab] = useState(urlTab || 'all');
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    low: 0,
    expired: 0,
    disposed: 0,
    expired_weight_kg: 0
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Delivery Batch Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    supplier_id: '',
    weight_kg: '',
    price_per_kg: '',
    date_processed: new Date().toISOString().slice(0, 10),
    expiration_date: '',
    notes: ''
  });

  // Disposal Modal State
  const [disposeModal, setDisposeModal] = useState({
    open: false,
    isAll: false,
    batch: null,
    count: 0,
    weight: 0,
    reason: ''
  });
  const [submittingDispose, setSubmittingDispose] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    if (urlTab && ['all', 'active', 'low', 'expired', 'disposed'].includes(urlTab.toLowerCase())) {
      setActiveTab(urlTab.toLowerCase());
    }
  }, [urlTab]);

  // Load Inventory & Counts
  const loadData = useCallback(async () => {
    try {
      const [invResult, countResult, prodResult, supResult] = await Promise.allSettled([
        getInventoryApi({ tab: activeTab, search: search.trim() || undefined }),
        getInventoryCountsApi(),
        getProductsApi({ is_active: 1 }),
        getSuppliersApi({ is_active: 1 })
      ]);

      if (invResult.status === 'fulfilled') {
        setInventory(invResult.value?.data || []);
      } else {
        console.error('getInventoryApi failed:', invResult.reason);
      }

      if (countResult.status === 'fulfilled') {
        setCounts(countResult.value?.data || {
          all: 0,
          active: 0,
          low: 0,
          expired: 0,
          disposed: 0,
          expired_weight_kg: 0
        });
      } else {
        console.error('getInventoryCountsApi failed:', countResult.reason);
      }

      let activeProds = [];
      if (prodResult.status === 'fulfilled') {
        activeProds = prodResult.value?.data || [];
        setProducts(activeProds);
      } else {
        console.error('getProductsApi failed:', prodResult.reason);
      }

      if (supResult.status === 'fulfilled') {
        setSuppliers(supResult.value?.data || []);
      } else {
        console.error('getSuppliersApi failed:', supResult.reason);
      }

      // If restock query param was provided, open modal with product preselected
      if (restockProductId && activeProds.length > 0) {
        const foundProd = activeProds.find((p) => String(p.id) === String(restockProductId));
        if (foundProd) {
          setFormData((prev) => ({
            ...prev,
            product_id: String(foundProd.id),
            price_per_kg: foundProd.price_per_kg ? String(foundProd.price_per_kg) : prev.price_per_kg
          }));
          setShowModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, restockProductId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', newTab);
      // Remove restock query if switching tabs
      next.delete('restock');
      return next;
    });
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      await addBatchApi(formData);
      setShowModal(false);
      setFormData({
        product_id: '',
        supplier_id: '',
        weight_kg: '',
        price_per_kg: '',
        date_processed: new Date().toISOString().slice(0, 10),
        expiration_date: '',
        notes: ''
      });
      // Clear restock param
      if (restockProductId) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete('restock');
          return next;
        });
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add inventory batch');
    }
  };

  // Open single batch disposal confirmation
  const handleOpenDisposeSingle = (batch) => {
    setDisposeModal({
      open: true,
      isAll: false,
      batch,
      count: 1,
      weight: Number(batch.available_stock_kg || 0),
      reason: 'Expired inventory routine disposal'
    });
  };

  // Open bulk disposal confirmation
  const handleOpenDisposeAll = () => {
    setDisposeModal({
      open: true,
      isAll: true,
      batch: null,
      count: counts.expired || 0,
      weight: counts.expired_weight_kg || 0,
      reason: 'Bulk disposal of all expired inventory batches'
    });
  };

  // Confirm disposal
  const handleConfirmDisposal = async () => {
    setSubmittingDispose(true);
    try {
      if (disposeModal.isAll) {
        const res = await disposeAllExpiredApi({ reason: disposeModal.reason });
        alert(res.data?.message || `Successfully disposed ${disposeModal.count} expired batches.`);
      } else if (disposeModal.batch) {
        const res = await disposeBatchApi(disposeModal.batch.id, { reason: disposeModal.reason });
        alert(res.data?.message || `Batch ${disposeModal.batch.batch_no} disposed successfully.`);
      }
      setDisposeModal({ open: false, isAll: false, batch: null, count: 0, weight: 0, reason: '' });
      await loadData();
    } catch (err) {
      console.error('Disposal error:', err);
      alert(err.response?.data?.message || 'Failed to dispose batch. Please make sure you are logged in as Admin.');
    } finally {
      setSubmittingDispose(false);
    }
  };

  const tabs = [
    { key: 'all', label: `All (${counts.all || 0})` },
    { key: 'active', label: `Active (${counts.active || 0})` },
    { key: 'low', label: `Low Stock (${counts.low || 0})` },
    { key: 'expired', label: `Expired (${counts.expired || 0})`, isDanger: (counts.expired || 0) > 0 },
    { key: 'disposed', label: `Disposed (${counts.disposed || 0})` }
  ];

  return (
    <div className="page-container">
      {/* ── Top Header Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#FFF1F2' }}>
            Per-Batch Inventory Management
          </h2>
          <div style={{ fontSize: '12px', color: '#a89886', marginTop: '2px' }}>
            Monitor freshness, FIFO batch rotation, and dispose expired stock
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {activeTab === 'expired' && (counts.expired || 0) > 0 && (
            <button
              className="btn btn-outline"
              style={{
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '700'
              }}
              onClick={handleOpenDisposeAll}
              title="Dispose all expired batches at once"
            >
              <Trash2 size={16} />
              <span>Dispose All Expired ({counts.expired})</span>
            </button>
          )}

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Delivery Batch
          </button>
        </div>
      </div>

      <div className="card">
        {/* ── Filter Tabs & Search Bar ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
          borderBottom: '1px solid rgba(246, 235, 221, 0.12)',
          paddingBottom: '14px'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '12px',
                    padding: '6px 14px',
                    ...(tab.isDanger && !isActive ? { color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' } : {})
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search batch #, product, supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', height: '36px', fontSize: '12px' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Inventory Table ── */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Batch No.</th>
                <th>Product & Cut</th>
                <th>Supplier</th>
                <th>Delivered</th>
                <th>Available</th>
                <th>Price/kg</th>
                <th>Processed</th>
                <th>Expiry</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((b) => {
                const computedStatus = b.computed_status || (b.status ? b.status.toUpperCase() : 'ACTIVE');
                const isExpired = computedStatus === 'EXPIRED';
                const isDisposed = computedStatus === 'DISPOSED';
                const isSoldOut = computedStatus === 'SOLD OUT';
                const isProductLow = Number(b.product_total_stock_kg) > 0 && Number(b.product_total_stock_kg) <= Number(b.low_stock_threshold || 15);

                return (
                  <tr key={b.id} style={isDisposed ? { opacity: 0.65 } : {}}>
                    <td>
                      <strong>{b.batch_no}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span><strong>{b.product_name}</strong> ({b.meat_cut})</span>
                        {isProductLow && (
                          <span
                            className="badge badge-warning"
                            style={{ fontSize: '10px', padding: '1px 6px', letterSpacing: '0.02em' }}
                            title="Total available product stock is at or below threshold"
                          >
                            Low stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{b.supplier_name}</td>
                    <td>{Number(b.weight_kg).toFixed(3)} kg</td>
                    <td>
                      <span className={`badge ${
                        isDisposed
                          ? 'badge-gray'
                          : isExpired
                          ? 'badge-danger'
                          : Number(b.available_stock_kg) > 0
                          ? 'badge-success'
                          : 'badge-gray'
                      }`}>
                        {Number(b.available_stock_kg).toFixed(3)} kg
                      </span>
                    </td>
                    <td>₱{Number(b.price_per_kg).toFixed(2)}</td>
                    <td style={{ fontSize: '12px', color: '#C9B4A6' }}>{b.date_processed}</td>
                    <td style={{
                      fontSize: '12px',
                      fontWeight: isExpired ? '800' : 'normal',
                      color: isExpired ? '#f87171' : 'inherit'
                    }}>
                      {b.expiration_date}
                    </td>
                    <td>
                      {/* Individual batch status: ACTIVE, EXPIRED, SOLD OUT, DISPOSED */}
                      <span className={`badge ${
                        isExpired
                          ? 'badge-danger'
                          : isDisposed
                          ? 'badge-gray'
                          : isSoldOut
                          ? 'badge-gray'
                          : 'badge-success'
                      }`}>
                        {computedStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isExpired && !isDisposed && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{
                            color: '#f87171',
                            borderColor: 'rgba(239, 68, 68, 0.45)',
                            padding: '4px 8px',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleOpenDisposeSingle(b)}
                          title={`Dispose expired batch ${b.batch_no}`}
                        >
                          <Trash2 size={13} />
                          <span>Dispose</span>
                        </button>
                      )}
                      {isDisposed && (
                        <span style={{ fontSize: '11px', color: '#a89886', fontStyle: 'italic' }}>
                          Disposed
                        </span>
                      )}
                      {!isExpired && !isDisposed && (
                        <span style={{ fontSize: '11px', color: '#a89886' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {inventory.length === 0 && !loading && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No inventory batches found in this view
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Add Inventory Batch ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#FFF1F2' }}>Add Delivery Batch</h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  if (restockProductId) {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete('restock');
                      return next;
                    });
                  }
                }}
                style={{ background: 'none', border: 'none', color: '#e5d5c3', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBatch}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Select Product</label>
                <select
                  className="form-control"
                  value={formData.product_id}
                  onChange={(e) => {
                    const selProd = products.find((p) => String(p.id) === e.target.value);
                    setFormData({
                      ...formData,
                      product_id: e.target.value,
                      price_per_kg: selProd?.price_per_kg ? String(selProd.price_per_kg) : formData.price_per_kg
                    });
                  }}
                  required
                >
                  <option value="">Choose product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.meat_cut}) - ID #{p.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Select Supplier</label>
                <select
                  className="form-control"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  required
                >
                  <option value="">Choose supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Weight Delivered (kg)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="form-control"
                    placeholder="0.000"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Batch Price per kg (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Date Processed</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date_processed}
                    onChange={(e) => setFormData({ ...formData, date_processed: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Dispose Confirmation Dialog ── */}
      {disposeModal.open && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#f87171' }}>
              <AlertCircle size={24} />
              <h3 style={{ margin: 0, color: '#FFF1F2' }}>
                {disposeModal.isAll ? 'Dispose All Expired Batches' : 'Confirm Batch Disposal'}
              </h3>
            </div>

            <p style={{ color: '#F6EBDD', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
              {disposeModal.isAll ? (
                <>
                  Dispose all <strong>{disposeModal.count}</strong> expired batch(es)?{' '}
                  <strong style={{ color: '#f87171' }}>{Number(disposeModal.weight).toFixed(3)} kg</strong> will be removed from available stock.
                </>
              ) : (
                <>
                  Dispose batch <strong>{disposeModal.batch?.batch_no}</strong>?{' '}
                  <strong style={{ color: '#f87171' }}>{Number(disposeModal.weight).toFixed(3)} kg</strong> will be removed from stock.
                </>
              )}
            </p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#C9B4A6', marginBottom: '6px', display: 'block' }}>
                Disposal Reason (Optional)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Expired shelf-life / routine condemned stock"
                value={disposeModal.reason}
                onChange={(e) => setDisposeModal({ ...disposeModal, reason: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={submittingDispose}
                onClick={() => setDisposeModal({ open: false, isAll: false, batch: null, count: 0, weight: 0, reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                disabled={submittingDispose}
                onClick={handleConfirmDisposal}
              >
                {submittingDispose ? 'Disposing...' : 'Confirm Disposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryMgmt;
