import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      enum: [
        'OFFER',
        'MENTORSHIP_UPDATE',
        'CAMPAIGN_UPDATE',
        'EVENT_REMINDER',
        'NETWORK_REQUEST',
        'PITCH_UPDATE',
        'VERIFICATION_UPDATE',
      ],
      required: [true, 'Notification type is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    relatedLinkId: {
      type: String,
      trim: true,
    },
    relatedLinkType: {
      type: String,
      enum: ['PITCH', 'CAMPAIGN', 'MENTORSHIP', 'EVENT', 'NETWORK_REQUEST', 'PROFILE'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;








