const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// POST /api/v1/payment/create-payment-url - Yêu cầu đăng nhập
router.post('/create-payment-url', authMiddleware, paymentController.createPaymentUrl);

// GET /api/v1/payment/vnpay-return - VNPay redirect về (không cần auth)
router.get('/vnpay-return', paymentController.vnpayReturn);

// GET/POST /api/v1/payment/vnpay-ipn - VNPay IPN callback (không cần auth)
router.get('/vnpay-ipn', paymentController.vnpayIpn);
router.post('/vnpay-ipn', paymentController.vnpayIpn);

module.exports = router;

