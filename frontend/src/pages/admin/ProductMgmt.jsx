import React, { useEffect, useState } from 'react';
import { getProductsApi, getCategoriesApi, createProductApi, toggleProductStatusApi } from '../../api/productApi';
import { getProductImage } from '../../utils/meatImages';
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
    description: '',
    image_url: ''
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
      setFormData({ category_id: '', name: '', meat_type: 'Beef', meat_cut: '', price_per_kg: '', description: '', image_url: '' });
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
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title" style={{ fontSize: '18px', fontWeight: '800' }}>Meat Product Catalog Management</span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Product Cut
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search products or meat cuts (e.g. Ribeye, Liempo, Chicken)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Cut / Product</th>
                <th>Category</th>
                <th>Meat Cut</th>
                <th>Price / kg</th>
                <th>Available Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = Number(p.total_available_stock_kg) || 0;
                const imgSrc = getProductImage(p);

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={imgSrc}
                          alt={p.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#f1f5f9' }}
                        />
                        <div>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>ID #{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.category_name === 'Beef' ? 'badge-danger' : p.category_name === 'Pork' ? 'badge-warning' : 'badge-primary'}`}>
                        {p.category_name || p.meat_type}
                      </span>
                    </td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{p.meat_cut}</code></td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary-admin)' }}>₱{Number(p.price_per_kg).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${stock > 10 ? 'badge-success' : stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {stock.toFixed(3)} kg
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
                );
              })}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '800' }}>Add New Meat Product</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Category <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="form-control"
                  value={formData.category_id}
                  onChange={(e) => {
                    const selCat = categories.find((c) => String(c.id) === e.target.value);
                    setFormData({
                      ...formData,
                      category_id: e.target.value,
                      meat_type: selCat ? selCat.name : formData.meat_type
                    });
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Product Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" className="form-control" placeholder="e.g. Batangas Beef Liempo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="form-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Meat Type <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" className="form-control" placeholder="Beef, Pork, Chicken..." value={formData.meat_type} onChange={(e) => setFormData({ ...formData, meat_type: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Meat Cut <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" className="form-control" placeholder="Liempo, Ribeye, Breast..." value={formData.meat_cut} onChange={(e) => setFormData({ ...formData, meat_cut: e.target.value })} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Price per kg (₱) <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="number" step="0.01" className="form-control" placeholder="0.00" value={formData.price_per_kg} onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })} required />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Image URL (Optional)</label>
                <input type="url" className="form-control" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Description (Optional)</label>
                <textarea className="form-control" rows="2" placeholder="Product description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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
