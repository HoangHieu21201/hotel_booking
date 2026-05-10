// frontend/src/pages/admin/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import axiosInstance from '../../../utils/axios.js';
import { useAuthStore } from '../../../stores/authStore.js';

export default function Login() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Xóa lỗi từng field khi người dùng gõ lại
    if (errors[name]) setErrors({ ...errors, [name]: null });
    // KHÔNG clear globalError ở đây để tránh trình duyệt autofill làm biến mất thông báo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setErrors({}); 
    setGlobalError('');

    try {
      const response = await axiosInstance.post('/admin/auth/login', formData);
      const { user, token } = response.data;
      setCredentials(user, token, user.permissions || []);
      navigate('/admin/dashboard');
    } catch (error) {
      if (error.response?.data) {
        const data = error.response.data;
        if (Array.isArray(data.errors)) {
          const fieldErrors = {};
          data.errors.forEach((err) => fieldErrors[err.field] = err.message);
          setErrors(fieldErrors);
        } else {
          setGlobalError(data.message || 'Đăng nhập thất bại');
        }
      } else {
        setGlobalError('Lỗi kết nối máy chủ.');
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

        {/* Thông báo lỗi đã được giữ lại hiển thị ổn định */}
        {globalError && <div className="mb-5 p-3 bg-red-50 text-danger border border-red-200 rounded-lg text-sm text-center font-medium">{globalError}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all" placeholder="Email đăng nhập" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all" placeholder="••••••••" />
            </div>
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <Link to="/admin/register" className="text-sm text-primary font-medium hover:underline transition-colors">Tạo tài khoản</Link>
            <Link to="/admin/forgot-password" className="text-sm text-warning font-medium hover:underline transition-colors">Quên mật khẩu?</Link>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 rounded-lg text-white bg-primary hover:bg-green-700 transition-all disabled:opacity-70 font-medium shadow-sm">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}