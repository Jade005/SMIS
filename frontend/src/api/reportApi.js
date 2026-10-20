import api from './axios';

export const getSalesReportApi = (params) => api.get('/reports/sales', { params });
export const getInventoryReportApi = (params) => api.get('/reports/inventory', { params });
export const getExpiryReportApi = (params) => api.get('/reports/expiry', { params });
export const getSupplierReportApi = (params) => api.get('/reports/suppliers', { params });
