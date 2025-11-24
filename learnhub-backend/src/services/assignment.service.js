// src/services/assignment.service.js
const { assignments, submissions, courses, enrollments, users } =
  require('../models');

/**
 * HÀM NỘI BỘ: Kiểm tra xem user có phải là Teacher/Admin của khóa học không
 */
const checkCourseOwnership = async (courseId, user) => {
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khóa học.');
  }
  if (user.role !== 'Admin' && course.teacherid !== user.id) {
    throw new Error('Bạn không có quyền tạo bài tập cho khóa học này.');
  }
  return course;
};

/**
 * HÀM NỘI BỘ: Kiểm tra xem user có phải là học viên đã ghi danh không
 */
const checkEnrollment = async (courseId, studentId) => {
  const enrollment = await enrollments.findOne({
    where: {
      courseid: courseId,
      studentid: studentId,
    },
  });
  if (!enrollment) {
    throw new Error('Bạn phải ghi danh vào khóa học để nộp bài tập.');
  }
  return enrollment;
};

/**
 * (Giáo viên) Tạo một bài tập mới
 * @param {object} assignmentData - Dữ liệu (courseId, title, description, duedate)
 * @param {object} user - Người dùng (từ middleware)
 */
const createAssignment = async (assignmentData, user) => {
  // Tách courseId (camelCase) ra khỏi assignmentData
  const { courseId, ...restOfData } = assignmentData;

  if (!courseId) {
    throw new Error('Vui lòng cung cấp courseId.');
  }

  // 1. Kiểm tra quyền sở hữu khóa học
  await checkCourseOwnership(courseId, user);

  // 2. Tạo đối tượng mới với đúng tên cột CSDL (courseid)
  const dataToCreate = {
    ...restOfData,
    courseid: courseId, // Ánh xạ 'courseId' thành 'courseid'
  };

  // 3. Tạo bài tập
  const newAssignment = await assignments.create(dataToCreate);
  return newAssignment;
};

/**
 * (Học viên) Lấy danh sách bài tập của một khóa học (kèm trạng thái nộp bài)
 * @param {number} courseId
 * @param {number} studentId
 */
const getAssignmentsByCourse = async (courseId, studentId) => {
  // 1. Lấy tất cả bài tập của khóa học
  const allAssignments = await assignments.findAll({
    where: { courseid: courseId },
    order: [['duedate', 'ASC']],
  });

  // 2. Lấy tất cả bài đã nộp của học viên này cho khóa học này
  const mySubmissions = await submissions.findAll({
    where: { studentid: studentId },
    attributes: ['assignmentid', 'submissionid', 'grade', 'submittedat'],
    include: {
      model: assignments,
      as: 'assignment',
      where: { courseid: courseId },
      attributes: [],
    },
  });

  // 3. Tạo một map để tra cứu nhanh bài nộp
  const submissionMap = mySubmissions.reduce((acc, sub) => {
    acc[sub.assignmentid] = sub;
    return acc;
  }, {});

  // 4. Gắn thông tin "đã nộp" (submission) vào từng bài tập
  const results = allAssignments.map((assignment) => {
    const submission = submissionMap[assignment.assignmentid] || null;
    return {
      ...assignment.toJSON(),
      submission: submission,
    };
  });

  return results;
};

/**
 * (Học viên) Nộp bài tập
 * @param {number} studentId
 * @param {number} assignmentId
 * @param {string} fileUrl - Đường link tới file đã upload (giả định)
 */
const submitAssignment = async (studentId, assignmentId, fileUrl) => {
  // 1. Lấy thông tin bài tập để biết courseId
  const assignment = await assignments.findByPk(assignmentId);
  if (!assignment) {
    throw new Error('Không tìm thấy bài tập.');
  }

  // 2. Kiểm tra xem học viên đã ghi danh chưa
  await checkEnrollment(assignment.courseid, studentId);

  // 3. Kiểm tra xem đã nộp bài này chưa (findOrCreate)
  const [submission, created] = await submissions.findOrCreate({
    where: {
      assignmentid: assignmentId,
      studentid: studentId,
    },
    defaults: {
      assignmentid: assignmentId,
      studentid: studentId,
      fileurl: fileUrl,
      submittedat: new Date(),
    },
  });

  // 4. Nếu đã tồn tại, cập nhật bài nộp (cho phép nộp lại)
  if (!created) {
    await submission.update({
      fileurl: fileUrl,
      submittedat: new Date(),
      grade: null,
      feedback: null,
    });
    return submission;
  }

  return submission;
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
};