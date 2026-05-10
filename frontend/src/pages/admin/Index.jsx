// frontend/src/pages/admin/Index.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import AdminLayout from '../../layouts/AdminLayout';
import NotFound from './NotFound';

import RoleIndex from './roles/RoleIndex';
import RoleCreate from './roles/RoleCreate';
import RoleEdit from './roles/RoleEdit';

// Tích hợp Component của Staff
import StaffIndex from './staffs/StaffIndex';
import StaffCreate from './staffs/StaffCreate';
import StaffEdit from './staffs/StaffEdit';

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('admin_token');
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

export default function AdminIndex() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4 text-gray-800">Dashboard Tổng quan</h1>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-600">Hệ thống đang hoạt động ổn định.</p>
              </div>
            </div>
          } />
          
          <Route path="roles">
            <Route index element={<RoleIndex />} />
            <Route path="create" element={<RoleCreate />} />
            <Route path=":id/edit" element={<RoleEdit />} />
          </Route>

          {/* LUỒNG CRUD STAFFS */}
          <Route path="staffs">
            <Route index element={<StaffIndex />} />
            <Route path="create" element={<StaffCreate />} />
            <Route path=":id/edit" element={<StaffEdit />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}