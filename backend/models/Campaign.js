import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor is required'],
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount must be positive'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    industryFocus: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'FUNDED'],
      default: 'OPEN',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
campaignSchema.index({ investor: 1, status: 1 });
campaignSchema.index({ status: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;






