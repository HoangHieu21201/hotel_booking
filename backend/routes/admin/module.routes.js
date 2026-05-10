import express from 'express';
import { getModules, syncModules, updateModule } from '../../controllers/admin/module.controller.js';

const router = express.Router();

router.get('/', getModules);
router.post('/sync', syncModules);
router.put('/:id', updateModule); 
export default router;