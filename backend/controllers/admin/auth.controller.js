// backend/controllers/admin/auth.controller.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../../utils/mailer.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_tam_thoi';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await prisma.staff.findUnique({
      where: { email },
      include: { role: { include: { permissions: true } } }
    });

    // Fix lỗi gọi sai thuộc tính (Phải là passwordHash)
    if (!staff || staff.deletedAt || !(await bcrypt.compare(password, staff.passwordHash))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { id: staff.id, role: staff.role.slug, userType: 'staff' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = staff;
    res.json({ 
      user: { ...userWithoutPassword, permissions: staff.role.permissions }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingStaff = await prisma.staff.findUnique({ where: { email } });
    if (existingStaff) return res.status(400).json({ message: 'Email này đã được sử dụng' });

    // Cấp phát role mặc định (Tạo mới nếu chưa có trong DB)
    let defaultRole = await prisma.role.findUnique({ where: { slug: 'receptionist' } });
    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: { name: 'Lễ tân', slug: 'receptionist', description: 'Quyền mặc định' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    const newStaff = await prisma.staff.create({
      data: {
        fullName,
        email,
        username, // Fix lỗi schema bắt buộc
        passwordHash: hashedPassword, // Fix lỗi schema
        roleId: defaultRole.id // Fix lỗi schema
      },
      include: { role: { include: { permissions: true } } }
    });

    const token = jwt.sign(
      { id: newStaff.id, role: newStaff.role.slug, userType: 'staff' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = newStaff;
    res.status(201).json({ 
      user: { ...userWithoutPassword, permissions: newStaff.role.permissions }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const staff = await prisma.staff.findUnique({ where: { email } });
    
    if (!staff) return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordReset.create({ data: { email, otpCode, expiresAt } });
    await sendOtpEmail(email, otpCode);

    res.json({ success: true, message: 'Mã OTP đã được gửi tới email của bạn' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email, otpCode },
      orderBy: { createdAt: 'desc' }
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    res.json({ success: true, message: 'Xác thực OTP thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email, otpCode },
      orderBy: { createdAt: 'desc' }
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.staff.update({ where: { email }, data: { passwordHash: hashedPassword } });
    await prisma.passwordReset.deleteMany({ where: { email } });

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};