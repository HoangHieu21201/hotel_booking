// Middleware này y hệt CheckModulePermission.php của Zyro
// Nó sẽ đứng trước API để chặn các nhân viên không đủ thẩm quyền
const checkPermission = (moduleName, action) => {
    return (req, res, next) => {
        // req.user đã được gài vào từ bước verifyToken ở trên
        const staffPermissions = req.user.permissions;

        // Tìm xem nhân viên này có quyền ở module được yêu cầu không
        const hasPermission = staffPermissions.some(
            (p) => p.module === moduleName && p[action] === true
        );

        if (!hasPermission) {
            return res.status(403).json({ 
                message: `Truy cập bị từ chối! Bạn không có quyền [${action}] trên module [${moduleName}].` 
            });
        }

        next(); // Đủ quyền thì cho qua
    };
};

module.exports = { checkPermission };