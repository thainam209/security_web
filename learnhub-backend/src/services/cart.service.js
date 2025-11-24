const { cart, courses } = require('../models'); // Import các model cần thiết

/**
 * Thêm một khóa học vào giỏ hàng của người dùng.
 * @param {number} userId - ID của người dùng.
 * @param {number} courseId - ID của khóa học.
 * @returns {Promise<[cart, boolean]>} - Trả về instance của cart và một boolean cho biết nó mới được tạo hay không.
 */
const addTocart = async (userId, courseId) => {
  // Sử dụng findOrCreate để tránh thêm trùng lặp khóa học vào giỏ hàng
  const [cartItem, created] = await cart.findOrCreate({
    where: { userid: userId, courseid: courseId },
    defaults: {
      userid: userId,
      courseid: courseId,
    },
  });

  if (!created) {
    // Nếu đã tồn tại, có thể throw lỗi hoặc chỉ trả về item đã có
    throw new Error('Khóa học này đã có trong giỏ hàng của bạn.');
  }

  return cartItem;
};

/**
 * Lấy tất cả các khóa học trong giỏ hàng của một người dùng.
 * @param {number} userId - ID của người dùng.
 * @returns {Promise<cart[]>} - Danh sách các item trong giỏ hàng kèm thông tin khóa học.
 */
const getcartByUserId = async (userId) => {
  const cartItems = await cart.findAll({
    where: { userid: userId },
    include: [{
      model: courses, // Lấy kèm thông tin chi tiết của khóa học
      as: 'course', // Bạn cần định nghĩa alias 'course' trong association nếu có
      attributes: ['courseid', 'coursename', 'price', 'imageurl'], // Chỉ lấy các trường cần thiết
    }],
    order: [['addedat', 'DESC']], // Sắp xếp theo ngày thêm mới nhất
  });
  return cartItems;
};

/**
 * Xóa một khóa học khỏi giỏ hàng.
 * @param {number} userId - ID của người dùng.
 * @param {number} courseId - ID của khóa học cần xóa.
 * @returns {Promise<number>} - Số lượng bản ghi đã bị xóa.
 */
const removeFromcart = async (userId, courseId) => {
  const result = await cart.destroy({
    where: {
      userid: userId,
      courseid: courseId,
    },
  });

  if (result === 0) {
    throw new Error('Không tìm thấy khóa học trong giỏ hàng để xóa.');
  }
  return result;
};

module.exports = {
  addTocart,
  getcartByUserId,
  removeFromcart,
};