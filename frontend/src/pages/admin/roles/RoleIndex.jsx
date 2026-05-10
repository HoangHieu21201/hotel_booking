// frontend/src/pages/admin/roles/RoleIndex.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, RotateCcw, Search, ShieldCheck, RefreshCw, Server, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';
import { roleService } from '../../../services/roleService';
import { moduleService } from '../../../services/moduleService';
import { toast } from '../../../utils/toast';
import { useAuthStore } from '../../../stores/authStore';

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export default function RoleIndex() {
  // === BẢO MẬT RBAC ===
  const { user, permissions } = useAuthStore();
  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : user?.role;
  const isAdmin = roleSlug === 'admin' || roleSlug === 'super-admin';
  const rolePerms = permissions.find(p => p.module === 'ROLE') || {};
  
  const canView = isAdmin || rolePerms.canView;
  const canCreate = isAdmin || rolePerms.canCreate;
  const canUpdate = isAdmin || rolePerms.canUpdate;
  const canDelete = isAdmin || rolePerms.canDelete;

  // Nếu không có quyền xem, đá văng ngay lập tức
  if (!canView) {
    toast.error('Bạn không có thẩm quyền truy cập trang này!');
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [activeTab, setActiveTab] = useState('roles');
  
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  
  const [roleSearch, setRoleSearch] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  
  const [rolePage, setRolePage] = useState(1);
  const [modulePage, setModulePage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState(null);
  const [moduleToEdit, setModuleToEdit] = useState(null);

  const PAGE_LEVEL_REQUIRED = 1;

  const fetchRoles = async () => {
    setIsRoleLoading(true);
    try {
      const res = await roleService.getAll(); 
      // Sắp xếp roles theo level tăng dần (Quyền cao nhất lên đầu)
      const sortedRoles = (res.data || []).sort((a, b) => a.level - b.level);
      setRoles(sortedRoles);
    } catch (err) {
      toast.error('Không thể tải dữ liệu vai trò');
    } finally {
      setIsRoleLoading(false);
    }
  };

  const fetchModules = async () => {
    setIsModuleLoading(true);
    try {
      const res = await moduleService.getAll(); 
      setModules(res.data || []);
    } catch (err) {
      toast.error('Không thể tải cấu hình Modules');
    } finally {
      setIsModuleLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);
  useEffect(() => {
    if (activeTab === 'modules' && modules.length === 0) fetchModules();
  }, [activeTab]);

  useEffect(() => setRolePage(1), [roleSearch, activeTab]);
  useEffect(() => setModulePage(1), [moduleSearch, activeTab]);

  // Phân loại data để lấy Count (Đếm số lượng hiển thị trên Tab)
  const activeRolesCount = useMemo(() => roles.filter(r => !r.deletedAt).length, [roles]);
  const trashedRolesCount = useMemo(() => roles.filter(r => r.deletedAt).length, [roles]);
  const modulesCount = modules.length;

  const filteredRoles = useMemo(() => {
    let result = roles.filter(r => activeTab === 'trashed_roles' ? r.deletedAt : !r.deletedAt);
    if (roleSearch) {
      const searchTxt = removeVietnameseTones(roleSearch);
      result = result.filter(r => 
        removeVietnameseTones(r.name).includes(searchTxt) || 
        removeVietnameseTones(r.slug).includes(searchTxt)
      );
    }
    return result;
  }, [roles, activeTab, roleSearch]);

  const filteredModules = useMemo(() => {
    if (!moduleSearch) return modules;
    const searchTxt = removeVietnameseTones(moduleSearch);
    return modules.filter(m => 
      removeVietnameseTones(m.label).includes(searchTxt) || 
      removeVietnameseTones(m.key).includes(searchTxt)
    );
  }, [modules, moduleSearch]);

  const paginatedRoles = filteredRoles.slice((rolePage - 1) * ITEMS_PER_PAGE, rolePage * ITEMS_PER_PAGE);
  const totalRolePages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);

  const paginatedModules = filteredModules.slice((modulePage - 1) * ITEMS_PER_PAGE, modulePage * ITEMS_PER_PAGE);
  const totalModulePages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);

  const confirmDelete = async () => {
    try {
      await roleService.delete(itemToDelete.id);
      toast.success(`Đã xóa vai trò "${itemToDelete.name}"`);
      fetchRoles(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa hệ thống');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSyncModules = async () => {
    setIsSyncing(true);
    try {
      const res = await moduleService.sync();
      toast.success(res.message || 'Đồng bộ Modules thành công');
      fetchModules(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đồng bộ Modules');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    try {
      await moduleService.update(moduleToEdit.id, { label: moduleToEdit.label, level: moduleToEdit.level });
      toast.success('Cập nhật phân hệ thành công!');
      fetchModules();
      setModuleToEdit(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu phân hệ');
    }
  };

  const roleColumns = [
    { 
      header: 'VAI TRÒ', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{row.name}</div>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">{row.slug}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'CẤP ĐỘ', 
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold border rounded-md uppercase tracking-wide ${row.level <= 10 ? 'bg-danger text-white border-danger/30' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          LEVEL {row.level || 50}
        </span>
      )
    },
    { 
      header: 'NHÂN SỰ', 
      render: (row) => <span className="font-bold text-gray-800">{row._count?.staff || 0} <span className="text-xs font-medium text-gray-500 ml-1">người</span></span>
    },
    { 
      header: 'HÀNH ĐỘNG', 
      isSticky: true, width: 'w-[120px]',
      render: (row) => (
        <div className="flex items-center gap-2">
          {activeTab === 'roles' ? (
            <>
              {/* Kiểm tra quyền Update */}
              {canUpdate && (
                <Link to={`/admin/roles/${row.id}/edit`}>
                  <button title="Sửa" className="p-2 bg-primary/10 text-primary border border-transparent hover:border-primary hover:bg-primary hover:text-white rounded-md transition-all shadow-sm"><Edit2 className="w-4 h-4" /></button>
                </Link>
              )}
              {/* Kiểm tra quyền Delete */}
              {canDelete && (
                <button title="Xóa" onClick={() => setItemToDelete({ id: row.id, name: row.name })} className="p-2 bg-red-50 text-red-600 border border-transparent hover:border-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
              )}
            </>
          ) : (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-md text-xs font-bold transition-all shadow-sm">
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
            </button>
          )}
        </div>
      )
    }
  ];

  const moduleColumns = [
    { 
      header: 'PHÂN HỆ (MODULE)', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{row.label}</div>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">{row.key}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'YÊU CẦU CẤP ĐỘ', 
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold border rounded-md uppercase tracking-wide ${row.level <= 10 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          LEVEL {row.level || 99}
        </span>
      )
    },
    { 
      header: 'THAO TÁC', 
      isSticky: true, width: 'w-[100px]',
      render: (row) => (
        canUpdate && (
          <button onClick={() => setModuleToEdit(row)} className="px-3 py-1.5 bg-primary/10 text-primary border border-transparent hover:bg-primary hover:text-white rounded-md text-xs font-bold transition-all shadow-sm">
            Thiết lập
          </button>
        )
      )
    }
  ];

  const Pagination = ({ currentPage, totalPages, setPage }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700">Trang <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span></p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} iconLeft={ChevronLeft}>Trước</Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} iconRight={ChevronRight}>Sau</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Phân Quyền</h1>
          <p className="text-sm text-gray-500 mt-1">Cấu hình cấp bậc Role và phân hệ Module hệ thống</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Trang yêu cầu:</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-md">Cấp {PAGE_LEVEL_REQUIRED}</span>
          </div>

          {activeTab === 'modules' && isAdmin && (
             <Button iconLeft={RefreshCw} variant="outline" onClick={handleSyncModules} isLoading={isSyncing} className="rounded-full !px-5">
               Đồng bộ Module
             </Button>
          )}
          
          {activeTab === 'roles' && canCreate && (
            <Link to="/admin/roles/create">
              <Button iconLeft={Plus} variant="primary" className="rounded-full !px-5">Thêm Role</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-6 w-full lg:w-auto border-b lg:border-b-0 border-gray-200 pb-3 lg:pb-0 overflow-x-auto">
          {/* Hiển thị số lượng linh động trên các Tab */}
          <button onClick={() => setActiveTab('roles')} className={`pb-2 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Vai Trò ({activeRolesCount})
          </button>
          <button onClick={() => setActiveTab('modules')} className={`pb-2 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'modules' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Phân Hệ ({modulesCount})
          </button>
          <button onClick={() => setActiveTab('trashed_roles')} className={`pb-2 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'trashed_roles' ? 'border-danger text-danger' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Đã Xóa ({trashedRolesCount})
          </button>
        </div>
        
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={activeTab === 'modules' ? 'Tìm phân hệ...' : 'Tìm vai trò...'} 
            value={activeTab === 'modules' ? moduleSearch : roleSearch} 
            onChange={(e) => activeTab === 'modules' ? setModuleSearch(e.target.value) : setRoleSearch(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'modules' ? (
          <>
            <DataTable columns={moduleColumns} data={paginatedModules} isLoading={isModuleLoading} emptyMessage="Chưa có phân hệ nào. Hãy Đồng bộ Modules." />
            <Pagination currentPage={modulePage} totalPages={totalModulePages} setPage={setModulePage} />
          </>
        ) : (
          <>
            <DataTable columns={roleColumns} data={paginatedRoles} isLoading={isRoleLoading} emptyMessage="Không tìm thấy vai trò phù hợp." />
            <Pagination currentPage={rolePage} totalPages={totalRolePages} setPage={setRolePage} />
          </>
        )}
      </div>

      {/* Modal Sửa Module */}
      {moduleToEdit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <form onSubmit={handleSaveModule} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cấu Hình Phân Hệ</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mã Hệ Thống (Key)</label>
                <input type="text" value={moduleToEdit.key} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-mono text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Hiển Thị (Label)</label>
                <input type="text" value={moduleToEdit.label} onChange={(e) => setModuleToEdit({...moduleToEdit, label: e.target.value})} required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yêu Cầu Cấp Độ (Level)</label>
                <input type="number" value={moduleToEdit.level} onChange={(e) => setModuleToEdit({...moduleToEdit, level: e.target.value})} required min="1" max="99" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-800" />
                <p className="text-[11px] text-gray-400 mt-1">Role có Level NHỎ HƠN HOẶC BẰNG số này mới được phép cấp quyền.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <Button type="button" onClick={() => setModuleToEdit(null)} variant="outline" className="rounded-lg">Hủy bỏ</Button>
              <Button type="submit" variant="primary" className="rounded-lg">Lưu Thay Đổi</Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Xoá */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận thao tác</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Vai trò <strong className="text-gray-800">"{itemToDelete.name}"</strong> sẽ được đưa vào Thùng rác. Bạn chắc chắn chứ?
            </p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setItemToDelete(null)} variant="outline" className="rounded-lg">Hủy bỏ</Button>
              <Button onClick={confirmDelete} variant="danger" className="rounded-lg">Đưa vào thùng rác</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}