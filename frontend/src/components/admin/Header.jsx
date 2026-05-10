import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Hàm helper để render role an toàn
  // Xử lý cả trường hợp role là string (đề phòng) và role là object
  const getRoleDisplay = () => {
    if (!user?.role) return 'Staff';
    if (typeof user.role === 'string') return user.role;
    return user.role.name || 'Staff';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shadow-sm z-10">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">{user?.fullName || 'Quản trị viên'}</p>
            {/* FIX LỖI OBJECT REACT TẠI ĐÂY */}
            <p className="text-xs text-gray-500 capitalize">{getRoleDisplay()}</p>
          </div>
        </div>
        
        <div className="h-6 w-px bg-gray-200"></div>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-danger hover:bg-red-50 rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}