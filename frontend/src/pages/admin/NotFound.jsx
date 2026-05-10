// frontend/src/pages/admin/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light">
      <h1 className="text-9xl font-bold text-primary tracking-widest">404</h1>
      <div className="bg-warning text-white px-2 text-sm rounded rotate-12 absolute">
        Trang không tồn tại
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mt-8">Ối! Bạn đi lạc rồi.</h2>
      <p className="text-gray-500 mt-2 mb-6 text-center max-w-md">
        Đường dẫn bạn đang cố truy cập không tồn tại, đã bị đổi tên hoặc tạm thời không khả dụng.
      </p>
      <Link 
        to="/admin/dashboard" 
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium shadow-md"
      >
        Quay lại Trang chủ
      </Link>
    </div>
  );
}