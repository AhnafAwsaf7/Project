import mongoose from 'mongoose';

const eventParticipationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VirtualPitchEvent',
      required: [true, 'Event ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'ATTENDED'],
      default: 'REGISTERED',
    },
    // Role the user is taking during the event (may differ from their account role)
    roleAtEvent: {
      type: String,
      enum: ['ENTREPRENEUR', 'INVESTOR', 'MENTOR', 'ADMIN'],
    },
    attended: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
    },
    // Engagement score (0-100) to track participation quality
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
eventParticipationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventParticipationSchema.index({ eventId: 1, status: 1 });
eventParticipationSchema.index({ eventId: 1, attended: 1 });
eventParticipationSchema.index({ userId: 1 });

const EventParticipation = mongoose.model('EventParticipation', eventParticipationSchema);

export default EventParticipation;






