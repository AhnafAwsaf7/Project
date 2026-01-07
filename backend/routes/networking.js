import express from 'express';
import { body, validationResult } from 'express-validator';
import PartnershipRequest from '../models/PartnershipRequest.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

// Validation middleware
const validTypes = ['PARTNERSHIP_INQUIRY', 'FUNDING_INQUIRY', 'PARTNERSHIP', 'FUNDING'];
const normalizeType = (type) => {
  if (type === 'PARTNERSHIP') return 'PARTNERSHIP_INQUIRY';
  if (type === 'FUNDING') return 'FUNDING_INQUIRY';
  return type;
};

const validatePartnershipRequest = [
  body('toUserId').notEmpty().withMessage('To user ID is required'),
  body('type')
    .isIn(validTypes)
    .withMessage('Type must be PARTNERSHIP or FUNDING'),
  body('message').optional().trim(),
];

// @route   POST /api/networking/request
// @desc    Create a new partnership/funding request (any authenticated user)
// @access  Private
router.post('/request', protect, validatePartnershipRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { toUserId, type, message } = req.body;
    const normalizedType = normalizeType(type);

    // Check if target user exists
    const toUser = await User.findById(toUserId);
    if (!toUser || !toUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found or inactive',
      });
    }

    // Prevent self-requests
    if (toUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send request to yourself',
      });
    }

    // Check if there's already a pending request
    const existingRequest = await PartnershipRequest.findOne({
      fromUserId: req.user._id,
      toUserId,
      status: 'PENDING',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request with this user',
      });
    }

    const partnershipRequest = await PartnershipRequest.create({
      fromUserId: req.user._id,
      toUserId,
      type: normalizedType,
      message: message || '',
      status: 'PENDING',
    });

    const populatedRequest = await PartnershipRequest.findById(partnershipRequest._id)
      .populate('fromUserId', 'name email role')
      .populate('toUserId', 'name email role');

    // Create notification for recipient
    await createNotification({
      recipientId: toUserId,
      type: 'NETWORK_REQUEST',
      message: `${req.user.name} sent you a ${normalizedType === 'FUNDING_INQUIRY' ? 'funding' : 'partnership'} request`,
      relatedLinkId: partnershipRequest._id.toString(),
      relatedLinkType: 'NETWORK_REQUEST',
    });

    res.status(201).json({
      success: true,
      message: 'Request sent successfully',
      data: { partnershipRequest: populatedRequest },
    });
  } catch (error) {
    console.error('Create partnership request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/networking/entrepreneur/partnership-request
// @desc    Entrepreneurs send partnership/funding requests to investors or mentors
// @access  Private (Entrepreneur)
router.post(
  '/entrepreneur/partnership-request',
  protect,
  authorize('ENTREPRENEUR'),
  validatePartnershipRequest,
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

      const { toUserId, type, message } = req.body;
      const normalizedType = normalizeType(type);

      // Recipient must be investor or mentor
      const toUser = await User.findById(toUserId);
      if (!toUser || !toUser.isActive || !['INVESTOR', 'MENTOR'].includes(toUser.role)) {
        return res.status(404).json({
          success: false,
          message: 'Target user must be an active investor or mentor',
        });
      }

      // Prevent self-requests
      if (toUserId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot send request to yourself',
        });
      }

      // Check if there's already a pending request
      const existingRequest = await PartnershipRequest.findOne({
        fromUserId: req.user._id,
        toUserId,
        status: 'PENDING',
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request with this user',
        });
      }

      const partnershipRequest = await PartnershipRequest.create({
        fromUserId: req.user._id,
        toUserId,
        type: normalizedType,
        message: message || '',
        status: 'PENDING',
      });

      const populatedRequest = await PartnershipRequest.findById(partnershipRequest._id)
        .populate('fromUserId', 'name email role')
        .populate('toUserId', 'name email role');

      await createNotification({
        recipientId: toUserId,
        type: 'NETWORK_REQUEST',
        message: `${req.user.name} sent you a ${normalizedType === 'FUNDING_INQUIRY' ? 'funding' : 'partnership'} request`,
        relatedLinkId: partnershipRequest._id.toString(),
        relatedLinkType: 'NETWORK_REQUEST',
      });

      res.status(201).json({
        success: true,
        message: 'Entrepreneur request sent successfully',
        data: { partnershipRequest: populatedRequest },
      });
    } catch (error) {
      console.error('Entrepreneur partnership request error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/networking/users
// @desc    Get list of users for networking (excluding current user)
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
    })
      .select('name email role profile.bio profile.entrepreneurData profile.investorData profile.mentorData')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent too many results

    res.json({
      success: true,
      data: { users },
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

// @route   GET /api/networking/requests/incoming
// @desc    Get incoming partnership requests
// @access  Private
router.get('/requests/incoming', protect, async (req, res) => {
  try {
    const requests = await PartnershipRequest.find({ toUserId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('fromUserId', 'name email role profile');

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    console.error('Get incoming requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/networking/requests/outgoing
// @desc    Get outgoing partnership requests
// @access  Private
router.get('/requests/outgoing', protect, async (req, res) => {
  try {
    const requests = await PartnershipRequest.find({ fromUserId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('toUserId', 'name email role profile');

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    console.error('Get outgoing requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/networking/requests/:id/status
// @desc    Update partnership request status (Accept/Decline)
// @access  Private
router.patch('/requests/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be ACCEPTED or DECLINED',
      });
    }

    const request = await PartnershipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found',
      });
    }

    // Check if user is the recipient
    if (request.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request is not in pending status',
      });
    }

    request.status = status;
    await request.save();

    const populatedRequest = await PartnershipRequest.findById(request._id)
      .populate('fromUserId', 'name email role')
      .populate('toUserId', 'name email role');

    // Create notification for sender
    await createNotification({
      recipientId: request.fromUserId,
      type: 'NETWORK_REQUEST',
      message: `${req.user.name} ${status === 'ACCEPTED' ? 'accepted' : 'declined'} your ${request.type === 'FUNDING_INQUIRY' ? 'funding' : 'partnership'} request`,
      relatedLinkId: request._id.toString(),
      relatedLinkType: 'NETWORK_REQUEST',
    });

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: { partnershipRequest: populatedRequest },
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;






