// frontend/src/utils/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor cho Request: Tự động gắn Token vào Header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho Response: Xử lý lỗi 401 chung toàn hệ thống
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa thông tin đăng nhập cũ
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin-auth-storage');
      
      // FIX LỖI RELOAD: Chỉ đá về trang login nếu người dùng KHÔNG PHẢI đang ở sẵn trang login
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;