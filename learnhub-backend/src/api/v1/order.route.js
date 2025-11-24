const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả các route về đơn hàng đều yêu cầu xác thực
router.use(authMiddleware);

// GET /api/v1/orders - Lấy lịch sử đơn hàng của người dùng
router.get('/', orderController.getUserOrders);

// GET /api/v1/orders/:orderId - Lấy chi tiết một đơn hàng cụ thể
router.get('/:orderId', orderController.getOrderDetails); // <-- THÊM ROUTE NÀY

// POST /api/v1/orders/checkout - Tạo đơn hàng từ giỏ hàng
router.post('/checkout', orderController.createOrder);

module.exports = router;