import axiosInstance from './axiosInstance';

export const getRegistrations = () =>
  axiosInstance.get('/api/v1/registrations');

export const getPendingRegistrations = () =>
  axiosInstance.get('/api/v1/registrations/pending');

export const getMyRegistrations = () =>
  axiosInstance.get('/api/v1/registrations/my');

export const submitRegistration = (data) =>
  axiosInstance.post('/api/v1/registrations', data);

export const processRegistration = (id, data) =>
  axiosInstance.put(`/api/v1/registrations/${id}/approve`, data);
