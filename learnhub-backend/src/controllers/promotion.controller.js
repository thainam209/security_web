const promotionService = require('../services/promotion.service');

const promotionController = {
  // [POST] /api/v1/promotions/validate
  validateCode: async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mã khuyến mãi.' });
      }
      const promotion = await promotionService.validatePromotionCode(code);
      res.status(200).json({
        message: 'Mã khuyến mãi hợp lệ.',
        data: {
          discountPercentage: promotion.discountpercentage
        }
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  // [POST] /api/v1/promotions - Chỉ dành cho Admin
  createCode: async (req, res) => {
    try {
      // Logic kiểm tra quyền admin sẽ nằm trong middleware
      const promotionData = req.body;
      const newPromotion = await promotionService.createPromotion(promotionData);
      res.status(201).json({
        message: 'Tạo mã khuyến mãi thành công!',
        data: newPromotion
      });
    } catch (error) {
      res.status(400).json({ message: `Tạo mã thất bại: ${error.message}` });
    }
  }
};

module.exports = promotionController;