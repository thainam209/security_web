const notificationService = require('../services/notification.service');

/**
 * [GET] /api/v1/notifications
 * Lấy danh sách notifications của user hiện tại
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { read, page = 1, limit = 20 } = req.query;

    const options = {
      read: read === 'true' ? true : read === 'false' ? false : null,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await notificationService.getNotificationsByUserId(userId, options);
    
    res.status(200).json({
      message: 'Lấy danh sách notifications thành công.',
      data: result.notifications,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /api/v1/notifications/unread-count
 * Lấy số lượng notifications chưa đọc
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    
    res.status(200).json({
      message: 'Lấy số lượng notifications chưa đọc thành công.',
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /api/v1/notifications/:id
 * Lấy chi tiết một notification
 */
const getNotificationById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const notification = await notificationService.getNotificationById(parseInt(id), userId);
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification không tồn tại.',
      });
    }
    
    res.status(200).json({
      message: 'Lấy notification thành công.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [PUT] /api/v1/notifications/:id/read
 * Đánh dấu một notification là đã đọc
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(parseInt(id), userId);
    
    res.status(200).json({
      message: 'Đánh dấu notification đã đọc thành công.',
      data: notification,
    });
  } catch (error) {
    if (error.message === 'Notification không tồn tại') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * [PUT] /api/v1/notifications/read-all
 * Đánh dấu tất cả notifications là đã đọc
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updatedCount = await notificationService.markAllAsRead(userId);
    
    res.status(200).json({
      message: 'Đánh dấu tất cả notifications đã đọc thành công.',
      data: { updatedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [DELETE] /api/v1/notifications/:id
 * Xóa một notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await notificationService.deleteNotification(parseInt(id), userId);
    
    res.status(200).json({
      message: 'Xóa notification thành công.',
    });
  } catch (error) {
    if (error.message === 'Notification không tồn tại') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * [DELETE] /api/v1/notifications/read-all
 * Xóa tất cả notifications đã đọc
 */
const deleteAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deletedCount = await notificationService.deleteAllRead(userId);
    
    res.status(200).json({
      message: 'Xóa tất cả notifications đã đọc thành công.',
      data: { deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
};

