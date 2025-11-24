const userService = require('../services/user.service');

exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const role = req.query.role; // Filter theo role nếu có

        const { users, totalItems } = await userService.getAllUsers(page, limit, role);

        res.json({
            message: "Lấy danh sách người dùng thành công!",
            data: users,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/user - Lấy thông tin user hiện tại
exports.getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user.id; // Lấy từ authMiddleware
        const user = await userService.getUserById(userId);
        res.json(user);
    } catch (error) {
        if (error.message === 'Không tìm thấy người dùng') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

// PUT /api/v1/user/:id - Cập nhật thông tin user
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Lấy từ authMiddleware
        const updateData = req.body;

        const updatedUser = await userService.updateUser(Number(id), updateData, userId);

        res.status(200).json({
            message: "Cập nhật thông tin thành công",
            data: updatedUser
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy người dùng') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('không có quyền')) {
            return res.status(403).json({ message: error.message });
        }
        next(error);
    }
};

// POST /api/v1/user/:id/upload-avatar - Upload avatar cho user
exports.uploadUserAvatar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Lấy từ authMiddleware

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn file ảnh để upload" });
        }

        const updatedUser = await userService.uploadUserAvatar(
            Number(id),
            req.file.buffer,
            userId
        );

        res.status(200).json({
            message: "Upload avatar thành công",
            data: {
                userId: updatedUser.userid,
                profilePicture: updatedUser.profilepicture
            }
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy người dùng') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('không có quyền')) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes('Chỉ chấp nhận file ảnh')) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};