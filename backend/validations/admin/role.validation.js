// backend/validations/admin/role.validation.js
import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2, 'Tên vai trò phải có ít nhất 2 ký tự').max(50, 'Tên quá dài'),
  slug: z.string()
    .min(2, 'Mã (Slug) phải có ít nhất 2 ký tự')
    .max(50, 'Mã quá dài')
    .regex(/^[a-z0-9-]+$/, 'Mã chỉ được chứa chữ cái thường, số và dấu gạch ngang (VD: admin, le-tan)'),
  description: z.string().optional(),
});