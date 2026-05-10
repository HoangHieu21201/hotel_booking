// backend/controllers/admin/staff.controller.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// [GET] Danh sách
export const getStaffs = async (req, res) => {
  try {
    const staffs = await prisma.staff.findMany({
      include: { role: { select: { id: true, name: true, level: true, slug: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const safeStaffs = staffs.map(staff => {
      const { passwordHash, ...rest } = staff;
      // Trả nguyên vẹn trạng thái cho Frontend xử lý (status, deletedAt)
      return rest;
    });

    res.json({ success: true, data: safeStaffs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [GET] Chi tiết
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: { role: { select: { id: true, name: true } } }
    });

    if (!staff) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân sự' });
    
    const { passwordHash, ...rest } = staff;
    res.json({ success: true, data: rest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [POST] Thêm mới
export const createStaff = async (req, res) => {
  try {
    const { fullName, email, password, phone, roleId, status } = req.body;

    const existingStaff = await prisma.staff.findUnique({ where: { email } });
    if (existingStaff) return res.status(400).json({ success: false, message: 'Email này đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    const newStaff = await prisma.staff.create({
      data: {
        fullName,
        email,
        username,
        passwordHash: hashedPassword,
        phone: phone || null,
        roleId: parseInt(roleId),
        status: status || 'active',
        deletedAt: status === 'inactive' ? new Date() : null
      }
    });

    res.status(201).json({ success: true, message: 'Tạo tài khoản thành công', data: { id: newStaff.id } });
  } catch (error) {
    console.error("Lỗi createStaff:", error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống', error: error.message });
  }
};

// [PUT] Cập nhật
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, password, phone, roleId, status } = req.body;

    const updateData = { 
      fullName, 
      phone: phone || null, 
      roleId: parseInt(roleId),
      status: status || 'active',
      deletedAt: status === 'inactive' ? new Date() : null
    };

    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.staff.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error("Lỗi updateStaff:", error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống', error: error.message });
  }
};

// [DELETE] Xóa mềm (Đưa vào Thùng rác)
export const deleteStaff = async (req, res) => {
  try {
    await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: { deletedAt: new Date() }
    });
    res.json({ success: true, message: 'Đã đưa vào thùng rác' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa', error: error.message });
  }
};

// [PATCH] Khôi phục (Restore)
export const restoreStaff = async (req, res) => {
  try {
    await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: { deletedAt: null }
    });
    res.json({ success: true, message: 'Khôi phục tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khôi phục', error: error.message });
  }
};