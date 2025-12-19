import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema(
  {
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Entrepreneur is required'],
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'COMPLETED'],
      default: 'PENDING',
    },
    scheduledDate: {
      type: Date,
    },
    sessionNotes: {
      type: String,
      trim: true,
    },
    feedbackScore: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
mentorshipRequestSchema.index({ entrepreneur: 1, status: 1 });
mentorshipRequestSchema.index({ mentor: 1, status: 1 });
mentorshipRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate requests from same entrepreneur to same mentor
mentorshipRequestSchema.index({ entrepreneur: 1, mentor: 1, status: 'PENDING' }, { unique: true });

const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);

export default MentorshipRequest;






