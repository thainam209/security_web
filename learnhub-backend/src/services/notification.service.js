const { notifications } = require('../models');

/**
 * Tạo một notification mới
 * @param {number} userId - ID của người dùng nhận notification
 * @param {string} message - Nội dung thông báo
 * @returns {Promise<Object>} Notification object
 */
const createNotification = async (userId, message) => {
  const notification = await notifications.create({
    userid: userId,
    message: message,
    isread: false,
  });
  return notification;
};

/**
 * Lấy danh sách notifications của một user
 * @param {number} userId - ID của người dùng
 * @param {Object} options - Options: { read, type, page, limit }
 * @returns {Promise<Object>} { notifications, total, page, limit }
 */
const getNotificationsByUserId = async (userId, options = {}) => {
  const {
    read = null, // null = all, true = read only, false = unread only
    page = 1,
    limit = 20,
  } = options;

  const where = { userid: userId };
  if (read !== null) {
    where.isread = read;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await notifications.findAndCountAll({
    where,
    order: [['createdat', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    notifications: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit),
  };
};

/**
 * Lấy số lượng notifications chưa đọc của một user
 * @param {number} userId - ID của người dùng
 * @returns {Promise<number>} Số lượng notifications chưa đọc
 */
const getUnreadCount = async (userId) => {
  const count = await notifications.count({
    where: {
      userid: userId,
      isread: false,
    },
  });
  return count;
};

/**
 * Lấy một notification theo ID
 * @param {number} notificationId - ID của notification
 * @param {number} userId - ID của người dùng (để đảm bảo chỉ lấy notification của user đó)
 * @returns {Promise<Object>} Notification object
 */
const getNotificationById = async (notificationId, userId) => {
  const notification = await notifications.findOne({
    where: {
      notificationid: notificationId,
      userid: userId,
    },
  });
  return notification;
};

/**
 * Đánh dấu một notification là đã đọc
 * @param {number} notificationId - ID của notification
 * @param {number} userId - ID của người dùng
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await notifications.findOne({
    where: {
      notificationid: notificationId,
      userid: userId,
    },
  });

  if (!notification) {
    throw new Error('Notification không tồn tại');
  }

  notification.isread = true;
  await notification.save();
  return notification;
};

/**
 * Đánh dấu tất cả notifications của user là đã đọc
 * @param {number} userId - ID của người dùng
 * @returns {Promise<number>} Số lượng notifications đã được đánh dấu
 */
const markAllAsRead = async (userId) => {
  const [updatedCount] = await notifications.update(
    { isread: true },
    {
      where: {
        userid: userId,
        isread: false,
      },
    }
  );
  return updatedCount;
};

/**
 * Xóa một notification
 * @param {number} notificationId - ID của notification
 * @param {number} userId - ID của người dùng
 * @returns {Promise<number>} Số lượng notifications đã xóa
 */
const deleteNotification = async (notificationId, userId) => {
  const deletedCount = await notifications.destroy({
    where: {
      notificationid: notificationId,
      userid: userId,
    },
  });

  if (deletedCount === 0) {
    throw new Error('Notification không tồn tại');
  }

  return deletedCount;
};

/**
 * Xóa tất cả notifications đã đọc của user
 * @param {number} userId - ID của người dùng
 * @returns {Promise<number>} Số lượng notifications đã xóa
 */
const deleteAllRead = async (userId) => {
  const deletedCount = await notifications.destroy({
    where: {
      userid: userId,
      isread: true,
    },
  });
  return deletedCount;
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
};

