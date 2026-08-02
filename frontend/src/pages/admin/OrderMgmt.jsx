import React, { useEffect, useState } from 'react';
import { getOrdersApi, updateOrderStatusApi } from '../../api/orderApi';
import { ShoppingBag, CheckCircle, Clock, XCircle } from 'lucide-react';

const OrderMgmt = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const loadOrders = async () => {
    try {
      const res = await getOrdersApi({ status: filterStatus || undefined });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatusApi(id, status);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Customer Pre-Orders</span>
          <select className="form-control" style={{ width: '180px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ready">Ready for Pickup</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.order_no}</strong></td>
                  <td>{o.customer_name}</td>
                  <td>{o.customer_phone || '—'}</td>
                  <td style={{ fontWeight: 'bold' }}>₱{Number(o.total_amount).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
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
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {o.status === 'pending' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(o.id, 'confirmed')}>Confirm</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(o.id, 'cancelled')}>Reject</button>
                        </>
                      )}
                      {o.status === 'confirmed' && (
                        <button className="btn btn-customer btn-sm" onClick={() => handleStatusChange(o.id, 'ready')}>Mark Ready</button>
                      )}
                      {o.status === 'ready' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(o.id, 'completed')}>Fulfill</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customer pre-orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderMgmt;
