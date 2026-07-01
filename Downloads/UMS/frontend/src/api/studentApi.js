import axiosInstance from './axiosInstance';

export const getStudentProfile = () =>
  axiosInstance.get('/api/v1/students/profile');

export const getStudentById = (id) =>
  axiosInstance.get(`/api/v1/students/${id}`);

export const getStudentByUserId = (userId) =>
  axiosInstance.get(`/api/v1/students/user/${userId}`);

export const createStudentProfile = (data) =>
  axiosInstance.post('/api/v1/students', data);

export const updateStudentProfile = (data) =>
  axiosInstance.put('/api/v1/students/profile', data);

export const getPendingStudents = () =>
  axiosInstance.get('/api/v1/students/pending');

export const approveStudentProfile = (id, status, reason) => {
  const params = new URLSearchParams();
  params.append('status', status);
  if (reason) {
    params.append('reason', reason);
  }
  return axiosInstance.put(`/api/v1/students/${id}/approve?${params.toString()}`);
};
