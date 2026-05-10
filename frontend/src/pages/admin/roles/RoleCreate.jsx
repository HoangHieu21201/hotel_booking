// frontend/src/pages/admin/roles/RoleCreate.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckSquare, Eye, XSquare } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { roleService } from '../../../services/roleService';
import { moduleService } from '../../../services/moduleService';
import { toast } from '../../../utils/toast';
import { useAuthStore } from '../../../stores/authStore';

export default function RoleCreate() {
  // === BẢO MẬT RBAC ===
  const { user, permissions } = useAuthStore();
  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : user?.role;
  const isAdmin = roleSlug === 'admin' || roleSlug === 'super-admin';
  const rolePerms = permissions.find(p => p.module === 'ROLE') || {};
  
  const canCreate = isAdmin || rolePerms.canCreate;

  if (!canCreate) {
    toast.error('Bạn không có thẩm quyền tạo Vai trò mới!');
    return <Navigate to="/admin/roles" replace />;
  }

  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', level: 50 });
  const [permissionsData, setPermissionsData] = useState([]); 
  const [dbModules, setDbModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await moduleService.getAll();
        setDbModules(res.data || []);
      } catch (err) {
        toast.error('Không tải được danh sách Modules');
      }
    };
    loadData();
  }, []);

  const generateSlug = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

  const handleNameChange = (e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const allowedModules = useMemo(() => {
    const roleLevel = parseInt(formData.level) || 99;
    // Sắp xếp modules hiển thị trong form theo mức độ quan trọng (level)
    const sorted = [...dbModules].sort((a, b) => a.level - b.level);
    return sorted.filter(m => roleLevel <= m.level);
  }, [dbModules, formData.level]);

  const handlePermissionChange = (moduleKey, action, checked) => {
    setPermissionsData(prev => {
      const idx = prev.findIndex(p => p.module === moduleKey);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [action]: checked };
        if (checked && action !== 'canView') updated[idx].canView = true;
        return updated;
      }
      return [...prev, { 
        module: moduleKey, 
        canView: action === 'canView' || checked, 
        canCreate: action === 'canCreate' ? checked : false, 
        canUpdate: action === 'canUpdate' ? checked : false, 
        canDelete: action === 'canDelete' ? checked : false 
      }];
    });
  };

  const quickAction = (type) => {
    if (type === 'ALL') {
      setPermissionsData(allowedModules.map(m => ({ module: m.key, canView: true, canCreate: true, canUpdate: true, canDelete: true })));
    } else if (type === 'VIEW') {
      setPermissionsData(allowedModules.map(m => ({ module: m.key, canView: true, canCreate: false, canUpdate: false, canDelete: false })));
    } else {
      setPermissionsData([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await roleService.create({ ...formData, permissions: permissionsData });
      toast.success('Khởi tạo vai trò thành công');
      navigate('/admin/roles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/roles" className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary rounded-xl transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thiết Lập Vai Trò Mới</h1>
          <p className="text-sm text-gray-500 mt-1">Định nghĩa thông tin và phân quyền chi tiết cho nhân sự</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">
          <div className="xl:col-span-4 space-y-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">1. Thông tin chung</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên hiển thị <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleNameChange} required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" placeholder="VD: Quản lý khách sạn" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã Slug (Hệ thống) <span className="text-red-500">*</span></label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cấp độ Level <span className="text-xs font-normal text-gray-400 ml-1">(Số nhỏ = Quyền cao)</span> <span className="text-red-500">*</span></label>
              <input type="number" name="level" value={formData.level} onChange={handleChange} min="1" max="99" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả nhiệm vụ</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" placeholder="Ghi chú..."></textarea>
            </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-2 gap-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase">2. Ma trận Đặc Quyền ({allowedModules.length})</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => quickAction('ALL')} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5" /> Full Quyền</button>
                <button type="button" onClick={() => quickAction('VIEW')} className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-bold flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Chỉ xem</button>
                <button type="button" onClick={() => quickAction('NONE')} className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-600 hover:text-white rounded-lg transition-all text-xs font-bold flex items-center gap-1.5"><XSquare className="w-3.5 h-3.5" /> Xóa sạch</button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-5 py-4">Phân hệ Module</th>
                    <th className="px-4 py-4 text-center">Xem</th>
                    <th className="px-4 py-4 text-center">Thêm</th>
                    <th className="px-4 py-4 text-center">Sửa</th>
                    <th className="px-4 py-4 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allowedModules.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">Không có module nào phù hợp với cấp độ này. Vui lòng giảm chỉ số Cấp độ (Level).</td></tr>
                  ) : (
                    allowedModules.map(mod => {
                      const perm = permissionsData.find(p => p.module === mod.key) || {};
                      return (
                        <tr key={mod.key} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-800">{mod.label}</td>
                          <td className="text-center"><input type="checkbox" checked={perm.canView || false} onChange={(e) => handlePermissionChange(mod.key, 'canView', e.target.checked)} className="w-4 h-4 rounded-md text-primary focus:ring-primary border-gray-300 cursor-pointer" /></td>
                          <td className="text-center"><input type="checkbox" checked={perm.canCreate || false} onChange={(e) => handlePermissionChange(mod.key, 'canCreate', e.target.checked)} className="w-4 h-4 rounded-md text-primary focus:ring-primary border-gray-300 cursor-pointer" /></td>
                          <td className="text-center"><input type="checkbox" checked={perm.canUpdate || false} onChange={(e) => handlePermissionChange(mod.key, 'canUpdate', e.target.checked)} className="w-4 h-4 rounded-md text-primary focus:ring-primary border-gray-300 cursor-pointer" /></td>
                          <td className="text-center"><input type="checkbox" checked={perm.canDelete || false} onChange={(e) => handlePermissionChange(mod.key, 'canDelete', e.target.checked)} className="w-4 h-4 rounded-md text-primary focus:ring-primary border-gray-300 cursor-pointer" /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="p-5 sm:px-8 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
          <Link to="/admin/roles">
            <Button variant="outline" type="button" className="px-6">Hủy bỏ</Button>
          </Link>
          <Button type="submit" variant="primary" iconLeft={Save} isLoading={loading} className="px-6">Khởi tạo Vai Trò</Button>
        </div>
      </form>
    </div>
  );
}