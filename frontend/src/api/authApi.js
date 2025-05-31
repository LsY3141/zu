import axiosInstance from './axios';

const authApi = {
  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },
  login: (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },
  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },
  changePassword: (passwordData) => {
    return axiosInstance.post('/auth/change-password', passwordData);
  },
  updateProfile: (profileData) => {
    return axiosInstance.put('/users/profile', profileData);
  },
  forgotPassword: (email) => {
    return axiosInstance.post('/auth/forgot-password', { email });
  },
  resetPassword: (resetData) => {
    return axiosInstance.post('/auth/reset-password', resetData);
  },
};

export default authApi;