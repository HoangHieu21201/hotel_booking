// frontend/src/pages/admin/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, Loader2, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../../utils/axios.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Nhập Email, 2: Nhập OTP, 3: Nhập Mật khẩu mới
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Bước 1: Gửi mã OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axiosInstance.post('/admin/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi mã. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axiosInstance.post('/admin/auth/verify-otp', { email, otpCode });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axiosInstance.post('/admin/auth/reset-password', { email, otpCode, newPassword });
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/admin/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Khôi phục mật khẩu</h1>
          <p className="text-gray-500 text-sm">
            {step === 1 && 'Nhập email của bạn để nhận mã xác thực'}
            {step === 2 && 'Mã gồm 6 chữ số đã được gửi tới email'}
            {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-danger rounded-lg text-sm text-center">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Mail className="h-5 w-5 text-gray-400" /></div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-warning" placeholder="Nhập email của bạn" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 rounded-lg text-white bg-warning hover:bg-orange-500 transition-all disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Gửi mã xác nhận'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><KeyRound className="h-5 w-5 text-gray-400" /></div>
              <input type="text" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-warning font-mono tracking-widest text-center text-lg" placeholder="123456" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 rounded-lg text-white bg-warning hover:bg-orange-500 transition-all disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Xác nhận mã'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Lock className="h-5 w-5 text-gray-400" /></div>
              <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-warning" placeholder="Nhập mật khẩu mới" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 rounded-lg text-white bg-primary hover:bg-green-700 transition-all disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Lưu mật khẩu & Đăng nhập'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/admin/login" className="text-sm flex items-center justify-center text-gray-500 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}