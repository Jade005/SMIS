import React, { useEffect, useState } from 'react';
import { getSuppliersApi, createSupplierApi, toggleSupplierStatusApi } from '../../api/supplierApi';
import { Plus, Truck, Phone, Mail } from 'lucide-react';

const SupplierMgmt = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });

  const loadSuppliers = async () => {
    try {
      const res = await getSuppliersApi();
      setSuppliers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSupplierApi(formData);
      setShowModal(false);
      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
      loadSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add supplier');
    }
  };

  const handleToggle = async (id, is_active) => {
    try {
      await toggleSupplierStatusApi(id, !is_active);
      loadSuppliers();
    } catch (err) {
      alert('Failed to update supplier status');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Supplier Directory</span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Supplier
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.contact_person || '—'}</td>
                  <td>{s.phone || '—'}</td>
                  <td>{s.email || '—'}</td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleToggle(s.id, s.is_active)}>
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '16px' }}>Add New Supplier</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Supplier Name</label>
                <input type="text" className="form-control" placeholder="e.g. San Jose Farm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Contact Person</label>
                <input type="text" className="form-control" placeholder="Full Name" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
              </div>
              <div className="form-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" className="form-control" placeholder="09XX-XXX-XXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" placeholder="email@domain.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierMgmt;
