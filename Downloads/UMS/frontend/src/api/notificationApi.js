import axiosInstance from './axiosInstance';

export const getNotifications = (recipient) =>
  axiosInstance.get(`/api/v1/notifications?recipient=${recipient}`);

export const sendNotification = (data) =>
  axiosInstance.post('/api/v1/notifications', data);
