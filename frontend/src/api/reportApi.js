import api from './axios';

export const getSalesReportApi = (params) => api.get('/reports/sales', { params });
export const getInventoryReportApi = () => api.get('/reports/inventory');
export const getExpiryReportApi = () => api.get('/reports/expiry');
export const getSupplierReportApi = () => api.get('/reports/suppliers');
