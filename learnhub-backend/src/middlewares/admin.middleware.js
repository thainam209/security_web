const adminMiddleware = (req, res, next) => {
    // Middleware này chạy sau authMiddleware, nên req.user đã tồn tại
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
    }
};

module.exports = adminMiddleware;