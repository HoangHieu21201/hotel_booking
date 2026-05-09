const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu.' });
        }

        // 1. Tìm nhân viên kèm theo Role và toàn bộ Quyền hạn (Permissions)
        const staff = await prisma.staff.findUnique({
            where: { username },
            include: {
                role: {
                    include: {
                        permissions: true // Kéo luôn cả danh sách quyền ra
                    }
                }
            }
        });

        if (!staff || staff.deletedAt) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa.' });
        }

        // 2. Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }

        // 3. Rút gọn data permissions để nhét vào Token cho nhẹ
        const permissions = staff.role.permissions.map(p => ({
            module: p.module,
            canView: p.canView,
            canCreate: p.canCreate,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete
        }));

        // 4. Sinh JWT Token
        const token = jwt.sign(
            { 
                id: staff.id, 
                username: staff.username,
                role: staff.role.slug,
                permissions: permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token sống 1 ngày
        );

        // 5. Trả về kết quả cho Frontend
        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: staff.id,
                username: staff.username,
                fullName: staff.fullName,
                role: staff.role.name,
                permissions
            }
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};

module.exports = { login };