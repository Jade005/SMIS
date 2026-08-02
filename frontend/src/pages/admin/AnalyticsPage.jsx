import React, { useEffect, useState } from 'react';
import { getRevenueTrendsApi, getBestSellersApi, getSalesByCategoryApi } from '../../api/analyticsApi';
import { TrendingUp, Trophy, PieChart } from 'lucide-react';

const AnalyticsPage = () => {
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  useEffect(() => {
    Promise.all([
      getRevenueTrendsApi(30),
      getBestSellersApi(5),
      getSalesByCategoryApi()
    ]).then(([revRes, sellerRes, catRes]) => {
      setRevenueTrends(revRes.data || []);
      setBestSellers(sellerRes.data || []);
      setCategorySales(catRes.data || []);
    }).catch(console.error);
  }, []);

  return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Trophy size={18} color="var(--warning)" /> Top Selling Meat Cuts</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Cut</th>
                  <th>Volume Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((b, idx) => (
                  <tr key={idx}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td><strong>{b.product_name}</strong></td>
                    <td>{b.meat_cut}</td>
                    <td>{Number(b.total_kg_sold).toFixed(3)} kg</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary-admin)' }}>₱{Number(b.total_revenue_generated).toFixed(2)}</td>
                  </tr>
                ))}
                {bestSellers.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales analytics available yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><PieChart size={18} color="var(--primary-admin)" /> Sales Volume by Meat Category</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Volume Sold (kg)</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {categorySales.map((c, idx) => (
                  <tr key={idx}>
                    <td><strong>{c.category_name}</strong></td>
                    <td>{Number(c.total_kg_sold).toFixed(3)} kg</td>
                    <td style={{ fontWeight: 'bold' }}>₱{Number(c.total_revenue).toFixed(2)}</td>
                  </tr>
                ))}
                {categorySales.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No category sales recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><TrendingUp size={18} color="var(--success)" /> Daily Revenue Trends (Last 30 Days)</span>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transactions Count</th>
                <th>Daily Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueTrends.map((t, idx) => (
                <tr key={idx}>
                  <td>{t.date}</td>
                  <td>{t.total_sales_count} sale(s)</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>₱{Number(t.daily_revenue).toFixed(2)}</td>
                </tr>
              ))}
              {revenueTrends.length === 0 && (
                <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No trend data recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
