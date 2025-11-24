// src/api/v1/assignment.route.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/assignment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả API đều yêu cầu đăng nhập
router.use(authMiddleware);

// POST /api/v1/assignments
// (Teacher/Admin) Tạo bài tập mới
router.post('/', assignmentController.handleCreateAssignment);

// POST /api/v1/assignments/submit
// (Student) Nộp bài tập
router.post('/submit', assignmentController.handleSubmitAssignment);

// GET /api/v1/assignments/course/:courseId
// (Student) Lấy danh sách bài tập của khóa học
router.get('/course/:courseId', assignmentController.handleGetAssignments);

module.exports = router;