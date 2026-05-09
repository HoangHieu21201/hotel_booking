// frontend/src/router/adminRoutes.jsx
import { Outlet } from 'react-router-dom';

// Layout & Pages (Tạm thời import giả định, ta sẽ tạo các component này sau)
// import AdminLayout from '../layouts/AdminLayout';
// import Dashboard from '../pages/admin/Dashboard';
// import Login from '../pages/admin/auth/Login';

// Component bảo vệ Route: Nếu chưa có Token thì đá ra Login
const ProtectedRoute = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    // Nếu chưa đăng nhập, chuyển hướng (Tạm dùng window.location, sau này dùng <Navigate>)
    if (!isAuthenticated) {
        window.location.href = '/admin/login';
        return null;
    }
    return <Outlet />; // Outlet giống như <router-view> bên Vue
};

export const adminRoutes = [
  {
    path: '/admin/login',
    element: <div>Trang Đăng Nhập Admin (Sẽ code sau)</div>, // Chỗ này ghép Login.jsx vào
  },
  {
    path: '/admin',
    element: <ProtectedRoute />, // Bọc bảo vệ toàn bộ khu vực /admin
    children: [
      {
        path: '',
        element: <div>Khung Layout Admin (Sidebar + Header) <Outlet /></div>, // Chỗ này ghép AdminLayout vào
        children: [
          {
            path: 'dashboard',
            element: <div>Trang Dashboard (Sẽ code sau)</div>,
          },
          {
            path: 'rooms',
            element: <div>Trang Quản lý Phòng (Active/All/Deleted Tab)</div>,
          }
        ],
      },
    ],
  },
];