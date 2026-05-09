const jwt = require('jsonwebtoken');

// Middleware này giống CheckAuth, kiểm tra xem khách có đeo thẻ (Token) không
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Giải mã thẻ Token xem có hợp lệ và do hệ thống mình cấp không
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Gắn thông tin user (kèm permissions) vào request để các hàm sau dùng
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token đã hết hạn hoặc không hợp lệ!' });
    }
};

module.exports = { verifyToken };