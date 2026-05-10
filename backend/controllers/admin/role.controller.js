// backend/controllers/admin/role.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// [GET] Lấy danh sách Role (Bao gồm cả Role đã xóa mềm để frontend chia tab)
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { staff: true } // Đếm số lượng nhân sự đang giữ role này
        }
      },
      orderBy: { level: 'asc' } // Sắp xếp quyền to nhất (level thấp) lên đầu
    });
    
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [GET] Lấy chi tiết 1 Role để đẩy vào Form Edit
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findFirst({
      where: { id: parseInt(id) },
      include: { 
        permissions: {
            include: { module: true } // Lấy kèm thông tin Module để lấy key
        }
      } 
    });

    if (!role) return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });
    
    // Format lại permissions trả về cho Frontend (Frontend đang cần moduleKey)
    const formattedPermissions = role.permissions.map(p => ({
        module: p.module.key, 
        canView: p.canView,
        canCreate: p.canCreate,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete
    }));

    res.json({ success: true, data: { ...role, permissions: formattedPermissions } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [POST] Thêm mới Role
export const createRole = async (req, res) => {
  try {
    const { name, slug, description, level, permissions } = req.body;

    // Kiểm tra trùng lặp Tên hoặc Mã
    const existingRole = await prisma.role.findFirst({
      where: { OR: [{ name }, { slug }] }
    });

    if (existingRole) return res.status(400).json({ success: false, message: 'Tên hoặc Mã vai trò đã tồn tại' });

    // Lấy danh sách Modules từ DB để map moduleKey -> moduleId
    const dbModules = await prisma.module.findMany();
    const moduleMap = {};
    dbModules.forEach(m => moduleMap[m.key] = m.id);

    // Lọc và cấu trúc lại permissions trước khi insert
    const validPermissions = (permissions || [])
        .filter(p => moduleMap[p.module]) // Bỏ qua nếu module không tồn tại trong DB
        .map(p => ({
            moduleId: moduleMap[p.module],
            canView: p.canView || false,
            canCreate: p.canCreate || false,
            canUpdate: p.canUpdate || false,
            canDelete: p.canDelete || false
        }));

    // Insert Role kèm theo mảng Permissions
    const newRole = await prisma.role.create({
      data: { 
          name, 
          slug, 
          description, 
          level: parseInt(level),
          permissions: { create: validPermissions }
      }
    });

    res.status(201).json({ success: true, message: 'Tạo vai trò thành công', data: newRole });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [PUT] Cập nhật Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, level, permissions } = req.body;

    // Kiểm tra trùng lặp với Role khác
    const existingRole = await prisma.role.findFirst({
      where: { OR: [{ name }, { slug }], id: { not: parseInt(id) } }
    });

    if (existingRole) return res.status(400).json({ success: false, message: 'Tên hoặc Mã vai trò đã được sử dụng' });

    // Cấu trúc lại dữ liệu Permissions
    const dbModules = await prisma.module.findMany();
    const moduleMap = {};
    dbModules.forEach(m => moduleMap[m.key] = m.id);

    const validPermissions = (permissions || [])
        .filter(p => moduleMap[p.module]) 
        .map(p => ({
            moduleId: moduleMap[p.module],
            canView: p.canView || false,
            canCreate: p.canCreate || false,
            canUpdate: p.canUpdate || false,
            canDelete: p.canDelete || false
        }));

    // Xoá quyền cũ, Insert quyền mới
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        slug, 
        description, 
        level: parseInt(level),
        permissions: {
          deleteMany: {}, 
          create: validPermissions 
        }
      }
    });

    res.json({ success: true, message: 'Cập nhật thành công', data: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [DELETE] Xóa mềm Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cập nhật trường deletedAt thay vì xóa hẳn khỏi Database
    await prisma.role.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    res.json({ success: true, message: 'Đã đưa vai trò vào thùng rác' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa vai trò', error: error.message });
  }
};