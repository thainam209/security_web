const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu đăng nhập
router.use(authMiddleware);

// GET /api/v1/notifications - Lấy danh sách notifications
router.get('/', notificationController.getNotifications);

// GET /api/v1/notifications/unread-count - Lấy số lượng notifications chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/v1/notifications/:id - Lấy chi tiết một notification
router.get('/:id', notificationController.getNotificationById);

// PUT /api/v1/notifications/:id/read - Đánh dấu một notification là đã đọc
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/v1/notifications/read-all - Đánh dấu tất cả notifications là đã đọc
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/v1/notifications/:id - Xóa một notification
router.delete('/:id', notificationController.deleteNotification);

// DELETE /api/v1/notifications/read-all - Xóa tất cả notifications đã đọc
router.delete('/read-all', notificationController.deleteAllRead);

module.exports = router;

