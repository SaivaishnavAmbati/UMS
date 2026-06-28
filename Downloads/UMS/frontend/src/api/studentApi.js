import axiosInstance from './axiosInstance';

export const getStudentProfile = () =>
  axiosInstance.get('/api/v1/students/profile');

export const getStudentById = (id) =>
  axiosInstance.get(`/api/v1/students/${id}`);

export const getStudentByUserId = (userId) =>
  axiosInstance.get(`/api/v1/students/user/${userId}`);

export const createStudentProfile = (data) =>
  axiosInstance.post('/api/v1/students', data);
