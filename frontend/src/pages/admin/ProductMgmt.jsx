import React, { useEffect, useState, useRef } from 'react';
import {
  getProductsApi,
  getCategoriesApi,
  createProductApi,
  updateProductApi,
  toggleProductStatusApi
} from '../../api/productApi';
import { getProductImage, DEFAULT_MEAT_PLACEHOLDER } from '../../utils/meatImages';
import { Plus, Search, UploadCloud, X, AlertCircle, Pencil } from 'lucide-react';

const ProductMgmt = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    meat_type: 'Beef',
    meat_cut: '',
    price_per_kg: '',
    low_stock_threshold: '15',
    description: ''
  });

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const resetFormState = () => {
    setFormData({
      category_id: '',
      name: '',
      meat_type: 'Beef',
      meat_cut: '',
      price_per_kg: '',
      low_stock_threshold: '15',
      description: ''
    });
    setEditingProduct(null);
    setPhotoFile(null);
    setPhotoPreview('');
    setRemovePhoto(false);
    setUploadError('');
    setIsDragging(false);
  };

  const handleOpenAdd = () => {
    resetFormState();
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const matchedCategory = categories.find(
      (c) => String(c.id) === String(p.category_id) || c.name.toLowerCase() === (p.category_name || p.meat_type || '').toLowerCase()
    );
    const categoryId = matchedCategory ? String(matchedCategory.id) : (p.category_id ? String(p.category_id) : '');
    const meatType = matchedCategory ? matchedCategory.name : (p.meat_type || 'Beef');

    setFormData({
      category_id: categoryId,
      name: p.name || '',
      meat_type: meatType,
      meat_cut: p.meat_cut || '',
      price_per_kg: p.price_per_kg !== undefined ? String(p.price_per_kg) : '',
      low_stock_threshold: p.low_stock_threshold !== undefined && p.low_stock_threshold !== null ? String(Number(p.low_stock_threshold)) : '15',
      description: p.description || ''
    });
    setPhotoFile(null);
    setRemovePhoto(false);
    setUploadError('');
    setIsDragging(false);

    // If product already has an image, show it in preview
    if (p.image_url && p.image_url.trim()) {
      setPhotoPreview(getProductImage(p));
    } else {
      setPhotoPreview('');
    }

    setShowModal(true);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp');

    if (!allowedMimes.includes(file.type) && !hasValidExt) {
      setUploadError('Invalid file type. Only JPG, PNG, and WEBP images are allowed.');
      return;
    }

    // 2 MB size limit
    if (file.size > 2 * 1024 * 1024) {
      setUploadError(`File size exceeds 2 MB limit (selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB). Please choose a smaller photo.`);
      return;
    }

    setUploadError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setRemovePhoto(true);
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadError('');

    try {
      const catIdToSend = formData.category_id || (editingProduct ? String(editingProduct.category_id || '') : '');
      if (!catIdToSend) {
        setUploadError('Please select a category for this product.');
        setSubmitting(false);
        return;
      }

      const payload = new FormData();
      payload.append('category_id', catIdToSend);
      payload.append('name', formData.name);
      payload.append('meat_type', formData.meat_type);
      payload.append('meat_cut', formData.meat_cut);
      payload.append('price_per_kg', formData.price_per_kg);
      payload.append('low_stock_threshold', formData.low_stock_threshold || '15');
      payload.append('description', formData.description || '');

      if (photoFile) {
        payload.append('photo', photoFile);
      } else if (removePhoto) {
        payload.append('remove_photo', 'true');
      }

      if (editingProduct) {
        await updateProductApi(editingProduct.id, payload);
      } else {
        await createProductApi(payload);
      }

      setShowModal(false);
      resetFormState();
      await loadData();
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
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
          <button className="btn btn-primary" onClick={handleOpenAdd}>
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
                <th>Threshold</th>
                <th>Available Stock</th>
                <th>Stock Status</th>
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
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_MEAT_PLACEHOLDER;
                          }}
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', background: '#1c080b', border: '1px solid rgba(246, 235, 221, 0.15)' }}
                        />
                        <div>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '11px', color: '#a89886' }}>ID #{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.category_name === 'Beef' ? 'badge-danger' : p.category_name === 'Pork' ? 'badge-warning' : 'badge-primary'}`}>
                        {p.category_name || p.meat_type}
                      </span>
                    </td>
                    <td><code style={{ background: '#f1f5f9', color: '#111827', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{p.meat_cut}</code></td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary-admin)' }}>₱{Number(p.price_per_kg).toFixed(2)}</td>
                    <td style={{ fontSize: '12px', color: '#F6EBDD' }}>{Number(p.low_stock_threshold || 15).toFixed(1)} kg</td>
                    <td>
                      <span style={{ fontWeight: '800', color: stock === 0 ? 'var(--danger)' : stock <= (Number(p.low_stock_threshold) || 15) ? 'var(--warning)' : '#10b981' }}>
                        {stock.toFixed(3)} kg
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        stock === 0
                          ? 'badge-danger'
                          : stock <= (Number(p.low_stock_threshold) || 15)
                          ? 'badge-warning'
                          : 'badge-success'
                      }`}>
                        {stock === 0 ? 'Out of Stock' : stock <= (Number(p.low_stock_threshold) || 15) ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit product details & photo"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => handleToggle(p.id, p.is_active)}>
                          {p.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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

      {/* ---- Add / Edit Meat Product Modal ---- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#FFF1F2' }}>
                {editingProduct ? 'Edit Meat Product' : 'Add New Meat Product'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowModal(false); resetFormState(); }}
                style={{ background: 'none', border: 'none', color: '#e5d5c3', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {uploadError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
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
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>
                  Product Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Batangas Beef Liempo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid" style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>
                    Meat Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Beef, Pork, Chicken..."
                    value={formData.meat_type}
                    onChange={(e) => setFormData({ ...formData, meat_type: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>
                    Meat Cut <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Liempo, Ribeye, Breast..."
                    value={formData.meat_cut}
                    onChange={(e) => setFormData({ ...formData, meat_cut: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>
                    Price per kg (₱) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#C9B4A6', marginTop: '3px', display: 'block' }}>
                    New price applies to new orders only. Existing orders keep their agreed price.
                  </span>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>
                    Low stock threshold (kg) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-control"
                    placeholder="15"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* PRODUCT PHOTO (OPTIONAL) - Dropzone / Preview */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F6EBDD', marginBottom: '6px', display: 'block' }}>
                  Product Photo (Optional)
                </label>

                {photoPreview ? (
                  <div style={{
                    border: '1px solid rgba(246, 235, 221, 0.2)',
                    borderRadius: '10px',
                    padding: '12px',
                    background: 'rgba(20, 5, 7, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <img
                        src={photoPreview}
                        alt="Product Preview"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_MEAT_PLACEHOLDER;
                        }}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          background: '#140507',
                          border: '1px solid rgba(246, 235, 221, 0.25)',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFF1F2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                          {photoFile ? photoFile.name : (editingProduct ? 'Current Product Photo' : 'Selected Photo')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#a89886', marginTop: '2px' }}>
                          {photoFile ? `${(photoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to save` : 'Photo active'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '6px 12px', color: '#FFF1F2', borderColor: 'rgba(246, 235, 221, 0.3)' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '6px 12px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={handleRemovePhoto}
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? 'var(--meat-hi)' : 'rgba(246, 235, 221, 0.25)'}`,
                      borderRadius: '10px',
                      padding: '22px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? 'rgba(229, 56, 74, 0.12)' : 'rgba(20, 5, 7, 0.6)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(246, 235, 221, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#e5d5c3'
                    }}>
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFF1F2' }}>
                        Click to upload or drag and drop
                      </div>
                      <div style={{ fontSize: '11px', color: '#a89886', marginTop: '2px' }}>
                        JPG, PNG, or WEBP (max 2 MB)
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '12px', color: '#F6EBDD' }}>
                  Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowModal(false); resetFormState(); }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMgmt;
