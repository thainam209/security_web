// src/api/v1/forum.route.js
const express = require('express');
const router = express.Router();
const forumController = require('../../controllers/forum.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// GET /api/v1/forums/course/:courseId
// (Công khai) Lấy danh sách chủ đề của khóa học
router.get('/course/:courseId', forumController.handleGetDiscussions);

// GET /api/v1/forums/discussions/:discussionId
// (Công khai) Lấy chi tiết chủ đề và các phản hồi
router.get('/discussions/:discussionId', forumController.handleGetDiscussionDetails);

// Yêu cầu đăng nhập cho các hành động bên dưới
router.use(authMiddleware);

// POST /api/v1/forums/discussions
// (Học viên) Tạo chủ đề mới
router.post('/discussions', forumController.handleCreateDiscussion);

// POST /api/v1/forums/replies
// (Học viên) Gửi phản hồi
router.post('/replies', forumController.handleCreateReply);

module.exports = router;