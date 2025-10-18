import axios from 'axios';

// Base URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login/', { username, password }),
  
  register: (userData) => 
    api.post('/auth/register/', userData),
  
  refreshToken: (refreshToken) => 
    api.post('/auth/token/refresh/', { refresh: refreshToken }),
  
  getProfile: () => 
    api.get('/auth/profile/'),
  
  updateProfile: (userData) => 
    api.put('/auth/profile/update/', userData),
};

// User management API (Admin only)
export const userAPI = {
  getUsers: (params) => 
    api.get('/users/', { params }),
  
  getUser: (id) => 
    api.get(`/users/${id}/`),
  
  createUser: (userData) => 
    api.post('/users/', userData),
  
  updateUser: (id, userData) => 
    api.put(`/users/${id}/`, userData),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}/`),
  
  deactivateUser: (id) => 
    api.post(`/users/${id}/deactivate/`),
  
  activateUser: (id) => 
    api.post(`/users/${id}/activate/`),
};

// Pupil Profile API
export const pupilAPI = {
  getProfiles: (params) => 
    api.get('/pupil-profiles/', { params }),
  
  getProfile: (id) => 
    api.get(`/pupil-profiles/${id}/`),
  
  updateProfile: (id, profileData) => 
    api.put(`/pupil-profiles/${id}/`, profileData),
};

// For backwards compatibility
export const studentAPI = pupilAPI;

// Class management API
export const classAPI = {
  getClasses: (params) => 
    api.get('/classes/', { params }),
  
  getClass: (id) => 
    api.get(`/classes/${id}/`),
  
  createClass: (classData) => 
    api.post('/classes/', classData),
  
  updateClass: (id, classData) => 
    api.put(`/classes/${id}/`, classData),
  
  deleteClass: (id) => 
    api.delete(`/classes/${id}/`),
  
  getPupils: (id) => 
    api.get(`/classes/${id}/pupils/`),
  
  // For backwards compatibility
  getStudents: (id) => 
    api.get(`/classes/${id}/pupils/`),
};

// Subject management API
export const subjectAPI = {
  getSubjects: (params) => 
    api.get('/subjects/', { params }),
  
  getSubject: (id) => 
    api.get(`/subjects/${id}/`),
  
  createSubject: (subjectData) => 
    api.post('/subjects/', subjectData),
  
  updateSubject: (id, subjectData) => 
    api.put(`/subjects/${id}/`, subjectData),
  
  deleteSubject: (id) => 
    api.delete(`/subjects/${id}/`),
};

// Academic Session API
export const sessionAPI = {
  getSessions: (params) => 
    api.get('/sessions/', { params }),
  
  getSession: (id) => 
    api.get(`/sessions/${id}/`),
  
  getActiveSession: () => 
    api.get('/sessions/active/'),
  
  createSession: (sessionData) => 
    api.post('/sessions/', sessionData),
  
  updateSession: (id, sessionData) => 
    api.put(`/sessions/${id}/`, sessionData),
  
  deleteSession: (id) => 
    api.delete(`/sessions/${id}/`),

  unlockResults: (id) => 
    api.post(`/sessions/${id}/unlock_results/`),

  lockResults: (id) => 
    api.post(`/sessions/${id}/lock_results/`),
};

// Result management API
export const resultAPI = {
  getResults: (params) => 
    api.get('/results/', { params }),
  
  getResult: (id) => 
    api.get(`/results/${id}/`),
  
  createResult: (resultData) => 
    api.post('/results/', resultData),
  
  updateResult: (id, resultData) => 
    api.put(`/results/${id}/`, resultData),
  
  deleteResult: (id) => 
    api.delete(`/results/${id}/`),
  
  bulkCreateResults: (bulkData) => 
    api.post('/results/bulk_create/', bulkData),
  
  getMyResults: (params) => 
    api.get('/results/my_results/', { params }),
};

// Result Summary API
export const summaryAPI = {
  getSummaries: (params) => 
    api.get('/summaries/', { params }),
  
  getSummary: (id) => 
    api.get(`/summaries/${id}/`),
  
  createSummary: (summaryData) => 
    api.post('/summaries/', summaryData),
  
  updateSummary: (id, summaryData) => 
    api.put(`/summaries/${id}/`, summaryData),
  
  calculateSummary: (id) => 
    api.post(`/summaries/${id}/calculate/`),
  
  generateSummary: (summaryData) => 
    api.post('/summaries/generate_summary/', summaryData),
  
  downloadPDF: (id) => 
    api.get(`/summaries/${id}/pdf/`, { responseType: 'blob' }),
};

// Media management API
export const mediaAPI = {
  // Carousel
  getCarouselImages: () => 
    api.get('/media/carousel/'),
  
  getActiveCarouselImages: () => 
    api.get('/media/carousel/active_images/'),
  
  createCarouselImage: (formData) => 
    api.post('/media/carousel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateCarouselImage: (id, formData) => 
    api.put(`/media/carousel/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteCarouselImage: (id) => 
    api.delete(`/media/carousel/${id}/`),
  
  // Logo
  getLogos: () => 
    api.get('/media/logo/'),
  
  getActiveLogo: () => 
    api.get('/media/logo/active_logo/'),
  
  uploadLogo: (formData) => 
    api.post('/media/logo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateLogo: (id, formData) => 
    api.put(`/media/logo/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
