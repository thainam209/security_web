// src/api/v1/lesson.route.js
const express = require("express");
const router = express.Router();
const lessonController = require("../../controllers/lesson.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const uploadVideo = require("../../middlewares/upload-video.middleware");

// Routes quản lý BÀI HỌC (Lesson)

// === Các route CÔNG KHAI ===
// Lấy tất cả bài học của 1 chương
router.get("/chapter/:chapterId", lessonController.handleGetLessonsByChapterId);

// === Các route YÊU CẦU ĐĂNG NHẬP ===
router.use(authMiddleware);

// Lấy chi tiết 1 bài học (sau này thêm kiểm tra ghi danh)
router.get("/:id", lessonController.handleGetLessonById);

// Upload video cho bài học
router.post("/:id/upload-video", uploadVideo, lessonController.handleUploadLessonVideo);

// Tạo bài học mới
router.post("/", lessonController.handleCreateLesson);

// Cập nhật bài học
router.put("/:id", lessonController.handleUpdateLesson);

// Xóa bài học
router.delete("/:id", lessonController.handleDeleteLesson);

module.exports = router;
