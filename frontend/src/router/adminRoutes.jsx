// frontend/src/router/adminRoutes.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Login from '../pages/admin/auth/Login';
import AdminLayout from '../layouts/AdminLayout';

// Component bảo vệ Route: Nếu chưa có Token thì đá ra Login
const ProtectedRoute = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
};

export const adminRoutes = [
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <AdminLayout />, // Đã tích hợp Layout chính thức
        children: [
          {
            path: 'dashboard',
            element: (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Tổng quan (Dashboard)</h1>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-600">Dữ liệu tổng quan đang được cập nhật...</p>
                </div>
              </div>
            ),
          },
          // Các trang khác (rooms, bookings...) sẽ được nhét vào đây ở các Task sau
        ]
      }
    ]
  }
];