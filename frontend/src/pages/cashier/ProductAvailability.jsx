import React, { useEffect, useState } from 'react';
import { getProductsApi } from '../../api/productApi';

const ProductAvailability = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProductsApi({ is_active: 1 }).then(res => setProducts(res.data || [])).catch(console.error);
  }, []);

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Live Product Availability & Stock Lookup</span>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Meat Type</th>
                <th>Meat Cut</th>
                <th>Price per kg</th>
                <th>Available Weight</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category_name}</td>
                  <td>{p.meat_type}</td>
                  <td>{p.meat_cut}</td>
                  <td style={{ fontWeight: 'bold' }}>₱{Number(p.price_per_kg).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${Number(p.total_available_stock_kg) > 10 ? 'badge-success' : Number(p.total_available_stock_kg) > 0 ? 'badge-warning' : 'badge-danger'}`}>
                      {Number(p.total_available_stock_kg).toFixed(3)} kg
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${Number(p.total_available_stock_kg) > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {Number(p.total_available_stock_kg) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductAvailability;
