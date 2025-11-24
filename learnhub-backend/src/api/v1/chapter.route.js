// src/api/v1/chapter.route.js
const express = require("express");
const router = express.Router();
const chapterController = require("../../controllers/chapter.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// Các route yêu cầu đăng nhập (và quyền Teacher/Admin)
router.use(authMiddleware);

// ✅ Lấy danh sách chương của 1 khóa học (đặt trước route /:id để tránh conflict)
router.get("/course/:courseId", chapterController.handleGetChaptersByCourseId);

// 🆕 Tạo chương mới
router.post("/", chapterController.handleCreateChapter);

// 🆕 Cập nhật chương
router.put("/:id", chapterController.handleUpdateChapter);

// 🆕 Xóa chương
router.delete("/:id", chapterController.handleDeleteChapter);

module.exports = router;
