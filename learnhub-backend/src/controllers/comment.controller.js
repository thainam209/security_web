// src/controllers/comment.controller.js
const commentService = require('../services/comment.service');

// [POST] /api/v1/comments
const handleCreateComment = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { lessonId, content } = req.body;

    if (!lessonId || !content) {
      return res
        .status(400)
        .json({ message: 'Vui lòng cung cấp lessonId và content.' });
    }

    const newComment = await commentService.createComment(
      studentId,
      Number(lessonId),
      content
    );
    res
      .status(201)
      .json({ message: 'Đăng bình luận thành công!', data: newComment });
  } catch (error) {
    if (error.message.includes('ghi danh') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/comments/lesson/:lessonId
const handleGetCommentsByLessonId = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const comments = await commentService.getCommentsByLessonId(Number(lessonId));
    res
      .status(200)
      .json({ message: 'Lấy danh sách bình luận thành công.', data: comments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateComment,
  handleGetCommentsByLessonId,
};