import axiosInstance from './axiosInstance';

export const login = (credentials) =>
  axiosInstance.post('/api/v1/auth/login', credentials);

export const register = (data) =>
  axiosInstance.post('/api/v1/auth/register', data);

export const refreshToken = (refreshToken) =>
  axiosInstance.post('/api/v1/auth/refresh', { refreshToken });

export const getProfile = () =>
  axiosInstance.get('/api/v1/auth/profile');
