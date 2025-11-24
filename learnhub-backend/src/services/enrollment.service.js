// src/services/enrollment.service.js
const { enrollments, courses } = require('../models');
const notificationService = require('./notification.service');

/**
 * Ghi danh một học viên vào khóa học.
 * @param {number} studentId - ID của học viên.
 * * @param {number} courseId - ID của khóa học.
 */
const createEnrollment = async (studentId, courseId) => {
  // 1. Kiểm tra xem khóa học có tồn tại không
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khóa học này.');
  }

  // 2. Kiểm tra xem học viên đã ghi danh khóa này chưa
  const existingEnrollment = await enrollments.findOne({
    where: {
      studentid: studentId,
      courseid: courseId,
    },
  });

  if (existingEnrollment) {
    throw new Error('Bạn đã ghi danh khóa học này rồi.');
  }

  // 3. (Quan trọng) Kiểm tra xem khóa học có miễn phí không
  // Nếu khóa học có giá > 0, đáng lẽ logic này phải được gọi từ service Order (Thành viên 3)
  // Tạm thời, chúng ta sẽ cho phép ghi danh nếu khóa học miễn phí (price = 0)
  if (course.price > 0) {
    throw new Error(
      'Đây là khóa học có phí. Bạn cần thanh toán để được ghi danh.'
    );
  }

  // 4. Tạo bản ghi ghi danh mới
  const newEnrollment = await enrollments.create({
    studentid: studentId,
    courseid: courseId,
  });

  // 5. Tạo notification cho học viên
  try {
    await notificationService.createNotification(
      studentId,
      `Bạn đã đăng ký thành công khóa học "${course.coursename}". Chúc bạn học tập tốt!`
    );
  } catch (error) {
    // Không throw error nếu tạo notification thất bại, chỉ log
    console.error('Error creating enrollment notification:', error);
  }

  // 6. Tạo notification cho giảng viên (nếu có)
  if (course.teacherid) {
    try {
      const { users } = require('../models');
      const teacher = await users.findByPk(course.teacherid);
      if (teacher) {
        await notificationService.createNotification(
          course.teacherid,
          `Học viên mới đã đăng ký khóa học "${course.coursename}" của bạn.`
        );
      }
    } catch (error) {
      console.error('Error creating teacher notification:', error);
    }
  }

  return newEnrollment;
};

/**
 * Tạo enrollment từ order (sau khi thanh toán thành công)
 * Bỏ qua kiểm tra giá vì đã thanh toán rồi
 * @param {number} studentId - ID của học viên
 * @param {number} courseId - ID của khóa học
 * @param {object} transaction - Sequelize transaction
 */
const createEnrollmentFromOrder = async (studentId, courseId, transaction = null) => {
  // Kiểm tra xem học viên đã ghi danh khóa này chưa
  const existingEnrollment = await enrollments.findOne({
    where: {
      studentid: studentId,
      courseid: courseId,
    },
    transaction
  });

  if (existingEnrollment) {
    return existingEnrollment; // Đã enroll rồi, không cần tạo lại
  }

  // Lấy thông tin khóa học
  const course = await courses.findByPk(courseId, { transaction });
  if (!course) {
    throw new Error('Không tìm thấy khóa học này.');
  }

  // Tạo enrollment (bỏ qua kiểm tra giá)
  const newEnrollment = await enrollments.create({
    studentid: studentId,
    courseid: courseId,
  }, { transaction });

  // Tạo notification cho học viên
  try {
    await notificationService.createNotification(
      studentId,
      `Bạn đã đăng ký thành công khóa học "${course.coursename}". Chúc bạn học tập tốt!`
    );
  } catch (error) {
    console.error('Error creating enrollment notification:', error);
  }

  // Tạo notification cho giảng viên (nếu có)
  if (course.teacherid) {
    try {
      const { users } = require('../models');
      const teacher = await users.findByPk(course.teacherid);
      if (teacher) {
        await notificationService.createNotification(
          course.teacherid,
          `Học viên mới đã đăng ký khóa học "${course.coursename}" của bạn.`
        );
      }
    } catch (error) {
      console.error('Error creating teacher notification:', error);
    }
  }

  return newEnrollment;
};

/**
 * Lấy danh sách các khóa học mà học viên đã ghi danh.
 * @param {number} studentId - ID của học viên.
 */
const getMyEnrolledCourses = async (studentId) => {
  const enrolledList = await enrollments.findAll({
    where: { studentid: studentId },
    include: [
      {
        model: courses,
        as: 'course', // Alias từ init-models.js
        attributes: [
          'courseid',
          'coursename',
          'imageurl',
          'description',
        ],
      },
    ],
    order: [['enrolledat', 'DESC']],
  });

  // Chỉ trả về mảng các đối tượng course cho gọn
  return enrolledList.map((item) => item.course);
};

module.exports = {
  createEnrollment,
  createEnrollmentFromOrder,
  getMyEnrolledCourses,
};