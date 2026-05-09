// backend/routes/admin/auth.routes.js
import express from 'express';
import { login, forgotPassword, verifyOtp, resetPassword } from '../../controllers/admin/auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '../../validations/admin/auth.validation.js';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;