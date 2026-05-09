// backend/server.js
import express from 'express';
import cors from 'cors';

// Import các Admin Routes
import adminAuthRoutes from './routes/admin/auth.routes.js';
// Sau này sẽ import thêm clientRoutes ở đây: import clientAuthRoutes from './routes/client/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Phân luồng Routes rõ ràng cho Admin và Client
app.use('/api/admin/auth', adminAuthRoutes); 
// app.use('/api/client/auth', clientAuthRoutes); // Chuẩn bị sẵn cho tương lai

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Đã xảy ra lỗi hệ thống' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});