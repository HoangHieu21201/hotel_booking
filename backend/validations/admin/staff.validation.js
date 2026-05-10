// backend/validations/admin/staff.validation.js
import { z } from 'zod';

export const createStaffSchema = z.object({
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự').max(100, 'Họ tên quá dài'),
  email: z.string().email('Định dạng Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().optional().nullable(),
  roleId: z.number({ required_error: 'Vui lòng chọn Vai trò' }).int().positive(),
  status: z.enum(['active', 'inactive']).default('active')
});

export const updateStaffSchema = z.object({
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự').max(100, 'Họ tên quá dài'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
  phone: z.string().optional().nullable(),
  roleId: z.number({ required_error: 'Vui lòng chọn Vai trò' }).int().positive(),
  status: z.enum(['active', 'inactive']).default('active')
});