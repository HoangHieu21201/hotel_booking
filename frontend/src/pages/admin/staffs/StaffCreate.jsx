// frontend/src/pages/admin/staffs/StaffCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';

import Button from '../../../components/ui/Button.jsx';
import { staffService } from '../../../services/staffService.js';
import { roleService } from '../../../services/roleService.js';
import { moduleService } from '../../../services/moduleService.js';
import { toast } from '../../../utils/toast.js';
import { useAuthStore } from '../../../stores/authStore.js';

export default function StaffCreate() {
  const { user, permissions } = useAuthStore();
  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : user?.role;
  const isAdmin = roleSlug === 'admin' || roleSlug === 'super-admin';
  const staffPerms = permissions.find(p => p.module === 'STAFF') || {};
  
  if (!isAdmin && !staffPerms.canCreate) {
    toast.error('Bạn không có quyền thêm nhân sự!');
    return <Navigate to="/admin/staffs" replace />;
  }

  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [pageLevel, setPageLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: '', roleId: '', status: 'active'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleRes, moduleRes] = await Promise.all([
          roleService.getAll(),
          moduleService.getAll()
        ]);
        setRoles(roleRes.data.filter(r => !r.deletedAt));
        
        const staffModule = (moduleRes.data || []).find(m => m.key === 'STAFF');
        if (staffModule) setPageLevel(staffModule.level);
      } catch (err) {
        toast.error('Lỗi khi tải cấu hình');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(errors[e.target.name]) setErrors({...errors, [e.target.name]: null});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      await staffService.create(formData);
      
      toast.success('Tạo nhân sự mới thành công');
      navigate('/admin/staffs');
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach(e => fieldErrors[e.field] = e.message);
        setErrors(fieldErrors);
      } else {
        toast.error(err.response?.data?.message || 'Lỗi hệ thống');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/staffs" className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary rounded-xl transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thêm Nhân Sự Mới</h1>
            <p className="text-sm text-gray-500 mt-1">Cấp tài khoản và phân quyền truy cập hệ thống</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-600">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Trang yêu cầu:</span>
          <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-md">
            Cấp {pageLevel !== null ? pageLevel : '...'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <input type="email" style={{display: 'none'}} />
        <input type="password" style={{display: 'none'}} />

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">1. Thông tin cá nhân</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên <span className="text-red-500">*</span></label>
              <input type="text" name="fullName" autoComplete="new-password" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" placeholder="Nguyễn Văn A" />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email đăng nhập <span className="text-red-500">*</span></label>
              <input type="email" name="email" autoComplete="new-password" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" placeholder="email@hotel.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
              <input type="tel" name="phone" autoComplete="new-password" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" placeholder="0987654321" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            
            {/* Đã xóa hẳn ô nhập Avatar URL rác rưởi */}
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">2. Bảo mật & Phân quyền</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
              <input type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" placeholder="Tối thiểu 6 ký tự" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò (Role) <span className="text-red-500">*</span></label>
              <select name="roleId" value={formData.roleId} onChange={handleChange} className={`w-full px-4 py-2.5 bg-white border ${errors.roleId ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm`}>
                <option value="">-- Chọn vai trò --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Level {r.level})</option>
                ))}
              </select>
              {errors.roleId && <p className="text-xs text-red-500 mt-1">{errors.roleId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái (Khóa/Mở Khóa)</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm">
                <option value="active">Đang hoạt động (Mở khóa)</option>
                <option value="inactive">Khóa tài khoản</option>
              </select>
            </div>
          </div>

        </div>
        
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
          <Link to="/admin/staffs"><Button variant="outline" type="button" className="rounded-lg px-6">Hủy bỏ</Button></Link>
          <Button type="submit" variant="primary" iconLeft={Save} isLoading={loading} className="rounded-lg px-6">Tạo Tài Khoản</Button>
        </div>
      </form>
    </div>
  );
}