import Notification from '../models/Notification.js';

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {String} options.recipientId - User ID who will receive the notification
 * @param {String} options.type - Notification type (OFFER, MENTORSHIP_UPDATE, etc.)
 * @param {String} options.message - Notification message
 * @param {String} options.relatedLinkId - Optional ID of related entity
 * @param {String} options.relatedLinkType - Optional type of related entity
 */
export const createNotification = async ({
  recipientId,
  type,
  message,
  relatedLinkId = null,
  relatedLinkType = null,
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      type,
      message,
      relatedLinkId,
      relatedLinkType,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw error - notifications shouldn't break the main flow
    return null;
  }
};

/**
 * Create notifications for multiple recipients
 */
export const createNotifications = async (notifications) => {
  try {
    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error('Error creating notifications:', error);
    return [];
  }
};






