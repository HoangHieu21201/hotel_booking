const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes.js');

const app = express();

// Middlewares cơ bản
app.use(cors()); // Cho phép Frontend (React/Vue) gọi API
app.use(express.json()); // Parse request body dạng JSON
app.use(express.urlencoded({ extended: true })); // Parse urlencoded data

// Routes API
app.use('/api/auth', authRoutes);

// Route Test / Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Hotel PMS API Server đang chạy mượt mà!' });
});

// Middleware xử lý lỗi (Bắt các lỗi không xác định)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Có lỗi xảy ra trên server!',
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đã khởi chạy tại http://localhost:${PORT}`);
    console.log(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
});