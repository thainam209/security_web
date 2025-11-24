// src/controllers/progress.controller.js
const progressService = require('../services/progress.service');

// [POST] /api/v1/progress/complete
const handleMarkAsComplete = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lessonId.' });
    }

    const progress = await progressService.markLessonAsComplete(
      studentId,
      Number(lessonId)
    );
    res
      .status(200)
      .json({ message: 'Đánh dấu bài học hoàn thành!', data: progress });
  } catch (error) {
    if (error.message.includes('Không tìm thấy') || error.message.includes('ghi danh')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/progress/course/:courseId
const handleGetCourseProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const progressIds = await progressService.getCourseProgress(
      studentId,
      Number(courseId)
    );
    res.status(200).json({
      message: 'Lấy tiến độ khóa học thành công.',
      data: progressIds, // Trả về mảng các lessonId đã hoàn thành
    });
  } catch (error) {
     if (error.message.includes('chưa ghi danh')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  handleMarkAsComplete,
  handleGetCourseProgress,
};