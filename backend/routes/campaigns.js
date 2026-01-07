import express from 'express';
import { body, validationResult } from 'express-validator';
import Campaign from '../models/Campaign.js';
import Pitch from '../models/Pitch.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotifications } from '../utils/notifications.js';
import User from '../models/User.js';

const router = express.Router();

// Validation middleware
const validateCampaign = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('targetAmount')
    .isNumeric()
    .withMessage('Target amount must be a number')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('Target amount must be greater than 0');
      }
      return true;
    }),
  body('durationDays')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),
  body('industryFocus').optional().trim(),
];

// @route   POST /api/campaigns
// @desc    Create a new campaign (Investor only)
// @access  Private (Investor)
router.post('/', protect, authorize('INVESTOR'), validateCampaign, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, description, targetAmount, durationDays, industryFocus } = req.body;

    const campaign = await Campaign.create({
      investor: req.user._id,
      title,
      description,
      targetAmount,
      durationDays,
      industryFocus,
      status: 'OPEN',
    });

    const users = await User.find({
      isActive: true,
      role: { $ne: 'ADMIN' },
      _id: { $ne: req.user._id },
    }).select('_id');

    const notifications = users.map((user) => ({
      recipientId: user._id,
      type: 'CAMPAIGN_UPDATE',
      message: `New campaign: "${title}" is now open for pitches`,
      relatedLinkId: campaign._id.toString(),
      relatedLinkType: 'CAMPAIGN',
    }));

    await createNotifications(notifications);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign },
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/campaigns/my
// @desc    Get all campaigns created by current investor
// @access  Private (Investor)
router.get('/my', protect, authorize('INVESTOR'), async (req, res) => {
  try {
    const campaigns = await Campaign.find({ investor: req.user._id })
      .sort({ createdAt: -1 })
      .populate('investor', 'name email');

    res.json({
      success: true,
      data: { campaigns },
    });
  } catch (error) {
    console.error('Get my campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/campaigns/stats/entrepreneur
// @desc    Get entrepreneur campaign statistics
// @access  Private (Entrepreneur)
router.get('/stats/entrepreneur', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    // Count available (OPEN) campaigns
    const availableCampaigns = await Campaign.countDocuments({ status: 'OPEN' });

    res.json({
      success: true,
      data: { availableCampaigns },
    });
  } catch (error) {
    console.error('Get entrepreneur campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/campaigns/stats/investor
// @desc    Get investor campaign statistics
// @access  Private (Investor)
router.get('/stats/investor', protect, authorize('INVESTOR'), async (req, res) => {
  try {
    const investorId = req.user._id;

    // Count active campaigns
    const activeCampaigns = await Campaign.countDocuments({
      investor: investorId,
      status: 'OPEN',
    });

    // Count pending pitches across all investor's campaigns
    const investorCampaigns = await Campaign.find({ investor: investorId }).select('_id');
    const campaignIds = investorCampaigns.map((c) => c._id);
    const pendingPitches = await Pitch.countDocuments({
      campaign: { $in: campaignIds },
      status: 'PENDING',
    });

    // Calculate total funded (sum of targetAmount for FUNDED campaigns)
    const fundedCampaigns = await Campaign.find({
      investor: investorId,
      status: 'FUNDED',
    });
    const totalFunded = fundedCampaigns.reduce((sum, campaign) => sum + (campaign.targetAmount || 0), 0);

    res.json({
      success: true,
      data: {
        activeCampaigns,
        pendingPitches,
        totalFunded,
      },
    });
  } catch (error) {
    console.error('Get investor campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/campaigns/active
// @desc    Get all active campaigns (for entrepreneurs to browse)
// @access  Private (Entrepreneur)
router.get('/active', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'OPEN' })
      .sort({ createdAt: -1 })
      .populate('investor', 'name email profile.investorData.companyName')
      .select('-__v');

    res.json({
      success: true,
      data: { campaigns },
    });
  } catch (error) {
    console.error('Get active campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/campaigns/:id
// @desc    Get a single campaign by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('investor', 'name email profile.investorData.companyName');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      data: { campaign },
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/campaigns/:id/pitches
// @desc    Get all pitches for a specific campaign
// @access  Private (Investor - owner of campaign)
router.get('/:id/pitches', protect, authorize('INVESTOR'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check if the investor owns this campaign
    if (campaign.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view pitches for this campaign',
      });
    }

    const pitches = await Pitch.find({ campaign: req.params.id })
      .sort({ createdAt: -1 })
      .populate('entrepreneur', 'name email profile.entrepreneurData.startupName');

    res.json({
      success: true,
      data: { pitches },
    });
  } catch (error) {
    console.error('Get pitches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/campaigns/:id/status
// @desc    Update campaign status
// @access  Private (Investor - owner)
router.patch('/:id/status', protect, authorize('INVESTOR'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['OPEN', 'CLOSED', 'FUNDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be OPEN, CLOSED, or FUNDED',
      });
    }

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check ownership
    if (campaign.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign',
      });
    }

    campaign.status = status;
    await campaign.save();

    res.json({
      success: true,
      message: 'Campaign status updated',
      data: { campaign },
    });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;








