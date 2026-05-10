// frontend/src/pages/admin/staffs/StaffEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, User } from 'lucide-react';

import Button from '../../../components/ui/Button.jsx';
import Image from '../../../components/ui/Image.jsx'; 
import { staffService } from '../../../services/staffService.js';
import { roleService } from '../../../services/roleService.js';
import { toast } from '../../../utils/toast.js';
import { useAuthStore } from '../../../stores/authStore.js';

export default function StaffEdit() {
  const { id } = useParams();
  
  const { user, permissions } = useAuthStore();
  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : user?.role;
  const isAdmin = roleSlug === 'admin' || roleSlug === 'super-admin';
  const staffPerms = permissions.find(p => p.module === 'STAFF') || {};
  
  if (!isAdmin && !staffPerms.canUpdate) {
    toast.error('Bạn không có quyền chỉnh sửa nhân sự!');
    return <Navigate to="/admin/staffs" replace />;
  }

  const isMe = parseInt(id) === user?.id;

  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: '', roleId: '', status: 'active', avatarUrl: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [staffRes, rolesRes] = await Promise.all([
          staffService.getById(id),
          roleService.getAll()
        ]);
        
        const staffData = staffRes.data;
        setFormData({
            fullName: staffData.fullName || '',
            email: staffData.email || '',
            password: '', 
            phone: staffData.phone || '',
            avatarUrl: staffData.avatarUrl || '',
            roleId: staffData.roleId || '',
            status: staffData.status || 'active',
        });
        setRoles(rolesRes.data.filter(r => !r.deletedAt));
      } catch (err) {
        toast.error('Lỗi tải dữ liệu');
        navigate('/admin/staffs');
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(errors[e.target.name]) setErrors({...errors, [e.target.name]: null});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      const { email, avatarUrl, ...updatePayload } = formData;
      await staffService.update(id, updatePayload);
      toast.success('Cập nhật nhân sự thành công');
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

  if (fetching) return <div className="p-12 text-center text-gray-500 font-medium">Đang tải dữ liệu...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/staffs" className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary rounded-xl transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-gray-200 shadow-sm shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
            {formData.avatarUrl ? <Image src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cập Nhật: <span className="text-primary">{formData.fullName}</span>
              {isMe && <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold align-middle uppercase tracking-wider">Tài khoản của bạn</span>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Sửa đổi thông tin và quyền hạn truy cập</p>
          </div>
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
              <input type="text" name="fullName" autoComplete="new-password" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email đăng nhập</label>
              <input type="email" name="email" value={formData.email} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed shadow-sm" />
              <p className="text-[11px] text-gray-400 mt-1">Email là định danh duy nhất và không thể thay đổi.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
              <input type="tel" name="phone" autoComplete="new-password" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            
            {/* Đã xóa URL Avatar */}
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">2. Bảo mật & Phân quyền</h2>
            
            {isMe && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Bạn không thể tự thay đổi <b>Vai trò</b> và <b>Trạng thái</b> của chính mình để tránh mất quyền truy cập.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu mới</label>
              <input type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" placeholder="Bỏ trống nếu không muốn đổi mật khẩu" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò (Role) <span className="text-red-500">*</span></label>
              <select name="roleId" disabled={isMe} value={formData.roleId} onChange={handleChange} className={`w-full px-4 py-2.5 bg-white border ${errors.roleId ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}>
                <option value="">-- Chọn vai trò --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Level {r.level})</option>
                ))}
              </select>
              {errors.roleId && <p className="text-xs text-red-500 mt-1">{errors.roleId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái (Khóa/Mở khóa)</label>
              <select name="status" disabled={isMe} value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                <option value="active">Đang hoạt động (Mở khóa)</option>
                <option value="inactive">Khóa tài khoản</option>
              </select>
            </div>
          </div>

        </div>
        
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
          <Link to="/admin/staffs"><Button variant="outline" type="button" className="rounded-lg px-6">Hủy bỏ</Button></Link>
          <Button type="submit" variant="primary" iconLeft={Save} isLoading={loading} className="rounded-lg px-6">Lưu Cập Nhật</Button>
        </div>
      </form>
    </div>
  );
}