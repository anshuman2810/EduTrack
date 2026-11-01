import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor to add JWT token from localStorage to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edutrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle expired tokens or 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're on public verification route
      if (!window.location.pathname.startsWith('/verify')) {
        localStorage.removeItem('edutrack_token');
        localStorage.removeItem('edutrack_user');
      }
    }
    return Promise.reject(error);
  }
);

// ================= API METHODS =================

// Auth
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Public QR Verification
export const verifyQRCode = (qrToken, academicYearId = '') =>
  api.get(`/qr/verify/${qrToken}${academicYearId ? `?academicYearId=${academicYearId}` : ''}`);
export const getQRImage = (qrToken) => api.get(`/qr/image/${qrToken}`);

// Students
export const getStudents = (params) => api.get('/students', { params });
export const getStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (formData) =>
  api.post('/students', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateStudent = (id, formData) =>
  api.put(`/students/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const enrollStudentYear = (id, data) => api.post(`/students/${id}/enroll-year`, data);
export const getStudentQR = (id) => api.get(`/students/${id}/qr`);

// Academic Structure
export const getAcademicYears = () => api.get('/academic/years');
export const createAcademicYear = (data) => api.post('/academic/years', data);
export const updateAcademicYear = (id, data) => api.put(`/academic/years/${id}`, data);
export const deleteAcademicYear = (id) => api.delete(`/academic/years/${id}`);

export const getClasses = () => api.get('/academic/classes');
export const createClass = (data) => api.post('/academic/classes', data);
export const updateClass = (id, data) => api.put(`/academic/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/academic/classes/${id}`);

export const getSections = (classId = '') =>
  api.get(`/academic/sections${classId ? `?classId=${classId}` : ''}`);
export const createSection = (data) => api.post('/academic/sections', data);
export const updateSection = (id, data) => api.put(`/academic/sections/${id}`, data);
export const deleteSection = (id) => api.delete(`/academic/sections/${id}`);

export const getSubjects = (classId = '') =>
  api.get(`/academic/subjects${classId ? `?classId=${classId}` : ''}`);
export const createSubject = (data) => api.post('/academic/subjects', data);
export const updateSubject = (id, data) => api.put(`/academic/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/academic/subjects/${id}`);

// Users & Stats
export const getTeachers = () => api.get('/users/teachers');
export const createTeacher = (data) => api.post('/users/teachers', data);
export const updateTeacher = (id, data) => api.put(`/users/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/users/teachers/${id}`);

export const getParents = () => api.get('/users/parents');
export const createParent = (data) => api.post('/users/parents', data);
export const updateParent = (id, data) => api.put(`/users/parents/${id}`, data);
export const deleteParent = (id) => api.delete(`/users/parents/${id}`);

export const getInstitutionStats = () => api.get('/users/stats');

// Attendance
export const getAttendance = (params) => api.get('/attendance', { params });
export const submitBulkAttendance = (data) => api.post('/attendance/bulk', data);
export const getStudentAttendance = (studentId, academicYearId = '') =>
  api.get(
    `/attendance/student/${studentId}${academicYearId ? `?academicYearId=${academicYearId}` : ''}`
  );

// Exams & Marks
export const getExams = (params) => api.get('/exams', { params });
export const createExam = (data) => api.post('/exams', data);
export const getExamById = (id) => api.get(`/exams/${id}`);
export const updateExam = (id, data) => api.put(`/exams/${id}`, data);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

export const getExamMarks = (examId, sectionId = '') =>
  api.get(`/marks/exam/${examId}${sectionId ? `?sectionId=${sectionId}` : ''}`);
export const submitBulkMarks = (data) => api.post('/marks/bulk', data);
export const getStudentMarks = (studentId, academicYearId = '') =>
  api.get(`/marks/student/${studentId}${academicYearId ? `?academicYearId=${academicYearId}` : ''}`);

// Feedback
export const getFeedback = (params) => api.get('/feedback', { params });
export const submitFeedback = (data) => api.post('/feedback', data);
export const replyFeedback = (id, data) => api.put(`/feedback/${id}/reply`, data);

export default api;
