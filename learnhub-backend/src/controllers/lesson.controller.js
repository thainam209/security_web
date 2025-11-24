// src/controllers/lesson.controller.js
const lessonService = require("../services/lesson.service");

// [POST] /api/v1/lessons (body: { chapterId, title, ... })
const handleCreateLesson = async (req, res, next) => {
  try {
    const lessonData = req.body;
    if (!lessonData.chapterid || !lessonData.title) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp chapterId và title." });
    }
    const newLesson = await lessonService.createLesson(lessonData, req.user);
    res
      .status(201)
      .json({ message: "Tạo bài học mới thành công.", data: newLesson });
  } catch (error) {
    if (error.message.includes("không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/lessons/chapter/:chapterId
const handleGetLessonsByChapterId = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const lessonList = await lessonService.getLessonsByChapterId(
      Number(chapterId)
    );
    res
      .status(200)
      .json({ message: "Lấy danh sách bài học thành công.", data: lessonList });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/v1/lessons/:id
const handleGetLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonById(Number(id));
    res
      .status(200)
      .json({ message: "Lấy chi tiết bài học thành công.", data: lesson });
  } catch (error) {
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [PUT] /api/v1/lessons/:id
const handleUpdateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedLesson = await lessonService.updateLesson(
      Number(id),
      req.body,
      req.user
    );
    res
      .status(200)
      .json({ message: "Cập nhật bài học thành công.", data: updatedLesson });
  } catch (error) {
    if (error.message.includes("không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [DELETE] /api/v1/lessons/:id
const handleDeleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    await lessonService.deleteLesson(Number(id), req.user);
    res.status(200).json({ message: "Xóa bài học thành công." });
  } catch (error) {
    if (error.message.includes("không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/lessons/:id/upload-video
const handleUploadLessonVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user; // Lấy từ authMiddleware

    // Kiểm tra file đã được upload chưa
    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn file video để upload",
      });
    }

    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);
    console.log('Uploading video:', {
      lessonId: id,
      fileName: req.file.originalname,
      fileSize: `${fileSizeMB} MB`,
      fileType: req.file.mimetype
    });
    
    // Cảnh báo nếu file quá lớn
    if (req.file.size > 200 * 1024 * 1024) {
      console.warn(`Warning: Large file detected (${fileSizeMB} MB). Upload may take several minutes.`);
    }

    // Upload video lên Cloudinary và cập nhật database
    const updatedLesson = await lessonService.uploadLessonVideo(
      Number(id),
      req.file.buffer,
      user
    );

    res.status(200).json({
      message: "Upload video bài học thành công",
      data: {
        lessonId: updatedLesson.lessonid,
        videoUrl: updatedLesson.videourl,
      },
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    if (error.message.includes("không có quyền") || error.message.includes("Bạn không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Không tìm thấy bài học" || error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("Chỉ chấp nhận file video")) {
      return res.status(400).json({ message: error.message });
    }
    // Trả về lỗi chi tiết hơn cho Cloudinary errors
    if (error.http_code) {
      return res.status(500).json({ 
        message: "Lỗi khi upload video lên Cloudinary: " + error.message 
      });
    }
    next(error);
  }
};

module.exports = {
  handleCreateLesson,
  handleGetLessonsByChapterId,
  handleGetLessonById,
  handleUpdateLesson,
  handleDeleteLesson,
  handleUploadLessonVideo,
};
