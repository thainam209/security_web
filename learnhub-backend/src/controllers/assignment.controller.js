// src/controllers/assignment.controller.js
const assignmentService = require('../services/assignment.service');

// [POST] /api/v1/assignments
const handleCreateAssignment = async (req, res, next) => {
  try {
    const assignmentData = req.body;
    const user = req.user; // Teacher/Admin

    if (!assignmentData.courseId || !assignmentData.title || !assignmentData.duedate) {
        return res.status(400).json({ message: 'Vui lòng cung cấp courseId, title, và duedate.' });
    }

    const newAssignment = await assignmentService.createAssignment(assignmentData, user);
    res.status(201).json({ message: 'Tạo bài tập thành công.', data: newAssignment });
  } catch (error) {
     if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/assignments/course/:courseId
const handleGetAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id; // Lấy từ học viên
    const assignments = await assignmentService.getAssignmentsByCourse(Number(courseId), studentId);
    res.status(200).json({ message: 'Lấy danh sách bài tập thành công.', data: assignments });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/v1/assignments/submit
const handleSubmitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, fileUrl } = req.body;
    const studentId = req.user.id;

    if (!assignmentId || !fileUrl) {
        return res.status(400).json({ message: 'Vui lòng cung cấp assignmentId và fileUrl.' });
    }

    const submission = await assignmentService.submitAssignment(studentId, Number(assignmentId), fileUrl);
    res.status(200).json({ message: 'Nộp bài thành công.', data: submission });
  } catch (error)
 {
    if (error.message.includes('ghi danh') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  handleCreateAssignment,
  handleGetAssignments,
  handleSubmitAssignment,
};