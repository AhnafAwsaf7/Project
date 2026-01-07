import mongoose from 'mongoose';

const verificationDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    fileUrl: {
      type: String,
      required: function() {
        // Only require fileUrl if documentType is not DOMAIN_VERIFICATION
        return this.documentType !== 'DOMAIN_VERIFICATION';
      },
      default: null,
    },
    documentType: {
      type: String,
      enum: ['BUSINESS_LICENSE', 'ID_PROOF', 'DOMAIN_VERIFICATION'],
      required: [true, 'Document type is required'],
    },
    domain: {
      type: String,
      required: function() {
        // Only require domain if documentType is DOMAIN_VERIFICATION
        return this.documentType === 'DOMAIN_VERIFICATION';
      },
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);

export default VerificationDocument;


