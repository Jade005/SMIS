import api from './axios';

export const getOrdersApi = (params) => api.get('/orders', { params });
export const getMyOrdersApi = () => api.get('/orders/my');
export const getOrderByIdApi = (id) => api.get(`/orders/${id}`);
export const createOrderApi = (data) => api.post('/orders', data);
export const updateOrderStatusApi = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const cancelOrderApi = (id) => api.delete(`/orders/${id}`);
