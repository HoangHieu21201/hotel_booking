// frontend/src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import Footer from '../components/admin/Footer';

export default function AdminLayout() {
  // Trạng thái đóng/mở sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-light overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} />
      
      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Main Content (Hiển thị các trang qua Outlet) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}