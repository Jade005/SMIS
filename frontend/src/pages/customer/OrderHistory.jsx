import React, { useEffect, useState } from 'react';
import { getMyOrdersApi, cancelOrderApi } from '../../api/orderApi';
import { ShoppingBag, XCircle } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const res = await getMyOrdersApi();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrderApi(id);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Pre-Order History</span>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.order_no}</strong></td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td style={{ fontWeight: 'bold' }}>₱{Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${
                      o.status === 'pending' ? 'badge-warning' :
                      o.status === 'confirmed' ? 'badge-info' :
                      o.status === 'ready' ? 'badge-success' :
                      o.status === 'completed' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {o.status === 'pending' && (
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleCancel(o.id)}>
                        <XCircle size={12} /> Cancel Order
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No orders placed yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
