import api from './axios';

export const getInventoryApi = (params) => api.get('/inventory', { params });
export const getBatchByIdApi = (id) => api.get(`/inventory/${id}`);
export const addBatchApi = (data) => api.post('/inventory', data);
export const updateBatchApi = (id, data) => api.put(`/inventory/${id}`, data);
export const updateBatchStatusApi = (id, status) => api.patch(`/inventory/${id}/status`, { status });

export const getLowStockAlertsApi = () => api.get('/inventory/alerts/low-stock');
export const getExpiringAlertsApi = (days) => api.get('/inventory/alerts/expiring', { params: { days } });
export const getExpiredAlertsApi = () => api.get('/inventory/alerts/expired');

export const getInventoryCountsApi = () => api.get('/inventory/counts');
export const disposeBatchApi = (id, data) => api.post(`/inventory/${id}/dispose`, data);
export const disposeAllExpiredApi = (data) => api.post('/inventory/dispose-all-expired', data);
export const getDisposalsApi = () => api.get('/inventory/disposals');

