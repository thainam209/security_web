// src/api/v1/comment.route.js
const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/comment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// GET /api/v1/comments/lesson/:lessonId
// (Công khai) Lấy tất cả bình luận của 1 bài học
router.get('/lesson/:lessonId', commentController.handleGetCommentsByLessonId);

// Yêu cầu đăng nhập cho các hành động bên dưới
router.use(authMiddleware);

// POST /api/v1/comments
// (Học viên) Đăng bình luận mới
router.post('/', commentController.handleCreateComment);

module.exports = router;