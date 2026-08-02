import React, { useEffect, useState } from 'react';
import { getInventoryApi, addBatchApi } from '../../api/inventoryApi';
import { getProductsApi } from '../../api/productApi';
import { getSuppliersApi } from '../../api/supplierApi';
import { Plus, Package, AlertCircle } from 'lucide-react';

const InventoryMgmt = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadData = async () => {
    try {
      const [invRes, prodRes, supRes] = await Promise.all([
        getInventoryApi(),
        getProductsApi(),
        getSuppliersApi()
      ]);
      setInventory(invRes.data || []);
      setProducts(prodRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      await addBatchApi(formData);
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add inventory batch');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Per-Batch Inventory Management</span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Delivery Batch
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Batch No.</th>
                <th>Product</th>
                <th>Supplier</th>
                <th>Delivered</th>
                <th>Available</th>
                <th>Price/kg</th>
                <th>Processed</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.batch_no}</strong></td>
                  <td>{b.product_name} ({b.meat_cut})</td>
                  <td>{b.supplier_name}</td>
                  <td>{Number(b.weight_kg).toFixed(3)} kg</td>
                  <td>
                    <span className={`badge ${b.status === 'available' ? 'badge-success' : b.status === 'low' ? 'badge-warning' : 'badge-danger'}`}>
                      {Number(b.available_stock_kg).toFixed(3)} kg
                    </span>
                  </td>
                  <td>₱{Number(b.price_per_kg).toFixed(2)}</td>
                  <td>{b.date_processed}</td>
                  <td>{b.expiration_date}</td>
                  <td>
                    <span className={`badge ${b.status === 'available' ? 'badge-success' : b.status === 'low' ? 'badge-warning' : b.status === 'expired' ? 'badge-danger' : 'badge-gray'}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '16px' }}>Add Inventory Batch</h3>
            <form onSubmit={handleAddBatch}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Select Product</label>
                <select className="form-control" value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} required>
                  <option value="">Choose product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.meat_cut})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Select Supplier</label>
                <select className="form-control" value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })} required>
                  <option value="">Choose supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Weight Delivered (kg)</label>
                  <input type="number" step="0.001" className="form-control" placeholder="0.000" value={formData.weight_kg} onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Batch Price per kg (₱)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="0.00" value={formData.price_per_kg} onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })} required />
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Date Processed</label>
                  <input type="date" className="form-control" value={formData.date_processed} onChange={(e) => setFormData({ ...formData, date_processed: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input type="date" className="form-control" value={formData.expiration_date} onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryMgmt;
