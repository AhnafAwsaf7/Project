import mongoose from 'mongoose';

const pitchSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign is required'],
    },
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Entrepreneur is required'],
    },
    pitchDeckUrl: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'FUNDED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
pitchSchema.index({ campaign: 1, status: 1 });
pitchSchema.index({ entrepreneur: 1, status: 1 });
pitchSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate pitches from same entrepreneur to same campaign
pitchSchema.index({ campaign: 1, entrepreneur: 1 }, { unique: true });

const Pitch = mongoose.model('Pitch', pitchSchema);

export default Pitch;






