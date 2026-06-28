import axiosInstance from './axiosInstance';

export const getAuditLogs = () =>
  axiosInstance.get('/api/v1/audits');

export const getAuditLogsByUser = (username) =>
  axiosInstance.get(`/api/v1/audits/user/${username}`);
