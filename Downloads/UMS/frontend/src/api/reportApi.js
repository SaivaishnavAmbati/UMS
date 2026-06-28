import axiosInstance from './axiosInstance';

export const getDashboardMetrics = () =>
  axiosInstance.get('/api/v1/reports/dashboard');

export const exportRegistrations = () =>
  axiosInstance.get('/api/v1/reports/export/registrations', { responseType: 'blob' });

export const exportAuditTrail = () =>
  axiosInstance.get('/api/v1/reports/export/audit-trail', { responseType: 'blob' });
