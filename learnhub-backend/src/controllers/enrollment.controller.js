// src/controllers/enrollment.controller.js
const enrollmentService = require('../services/enrollment.service');

// [POST] /api/v1/enrollments
const handleCreateEnrollment = async (req, res, next) => {
  try {
    const studentId = req.user.id; // Lấy từ authMiddleware
    const { courseId } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: 'Vui lòng cung cấp courseId.' });
    }

    const newEnrollment = await enrollmentService.createEnrollment(
      studentId,
      Number(courseId)
    );
    res.status(201).json({
      message: 'Ghi danh khóa học thành công!',
      data: newEnrollment,
    });
  } catch (error) {
    // Bắt các lỗi cụ thể từ service
    if (
      error.message.includes('Không tìm thấy') ||
      error.message.includes('có phí')
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('đã ghi danh')) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    next(error);
  }
};

// [GET] /api/v1/enrollments/my-courses
const handleGetMyEnrolledCourses = async (req, res, next) => {
  try {
    const studentId = req.user.id; // Lấy từ authMiddleware
    const courses = await enrollmentService.getMyEnrolledCourses(studentId);
    res.status(200).json({
      message: 'Lấy danh sách khóa học đã ghi danh thành công.',
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateEnrollment,
  handleGetMyEnrolledCourses,
};