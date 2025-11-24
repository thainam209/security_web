const { promotions } = require('../models');
const { Op } = require('sequelize');

/**
 * Xác thực một mã khuyến mãi.
 * @param {string} promotionCode - Mã khuyến mãi người dùng nhập.
 * @returns {Promise<promotions>} - Trả về thông tin của mã nếu hợp lệ.
 */
const validatePromotionCode = async (promotionCode) => {
  const promotion = await promotions.findOne({
    where: {
      code: promotionCode,
      startdate: {
        [Op.lte]: new Date() // Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày hiện tại
      },
      enddate: {
        [Op.gte]: new Date() // Ngày kết thúc phải lớn hơn hoặc bằng ngày hiện tại
      }
    }
  });

  if (!promotion) {
    throw new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
  }

  return promotion;
};

/**
 * (Admin) Tạo một mã khuyến mãi mới.
 */
const createPromotion = async (promotionData) => {
    return await promotions.create(promotionData);
}

module.exports = {
  validatePromotionCode,
  createPromotion,
};