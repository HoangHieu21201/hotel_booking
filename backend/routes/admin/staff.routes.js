// backend/routes/admin/staff.routes.js
import express from 'express';
import { getStaffs, getStaffById, createStaff, updateStaff, deleteStaff, restoreStaff } from '../../controllers/admin/staff.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createStaffSchema, updateStaffSchema } from '../../validations/admin/staff.validation.js';

const router = express.Router();

router.get('/', getStaffs);
router.get('/:id', getStaffById);
router.post('/', validate(createStaffSchema), createStaff);
router.put('/:id', validate(updateStaffSchema), updateStaff);
router.delete('/:id', deleteStaff);
router.patch('/:id/restore', restoreStaff); // Route khôi phục

export default router;