// frontend/src/pages/admin/staffs/StaffIndex.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Eye, ShieldCheck, Mail, Phone, Circle, RotateCcw, User } from 'lucide-react';

import DataTable from '../../../components/ui/DataTable.jsx';
import Button from '../../../components/ui/Button.jsx';
import Image from '../../../components/ui/Image.jsx';
import { staffService } from '../../../services/staffService.js';
import { moduleService } from '../../../services/moduleService.js';
import { toast } from '../../../utils/toast.js';
import { useAuthStore } from '../../../stores/authStore.js';

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export default function StaffIndex() {
  const { user, permissions } = useAuthStore();
  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : user?.role;
  const isAdmin = roleSlug === 'admin' || roleSlug === 'super-admin';
  const staffPerms = permissions.find(p => p.module === 'STAFF') || {};
  
  const canView = isAdmin || staffPerms.canView;
  const canCreate = isAdmin || staffPerms.canCreate;
  const canUpdate = isAdmin || staffPerms.canUpdate;
  const canDelete = isAdmin || staffPerms.canDelete;

  if (!canView) {
    toast.error('Bạn không có quyền truy cập trang này!');
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [activeTab, setActiveTab] = useState('active'); // active, inactive, trashed
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pageLevel, setPageLevel] = useState(null);
  
  const [itemToDelete, setItemToDelete] = useState(null);
  const [quickViewData, setQuickViewData] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, moduleRes] = await Promise.all([
        staffService.getAll(),
        moduleService.getAll()
      ]);
      setStaffs(staffRes.data || []);
      
      const staffModule = (moduleRes.data || []).find(m => m.key === 'STAFF');
      if (staffModule) setPageLevel(staffModule.level);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredStaffs = useMemo(() => {
    let result = staffs;
    
    // Logic Tab (Nếu record trong DB chưa update status thì mặc định nó là active)
    if (activeTab === 'active') result = result.filter(s => (s.status || 'active') === 'active' && !s.deletedAt);
    if (activeTab === 'inactive') result = result.filter(s => s.status === 'inactive' && !s.deletedAt);
    if (activeTab === 'trashed') result = result.filter(s => s.deletedAt);

    // Logic Tìm kiếm
    if (search) {
      const searchTxt = removeVietnameseTones(search);
      result = result.filter(s => {
        const name = s.fullName || ''; 
        const email = s.email || '';
        const phone = s.phone || '';
        return removeVietnameseTones(name).includes(searchTxt) || 
               removeVietnameseTones(email).includes(searchTxt) ||
               removeVietnameseTones(phone).includes(searchTxt);
      });
    }
    return result;
  }, [staffs, activeTab, search]);

  const confirmDelete = async () => {
    try {
      await staffService.delete(itemToDelete.id);
      toast.success(`Đã đưa "${itemToDelete.fullName}" vào thùng rác`);
      fetchData(); // Lấy lại list để update giao diện
    } catch (err) {
      toast.error('Lỗi khi xóa nhân sự');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await staffService.restore(id);
      toast.success('Đã khôi phục tài khoản');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khôi phục');
    }
  };

  const columns = [
    { 
      header: 'NHÂN SỰ', 
      render: (row) => {
        const isMe = row.id === user?.id;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm shrink-0 overflow-hidden relative">
              {row.avatarUrl ? (
                <Image src={row.avatarUrl} alt={row.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                {row.fullName}
                {isMe && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Bạn</span>}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{row.email}</div>
            </div>
          </div>
        )
      }
    },
    { 
      header: 'VAI TRÒ', 
      render: (row) => (
        <span className="px-2.5 py-1 text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-md uppercase">
          {row.role?.name || 'Chưa cấp quyền'}
        </span>
      )
    },
    { 
      header: 'TRẠNG THÁI', 
      render: (row) => {
        if (row.deletedAt) return <span className="text-xs font-semibold text-gray-500 line-through">Đã xóa</span>;
        
        const status = row.status || 'active'; // Fix trường hợp db rỗng
        return (
          <div className="flex items-center gap-1.5">
            <Circle className={`w-2.5 h-2.5 fill-current ${status === 'active' ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className={`text-xs font-semibold ${status === 'active' ? 'text-emerald-700' : 'text-red-700'}`}>
              {status === 'active' ? 'Hoạt động' : 'Bị khóa'}
            </span>
          </div>
        );
      }
    },
    { 
      header: 'THAO TÁC', 
      isSticky: true, width: 'w-[140px]',
      render: (row) => {
        const isMe = row.id === user?.id;

        if (row.deletedAt) {
           return (
             <button onClick={() => handleRestore(row.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-md text-xs font-bold transition-all shadow-sm">
               <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
             </button>
           );
        }

        return (
          <div className="flex items-center gap-2">
            <button title="Xem nhanh" onClick={() => setQuickViewData(row)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all shadow-sm">
              <Eye className="w-4 h-4" />
            </button>
            
            {canUpdate && (
              <Link to={`/admin/staffs/${row.id}/edit`}>
                <button title="Sửa" className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-all shadow-sm">
                  <Edit2 className="w-4 h-4" />
                </button>
              </Link>
            )}

            {canDelete && !isMe && (
              <button title="Xóa" onClick={() => setItemToDelete(row)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all shadow-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Nhân Sự</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tài khoản nội bộ và phân quyền</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Trang yêu cầu:</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-md">
              Cấp {pageLevel !== null ? pageLevel : '...'}
            </span>
          </div>

          {canCreate && (
            <Link to="/admin/staffs/create">
              <Button iconLeft={Plus} variant="primary" className="rounded-full !px-5">Thêm Nhân Sự</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-6 w-full lg:w-auto border-b lg:border-b-0 border-gray-200 pb-3 lg:pb-0 overflow-x-auto">
          <button onClick={() => setActiveTab('active')} className={`pb-2 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Đang Hoạt Động ({staffs.filter(s => (s.status || 'active') === 'active' && !s.deletedAt).length})
          </button>
          <button onClick={() => setActiveTab('inactive')} className={`pb-2 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'inactive' ? 'border-danger text-danger' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Bị Khóa ({staffs.filter(s => s.status === 'inactive' && !s.deletedAt).length})
          </button>
          <button onClick={() => setActiveTab('trashed')} className={`pb-2 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'trashed' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Đã Xóa ({staffs.filter(s => s.deletedAt).length})
          </button>
        </div>
        
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tìm tên, email, sđt..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
        </div>
      </div>

      <DataTable columns={columns} data={filteredStaffs} isLoading={isLoading} emptyMessage="Không tìm thấy nhân sự nào." />

      {/* QUICKVIEW MODAL */}
      {quickViewData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="relative bg-primary/10 h-24 flex justify-center">
              <div className="absolute -bottom-10 w-20 h-20 bg-white rounded-full p-1 shadow-sm">
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {quickViewData.avatarUrl ? <Image src={quickViewData.avatarUrl} alt="" className="w-full h-full object-cover"/> : <User className="w-8 h-8 text-gray-400" />}
                </div>
              </div>
            </div>
            
            <div className="pt-14 pb-6 px-6 flex flex-col items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {quickViewData.fullName}
                {quickViewData.id === user?.id && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Bạn</span>}
              </h3>
              <span className="px-3 py-1 mt-2 text-[11px] font-bold bg-primary/10 text-primary rounded-full uppercase border border-primary/20">
                {quickViewData.role?.name || 'Chưa cấp quyền'}
              </span>
              
              <div className="w-full mt-6 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" /> {quickViewData.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" /> {quickViewData.phone || <span className="text-gray-400 italic">Chưa cập nhật SĐT</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-gray-400" /> Trạng thái: 
                  <span className={`font-semibold ${(quickViewData.status || 'active') === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(quickViewData.status || 'active') === 'active' ? ' Đang hoạt động' : ' Bị khóa'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <Button variant="outline" onClick={() => setQuickViewData(null)} className="rounded-lg">Đóng</Button>
              {canUpdate && (
                <Link to={`/admin/staffs/${quickViewData.id}/edit`}>
                  <Button variant="primary" className="rounded-lg">Chỉnh sửa</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đưa vào thùng rác</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Bạn có chắc chắn muốn đưa nhân sự <strong className="text-gray-800">"{itemToDelete.fullName}"</strong> vào thùng rác?
            </p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setItemToDelete(null)} variant="outline" className="rounded-lg">Hủy bỏ</Button>
              <Button onClick={confirmDelete} variant="danger" className="rounded-lg">Đồng ý Xóa</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}