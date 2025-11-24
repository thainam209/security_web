// src/services/lesson.service.js
const { lessons, chapters, courses, users } = require("../models");
const cloudinary = require("../config/cloudinary.config");
const { Readable } = require("stream");

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
 * Tạo một bài học mới
 * @param {object} lessonData - Dữ liệu (chapterid, title, videourl, ...)
 * @param {object} user - Người dùng (từ middleware)
 */
const createLesson = async (lessonData, user) => {
  const { chapterid } = lessonData;
  if (!chapterid) {
    throw new Error("Vui lòng cung cấp chapterid.");
  }

  // Kiểm tra chương tồn tại
  const chapter = await chapters.findByPk(chapterid);
  if (!chapter) {
    throw new Error("Không tìm thấy chương học.");
  }

  // Kiểm tra quyền
  await checkCourseOwnership(chapter.courseid, user);

  // Tự động gán sortorder nếu chưa có
  const maxOrder = await lessons.max("sortorder", { where: { chapterid } });
  const sortorder = lessonData.sortorder || (maxOrder || 0) + 1;

  const newLesson = await lessons.create({
    ...lessonData,
    sortorder,
    courseid: chapter.courseid, // Lấy courseid từ chapter
  });

  return newLesson;
};

/**
 * Lấy tất cả bài học của một chương
 * @param {number} chapterId
 */
const getLessonsByChapterId = async (chapterId) => {
  return await lessons.findAll({
    where: { chapterid: chapterId },
    order: [["sortorder", "ASC"]],
  });
};

/**
 * Lấy chi tiết 1 bài học
 * @param {number} lessonId
 */
const getLessonById = async (lessonId) => {
  const lesson = await lessons.findByPk(lessonId);
  if (!lesson) {
    throw new Error("Không tìm thấy bài học.");
  }
  return lesson;
};

/**
 * Cập nhật bài học
 * @param {number} lessonId
 * @param {object} updateData
 * @param {object} user
 */
const updateLesson = async (lessonId, updateData, user) => {
  const lesson = await lessons.findByPk(lessonId);
  if (!lesson) {
    throw new Error("Không tìm thấy bài học.");
  }
  await checkCourseOwnership(lesson.courseid, user);

  return await lesson.update(updateData);
};

/**
 * Xóa một bài học
 * @param {number} lessonId
 * @param {object} user
 */
const deleteLesson = async (lessonId, user) => {
  const lesson = await lessons.findByPk(lessonId);
  if (!lesson) {
    throw new Error("Không tìm thấy bài học.");
  }

  await checkCourseOwnership(lesson.courseid, user);

  await lesson.destroy();
  return { message: "Xóa bài học thành công." };
};

/**
 * Upload video lên Cloudinary (hỗ trợ file lớn)
 * @param {Buffer} fileBuffer - Buffer của file video
 * @param {string} folder - Thư mục trên Cloudinary (ví dụ: 'lessons')
 * @returns {Promise<string>} - URL của video trên Cloudinary
 */
const uploadVideoToCloudinary = async (fileBuffer, folder = 'lessons') => {
  return new Promise((resolve, reject) => {
    // Sử dụng upload_large_stream cho file lớn (>100MB)
    const fileSize = fileBuffer.length;
    const isLargeFile = fileSize > 100 * 1024 * 1024; // > 100MB
    
    if (isLargeFile) {
      // Upload file lớn với chunked upload
      const uploadStream = cloudinary.uploader.upload_large_stream(
        {
          folder: folder,
          resource_type: 'video',
          chunk_size: 6000000, // 6MB chunks
          eager: [], // Không cần transform ngay
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      // Chuyển buffer thành stream để upload
      const stream = Readable.from(fileBuffer);
      stream.pipe(uploadStream);
    } else {
      // Upload file nhỏ bình thường
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'video',
          chunk_size: 6000000, // 6MB chunks
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      // Chuyển buffer thành stream để upload
      const stream = Readable.from(fileBuffer);
      stream.pipe(uploadStream);
    }
  });
};

/**
 * Upload video cho bài học và cập nhật database
 * @param {number} lessonId - ID bài học
 * @param {Buffer} fileBuffer - Buffer của file video
 * @param {object} user - Người dùng thực hiện (từ middleware)
 * @returns {Promise<object>} - Bài học đã được cập nhật
 */
const uploadLessonVideo = async (lessonId, fileBuffer, user) => {
  // 1. Kiểm tra bài học tồn tại
  const lesson = await lessons.findByPk(lessonId);
  if (!lesson) {
    throw new Error("Không tìm thấy bài học");
  }

  // 2. Kiểm tra quyền
  await checkCourseOwnership(lesson.courseid, user);

  // 3. Upload video mới lên Cloudinary
  const videoUrl = await uploadVideoToCloudinary(fileBuffer, 'lessons');

  // 4. Cập nhật videourl trong database
  await lesson.update({ videourl: videoUrl });

  // 5. Trả về bài học đã cập nhật
  return lesson;
};

module.exports = {
  createLesson,
  getLessonsByChapterId,
  getLessonById,
  updateLesson,
  deleteLesson,
  uploadLessonVideo,
};
