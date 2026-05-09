// frontend/src/utils/axios.js
import axios from 'axios';

// Tạo một instance (phiên bản) của axios với các cấu hình mặc định
const axiosInstance = axios.create({
  // Tạm thời fix cứng localhost, sau này có thể dùng import.meta.env.VITE_API_URL
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Quá 10s không phản hồi thì báo lỗi mạng
});

// INTERCEPTOR REQUEST: Trước khi gửi API đi, tự động đính kèm Token (nếu có)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Lấy token từ LocalStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR RESPONSE: Khi Backend trả kết quả về, bắt lỗi tập trung tại đây
axiosInstance.interceptors.response.use(
  (response) => {
    // Trả về data luôn cho gọn, không cần res.data.data ở các component
    return response.data;
  },
  (error) => {
    // Xử lý lỗi 401 (Hết hạn Token / Chưa đăng nhập)
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ. Đang đá văng ra login...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Chuyển hướng về trang đăng nhập
      window.location.href = '/admin/login'; 
    }
    
    // Xử lý lỗi 403 (Không có quyền truy cập - RBAC)
    if (error.response && error.response.status === 403) {
      alert("Bạn không có quyền thực hiện hành động này!");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;