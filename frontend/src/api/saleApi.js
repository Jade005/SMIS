import api from './axios';

export const getSalesApi = (params) => api.get('/sales', { params });
export const getSaleByIdApi = (id) => api.get(`/sales/${id}`);
export const createSaleApi = (data) => api.post('/sales', data);
export const getReceiptApi = (id) => api.get(`/sales/${id}/receipt`);
