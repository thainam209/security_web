const vnpayService = require('../services/vnpay.service');
const orderService = require('../services/order.service');

/**
 * [POST] /api/v1/payment/create-payment-url
 * Tạo payment URL từ VNPay
 */
const createPaymentUrl = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { promotionCode } = req.body;

    // Tạo order với status Pending
    const order = await orderService.createOrderFromCart(userId, promotionCode);

    // Kiểm tra nếu tổng tiền = 0 hoặc < 5000 VND (VNPay yêu cầu tối thiểu 5,000 VND)
    if (order.totalamount === 0 || order.totalamount < 5000) {
      // Khóa học miễn phí - tạo enrollment trực tiếp
      await orderService.updateOrderStatus(order.orderid, 'Completed');
      
      return res.status(200).json({
        message: 'Đăng ký khóa học miễn phí thành công.',
        data: {
          orderId: order.orderid,
          isFree: true,
          paymentUrl: null,
        },
      });
    }

    // Tạo payment URL cho khóa học có phí
    const orderInfo = `Thanh toan don hang ${order.orderid}`;
    const ipAddr = vnpayService.getIpAddress(req);
    const paymentUrl = vnpayService.createPaymentUrl(
      order.orderid,
      order.totalamount,
      orderInfo,
      'other',
      'vn',
      ipAddr
    );

    res.status(200).json({
      message: 'Tạo payment URL thành công.',
      data: {
        paymentUrl,
        orderId: order.orderid,
        isFree: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /api/v1/payment/vnpay-return
 * Nhận kết quả thanh toán từ VNPay (redirect về website)
 */
const vnpayReturn = async (req, res, next) => {
  try {
    const vnp_Params = req.query;
    const orderId = parseInt(vnp_Params.vnp_TxnRef);
    // VNPay có thể gửi responseCode hoặc TransactionStatus
    const responseCode = vnp_Params.vnp_ResponseCode || vnp_Params.vnp_TransactionStatus;

    // Log để debug
    console.log('=== VNPay Return Callback ===');
    console.log('Order ID:', orderId);
    console.log('Response Code:', responseCode);
    console.log('All params:', JSON.stringify(vnp_Params, null, 2));

    // Xác thực chữ ký
    const isValidSignature = vnpayService.verifyPaymentSignature(vnp_Params);
    console.log('Signature valid:', isValidSignature);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (!isValidSignature) {
      console.error('Signature verification failed!');
      return res.redirect(`${frontendUrl}/payment/result?success=false&message=Chữ ký không hợp lệ`);
    }

    // Kiểm tra response code
    // 00 = Giao dịch thành công
    console.log('Checking response code:', responseCode);
    if (responseCode === '00') {
      console.log('Payment successful! Updating order status...');
      // Cập nhật order status thành Completed và tạo enrollment
      await orderService.updateOrderStatus(orderId, 'Completed');
      console.log('Order status updated to Completed');
      
      return res.redirect(`${frontendUrl}/payment/result?success=true&orderId=${orderId}`);
    } else {
      console.log('Payment failed with response code:', responseCode);
      // Thanh toán thất bại
      await orderService.updateOrderStatus(orderId, 'Failed');
      
      const message = vnp_Params.vnp_ResponseCode === '07' 
        ? 'Trừ tiền thành công nhưng bị nghi ngờ'
        : vnp_Params.vnp_ResponseCode === '09'
        ? 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking'
        : vnp_Params.vnp_ResponseCode === '10'
        ? 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần'
        : vnp_Params.vnp_ResponseCode === '11'
        ? 'Đã hết hạn chờ thanh toán. Vui lòng thử lại'
        : vnp_Params.vnp_ResponseCode === '12'
        ? 'Thẻ/Tài khoản bị khóa'
        : vnp_Params.vnp_ResponseCode === '13'
        ? 'Nhập sai mật khẩu xác thực giao dịch (OTP)'
        : vnp_Params.vnp_ResponseCode === '24'
        ? 'Khách hàng hủy giao dịch'
        : 'Thanh toán thất bại. Vui lòng thử lại';
      
      return res.redirect(`${frontendUrl}/payment/result?success=false&orderId=${orderId}&message=${encodeURIComponent(message)}`);
    }
  } catch (error) {
    console.error('Error in vnpayReturn:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/payment/result?success=false&message=${encodeURIComponent('Lỗi hệ thống')}`);
  }
};

/**
 * [GET/POST] /api/v1/payment/vnpay-ipn
 * IPN (Instant Payment Notification) - VNPay gọi server-to-server
 */
const vnpayIpn = async (req, res, next) => {
  try {
    // VNPay có thể gọi bằng GET hoặc POST
    const vnp_Params = req.method === 'GET' ? req.query : req.body;
    const orderId = parseInt(vnp_Params.vnp_TxnRef);
    const responseCode = vnp_Params.vnp_ResponseCode;

    // Xác thực chữ ký
    const isValidSignature = vnpayService.verifyPaymentSignature(vnp_Params);

    if (!isValidSignature) {
      return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }

    // Kiểm tra order có tồn tại không
    const { orders } = require('../models');
    const order = await orders.findByPk(orderId);
    if (!order) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    // Kiểm tra số tiền
    const amount = parseInt(vnp_Params.vnp_Amount) / 100; // VNPay trả về số tiền nhân 100
    if (amount !== order.totalamount) {
      return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status === 'Completed') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    // Cập nhật trạng thái đơn hàng
    if (responseCode === '00') {
      await orderService.updateOrderStatus(orderId, 'Completed');
      return res.status(200).json({ RspCode: '00', Message: 'Confirm success' });
    } else {
      await orderService.updateOrderStatus(orderId, 'Failed');
      return res.status(200).json({ RspCode: '00', Message: 'Order updated to Failed' });
    }
  } catch (error) {
    console.error('Error in vnpayIpn:', error);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

module.exports = {
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn,
};

