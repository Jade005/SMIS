import React, { useEffect, useState } from 'react';
import { getProductsApi, getCategoriesApi, createProductApi, toggleProductStatusApi } from '../../api/productApi';
import { Plus, Search, Filter } from 'lucide-react';

const ProductMgmt = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    meat_type: 'Beef',
    meat_cut: '',
    price_per_kg: '',
    description: ''
  });

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        getProductsApi({ category_id: filterCat || undefined, search: search || undefined }),
        getCategoriesApi()
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCat, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProductApi(formData);
      setShowModal(false);
      setFormData({ category_id: '', name: '', meat_type: 'Beef', meat_cut: '', price_per_kg: '', description: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleToggle = async (id, is_active) => {
    try {
      await toggleProductStatusApi(id, !is_active);
      loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Meat Product Catalog</span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search products or meat cuts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Cut</th>
                <th>Price/kg</th>
                <th>Available Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category_name}</td>
                  <td>{p.meat_type}</td>
                  <td>{p.meat_cut}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-admin)' }}>₱{Number(p.price_per_kg).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${Number(p.total_available_stock_kg) > 10 ? 'badge-success' : Number(p.total_available_stock_kg) > 0 ? 'badge-warning' : 'badge-danger'}`}>
                      {Number(p.total_available_stock_kg).toFixed(3)} kg
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleToggle(p.id, p.is_active)}>
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </button>
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
            <h3 style={{ marginBottom: '16px' }}>Add New Meat Product</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Category</label>
                <select className="form-control" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Product Name</label>
                <input type="text" className="form-control" placeholder="e.g. Batangas Beef Liempo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="form-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Meat Type</label>
                  <input type="text" className="form-control" placeholder="Beef, Pork, etc." value={formData.meat_type} onChange={(e) => setFormData({ ...formData, meat_type: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Meat Cut</label>
                  <input type="text" className="form-control" placeholder="Liempo, Kasim, etc." value={formData.meat_cut} onChange={(e) => setFormData({ ...formData, meat_cut: e.target.value })} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Price per kg (₱)</label>
                <input type="number" step="0.01" className="form-control" placeholder="0.00" value={formData.price_per_kg} onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMgmt;
