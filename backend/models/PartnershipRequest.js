import mongoose from 'mongoose';

const partnershipRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'From user is required'],
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'To user is required'],
    },
    type: {
      type: String,
      enum: ['PARTNERSHIP_INQUIRY', 'FUNDING_INQUIRY'],
      required: [true, 'Request type is required'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
partnershipRequestSchema.index({ fromUserId: 1, status: 1 });
partnershipRequestSchema.index({ toUserId: 1, status: 1 });
partnershipRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate requests
partnershipRequestSchema.index({ fromUserId: 1, toUserId: 1, status: 'PENDING' }, { unique: true });

const PartnershipRequest = mongoose.model('PartnershipRequest', partnershipRequestSchema);

export default PartnershipRequest;






