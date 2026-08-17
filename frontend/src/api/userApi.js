import api from './axios';

export const getUsersApi = (params) => api.get('/users', { params });
export const getUserByIdApi = (id) => api.get(`/users/${id}`);
export const createUserApi = (data) => api.post('/users', data);
export const updateUserApi = (id, data) => api.put(`/users/${id}`, data);
export const toggleUserStatusApi = (id, is_active) => api.patch(`/users/${id}/status`, { is_active });
export const resetPasswordApi = (id) => api.patch(`/users/${id}/password`);
export const getPendingUsersApi = () => api.get('/users/pending');
export const approveUserApi = (id) => api.patch(`/users/${id}/approve`);
export const changePasswordApi = (data) => api.put('/customer/change-password', data);
export const getUserProfileApi = () => api.get('/users/profile');
export const updateUserProfileApi = (data) => api.put('/users/profile', data);
