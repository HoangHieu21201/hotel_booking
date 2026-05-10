// frontend/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashLoading from './components/common/SplashLoading.jsx'; // Đã thêm .jsx
import AdminIndex from './pages/admin/Index.jsx'; // Đã thêm .jsx
import NotFound from './pages/admin/NotFound.jsx'; // Đã thêm .jsx

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 1. Hiển thị màn hình Splash Sóng nước lúc mới tải trang
  if (isInitialLoad) {
    return <SplashLoading onFinish={() => setIsInitialLoad(false)} />;
  }

  // 2. Load xong thì vào luồng Router chính
  return (
    <BrowserRouter>
      <Routes>
        {/* Mặc định vào trang chủ sẽ nhảy sang khu vực Admin */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* --- PHÂN LUỒNG ADMIN --- */}
        {/* Dấu * cực kỳ quan trọng: Báo cho React biết mọi URL bắt đầu bằng /admin đều giao cho AdminIndex xử lý */}
        <Route path="/admin/*" element={<AdminIndex />} />

        {/* --- PHÂN LUỒNG CLIENT (Chuẩn bị sẵn cho tương lai) --- */}
        {/* <Route path="/client/*" element={<ClientIndex />} /> */}

        {/* Bắt các URL sai ở cấp cao nhất */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;