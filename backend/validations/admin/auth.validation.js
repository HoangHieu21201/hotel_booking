// backend/validations/admin/auth.validation.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otpCode: z.string().length(6, "Mã OTP phải đúng 6 số"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otpCode: z.string().length(6, "Mã OTP phải đúng 6 số"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});