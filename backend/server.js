// backend/server.js
import express from 'express';
import cors from 'cors';

// Import các Admin Routes
import adminAuthRoutes from './routes/admin/auth.routes.js';
import roleRoutes from './routes/admin/role.routes.js';
import moduleRoutes from './routes/admin/module.routes.js';
import staffRoutes from './routes/admin/staff.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Phân luồng Routes rõ ràng cho Admin và Client
app.use('/api/admin/auth', adminAuthRoutes); 
app.use('/api/admin/roles', roleRoutes);
app.use('/api/admin/modules', moduleRoutes)
app.use('/api/admin/staffs', staffRoutes);
// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Đã xảy ra lỗi hệ thống' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});