// src/controllers/chapter.controller.js
const chapterService = require("../services/chapter.service");

// [POST] /api/v1/chapters (body: { courseId, title, ... })
const handleCreateChapter = async (req, res, next) => {
  try {
    const { courseId, ...chapterData } = req.body;
    if (!courseId || !chapterData.title) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp courseId và title." });
    }
    const newChapter = await chapterService.createChapter(
      courseId,
      chapterData,
      req.user
    );
    res
      .status(201)
      .json({ message: "Tạo chương mới thành công.", data: newChapter });
  } catch (error) {
    if (error.message.includes("không có quyền")) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/chapters/course/:courseId
const handleGetChaptersByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const chapterList = await chapterService.getChaptersByCourseId(
      Number(courseId)
    );
    // Convert Sequelize instances to plain objects
    const plainChapters = chapterList.map(chapter => {
      const plain = chapter.toJSON ? chapter.toJSON() : chapter;
      if (plain.lessons) {
        plain.lessons = plain.lessons.map(lesson => 
          lesson.toJSON ? lesson.toJSON() : lesson
        );
      }
      return plain;
    });
    res
      .status(200)
      .json({ message: "Lấy danh sách chương thành công.", data: plainChapters });
  } catch (error) {
    next(error);
  }
};

// [PUT] /api/v1/chapters/:id
const handleUpdateChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedChapter = await chapterService.updateChapter(
      Number(id),
      req.body,
      req.user
    );
    res
      .status(200)
      .json({ message: "Cập nhật chương thành công.", data: updatedChapter });
  } catch (error) {
    if (
      typeof error.message === "string" &&
      error.message.includes("không có quyền")
    ) {
      return res.status(403).json({ message: error.message });
    }
    if (
      typeof error.message === "string" &&
      error.message.includes("Không tìm thấy")
    ) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [DELETE] /api/v1/chapters/:id
const handleDeleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    await chapterService.deleteChapter(Number(id), req.user);
    res.status(200).json({ message: "Xóa chương thành công." });
  } catch (error) {
    if (
      typeof error.message === "string" &&
      error.message.includes("không có quyền")
    ) {
      return res.status(403).json({ message: error.message });
    }
    if (
      typeof error.message === "string" &&
      error.message.includes("Không tìm thấy")
    ) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  handleCreateChapter,
  handleGetChaptersByCourseId,
  handleUpdateChapter,
  handleDeleteChapter,
};
