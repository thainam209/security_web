const orderService = require('../services/order.service');

const orderController = {
  // [POST] /api/v1/orders/checkout
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { promotionCode } = req.body; // Nhận mã khuyến mãi từ body
      const newOrder = await orderService.createOrderFromCart(userId, promotionCode);
      res.status(201).json({
        message: 'Tạo đơn hàng thành công!',
        data: newOrder,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // [GET] /api/v1/orders
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const userOrders = await orderService.getOrdersByUserId(userId);
      res.status(200).json({
        message: 'Lấy lịch sử đơn hàng thành công!',
        data: userOrders,
      });
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      res.status(500).json({ message: 'Lỗi hệ thống khi lấy đơn hàng.' });
    }
  },

  // [GET] /api/v1/orders/:orderId
  getOrderDetails: async (req, res) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const order = await orderService.getOrderById(Number(orderId), userId);
      res.status(200).json({
        message: 'Lấy chi tiết đơn hàng thành công!',
        data: order,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },
};

module.exports = orderController;