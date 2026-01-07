import express from 'express';
import { body, validationResult } from 'express-validator';
import VirtualPitchEvent from '../models/VirtualPitchEvent.js';
import EventParticipation from '../models/EventParticipation.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification, createNotifications } from '../utils/notifications.js';
import User from '../models/User.js';

const router = express.Router();

// Validation middleware
const validateEvent = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('scheduledAt').isISO8601().withMessage('Scheduled date must be a valid ISO 8601 date'),
  body('durationMinutes')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  body('meetingLink')
    .trim()
    .notEmpty()
    .withMessage('Meeting link is required')
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
];

// @route   POST /api/events
// @desc    Create a new virtual pitch event (Admin only)
// @access  Private (Admin)
router.post('/', protect, authorize('ADMIN'), validateEvent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, description, scheduledAt, durationMinutes, meetingLink } = req.body;

    // Check if scheduled date is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future',
      });
    }

    const event = await VirtualPitchEvent.create({
      title,
      description,
      scheduledAt: scheduledDate,
      durationMinutes,
      meetingLink,
      createdBy: req.user._id,
    });

    const populatedEvent = await VirtualPitchEvent.findById(event._id)
      .populate('createdBy', 'name email');

    // Create notifications for all active users (except admin)
    const users = await User.find({ isActive: true, role: { $ne: 'ADMIN' } }).select('_id');
    const notifications = users.map((user) => ({
      recipientId: user._id,
      type: 'EVENT_REMINDER',
      message: `New event: "${title}" scheduled for ${scheduledDate.toLocaleString()}`,
      relatedLinkId: event._id.toString(),
      relatedLinkType: 'EVENT',
    }));

    await createNotifications(notifications);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: populatedEvent },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/events
// @desc    Get all upcoming events
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const events = await VirtualPitchEvent.find({
      scheduledAt: { $gte: now },
    })
      .sort({ scheduledAt: 1 })
      .populate('createdBy', 'name email')
      .select('-__v');

    // Check user's registration status for each event
    const eventsWithStatus = await Promise.all(
      events.map(async (event) => {
        const participation = await EventParticipation.findOne({
          eventId: event._id,
          userId: req.user._id,
        });
        return {
          ...event.toObject(),
          userStatus: participation ? participation.status : null,
          isRegistered: !!participation,
          engagementScore: participation?.engagementScore ?? null,
        };
      })
    );

    res.json({
      success: true,
      data: { events: eventsWithStatus },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await VirtualPitchEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if event is in the future
    if (event.scheduledAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events',
      });
    }

    // Check if already registered
    const existingParticipation = await EventParticipation.findOne({
      eventId: event._id,
      userId: req.user._id,
    });

    if (existingParticipation) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event',
      });
    }

    const participation = await EventParticipation.create({
      eventId: event._id,
      userId: req.user._id,
      status: 'REGISTERED',
    });

    res.status(201).json({
      success: true,
      message: 'Registered for event successfully',
      data: { participation },
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

const validateEngagement = [
  body('engagementScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Engagement score must be between 0 and 100'),
  body('roleAtEvent')
    .optional()
    .isIn(['ENTREPRENEUR', 'INVESTOR', 'MENTOR', 'ADMIN'])
    .withMessage('Invalid role at event'),
];

// @route   POST /api/events/:id/join
// @desc    Join an event (records attendance and returns meeting link)
// @access  Private
router.post('/:id/join', protect, validateEngagement, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const event = await VirtualPitchEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if event has started (allow joining 10 minutes before)
    const tenMinutesBefore = new Date(event.scheduledAt.getTime() - 10 * 60 * 1000);
    const now = new Date();

    if (now < tenMinutesBefore) {
      return res.status(400).json({
        success: false,
        message: 'Event has not started yet. You can join 10 minutes before the scheduled time.',
      });
    }

    // Check if event has ended
    const eventEnd = new Date(event.scheduledAt.getTime() + event.durationMinutes * 60 * 1000);
    if (now > eventEnd) {
      return res.status(400).json({
        success: false,
        message: 'Event has ended',
      });
    }

    // Find or create participation
    let participation = await EventParticipation.findOne({
      eventId: event._id,
      userId: req.user._id,
    });

    if (!participation) {
      // Auto-register if not already registered
      participation = await EventParticipation.create({
        eventId: event._id,
        userId: req.user._id,
        status: 'ATTENDED',
        joinedAt: now,
        attended: true,
        roleAtEvent: req.body.roleAtEvent || req.user.role,
        engagementScore: req.body.engagementScore,
      });
    } else {
      // Update to attended if not already
      if (participation.status !== 'ATTENDED') {
        participation.status = 'ATTENDED';
        participation.joinedAt = participation.joinedAt || now;
      }
      participation.attended = true;
      participation.roleAtEvent = req.body.roleAtEvent || participation.roleAtEvent || req.user.role;
      if (req.body.engagementScore !== undefined) {
        participation.engagementScore = req.body.engagementScore;
      }
      await participation.save();
    }

    res.json({
      success: true,
      message: 'Joining event',
      data: {
        meetingLink: event.meetingLink,
        participation,
      },
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/events/:id/engagement
// @desc    Update engagement score for an attended event
// @access  Private
router.patch(
  '/:id/engagement',
  protect,
  [body('engagementScore').isInt({ min: 0, max: 100 }).withMessage('Engagement score must be between 0 and 100')],
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

      const event = await VirtualPitchEvent.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      const participation = await EventParticipation.findOne({
        eventId: event._id,
        userId: req.user._id,
      });

      if (!participation || participation.status !== 'ATTENDED') {
        return res.status(400).json({
          success: false,
          message: 'You must attend the event before submitting engagement',
        });
      }

      participation.engagementScore = req.body.engagementScore;
      await participation.save();

      res.json({
        success: true,
        message: 'Engagement score updated',
        data: { participation },
      });
    } catch (error) {
      console.error('Update engagement error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/admin/events/analytics
// @desc    Get event analytics (Admin only)
// @access  Private (Admin)
router.get('/admin/analytics', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const events = await VirtualPitchEvent.find()
      .sort({ scheduledAt: -1 })
      .populate('createdBy', 'name email');

    const eventsWithAnalytics = await Promise.all(
      events.map(async (event) => {
        const registrations = await EventParticipation.countDocuments({
          eventId: event._id,
        });
        const attendees = await EventParticipation.countDocuments({
          eventId: event._id,
          attended: true,
        });
        const engagementScores = await EventParticipation.find({
          eventId: event._id,
          engagementScore: { $exists: true },
        }).select('engagementScore');
        const engagementAvg =
          engagementScores.length > 0
            ? (
                engagementScores.reduce((sum, record) => sum + (record.engagementScore || 0), 0) /
                engagementScores.length
              ).toFixed(2)
            : null;

        return {
          ...event.toObject(),
          registrations,
          attendees,
          attendanceRate: registrations > 0 ? ((attendees / registrations) * 100).toFixed(2) : 0,
          engagementAverage: engagementAvg,
        };
      })
    );

    res.json({
      success: true,
      data: { events: eventsWithAnalytics },
    });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/events/:id/registrations
// @desc    Get event registrations (Admin only)
// @access  Private (Admin)
router.get('/:id/registrations', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const event = await VirtualPitchEvent.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const registrations = await EventParticipation.find({ eventId: event._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role');

    res.json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          scheduledAt: event.scheduledAt,
          durationMinutes: event.durationMinutes,
          meetingLink: event.meetingLink,
          createdBy: event.createdBy,
        },
        registrations,
      },
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;




