const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/review.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// API để lấy danh sách đánh giá (công khai, không cần đăng nhập)
router.get('/:courseId', reviewController.getCourseReviews);

// API để tạo đánh giá mới (yêu cầu đăng nhập)
router.post('/:courseId', authMiddleware, reviewController.createReview);

module.exports = router;