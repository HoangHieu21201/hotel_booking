// frontend/src/router/clientRoutes.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

export const clientRoutes = [
  {
    path: '/',
    element: <div>Trang Chủ Client (Sẽ code sau) <Outlet /></div>,
    children: [
      // Các route con dành cho khách vãng lai sẽ nằm ở đây
    ]
  }
];