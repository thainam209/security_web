const cartService = require('../services/cart.service');

// [POST] /api/v1/cart
const handleAddToCart = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ middleware xác thực (ví dụ: JWT)
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp courseId.' });
    }

    const cartItem = await cartService.addTocart(userId, courseId);
    res.status(201).json({ message: 'Đã thêm khóa học vào giỏ hàng thành công.', data: cartItem });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// [GET] /api/v1/cart
const handleGetCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartService.getcartByUserId(userId);
    res.status(200).json({ message: 'Lấy thông tin giỏ hàng thành công.', data: cartItems });
  } catch (error) {
    // THÊM DÒNG NÀY ĐỂ IN LỖI CHI TIẾT RA TERMINAL
    console.log('--- LỖI KHI LẤY GIỎ HÀNG ---', error); 

    res.status(500).json({ message: 'Lỗi hệ thống khi lấy giỏ hàng.' });
  }
};

// [DELETE] /api/v1/cart/:courseId
const handleRemoveFromCart = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ middleware
    const { courseId } = req.params; // Lấy courseId từ URL params

    await cartService.removeFromcart(userId, Number(courseId));
    res.status(200).json({ message: 'Đã xóa khóa học khỏi giỏ hàng thành công.' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  handleAddToCart,
  handleGetCart,
  handleRemoveFromCart,
};