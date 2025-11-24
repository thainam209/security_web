const express = require('express');
const router = express.Router();
const promotionController = require('../../controllers/promotion.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');

// API công khai để người dùng xác thực mã
router.post('/validate', promotionController.validateCode);

// API tạo mã mới, yêu cầu đăng nhập và phải là Admin
router.post('/', authMiddleware, adminMiddleware, promotionController.createCode);

module.exports = router;