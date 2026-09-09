import api from './axios';

export const loginApi = (email, password) => api.post('/auth/login', { email, password });
export const registerApi = (data) => api.post('/auth/register', data);
export const setPasswordApi = (token, new_password, confirm_password) => api.post('/auth/set-password', { token, new_password, confirm_password });
export const getMeApi = () => api.get('/auth/me');
