const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/favorite.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Mọi route trong file này đều yêu cầu người dùng phải đăng nhập
router.use(authMiddleware);

//GET /api/v1/favorites - Lấy danh sách yêu thích của người dùng
router.get('/', favoriteController.getFavorites);
//POST /api/v1/favorites - Thêm một khóa học vào danh sách yêu thích
router.post('/', favoriteController.addFavorite);
//DELETE /api/v1/favorites/:courseId - Xóa một khóa học khỏi danh sách yêu thích
router.delete('/:courseId', favoriteController.removeFavorite);

module.exports = router;