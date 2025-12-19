import mongoose from 'mongoose';

const sessionFeedbackSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

sessionFeedbackSchema.index({ mentor: 1 });
sessionFeedbackSchema.index({ entrepreneur: 1 });

const SessionFeedback = mongoose.model('SessionFeedback', sessionFeedbackSchema);

export default SessionFeedback;

