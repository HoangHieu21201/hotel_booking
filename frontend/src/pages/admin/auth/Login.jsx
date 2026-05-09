// frontend/src/pages/admin/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';

// Sửa lại đường dẫn: Từ pages/admin/auth/Login.jsx đi lên src/ (3 cấp)
import axiosInstance from '../../../utils/axios';
import { useAuthStore } from '../../../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Lưu lỗi theo field: { email: '...', password: '...' }
  const [globalError, setGlobalError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Xóa lỗi khi user bắt đầu gõ lại
    if (errors[name]) setErrors({ ...errors, [name]: null });
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError('');

    try {
      const response = await axiosInstance.post('/admin/auth/login', formData);
      const { user, token } = response.data;
      
      // Lưu vào Zustand và LocalStorage
      setCredentials(user, token, user.permissions || []);
      
      // Chuyển hướng vào Dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        // Bắt mảng lỗi chuẩn từ Zod Middleware của Backend
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors = {};
          data.errors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setGlobalError(data.message || 'Đăng nhập thất bại');
        }
      } else {
        setGlobalError('Không thể kết nối đến máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Hotel PMS</h1>
          <p className="text-gray-500">Đăng nhập hệ thống quản trị</p>
        </div>

        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-danger border border-red-200 rounded-lg text-sm text-center">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? 'border-danger focus:ring-danger' : 'border-gray-300 focus:ring-primary focus:border-primary'
                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm`}
                placeholder="admin@hotel.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.password ? 'border-danger focus:ring-danger' : 'border-gray-300 focus:ring-primary focus:border-primary'
                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/forgot-password')}
              className="text-sm text-warning hover:text-orange-500 font-medium transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}