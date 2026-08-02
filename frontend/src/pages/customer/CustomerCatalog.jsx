import React, { useEffect, useState } from 'react';
import { getProductsApi, getCategoriesApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Search, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [addedIds, setAddedIds] = useState({});

  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getProductsApi({ is_active: 1 }), getCategoriesApi()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(console.error);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.meat_cut.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat ? p.category_id === Number(selectedCat) : true;
    return matchesSearch && matchesCat;
  });

  const handleAdd = (product) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      meat_cut: product.meat_cut,
      price_per_kg: Number(product.price_per_kg),
      weight_kg: 1.000
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '32px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>Fresh Meat Direct</h1>
          <p style={{ fontSize: '13px', opacity: 0.85 }}>Browse slaughterhouse-fresh meats online and place pre-orders for pickup.</p>
        </div>
        <button className="btn btn-customer btn-lg" onClick={() => navigate('/customer/cart')}>
          <ShoppingCart size={18} /> View Cart ({cart.length})
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search cut or meat type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            className={`btn ${selectedCat === '' ? 'btn-customer' : 'btn-outline'}`}
            onClick={() => setSelectedCat('')}
          >
            All Meats
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`btn ${selectedCat === String(c.id) ? 'btn-customer' : 'btn-outline'}`}
              onClick={() => setSelectedCat(String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
        {filteredProducts.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', marginBottom: 0 }}>
            <div style={{ height: '120px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '48px', marginBottom: '12px' }}>
              🥩
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{p.name}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Category: {p.category_name} • Cut: {p.meat_cut}</p>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-customer)' }}>₱{Number(p.price_per_kg).toFixed(2)}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}> / kg</span>
              </div>
              <button
                className={`btn ${addedIds[p.id] ? 'btn-outline' : 'btn-customer'} btn-sm`}
                onClick={() => handleAdd(p)}
              >
                {addedIds[p.id] ? <Check size={14} /> : <Plus size={14} />}
                {addedIds[p.id] ? 'Added' : 'Add'}
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No meat products available in this category
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCatalog;
