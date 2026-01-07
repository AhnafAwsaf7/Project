import express from 'express';
import { body, validationResult } from 'express-validator';
import Pitch from '../models/Pitch.js';
import Campaign from '../models/Campaign.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for pitch deck uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/pitch-decks'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `pitch-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PPT, PPTX, DOC, DOCX are allowed.'));
    }
  },
});

const router = express.Router();

// Validation middleware
const validatePitch = [
  body('campaignId').notEmpty().withMessage('Campaign ID is required'),
  body('message').optional().trim(),
];

// @route   POST /api/pitches
// @desc    Submit a pitch to a campaign (Entrepreneur only)
// @access  Private (Entrepreneur)
router.post(
  '/',
  protect,
  authorize('ENTREPRENEUR'),
  upload.single('pitchDeck'),
  validatePitch,
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

      const { campaignId, message } = req.body;

      // Check if campaign exists and is open
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found',
        });
      }

      if (campaign.status !== 'OPEN') {
        return res.status(400).json({
          success: false,
          message: 'Campaign is not open for pitches',
        });
      }

      // Check if entrepreneur already submitted a pitch to this campaign
      const existingPitch = await Pitch.findOne({
        campaign: campaignId,
        entrepreneur: req.user._id,
      });

      if (existingPitch) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a pitch to this campaign',
        });
      }

      // Build pitch deck URL if file was uploaded
      let pitchDeckUrl = null;
      if (req.file) {
        pitchDeckUrl = `/uploads/pitch-decks/${req.file.filename}`;
      }

      const pitch = await Pitch.create({
        campaign: campaignId,
        entrepreneur: req.user._id,
        pitchDeckUrl,
        message: message || '',
        status: 'PENDING',
      });

      const populatedPitch = await Pitch.findById(pitch._id)
        .populate('campaign', 'title investor')
        .populate('entrepreneur', 'name email');

      // Create notification for investor
      if (populatedPitch.campaign?.investor) {
        await createNotification({
          recipientId: populatedPitch.campaign.investor._id || populatedPitch.campaign.investor,
          type: 'CAMPAIGN_UPDATE',
          message: `New pitch submitted for "${populatedPitch.campaign.title}"`,
          relatedLinkId: pitch._id.toString(),
          relatedLinkType: 'PITCH',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Pitch submitted successfully',
        data: { pitch: populatedPitch },
      });
    } catch (error) {
      console.error('Submit pitch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/pitches/stats
// @desc    Get entrepreneur pitch statistics
// @access  Private (Entrepreneur)
router.get('/stats', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    const entrepreneurId = req.user._id;

    // Count active pitches (PENDING, REVIEWED)
    const activePitches = await Pitch.countDocuments({
      entrepreneur: entrepreneurId,
      status: { $in: ['PENDING', 'REVIEWED'] },
    });

    res.json({
      success: true,
      data: { activePitches },
    });
  } catch (error) {
    console.error('Get pitch stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/pitches/my
// @desc    Get all pitches submitted by current entrepreneur
// @access  Private (Entrepreneur)
router.get('/my', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    const pitches = await Pitch.find({ entrepreneur: req.user._id })
      .sort({ createdAt: -1 })
      .populate('campaign', 'title investor status')
      .populate('campaign.investor', 'name email');

    res.json({
      success: true,
      data: { pitches },
    });
  } catch (error) {
    console.error('Get my pitches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/pitches/:id/status
// @desc    Update pitch status (Investor only)
// @access  Private (Investor)
router.patch('/:id/status', protect, authorize('INVESTOR'), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['PENDING', 'REVIEWED', 'FUNDED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be PENDING, REVIEWED, FUNDED, or REJECTED',
      });
    }

    const pitch = await Pitch.findById(req.params.id).populate('campaign');

    if (!pitch) {
      return res.status(404).json({
        success: false,
        message: 'Pitch not found',
      });
    }

    // Check if the investor owns the campaign
    if (pitch.campaign.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pitch',
      });
    }

    pitch.status = status;
    if (reviewNotes !== undefined) {
      pitch.reviewNotes = reviewNotes;
    }

    await pitch.save();

    const updatedPitch = await Pitch.findById(pitch._id)
      .populate('campaign', 'title investor')
      .populate('entrepreneur', 'name email');

    // Create notification for entrepreneur
    let notificationMessage = '';
    if (status === 'REVIEWED') {
      notificationMessage = `Your pitch for "${pitch.campaign.title}" has been reviewed`;
    } else if (status === 'FUNDED') {
      notificationMessage = `🎉 Congratulations! Your pitch for "${pitch.campaign.title}" has been funded!`;
    } else if (status === 'REJECTED') {
      notificationMessage = `Your pitch for "${pitch.campaign.title}" was not selected`;
    }

    if (notificationMessage && updatedPitch.entrepreneur) {
      await createNotification({
        recipientId: updatedPitch.entrepreneur._id,
        type: 'PITCH_UPDATE',
        message: notificationMessage,
        relatedLinkId: pitch._id.toString(),
        relatedLinkType: 'PITCH',
      });
    }

    res.json({
      success: true,
      message: 'Pitch status updated',
      data: { pitch: updatedPitch },
    });
  } catch (error) {
    console.error('Update pitch status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/pitches/:id
// @desc    Get a single pitch by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id)
      .populate('campaign', 'title investor status')
      .populate('campaign.investor', 'name email')
      .populate('entrepreneur', 'name email profile.entrepreneurData.startupName');

    if (!pitch) {
      return res.status(404).json({
        success: false,
        message: 'Pitch not found',
      });
    }

    // Check authorization - entrepreneur can see their own, investor can see pitches for their campaigns
    const isEntrepreneur = pitch.entrepreneur._id.toString() === req.user._id.toString();
    const isInvestor = pitch.campaign.investor._id.toString() === req.user._id.toString();

    if (!isEntrepreneur && !isInvestor && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this pitch',
      });
    }

    res.json({
      success: true,
      data: { pitch },
    });
  } catch (error) {
    console.error('Get pitch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

