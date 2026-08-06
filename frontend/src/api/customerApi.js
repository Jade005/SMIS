import api from './axios';

export const getCustomerProfileApi = () => api.get('/customer/profile');
export const updateCustomerProfileApi = (data) => api.put('/customer/profile', data);
export const changeCustomerPasswordApi = (data) => api.put('/customer/change-password', data);
