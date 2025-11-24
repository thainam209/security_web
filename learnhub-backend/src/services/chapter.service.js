const { chapters, lessons, courses } = require("../models");

/**
 * Kiểm tra xem user có phải là chủ sở hữu khóa học hoặc Admin không
 */
const checkCourseOwnership = async (courseId, user) => {
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error("Không tìm thấy khóa học.");
  }
  if (user.role !== "Admin" && course.teacherid !== user.id) {
    throw new Error("Bạn không có quyền chỉnh sửa khóa học này.");
  }
  return course;
};

/**
 * Tạo một chương mới cho khóa học
 * @param {number} courseId - ID Khóa học
 * @param {object} chapterData - Dữ liệu chương (title, description, sortorder)
 * @param {object} user - Người dùng (từ middleware)
 */
const createChapter = async (courseId, chapterData, user) => {
  await checkCourseOwnership(courseId, user);

  const newChapter = await chapters.create({
    ...chapterData,
    courseid: courseId,
  });

  return newChapter;
};

/**
 * Lấy tất cả chương của một khóa học (kèm danh sách bài học)
 * @param {number} courseId
 */
const getChaptersByCourseId = async (courseId) => {
  return await chapters.findAll({
    where: { courseid: courseId },
    include: {
      model: lessons,
      as: "lessons",
      attributes: ["lessonid", "title", "videourl", "sortorder"],
    },
    order: [
      ["sortorder", "ASC"],
      [{ model: lessons, as: "lessons" }, "sortorder", "ASC"],
    ],
  });
};

/**
 * Cập nhật thông tin chương
 * @param {number} chapterId
 * @param {object} updateData
 * @param {object} user
 */
const updateChapter = async (chapterId, updateData, user) => {
  const chapter = await chapters.findByPk(chapterId);
  if (!chapter) {
    throw new Error("Không tìm thấy chương này.");
  }

  await checkCourseOwnership(chapter.courseid, user);

  // ✅ Loại bỏ field không được cập nhật (tránh người dùng sửa khóa học của người khác)
  delete updateData.courseid;
  delete updateData.chapterid;

  return await chapter.update(updateData);
};

/**
 * Xóa một chương (và toàn bộ bài học trong chương đó)
 * @param {number} chapterId
 * @param {object} user
 */
const deleteChapter = async (chapterId, user) => {
  const chapter = await chapters.findByPk(chapterId);
  if (!chapter) {
    throw new Error("Không tìm thấy chương này.");
  }

  await checkCourseOwnership(chapter.courseid, user);

  // ✅ Xóa các bài học thuộc chương trước
  await lessons.destroy({ where: { chapterid: chapterId } });

  // ✅ Sau đó mới xóa chương
  await chapter.destroy();

  return { message: "Xóa chương và các bài học liên quan thành công." };
};

module.exports = {
  createChapter,
  getChaptersByCourseId,
  updateChapter,
  deleteChapter,
};
