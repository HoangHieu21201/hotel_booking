import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import axiosInstance from '../../../utils/axios.js';
import { useAuthStore } from '../../../stores/authStore.js';

export default function Register() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '',
    confirmPassword: '' // Thêm trường xác nhận
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    // Đã bỏ clear globalError ở đây để tránh lỗi autofill
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setErrors({}); 
    setGlobalError('');

    // Validate Xác nhận mật khẩu ở Frontend
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp!' });
      setLoading(false);
      return;
    }

    try {
      // Chỉ gửi 3 trường backend cần
      const { fullName, email, password } = formData;
      const response = await axiosInstance.post('/admin/auth/register', { fullName, email, password });
      
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
          setGlobalError(data.message || 'Đăng ký thất bại');
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
          <h1 className="text-3xl font-bold text-primary mb-2">Tạo tài khoản</h1>
          <p className="text-gray-500">Gia nhập đội ngũ quản trị Hotel PMS</p>
        </div>

        {globalError && <div className="mb-5 p-3 bg-red-50 text-danger border border-red-200 rounded-lg text-sm text-center font-medium">{globalError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all" placeholder="Họ và Tên" />
            </div>
            {errors.fullName && <p className="mt-1 text-sm text-danger">{errors.fullName}</p>}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all" placeholder="Email làm việc" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all" placeholder="Mật khẩu (tối thiểu 6 ký tự)" />
            </div>
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ShieldCheck className="h-5 w-5 text-gray-400" /></div>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all" placeholder="Xác nhận lại mật khẩu" />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-danger">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 rounded-lg text-white bg-primary hover:bg-green-700 transition-all disabled:opacity-70 mt-2 font-medium shadow-sm">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Hoàn tất Đăng ký'}
          </button>
          
          <div className="text-center mt-5">
            <Link to="/admin/login" className="text-sm text-gray-500 hover:text-primary transition-colors">Đã có tài khoản? Đăng nhập ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}