import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import VerificationDocument from '../models/VerificationDocument.js';
import Session from '../models/Session.js';
import SessionFeedback from '../models/SessionFeedback.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Campaign from '../models/Campaign.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Pending verifications
    const pendingVerifications = await User.countDocuments({
      verificationStatus: { $in: ['UNVERIFIED', 'PENDING'] },
    });

    // Active mentorships (ACCEPTED, SCHEDULED)
    const activeMentorships = await MentorshipRequest.countDocuments({
      status: { $in: ['ACCEPTED', 'SCHEDULED'] },
    });

    // Active campaigns
    const activeCampaigns = await Campaign.countDocuments({
      status: 'OPEN',
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        pendingVerifications,
        activeMentorships,
        activeCampaigns,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/verification-queue
// @desc    Get list of users pending verification (UNVERIFIED and PENDING)
// @access  Private (Admin only)
router.get('/verification-queue', async (req, res) => {
  try {
    const pendingUsers = await User.find({
      verificationStatus: { $in: ['UNVERIFIED', 'PENDING'] },
    })
      .select('name email role verificationStatus verificationMethod createdAt')
      .sort({ createdAt: -1 });

    // Get verification documents for each user
    const queueWithDocs = await Promise.all(
      pendingUsers.map(async (user) => {
        const verificationDoc = await VerificationDocument.findOne({
          user: user._id,
        })
          .sort({ createdAt: -1 })
          .populate('user', 'name email role');

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
          verificationMethod: user.verificationMethod || 'NONE',
          submittedAt: verificationDoc?.createdAt || user.createdAt,
          verificationDocument: verificationDoc
            ? {
                id: verificationDoc._id,
                fileUrl: verificationDoc.fileUrl,
                domain: verificationDoc.domain,
                documentType: verificationDoc.documentType,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data: {
        queue: queueWithDocs,
        count: queueWithDocs.length,
      },
    });
  } catch (error) {
    console.error('Get verification queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (for admin user management)
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/admin/users/:userId/toggle-active
// @desc    Toggle user active status
// @access  Private (Admin only)
router.patch('/users/:userId/toggle-active', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Toggle user active status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/admin/users/:userId/verification
// @desc    Update user verification status (for direct admin approval/rejection)
// @access  Private (Admin only)
router.patch(
  '/users/:userId/verification',
  [
    body('verificationStatus')
      .isIn(['VERIFIED', 'REJECTED', 'UNVERIFIED'])
      .withMessage('Verification status must be VERIFIED, REJECTED, or UNVERIFIED'),
    body('rejectionReason')
      .optional()
      .trim(),
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

      const { userId } = req.params;
      const { verificationStatus, rejectionReason } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent admin from changing their own verification status
      if (userId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own verification status',
        });
      }

      user.verificationStatus = verificationStatus;
      if (verificationStatus === 'REJECTED' && rejectionReason) {
        user.verificationRejectionReason = rejectionReason;
      } else if (verificationStatus === 'VERIFIED') {
        user.verificationRejectionReason = null;
      }

      await user.save();

      res.json({
        success: true,
        message: `User verification status updated to ${verificationStatus}`,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            verificationStatus: user.verificationStatus,
            verificationRejectionReason: user.verificationRejectionReason,
          },
        },
      });
    } catch (error) {
      console.error('Update user verification status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   PATCH /api/admin/verification/:userId/decide
// @desc    Approve or reject user verification
// @access  Private (Admin only)
router.patch(
  '/verification/:userId/decide',
  [
    body('decision')
      .isIn(['VERIFIED', 'REJECTED'])
      .withMessage('Decision must be either VERIFIED or REJECTED'),
    body('rejectionReason')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Rejection reason is required when rejecting'),
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

      const { userId } = req.params;
      const { decision, rejectionReason } = req.body;

      // Validate rejection reason if rejecting
      if (decision === 'REJECTED' && !rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting verification',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.verificationStatus !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `User verification status is ${user.verificationStatus}, not PENDING`,
        });
      }

      // Update user verification status
      user.verificationStatus = decision;
      if (decision === 'REJECTED') {
        user.verificationRejectionReason = rejectionReason;
        user.verificationMethod = 'NONE'; // Reset method on rejection
      }

      await user.save();

      // Update verification document
      const verificationDoc = await VerificationDocument.findOne({
        user: userId,
      }).sort({ createdAt: -1 });

      if (verificationDoc) {
        verificationDoc.reviewedAt = new Date();
        verificationDoc.reviewedBy = req.user._id;
        await verificationDoc.save();
      }

      res.json({
        success: true,
        message: `User verification ${decision.toLowerCase()} successfully`,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            verificationStatus: user.verificationStatus,
            verificationRejectionReason: user.verificationRejectionReason,
          },
        },
      });
    } catch (error) {
      console.error('Decide verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   PATCH /api/admin/users/:userId/duplicate
// @desc    Flag or clear a duplicate user record
// @access  Private (Admin only)
router.patch(
  '/users/:userId/duplicate',
  [
    body('isDuplicate').isBoolean().withMessage('isDuplicate must be a boolean'),
    body('duplicateOf').optional().trim(),
    body('duplicateEmail').optional().trim().isEmail().withMessage('duplicateEmail must be a valid email'),
    body('duplicateNotes').optional().trim(),
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

      const { userId } = req.params;
      const { isDuplicate, duplicateOf, duplicateEmail, duplicateNotes } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!isDuplicate) {
        user.isDuplicate = false;
        user.duplicateOf = null;
        user.duplicateNotes = null;
        await user.save();
        return res.json({
          success: true,
          message: 'Duplicate flag cleared',
          data: { user },
        });
      }

      let duplicateUser = null;
      if (duplicateOf) {
        duplicateUser = await User.findById(duplicateOf);
      } else if (duplicateEmail) {
        duplicateUser = await User.findOne({ email: duplicateEmail.toLowerCase().trim() });
      }

      if (!duplicateUser) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate user reference not found',
        });
      }

      if (duplicateUser._id.toString() === user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'User cannot be marked as duplicate of themselves',
        });
      }

      user.isDuplicate = true;
      user.duplicateOf = duplicateUser._id;
      user.duplicateNotes = duplicateNotes || null;
      await user.save();

      res.json({
        success: true,
        message: 'User flagged as duplicate',
        data: { user },
      });
    } catch (error) {
      console.error('Update duplicate flag error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/admin/analytics/registrations
// @desc    Registration & verification trends (role-wise)
// @access  Private (Admin only)
router.get('/analytics/registrations', async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total registrations by role
    const totalByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Verification status by role
    const verificationByRole = await User.aggregate([
      {
        $group: {
          _id: { role: '$role', verificationStatus: '$verificationStatus' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Last 30 days registrations by day
    const last30Days = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalByRole,
        verificationByRole,
        last30Days,
      },
    });
  } catch (error) {
    console.error('Registration analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/mentorship/overview
// @desc    Admin view of mentorship sessions and feedback
// @access  Private (Admin only)
router.get('/mentorship/overview', async (_req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ createdAt: -1 })
      .populate('mentor', 'name email role')
      .populate('entrepreneur', 'name email role')
      .populate('mentorshipRequest', 'topic status');

    const feedbacks = await SessionFeedback.find()
      .populate('session', 'mentor entrepreneur scheduledAt')
      .select('-__v');

    res.json({
      success: true,
      data: {
        sessions,
        feedbacks,
      },
    });
  } catch (error) {
    console.error('Mentorship overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;




