// backend/routes/admin/role.routes.js
import express from 'express';
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from '../../controllers/admin/role.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { roleSchema } from '../../validations/admin/role.validation.js';

const router = express.Router();

router.get('/', getRoles);
router.get('/:id', getRoleById); // MỚI THÊM ROUTE NÀY
router.post('/', validate(roleSchema), createRole);
router.put('/:id', validate(roleSchema), updateRole);
router.delete('/:id', deleteRole);

export default router;