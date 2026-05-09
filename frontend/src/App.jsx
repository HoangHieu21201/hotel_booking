// frontend/src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { adminRoutes } from './router/adminRoutes';
import { clientRoutes } from './router/clientRoutes';

// Gom tất cả các router lại thành 1 cây duy nhất
const router = createBrowserRouter([
  ...clientRoutes,
  ...adminRoutes,
  {
    path: '*', // Bắt các đường dẫn không tồn tại (Lỗi 404)
    element: <div className="text-center text-red-500 mt-20 text-2xl">404 - Không tìm thấy trang!</div>,
  }
]);

function App() {
  return (
    // RouterProvider giống hệt cách khai báo của Vue Router
    <RouterProvider router={router} />
  );
}

export default App;