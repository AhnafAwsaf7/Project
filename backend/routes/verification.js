import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import VerificationDocument from '../models/VerificationDocument.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { getFileUrl } from '../middleware/upload.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/verification/submit-domain
// @desc    Submit domain for verification
// @access  Private (Startup/Investor only)
router.post(
  '/submit-domain',
  protect,
  [
    body('domain')
      .trim()
      .notEmpty()
      .withMessage('Domain is required')
      .custom((value) => {
        // Remove http://, https://, www. if present
        let cleanDomain = value.toLowerCase().trim();
        cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
        cleanDomain = cleanDomain.replace(/^www\./, '');
        cleanDomain = cleanDomain.replace(/\/$/, ''); // Remove trailing slash
        
        // Validate domain format - more flexible regex
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        if (!domainRegex.test(cleanDomain)) {
          throw new Error('Please provide a valid domain (e.g., example.com)');
        }
        return true;
      })
      .customSanitizer((value) => {
        // Clean and normalize the domain
        let cleanDomain = value.toLowerCase().trim();
        cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
        cleanDomain = cleanDomain.replace(/^www\./, '');
        cleanDomain = cleanDomain.replace(/\/$/, '');
        return cleanDomain;
      }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user role requires verification
      if (!['ENTREPRENEUR', 'INVESTOR'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Domain verification is only available for Entrepreneurs and Investors',
        });
      }

      // Check if already verified
      if (user.verificationStatus === 'VERIFIED') {
        return res.status(400).json({
          success: false,
          message: 'User is already verified',
        });
      }

      // Get sanitized domain from request (already cleaned by customSanitizer)
      const domain = req.body.domain;

      console.log('Domain verification request:', { userId: user._id, domain, role: user.role });

      // Create verification document record
      const verificationDoc = await VerificationDocument.create({
        user: user._id,
        fileUrl: null, // No file for domain verification
        documentType: 'DOMAIN_VERIFICATION',
        domain: domain, // This is already sanitized
      });

      // Update user verification status
      user.verificationStatus = 'PENDING';
      user.verificationMethod = 'DOMAIN';
      await user.save();

      console.log('Domain verification submitted successfully:', { verificationId: verificationDoc._id });

      res.json({
        success: true,
        message: 'Domain submitted for verification. Our team will review it within 24-48 hours.',
        data: {
          verificationStatus: user.verificationStatus,
          verificationMethod: user.verificationMethod,
          verificationId: verificationDoc._id,
        },
      });
    } catch (error) {
      console.error('Submit domain error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId: req.user?._id,
        domain: req.body?.domain,
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Server error during domain submission',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/verification/upload-document
// @desc    Upload verification document
// @access  Private (Startup/Investor only)
router.post(
  '/upload-document',
  protect,
  upload.single('document'),
  [
    body('documentType')
      .optional()
      .isIn(['BUSINESS_LICENSE', 'ID_PROOF'])
      .withMessage('Invalid document type'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a document file',
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user role requires verification
      if (!['ENTREPRENEUR', 'INVESTOR'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Document verification is only available for Entrepreneurs and Investors',
        });
      }

      // Check if already verified
      if (user.verificationStatus === 'VERIFIED') {
        return res.status(400).json({
          success: false,
          message: 'User is already verified',
        });
      }

      const documentType = req.body.documentType || 'BUSINESS_LICENSE';
      const fileUrl = getFileUrl(req.file.filename);

      // Create verification document record
      const verificationDoc = await VerificationDocument.create({
        user: user._id,
        fileUrl: fileUrl,
        documentType: documentType,
      });

      // Update user verification status
      user.verificationStatus = 'PENDING';
      user.verificationMethod = 'DOCUMENT';
      await user.save();

      res.json({
        success: true,
        message: 'Document uploaded successfully. Our team will review it within 24-48 hours.',
        data: {
          verificationStatus: user.verificationStatus,
          verificationMethod: user.verificationMethod,
          verificationId: verificationDoc._id,
          fileUrl: fileUrl,
        },
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;


