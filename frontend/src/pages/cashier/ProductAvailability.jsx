import React, { useEffect, useState, useMemo } from 'react';
import { getProductsApi, getCategoriesApi } from '../../api/productApi';
import { getProductImage } from '../../utils/meatImages';
import { Search, Filter, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ProductAvailability = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProductsApi({ is_active: 1 }), getCategoriesApi()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cut = (p.meat_cut || '').toLowerCase();
      const type = (p.meat_type || '').toLowerCase();
      const catName = (p.category_name || '').toLowerCase();

      const matchesSearch = !query ||
        name.includes(query) ||
        cut.includes(query) ||
        type.includes(query) ||
        catName.includes(query);

      const matchesCat = selectedCat === '' || String(p.category_id) === String(selectedCat);

      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCat]);

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span className="card-title" style={{ fontSize: '18px', fontWeight: '800' }}>
            Live Product Availability & Stock Lookup
          </span>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Total Active Cuts: <strong>{products.length}</strong>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search cut or meat type (e.g. Ribeye, Liempo, Chicken, Goat)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              className={`btn btn-sm ${selectedCat === '' ? 'btn-cashier' : 'btn-outline'}`}
              onClick={() => setSelectedCat('')}
              style={{ borderRadius: '100px', fontWeight: '700' }}
            >
              All Cuts
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`btn btn-sm ${selectedCat === String(c.id) ? 'btn-cashier' : 'btn-outline'}`}
                onClick={() => setSelectedCat(String(c.id))}
                style={{ borderRadius: '100px', fontWeight: '700' }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Cut / Product</th>
                <th>Category</th>
                <th>Meat Cut</th>
                <th>Price / kg</th>
                <th>Available Weight</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const stock = Number(p.total_available_stock_kg) || 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 5;
                const imgSrc = getProductImage(p);

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={imgSrc}
                          alt={p.name}
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', background: '#f1f5f9' }}
                        />
                        <div>
                          <strong>{p.name}</strong>
                          {p.description && (
                            <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.category_name === 'Beef' ? 'badge-danger' : p.category_name === 'Pork' ? 'badge-warning' : 'badge-primary'}`}>
                        {p.category_name || p.meat_type}
                      </span>
                    </td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{p.meat_cut}</code></td>
                    <td style={{ fontWeight: '800', color: 'var(--primary-cashier)' }}>₱{Number(p.price_per_kg).toFixed(2)}</td>
                    <td>
                      <span style={{ fontWeight: '800', fontSize: '14px', color: isOutOfStock ? '#ef4444' : isLowStock ? '#d97706' : '#10b981' }}>
                        {stock.toFixed(3)} kg
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No products found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductAvailability;
