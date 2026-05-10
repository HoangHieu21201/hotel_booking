// backend/controllers/admin/module.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// [GET] Lấy danh sách các Module
export const getModules = async (req, res) => {
  try {
    const modules = await prisma.module.findMany({ 
      orderBy: { level: 'asc' } 
    });
    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [PUT] Cập nhật Module (Sửa Level và Label trực tiếp từ Modal Frontend)
export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, level } = req.body;

    const updatedModule = await prisma.module.update({
      where: { id: parseInt(id) },
      data: { label, level: parseInt(level) }
    });

    res.json({ success: true, message: 'Cập nhật phân hệ thành công', data: updatedModule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
  }
};

// [POST] Đồng bộ dữ liệu gốc từ code vào Database
export const syncModules = async (req, res) => {
  try {
    // Dữ liệu gốc mặc định để nạp vào DB thay vì phải đọc file ngoài
    const MODULES_CONFIG = {
        DASHBOARD: { label: 'Dashboard Hệ thống', level: 99 },
        ROLE: { label: 'Vai trò & Phân quyền', level: 1 },
        ROOMS: { label: 'Phòng & Dịch vụ', level: 20 },
        BOOKINGS: { label: 'Lễ tân (Bookings)', level: 50 },
        STAFF: { label: 'Quản lý Nhân sự', level: 2 },
        CUSTOMERS: { label: 'Khách hàng', level: 50 },
        SETTINGS: { label: 'Cài đặt hệ thống', level: 1 },
        FOLIOS: { label: 'Kế toán (Folios)', level: 20 },
        REVIEWS: { label: 'Đánh giá', level: 50 }
    };

    let syncedCount = 0;

    // Quét qua cấu hình để insert vào Database
    for (const [key, config] of Object.entries(MODULES_CONFIG)) {
      // Chỉ tạo mới nếu module này chưa có trong Database. 
      // Nếu đã tồn tại thì bỏ qua, để tránh việc ghi đè (làm mất) các thay đổi Level/Label mà Admin đã sửa trên giao diện!
      const exist = await prisma.module.findUnique({ where: { key } });
      
      if (!exist) {
        await prisma.module.create({
          data: { 
            key, 
            label: config.label, 
            level: config.level 
          }
        });
        syncedCount++;
      }
    }

    res.json({ success: true, message: `Đồng bộ thành công ${syncedCount} phân hệ mới.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi đồng bộ', error: error.message });
  }
};