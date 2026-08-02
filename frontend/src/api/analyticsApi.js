import api from './axios';

export const getRevenueTrendsApi = (days) => api.get('/analytics/revenue', { params: { days } });
export const getBestSellersApi = (limit) => api.get('/analytics/best-sellers', { params: { limit } });
export const getSalesByCategoryApi = () => api.get('/analytics/sales-by-category');
