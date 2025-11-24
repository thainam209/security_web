// src/services/progress.service.js
const {
    lessonprogress,
    lessons,
    enrollments,
    coursecompletions, // Thêm model này
    certificates, // Thêm model này
    courses,
    sequelize,
  } = require('../models');
const notificationService = require('./notification.service');
  
  /**
   * HÀM NỘI BỘ: Tự động kiểm tra và hoàn thành khóa học
   */
  const checkAndCompleteCourse = async (studentId, courseId, transaction) => {
    // 1. Đếm TỔNG SỐ bài học của khóa học
    const totalLessons = await lessons.count({
      where: { courseid: courseId },
      transaction,
    });
  
    if (totalLessons === 0) {
      return; // Khóa học chưa có bài học, bỏ qua
    }
  
    // 2. Đếm số bài học HỌC VIÊN ĐÃ HOÀN THÀNH trong khóa này
    const completedLessonsCount = await lessonprogress.count({
      where: {
        studentid: studentId,
        iscompleted: true,
      },
      include: {
        model: lessons,
        as: 'lesson',
        where: { courseid: courseId },
        attributes: [],
      },
      transaction,
    });
  
    // 3. So sánh
    if (completedLessonsCount === totalLessons) {
      // 4. Nếu bằng nhau -> Tạo CourseCompletion (nếu chưa có)
      const [completion, created] = await coursecompletions.findOrCreate({
        where: {
          studentid: studentId,
          courseid: courseId,
        },
        defaults: {
          studentid: studentId,
          courseid: courseId,
          completedat: new Date(),
        },
        transaction,
      });

      // 5. Tạo Certificate (nếu chưa có)
      await certificates.findOrCreate({
        where: {
          studentid: studentId,
          courseid: courseId,
        },
        defaults: {
          studentid: studentId,
          courseid: courseId,
          issuedat: new Date(),
        },
        transaction,
      });

      // 6. Tạo notification khi hoàn thành khóa học (chỉ khi mới hoàn thành)
      if (created) {
        try {
          const course = await courses.findByPk(courseId, { transaction });
          if (course) {
            await notificationService.createNotification(
              studentId,
              `Chúc mừng! Bạn đã hoàn thành khóa học "${course.coursename}". Bạn đã nhận được chứng chỉ!`
            );
          }
        } catch (error) {
          console.error('Error creating course completion notification:', error);
        }
      }
    }
  };
  
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
      throw new Error(
        'Bạn phải ghi danh khóa học để xem hoặc hoàn thành bài học này.'
      );
    }
  
    return lesson.courseid; // Trả về courseId để dùng sau
  };
  
  /**
   * Đánh dấu một bài học là đã hoàn thành
   * @param {number} studentId
   * @param {number} lessonId
   */
  const markLessonAsComplete = async (studentId, lessonId) => {
    // 1. Kiểm tra quyền ghi danh (quan trọng)
    const courseId = await checkEnrollment(studentId, lessonId);
  
    // ✨ SỬ DỤNG TRANSACTION ĐỂ ĐẢM BẢO AN TOÀN DỮ LIỆU ✨
    const t = await sequelize.transaction();
    try {
      // 2. Dùng findOrCreate để tạo hoặc tìm bản ghi tiến độ
      const [progress, created] = await lessonprogress.findOrCreate({
        where: {
          studentid: studentId,
          lessonid: lessonId,
        },
        defaults: {
          studentid: studentId,
          lessonid: lessonId,
          iscompleted: true,
          completedat: new Date(),
        },
        transaction: t, // Thêm transaction
      });
  
      // 3. Nếu bản ghi đã tồn tại nhưng chưa hoàn thành, cập nhật nó
      if (!created && !progress.iscompleted) {
        await progress.update(
          {
            iscompleted: true,
            completedat: new Date(),
          },
          { transaction: t }
        ); // Thêm transaction
      }
  
      // 4. ✨ GỌI HÀM KIỂM TRA HOÀN THÀNH KHÓA HỌC ✨
      await checkAndCompleteCourse(studentId, courseId, t);

      // 5. Tạo notification khi hoàn thành bài học
      try {
        const lesson = await lessons.findByPk(lessonId, { transaction: t });
        if (lesson) {
          await notificationService.createNotification(
            studentId,
            `Bạn đã hoàn thành bài học "${lesson.title}". Tiếp tục phát huy nhé!`
          );
        }
      } catch (error) {
        console.error('Error creating lesson completion notification:', error);
      }

      // 6. Commit transaction
      await t.commit();

      return progress;
    } catch (error) {
      // 6. Nếu có lỗi, rollback tất cả
      await t.rollback();
      throw new Error(`Lỗi khi đánh dấu hoàn thành: ${error.message}`);
    }
  };
  
  /**
   * Lấy tất cả tiến độ bài học của học viên trong một khóa học
   * @param {number} studentId
   * @param {number} courseId
   */
  const getCourseProgress = async (studentId, courseId) => {
    // 1. Kiểm tra xem học viên có ghi danh khóa này không
    const enrollment = await enrollments.findOne({
      where: { studentid: studentId, courseid: courseId },
    });
    if (!enrollment) {
      throw new Error('Bạn chưa ghi danh khóa học này.');
    }
  
    // 2. Lấy danh sách các lessonId đã hoàn thành
    const completedLessons = await lessonprogress.findAll({
      where: {
        studentid: studentId,
        iscompleted: true,
      },
      attributes: ['lessonid'],
      include: {
        model: lessons,
        as: 'lesson',
        where: { courseid: courseId },
        attributes: [],
      },
    });
  
    return completedLessons.map((item) => item.lessonid);
  };
  
  module.exports = {
    markLessonAsComplete,
    getCourseProgress,
  };