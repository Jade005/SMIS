import api from './axios';

// Categories
export const getCategoriesApi = () => api.get('/categories');
export const createCategoryApi = (data) => api.post('/categories', data);

// Products
export const getProductsApi = (params) => api.get('/products', { params });
export const getProductByIdApi = (id) => api.get(`/products/${id}`);
export const createProductApi = (data) => api.post('/products', data);
export const updateProductApi = (id, data) => api.put(`/products/${id}`, data);
export const toggleProductStatusApi = (id, is_active) => api.patch(`/products/${id}/status`, { is_active });
