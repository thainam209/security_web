const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const authMiddleware = require('../../middlewares/auth.middleware'); // Middleware để xác thực người dùng

// Tất cả các route trong file này đều yêu cầu người dùng phải đăng nhập
// Middleware này sẽ chạy trước tất cả các controller
router.use(authMiddleware);

// POST /api/cart - Thêm một khóa học vào giỏ hàng
router.post('/', cartController.handleAddToCart);

// GET /api/cart - Lấy tất cả các khóa học trong giỏ hàng
router.get('/', cartController.handleGetCart);

// DELETE /api/cart/:courseId - Xóa một khóa học khỏi giỏ hàng
router.delete('/:courseId', cartController.handleRemoveFromCart);

module.exports = router;