// src/services/comment.service.js
const { lessoncomments, users, enrollments, lessons } = require('../models');

/**
 * Kiểm tra xem học viên đã ghi danh vào khóa học chứa bài học này chưa
 * @param {number} studentId
 * @param {number} lessonId
 */
const checkEnrollment = async (studentId, lessonId) => {
  const lesson = await lessons.findByPk(lessonId, {
    attributes: ['courseid'],
  });
  if (!lesson) {
    throw new Error('Không tìm thấy bài học.');
  }

  const enrollment = await enrollments.findOne({
    where: {
      studentid: studentId,
      courseid: lesson.courseid,
    },
  });

  if (!enrollment) {
    throw new Error('Bạn phải ghi danh khóa học để bình luận.');
  }
};

/**
 * Tạo một bình luận mới cho bài học
 * @param {number} studentId
 * @param {number} lessonId
 * @param {string} content
 */
const createComment = async (studentId, lessonId, content) => {
  // 1. Kiểm tra quyền ghi danh
  await checkEnrollment(studentId, lessonId);

  // 2. Tạo bình luận
  const newComment = await lessoncomments.create({
    lessonid: lessonId,
    studentid: studentId,
    content: content,
  });

  return newComment;
};

/**
 * Lấy tất cả bình luận của một bài học
 * @param {number} lessonId
 */
const getCommentsByLessonId = async (lessonId) => {
  return await lessoncomments.findAll({
    where: { lessonid: lessonId },
    include: [
      {
        model: users,
        as: 'student', // Alias từ init-models.js
        attributes: ['userid', 'fullname', 'profilepicture'],
      },
    ],
    order: [['createdat', 'DESC']], // Hiển thị bình luận mới nhất trước
  });
};

module.exports = {
  createComment,
  getCommentsByLessonId,
};