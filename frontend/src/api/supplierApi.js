import api from './axios';

export const getSuppliersApi = (params) => api.get('/suppliers', { params });
export const getSupplierByIdApi = (id) => api.get(`/suppliers/${id}`);
export const createSupplierApi = (data) => api.post('/suppliers', data);
export const updateSupplierApi = (id, data) => api.put(`/suppliers/${id}`, data);
export const toggleSupplierStatusApi = (id, is_active) => api.patch(`/suppliers/${id}/status`, { is_active });
