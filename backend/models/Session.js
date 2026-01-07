import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    mentorshipRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorshipRequest',
      required: true,
      unique: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMin: {
      type: Number,
      required: true,
      min: 1,
    },
    meetingLink: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

sessionSchema.index({ mentor: 1, scheduledAt: -1 });
sessionSchema.index({ entrepreneur: 1, scheduledAt: -1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;



