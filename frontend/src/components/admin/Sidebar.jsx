// frontend/src/components/admin/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Hotel, CalendarCheck, Users, FileText, Settings, Key } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Logo from '../common/Logo';

const MENU_ITEMS = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', module: 'DASHBOARD' },
  { title: 'Phòng & Cấu hình', icon: Hotel, path: '/admin/rooms', module: 'ROOMS' },
  { title: 'Lễ tân (Bookings)', icon: CalendarCheck, path: '/admin/bookings', module: 'BOOKINGS' },
  { title: 'Khách hàng', icon: Users, path: '/admin/customers', module: 'CUSTOMERS' },
  { title: 'Kế toán (Folios)', icon: FileText, path: '/admin/folios', module: 'FOLIOS' },
  { title: 'Cài đặt hệ thống', icon: Settings, path: '/admin/settings', module: 'SETTINGS' },
  { title: 'Vai trò & Phân quyền', icon: Key, path: '/admin/roles', module: 'ROLE' },
  { title: 'Nhân viên', icon: Users, path: '/admin/staffs', module: 'STAFF' },
];

export default function Sidebar({ isOpen }) {
  const authStore = useAuthStore() || {};
  const permissions = authStore.permissions || [];
  const user = authStore.user || null;
  
  // LOGIC RBAC CHUẨN: Lọc menu hiển thị
  const authorizedMenus = MENU_ITEMS.filter(item => {
    if (!user) return false;
    
    const roleSlug = typeof user.role === 'object' ? user.role.slug : user.role;
    // Admin tối cao mặc định thấy tất cả
    if (roleSlug === 'admin' || roleSlug === 'super-admin') return true; 

    // Các role khác: Phải có quyền canView ở Module tương ứng mới được thấy Menu
    const hasPermission = permissions.find(p => p.module === item.module);
    return hasPermission && hasPermission.canView;
  });

  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-0 md:w-20'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col shrink-0`}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200 p-2">
         <Logo 
            size={isOpen ? 'md' : 'sm'} 
            showSlogan={isOpen}
            showText={isOpen} 
            className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}`} 
         />
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <ul className="space-y-1 px-2">
          {authorizedMenus.map((menu, index) => {
            const Icon = menu.icon;
            return (
              <li key={index}>
                <NavLink
                  to={menu.path}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                    }`
                  }
                  title={!isOpen ? menu.title : ''}
                >
                  <Icon className={`flex-shrink-0 ${isOpen ? 'h-5 w-5 mr-3' : 'h-6 w-6 mx-auto'}`} />
                  <span className={`${isOpen ? 'block' : 'hidden'} whitespace-nowrap`}>
                    {menu.title}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}