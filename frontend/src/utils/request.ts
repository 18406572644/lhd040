import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    try {
      const storageStr = localStorage.getItem('auth-storage');
      if (storageStr) {
        const storage = JSON.parse(storageStr);
        const token = storage?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('读取token失败', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        const storageStr = localStorage.getItem('auth-storage');
        if (storageStr) {
          const storage = JSON.parse(storageStr);
          if (storage?.state?.isAuthenticated) {
            storage.state.user = null;
            storage.state.token = null;
            storage.state.isAuthenticated = false;
            localStorage.setItem('auth-storage', JSON.stringify(storage));
          }
        }
      } catch (e) {
        console.error('清除认证状态失败', e);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default request;
