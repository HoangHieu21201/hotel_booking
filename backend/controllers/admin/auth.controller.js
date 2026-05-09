// backend/controllers/admin/auth.controller.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../../utils/mailer.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export const login = async (req, res) => {
  const { email, password } = req.body;
  // Admin Panel dùng bảng Staff
  const staff = await prisma.staff.findUnique({ 
    where: { email },
    include: { role: { include: { permissions: true } } }
  });

  if (!staff || staff.deletedAt) {
    return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu' });
  }

  const isMatch = await bcrypt.compare(password, staff.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu' });
  }

  // Đóng gói permissions vào token payload
  const token = jwt.sign(
    { 
      id: staff.id, 
      role: staff.role.slug,
      permissions: staff.role.permissions.map(p => ({
        module: p.module, canView: p.canView, canCreate: p.canCreate, canUpdate: p.canUpdate, canDelete: p.canDelete
      }))
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ success: true, token, user: { id: staff.id, fullName: staff.fullName, email: staff.email, role: staff.role.name } });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const staff = await prisma.staff.findUnique({ where: { email } });
  
  if (!staff) return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống' });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  // Lưu DB & Gửi mail
  await prisma.passwordReset.create({ data: { email, otpCode, expiresAt } });
  await sendOtpEmail(email, otpCode);

  res.json({ success: true, message: 'Mã OTP đã được gửi tới email của bạn' });
};

export const verifyOtp = async (req, res) => {
  const { email, otpCode } = req.body;
  const resetRecord = await prisma.passwordReset.findFirst({
    where: { email, otpCode },
    orderBy: { createdAt: 'desc' }
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
  }

  res.json({ success: true, message: 'Xác thực OTP thành công' });
};

export const resetPassword = async (req, res) => {
  const { email, otpCode, newPassword } = req.body;
  const resetRecord = await prisma.passwordReset.findFirst({
    where: { email, otpCode },
    orderBy: { createdAt: 'desc' }
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.staff.update({ where: { email }, data: { passwordHash: hashedPassword } });

  // Xóa mã OTP sau khi dùng
  await prisma.passwordReset.deleteMany({ where: { email } });

  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
};