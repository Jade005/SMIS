import React, { useEffect, useState, useMemo } from 'react';
import { getOrdersApi, updateOrderStatusApi } from '../../api/orderApi';
import { ShoppingBag, CheckCircle, Clock, XCircle, Search, X } from 'lucide-react';

const OrderMgmt = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const cleanDigits = term.replace(/[^0-9]/g, '');

    return orders.filter((o) => {
      // AND logic: respect active status filter
      if (filterStatus && o.status !== filterStatus) {
        return false;
      }

      if (!term) return true;

      const customerName = (o.customer_name || '').toLowerCase();
      const orderNo = (o.order_no || '').toLowerCase();
      const phone = (o.customer_phone || '').toLowerCase();
      const phoneDigits = phone.replace(/[^0-9]/g, '');

      const matchName = customerName.includes(term);
      const matchOrderNo = orderNo.includes(term);
      const matchPhone = phone.includes(term) || (cleanDigits.length > 0 && phoneDigits.includes(cleanDigits));

      return matchName || matchOrderNo || matchPhone;
    });
  }, [orders, searchTerm, filterStatus]);

  return (
    <div className="page-container">
      <style>{`
        .orders-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          border-bottom: 1px dashed var(--line);
          padding-bottom: 12px;
        }
        .orders-header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .orders-search-box {
          position: relative;
          width: 320px;
          max-width: 100%;
        }
        .orders-search-input {
          height: 40px !important;
          padding-left: 38px !important;
          padding-right: 34px !important;
          font-size: 13px !important;
          background: #140507 !important;
          color: var(--fat) !important;
          border: 1px solid var(--line-strong) !important;
          border-radius: var(--radius-sm) !important;
          box-shadow: var(--clay-shadow-inset) !important;
        }
        .orders-search-input::placeholder {
          color: #8C776B;
        }
        .orders-search-input:focus {
          border-color: var(--meat-hi) !important;
          background: #1B0709 !important;
          box-shadow: 0 0 0 3px rgba(229, 56, 74, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.5) !important;
        }
        .orders-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #8C776B;
          pointer-events: none;
        }
        .orders-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mute);
          border-radius: 4px;
          transition: color 0.2s ease;
        }
        .orders-search-clear:hover {
          color: var(--fat);
        }
        .orders-status-select {
          width: 180px;
          height: 40px !important;
          font-size: 13px !important;
          background-color: #140507 !important;
          color: var(--fat) !important;
          border: 1px solid var(--line-strong) !important;
          border-radius: var(--radius-sm) !important;
          box-shadow: var(--clay-shadow-inset) !important;
          cursor: pointer;
        }
        .orders-status-select:focus {
          border-color: var(--meat-hi) !important;
          background: #1B0709 !important;
          box-shadow: 0 0 0 3px rgba(229, 56, 74, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.5) !important;
        }
        @media (max-width: 680px) {
          .orders-card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }
          .orders-header-controls {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            gap: 10px;
          }
          .orders-search-box {
            width: 100% !important;
          }
          .orders-status-select {
            width: 100% !important;
          }
        }
      `}</style>

      <div className="card">
        <div className="orders-card-header">
          <span className="card-title">Customer Pre-Orders</span>
          <div className="orders-header-controls">
            <div className="orders-search-box">
              <Search size={16} className="orders-search-icon" />
              <input
                type="text"
                className="form-control orders-search-input"
                placeholder="Search customer name or order no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="orders-search-clear"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <select
              className="form-control orders-status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="ready">Ready for Pickup</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
              {filteredOrders.map((o) => (
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
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px 18px', color: 'var(--mute)' }}>
                    No orders found
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

export default OrderMgmt;
