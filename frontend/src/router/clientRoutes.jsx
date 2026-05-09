// frontend/src/router/clientRoutes.jsx
import { Outlet } from 'react-router-dom';

export const clientRoutes = [
  {
    path: '/',
    element: <div>Khung Layout Khách (Header Web + Footer) <Outlet /></div>,
    children: [
      {
        path: '',
        element: <div>Trang Chủ Đặt Phòng (Sẽ code sau)</div>,
      },
      {
        path: 'search',
        element: <div>Trang Tìm Kiếm Phòng</div>,
      }
    ],
  },
];