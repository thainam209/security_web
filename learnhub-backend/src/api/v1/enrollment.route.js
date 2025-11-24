// src/api/v1/enrollment.route.js
const express = require('express');
const router = express.Router();
const enrollmentController = require('../../controllers/enrollment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả API trong file này đều yêu cầu đăng nhập
router.use(authMiddleware);

// GET /api/v1/enrollments/my-courses
// (Lấy danh sách các khóa học tôi đã ghi danh)
router.get('/my-courses', enrollmentController.handleGetMyEnrolledCourses);

// POST /api/v1/enrollments
// (Ghi danh vào một khóa học mới - tạm thời chỉ cho khóa miễn phí)
router.post('/', enrollmentController.handleCreateEnrollment);

module.exports = router;