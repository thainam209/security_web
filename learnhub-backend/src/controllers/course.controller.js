// src/controllers/course.controller.js
const courseService = require("../services/course.service");

// [GET] /api/v1/courses
const handleGetAllCourses = async (req, res, next) => {
  try {
    // req.query chứa các tham số lọc như ?page=1&limit=10&categoryId=2
    const filters = req.query;
    const data = await courseService.getAllCourses(filters);
    res.status(200).json({
      message: "Lấy danh sách khóa học thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/v1/courses/:id
const handleGetCourseDetailsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseDetailsById(Number(id));
    res.status(200).json({
      message: "Lấy chi tiết khóa học thành công",
      data: course,
    });
  } catch (error) {
    // Nếu service ném lỗi "Không tìm thấy", trả về 404
    if (error.message === "Không tìm thấy khóa học") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/courses
const handleCreateCourse = async (req, res, next) => {
  try {
    const courseData = req.body;
    const teacherId = req.user.id; // Lấy từ authMiddleware

    // (Tạm thời) chỉ cho phép Teacher và Admin tạo khóa học
    if (req.user.role !== "Teacher" && req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Chỉ có Giáo viên hoặc Admin mới được tạo khóa học.",
      });
    }

    const newCourse = await courseService.createCourse(courseData, teacherId);
    res.status(201).json({
      message: "Tạo khóa học mới thành công, đang chờ duyệt",
      data: newCourse,
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] /api/v1/courses/:id
const handleUpdateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user; // Lấy từ authMiddleware

    const updatedCourse = await courseService.updateCourse(
      Number(id),
      updateData,
      user
    );
    res.status(200).json({
      message: "Cập nhật khóa học thành công",
      data: updatedCourse,
    });
  } catch (error) {
    if (error.message.includes("Bạn không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Không tìm thấy khóa học") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [DELETE] /api/v1/courses/:id
const handleDeleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user; // Lấy từ authMiddleware

    await courseService.deleteCourse(Number(id), user);
    res.status(200).json({
      message: "Xóa khóa học thành công",
    });
  } catch (error) {
    if (error.message.includes("Bạn không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Không tìm thấy khóa học") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/courses/category/:categoryId
const handleGetCoursesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const filters = { categoryId };
    const data = await courseService.getAllCourses(filters);
    res.status(200).json({
      message: "Lấy danh sách khóa học theo danh mục thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/v1/courses/:id/learn
const handleGetCourseForLearning = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id; // Lấy từ authMiddleware

    if (req.user.role !== 'Student' && req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({
        message: 'Chỉ có học viên mới được xem nội dung khóa học.',
      });
    }

    const courseData = await courseService.getCourseForLearning(Number(id), studentId);
    res.status(200).json({
      message: 'Lấy nội dung khóa học thành công.',
      data: courseData,
    });
  } catch (error) {
    if (error.message.includes('chưa ghi danh') || error.message.includes('Không tìm thấy')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/courses/:id/upload-image
const handleUploadCourseImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user; // Lấy từ authMiddleware

    // Kiểm tra file đã được upload chưa
    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn file ảnh để upload",
      });
    }

    // Upload ảnh lên Cloudinary và cập nhật database
    const updatedCourse = await courseService.uploadCourseImage(
      Number(id),
      req.file.buffer,
      user
    );

    res.status(200).json({
      message: "Upload ảnh khóa học thành công",
      data: {
        courseId: updatedCourse.courseid,
        imageUrl: updatedCourse.imageurl,
      },
    });
  } catch (error) {
    if (error.message.includes("Bạn không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Không tìm thấy khóa học") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("Chỉ chấp nhận file ảnh")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  handleGetAllCourses,
  handleGetCourseDetailsById,
  handleCreateCourse,
  handleUpdateCourse,
  handleDeleteCourse,
  handleGetCoursesByCategory,
  handleGetCourseForLearning,
  handleUploadCourseImage,
};
