import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  CalendarCheck, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu
} from 'lucide-react';

// ==========================================
// 1. COMPONENT: SIDEBAR (Thanh điều hướng bên trái)
// ==========================================
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Tổng quan', icon: LayoutDashboard, active: true },
    { name: 'Lễ tân & Đặt phòng', icon: CalendarCheck, active: false },
    { name: 'Quản lý Phòng', icon: BedDouble, active: false },
    { name: 'Nhân sự & Phân quyền', icon: Users, active: false },
    { name: 'Cài đặt hệ thống', icon: Settings, active: false },
  ];

  return (
    <aside className={`bg-slate-900 text-slate-300 w-64 min-h-screen flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-50`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
          <BedDouble className="text-blue-500" />
          LUXE STAY <span className="text-xs text-slate-500 font-normal">PMS</span>
        </h1>
      </div>

      {/* Menu Area */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Core Modules</p>
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              item.active 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </a>
        ))}
      </nav>

      {/* Footer Sidebar Area */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-left text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

// ==========================================
// 2. COMPONENT: HEADER (Thanh tiêu đề bên trên)
// ==========================================
const Header = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Nút mở menu trên Mobile */}
        <button onClick={toggleSidebar} className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600">
          <Menu size={24} />
        </button>
        
        {/* Thanh tìm kiếm */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all w-80">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm mã booking, sđt khách hàng..." 
            className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700"
          />
        </div>
      </div>

      {/* Thông tin User & Thông báo */}
      <div className="flex items-center gap-4 border-l pl-4 border-slate-200">
        <button className="p-2 text-slate-400 hover:text-blue-600 relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700 leading-none">Minh Nhat</p>
            <p className="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
            MN
          </div>
        </div>
      </div>
    </header>
  );
};

// ==========================================
// 3. COMPONENT: ADMIN LAYOUT (Khung sườn tổng)
// ==========================================
const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Overlay cho Mobile khi mở Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Component */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Vùng chứa nội dung trang (Outlet) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN APP (Nơi ghép nối)
// ==========================================
export default function App() {
  return (
    <AdminLayout>
      {/* Đây là vùng nội dung giả lập. Sau này sẽ thay bằng thư viện React Router */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Tổng quan hệ thống</h2>
        
        {/* Mockup Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Phòng đang trống", value: "24/50", color: "text-emerald-600", bg: "bg-emerald-100" },
            { title: "Khách đang ở", value: "38", color: "text-blue-600", bg: "bg-blue-100" },
            { title: "Cần dọn dẹp", value: "5", color: "text-amber-600", bg: "bg-amber-100" },
            { title: "Doanh thu hôm nay", value: "18.5M", color: "text-purple-600", bg: "bg-purple-100" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <BedDouble className={stat.color} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cấu trúc rỗng chờ Dev */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 border-dashed text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Task 1 Đã Hoàn Thành!</h3>
          <p className="mt-1 text-slate-500">
            Khung layout đã sẵn sàng. Hãy cài đặt Prisma Database để tiến hành lấy dữ liệu thật!
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}