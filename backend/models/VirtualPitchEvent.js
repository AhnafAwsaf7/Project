import mongoose from 'mongoose';

const virtualPitchEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
virtualPitchEventSchema.index({ scheduledAt: 1 });
virtualPitchEventSchema.index({ createdBy: 1 });

const VirtualPitchEvent = mongoose.model('VirtualPitchEvent', virtualPitchEventSchema);

export default VirtualPitchEvent;






