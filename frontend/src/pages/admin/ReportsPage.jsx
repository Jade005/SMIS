import React, { useEffect, useState } from 'react';
import { getSalesReportApi, getInventoryReportApi, getExpiryReportApi, getSupplierReportApi } from '../../api/reportApi';
import { FileText, Download } from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [expiryReport, setExpiryReport] = useState([]);
  const [supplierReport, setSupplierReport] = useState([]);

  useEffect(() => {
    if (activeTab === 'sales') {
      getSalesReportApi({ period: salesPeriod }).then(res => setSalesReport(res.data));
    } else if (activeTab === 'inventory') {
      getInventoryReportApi().then(res => setInventoryReport(res.data || []));
    } else if (activeTab === 'expiry') {
      getExpiryReportApi().then(res => setExpiryReport(res.data || []));
    } else if (activeTab === 'suppliers') {
      getSupplierReportApi().then(res => setSupplierReport(res.data || []));
    }
  }, [activeTab, salesPeriod]);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
        {['sales', 'inventory', 'expiry', 'suppliers'].map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab} Report
          </button>
        ))}
      </div>

      {activeTab === 'sales' && salesReport && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Sales Revenue Report</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="form-control" value={salesPeriod} onChange={(e) => setSalesPeriod(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="kpi-grid" style={{ marginBottom: '20px' }}>
            <div className="kpi-card">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">₱{Number(salesReport.summary?.total_revenue || 0).toFixed(2)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Transactions</div>
              <div className="kpi-value">{salesReport.summary?.total_transactions || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Avg Transaction Value</div>
              <div className="kpi-value">₱{Number(salesReport.summary?.average_transaction_value || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Cashier</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total Amount</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.transactions?.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.receipt_no}</strong></td>
                    <td>{t.cashier_name}</td>
                    <td>₱{Number(t.subtotal).toFixed(2)}</td>
                    <td>₱{Number(t.discount).toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold' }}>₱{Number(t.total_amount).toFixed(2)}</td>
                    <td>{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="card">
          <div className="card-header"><span class="card-title">Current Inventory Status Report</span></div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Available Stock</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.map((i) => (
                  <tr key={i.id}>
                    <td>{i.batch_no}</td>
                    <td><strong>{i.product_name}</strong></td>
                    <td>{i.category_name}</td>
                    <td>{i.supplier_name}</td>
                    <td>{Number(i.available_stock_kg).toFixed(3)} kg</td>
                    <td>{i.expiration_date}</td>
                    <td><span className="badge badge-info">{i.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expiry' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Product Expiry Monitor Report</span></div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Stock Remaining</th>
                  <th>Expiration Date</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {expiryReport.map((e) => (
                  <tr key={e.id}>
                    <td>{e.batch_no}</td>
                    <td><strong>{e.product_name}</strong></td>
                    <td>{e.supplier_name}</td>
                    <td>{Number(e.available_stock_kg).toFixed(3)} kg</td>
                    <td>{e.expiration_date}</td>
                    <td>
                      <span className={`badge ${e.expiry_flag === 'Expired' ? 'badge-danger' : 'badge-warning'}`}>
                        {e.expiry_flag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Supplier Activity & Volume Report</span></div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Batches Delivered</th>
                  <th>Total Weight Delivered (kg)</th>
                </tr>
              </thead>
              <tbody>
                {supplierReport.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.supplier_name}</strong></td>
                    <td>{s.contact_person || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.total_batches_supplied} batch(es)</td>
                    <td style={{ fontWeight: 'bold' }}>{Number(s.total_weight_supplied_kg).toFixed(3)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
