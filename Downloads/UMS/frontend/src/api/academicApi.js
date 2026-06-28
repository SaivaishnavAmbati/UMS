import axiosInstance from './axiosInstance';

// Departments
export const getDepartments = () =>
  axiosInstance.get('/api/v1/academic/departments');

export const getDepartmentById = (id) =>
  axiosInstance.get(`/api/v1/academic/departments/${id}`);

export const createDepartment = (data) =>
  axiosInstance.post('/api/v1/academic/departments', data);

export const deleteDepartment = (id) =>
  axiosInstance.delete(`/api/v1/academic/departments/${id}`);

// Semesters
export const getSemesters = () =>
  axiosInstance.get('/api/v1/academic/semesters');

export const getActiveSemester = () =>
  axiosInstance.get('/api/v1/academic/semesters/active');

export const getSemesterById = (id) =>
  axiosInstance.get(`/api/v1/academic/semesters/${id}`);

export const createSemester = (data) =>
  axiosInstance.post('/api/v1/academic/semesters', data);

export const activateSemester = (id) =>
  axiosInstance.put(`/api/v1/academic/semesters/${id}/activate`);

// Courses
export const getCourses = () =>
  axiosInstance.get('/api/v1/academic/courses');

export const getCourseById = (id) =>
  axiosInstance.get(`/api/v1/academic/courses/${id}`);

export const getCourseByCode = (code) =>
  axiosInstance.get(`/api/v1/academic/courses/code/${code}`);

export const searchCourses = (query) =>
  axiosInstance.get(`/api/v1/academic/courses/search?query=${query}`);

export const getCoursesByDepartment = (departmentId) =>
  axiosInstance.get(`/api/v1/academic/courses/department/${departmentId}`);

export const createCourse = (data) =>
  axiosInstance.post('/api/v1/academic/courses', data);

// Faculty
export const getFacultyList = () =>
  axiosInstance.get('/api/v1/academic/faculty');

export const getFacultyById = (id) =>
  axiosInstance.get(`/api/v1/academic/faculty/${id}`);

export const getFacultyByUsername = (username) =>
  axiosInstance.get(`/api/v1/academic/faculty/username/${username}`);

export const createFaculty = (data) =>
  axiosInstance.post('/api/v1/academic/faculty', data);
