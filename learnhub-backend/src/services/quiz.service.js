// src/services/quiz.service.js
const {
    sequelize,
    quizzes,
    quizquestions,
    quizoptions,
    quizsessions,
    quizanswers,
    enrollments,
  } = require('../models');
  
  /**
   * Lấy chi tiết một bài quiz (chỉ câu hỏi và lựa chọn)
   * @param {number} quizId - ID của bài quiz.
   * @param {number} studentId - ID của học viên.
   */
  const getQuizDetails = async (quizId, studentId) => {
    // 1. Lấy thông tin cơ bản của quiz
    const quizInfo = await quizzes.findByPk(quizId, {
      attributes: [
        'quizid',
        'lessonid',
        'title',
        'timelimit',
        'maxattempts',
      ],
    });
  
    if (!quizInfo) {
      throw new Error('Không tìm thấy bài quiz.');
    }
  
    // 2. Kiểm tra xem học viên đã ghi danh vào khóa học chứa bài quiz này chưa
    // (Giả định rằng lesson đã được liên kết với course)
    // Bạn cần đảm bảo model `lessons` có association 'course'
    // Vì model `quizzes` liên kết với `lessons`, chúng ta cần tìm `courseid` từ `lessonid`
    // (Phần này sẽ cần model `lessons` - tạm thời bỏ qua để đơn giản hóa)
    /*
    const lesson = await lessons.findByPk(quizInfo.lessonid);
    const enrollment = await enrollments.findOne({ 
      where: { studentid: studentId, courseid: lesson.courseid }
    });
    if (!enrollment) {
      throw new Error('Bạn phải ghi danh vào khóa học để làm bài quiz này.');
    }
    */
  
    // 3. Lấy danh sách câu hỏi và các lựa chọn
    const questions = await quizquestions.findAll({
      where: { quizid: quizId },
      attributes: ['questionid', 'questiontext', 'explanation'], // Không lấy correctoptionid
      include: [
        {
          model: quizoptions,
          as: 'quizoptions',
          attributes: ['optionid', 'optiontext'], // Không lấy iscorrect
        },
      ],
    });
  
    return { quizInfo, questions };
  };
  
  /**
   * Bắt đầu một phiên làm bài quiz
   * @param {number} quizId - ID của bài quiz.
   * @param {number} studentId - ID của học viên.
   */
  const startQuizSession = async (quizId, studentId) => {
    const quizInfo = await quizzes.findByPk(quizId);
    if (!quizInfo) {
      throw new Error('Không tìm thấy bài quiz.');
    }
    
    // (Tạm thời) logic kiểm tra số lần thử (attempts) ...
    
    // Tạo một phiên làm bài mới
    const newSession = await quizsessions.create({
      quizid: quizId,
      studentid: studentId,
      starttime: new Date(), // Giả sử starttime là bắt buộc
    });
  
    return newSession;
  };
  
  /**
   * Nộp bài và chấm điểm
   * @param {number} sessionId - ID của phiên làm bài.
   * @param {number} studentId - ID của học viên (để bảo mật).
   * @param {Array<object>} answers - Mảng các câu trả lời, ví dụ: [{ questionId: 1, selectedOptionId: 3 }, ...]
   */
  const submitQuiz = async (sessionId, studentId, answers) => {
    const t = await sequelize.transaction();
    try {
      // 1. Lấy thông tin phiên làm bài
      const session = await quizsessions.findOne({
        where: {
          sessionid: sessionId,
          studentid: studentId,
          submittedat: null, // Đảm bảo chưa nộp
        },
        transaction: t,
      });
  
      if (!session) {
        throw new Error('Phiên làm bài không hợp lệ hoặc đã được nộp.');
      }
  
      // 2. Lấy danh sách câu hỏi và đáp án ĐÚNG của bài quiz này
      const correctAnswers = await quizquestions.findAll({
        where: { quizid: session.quizid },
        attributes: ['questionid', 'correctoptionid'],
        raw: true, // Chỉ lấy dữ liệu thô
        transaction: t,
      });
  
      // Chuyển thành dạng map để tra cứu nhanh: { questionId: correctOptionId }
      const answerKey = correctAnswers.reduce((acc, q) => {
        acc[q.questionid] = q.correctoptionid;
        return acc;
      }, {});
  
      let score = 0;
      const answerRecords = []; // Mảng để bulkCreate vào CSDL
  
      // 3. Duyệt qua câu trả lời của học viên để chấm điểm
      for (const answer of answers) {
        const isCorrect =
          answerKey[answer.questionId] === answer.selectedOptionId;
        if (isCorrect) {
          score++;
        }
  
        answerRecords.push({
          sessionid: sessionId,
          questionid: answer.questionId,
          selectedoptionid: answer.selectedOptionId,
          iscorrect: isCorrect,
        });
      }
  
      // 4. Lưu tất cả câu trả lời vào CSDL
      await quizanswers.bulkCreate(answerRecords, { transaction: t });
  
      // 5. Cập nhật điểm và trạng thái cho phiên làm bài
      const finalScore = (score / correctAnswers.length) * 100; // Tính điểm %
      await session.update(
        {
          submittedat: new Date(),
          score: finalScore,
          endtime: new Date(), // (Tạm thời)
        },
        { transaction: t }
      );
  
      await t.commit();
      return {
        message: 'Nộp bài thành công!',
        sessionId,
        score: finalScore,
        totalCorrect: score,
        totalQuestions: correctAnswers.length,
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi nộp bài: ${error.message}`);
    }
  };
  
  /**
   * Tạo quiz mới (cho teacher)
   * @param {object} quizData - Dữ liệu quiz { lessonid, title, timelimit, maxattempts, showanswersaftersubmission }
   * @param {number} teacherId - ID của teacher
   */
  const createQuiz = async (quizData, teacherId) => {
    // Kiểm tra quyền: teacher phải sở hữu lesson
    const { lessons, courses } = require('../models');
    const lesson = await lessons.findByPk(quizData.lessonid, {
      include: [
        {
          model: courses,
          as: 'course',
          attributes: ['courseid', 'teacherid'],
        },
      ],
    });

    if (!lesson) {
      throw new Error('Không tìm thấy bài học');
    }

    if (lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền tạo quiz cho bài học này');
    }

    const newQuiz = await quizzes.create(quizData);
    return newQuiz;
  };

  /**
   * Cập nhật quiz (cho teacher)
   */
  const updateQuiz = async (quizId, quizData, teacherId) => {
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền sửa quiz này');
    }

    await quiz.update(quizData);
    return quiz;
  };

  /**
   * Xóa quiz (cho teacher)
   */
  const deleteQuiz = async (quizId, teacherId) => {
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xóa quiz này');
    }

    await quiz.destroy();
    return { message: 'Xóa quiz thành công' };
  };

  /**
   * Lấy danh sách quiz của một lesson (cho teacher)
   */
  const getQuizzesByLesson = async (lessonId, teacherId) => {
    const { lessons, courses } = require('../models');
    const lesson = await lessons.findByPk(lessonId, {
      include: [
        {
          model: courses,
          as: 'course',
          attributes: ['courseid', 'teacherid'],
        },
      ],
    });

    if (!lesson) {
      throw new Error('Không tìm thấy bài học');
    }

    if (lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xem quiz của bài học này');
    }

    const quizList = await quizzes.findAll({
      where: { lessonid: lessonId },
      include: [
        {
          model: quizquestions,
          as: 'quizquestions',
          include: [
            {
              model: quizoptions,
              as: 'quizoptions',
            },
          ],
        },
      ],
      order: [['createdat', 'DESC']],
    });

    return quizList;
  };

  /**
   * Tạo câu hỏi cho quiz
   */
  const createQuestion = async (quizId, questionData, teacherId) => {
    // Kiểm tra quyền
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền thêm câu hỏi vào quiz này');
    }

    const { questiontext, explanation, options, correctoptionid } = questionData;

    const t = await sequelize.transaction();
    try {
      // Tạo câu hỏi
      const question = await quizquestions.create(
        {
          quizid: quizId,
          questiontext,
          explanation: explanation || null,
          correctoptionid: null, // Sẽ cập nhật sau khi tạo options
        },
        { transaction: t }
      );

      // Tạo các lựa chọn
      const createdOptions = [];
      for (const option of options) {
        const createdOption = await quizoptions.create(
          {
            questionid: question.questionid,
            optiontext: option.optiontext,
            iscorrect: option.iscorrect || false,
          },
          { transaction: t }
        );
        createdOptions.push(createdOption);

        // Nếu đây là đáp án đúng, cập nhật correctoptionid
        if (option.iscorrect || option.optionid === correctoptionid) {
          await question.update({ correctoptionid: createdOption.optionid }, { transaction: t });
        }
      }

      await t.commit();
      return { question, options: createdOptions };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  /**
   * Cập nhật câu hỏi
   */
  const updateQuestion = async (questionId, questionData, teacherId) => {
    const { lessons, courses } = require('../models');
    const question = await quizquestions.findByPk(questionId, {
      include: [
        {
          model: quizzes,
          as: 'quiz',
          include: [
            {
              model: lessons,
              as: 'lesson',
              include: [
                {
                  model: courses,
                  as: 'course',
                  attributes: ['courseid', 'teacherid'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!question) {
      throw new Error('Không tìm thấy câu hỏi');
    }

    if (question.quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền sửa câu hỏi này');
    }

    await question.update({
      questiontext: questionData.questiontext,
      explanation: questionData.explanation,
    });

    return question;
  };

  /**
   * Xóa câu hỏi
   */
  const deleteQuestion = async (questionId, teacherId) => {
    const { lessons, courses, quizoptions, quizanswers } = require('../models');
    const question = await quizquestions.findByPk(questionId, {
      include: [
        {
          model: quizzes,
          as: 'quiz',
          include: [
            {
              model: lessons,
              as: 'lesson',
              include: [
                {
                  model: courses,
                  as: 'course',
                  attributes: ['courseid', 'teacherid'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!question) {
      throw new Error('Không tìm thấy câu hỏi');
    }

    if (question.quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xóa câu hỏi này');
    }

    // Xóa các bản ghi liên quan trước (answers và options)
    // Mặc dù có CASCADE nhưng để đảm bảo, xóa thủ công
    try {
      // Xóa quizanswers trước
      await quizanswers.destroy({
        where: { questionid: questionId },
      });

      // Xóa quizoptions
      await quizoptions.destroy({
        where: { questionid: questionId },
      });

      // Cuối cùng xóa question
      await question.destroy();
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('Lỗi khi xóa câu hỏi: ' + error.message);
    }

    return { message: 'Xóa câu hỏi thành công' };
  };

  /**
   * Lấy chi tiết quiz cho teacher (có đáp án đúng)
   */
  const getQuizDetailsForTeacher = async (quizId, teacherId) => {
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xem quiz này');
    }

    const questions = await quizquestions.findAll({
      where: { quizid: quizId },
      include: [
        {
          model: quizoptions,
          as: 'quizoptions',
        },
      ],
      order: [['questionid', 'ASC']],
    });

    return {
      quizInfo: {
        quizid: quiz.quizid,
        lessonid: quiz.lessonid,
        title: quiz.title,
        timelimit: quiz.timelimit,
        maxattempts: quiz.maxattempts,
        showanswersaftersubmission: quiz.showanswersaftersubmission,
      },
      questions: questions.map((q) => q.toJSON()),
    };
  };

  /**
   * Lấy kết quả quiz của học viên (cho teacher)
   */
  const getQuizResults = async (quizId, teacherId) => {
    const { lessons, courses, users } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xem kết quả quiz này');
    }

    const sessions = await quizsessions.findAll({
      where: { quizid: quizId },
      include: [
        {
          model: users,
          as: 'student',
          attributes: ['userid', 'fullname', 'email'],
        },
      ],
      order: [['submittedat', 'DESC']],
    });

    return sessions;
  };

  module.exports = {
    getQuizDetails,
    startQuizSession,
    submitQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizzesByLesson,
    getQuizDetailsForTeacher,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuizResults,
  };