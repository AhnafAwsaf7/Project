import express from 'express';
import { body, validationResult } from 'express-validator';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Session from '../models/Session.js';
import SessionFeedback from '../models/SessionFeedback.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

// Validation middleware
const validateMentorshipRequest = [
  body('mentorId').notEmpty().withMessage('Mentor ID is required'),
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('message').optional().trim(),
];

const validateSessionSchedule = [
  body('mentorshipRequestId').notEmpty().withMessage('Mentorship request ID is required'),
  body('scheduledAt').isISO8601().withMessage('scheduledAt must be a valid ISO date'),
  body('durationMin').isInt({ min: 1 }).withMessage('durationMin must be at least 1 minute'),
  body('meetingLink').trim().isURL().withMessage('meetingLink must be a valid URL'),
];

const validateFeedback = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comments').optional().trim(),
];

// @route   GET /api/mentors
// @desc    Get list of available mentors (for entrepreneurs)
// @access  Private (Entrepreneur)
router.get('/mentors', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    const mentors = await User.find({ role: 'MENTOR', isActive: true })
      .select('name email profile.mentorData profile.bio profile.achievements')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { mentors },
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/mentorship/request
// @desc    Send a mentorship request (Entrepreneur only)
// @access  Private (Entrepreneur)
router.post('/request', protect, authorize('ENTREPRENEUR'), validateMentorshipRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { mentorId, topic, message } = req.body;

    // Check if mentor exists and is active
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'MENTOR' || !mentor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found or not available',
      });
    }

    // Check if there's already a pending request
    const existingRequest = await MentorshipRequest.findOne({
      entrepreneur: req.user._id,
      mentor: mentorId,
      status: 'PENDING',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request with this mentor',
      });
    }

    const mentorshipRequest = await MentorshipRequest.create({
      entrepreneur: req.user._id,
      mentor: mentorId,
      topic,
      message: message || '',
      status: 'PENDING',
    });

    const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
      .populate('entrepreneur', 'name email')
      .populate('mentor', 'name email');

    // Create notification for mentor
    await createNotification({
      recipientId: mentorId,
      type: 'MENTORSHIP_UPDATE',
      message: `${req.user.name} sent you a mentorship request: "${topic}"`,
      relatedLinkId: mentorshipRequest._id.toString(),
      relatedLinkType: 'MENTORSHIP',
    });

    res.status(201).json({
      success: true,
      message: 'Mentorship request sent successfully',
      data: { mentorshipRequest: populatedRequest },
    });
  } catch (error) {
    console.error('Create mentorship request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/mentorship/requests/incoming
// @desc    Get incoming mentorship requests (Mentor only)
// @access  Private (Mentor)
router.get('/requests/incoming', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { mentor: req.user._id };
    if (status) {
      query.status = status;
    }

    const requests = await MentorshipRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('entrepreneur', 'name email profile.entrepreneurData.startupName profile.bio');

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

// @route   GET /api/mentorship/requests/my
// @desc    Get my mentorship requests (Entrepreneur only)
// @access  Private (Entrepreneur)
router.get('/requests/my', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ entrepreneur: req.user._id })
      .sort({ createdAt: -1 })
      .populate('mentor', 'name email profile.mentorData.specialization profile.mentorData.expertiseAreas');

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/mentorship/requests/:id/accept
// @desc    Accept a mentorship request (Mentor only)
// @access  Private (Mentor)
router.patch('/requests/:id/accept', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Check if the mentor owns this request
    if (request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request is not in pending status',
      });
    }

    request.status = 'ACCEPTED';
    await request.save();

    const populatedRequest = await MentorshipRequest.findById(request._id)
      .populate('entrepreneur', 'name email')
      .populate('mentor', 'name email');

    // Create notification for entrepreneur
    await createNotification({
      recipientId: request.entrepreneur,
      type: 'MENTORSHIP_UPDATE',
      message: `${req.user.name} accepted your mentorship request: "${request.topic}"`,
      relatedLinkId: request._id.toString(),
      relatedLinkType: 'MENTORSHIP',
    });

    res.json({
      success: true,
      message: 'Mentorship request accepted',
      data: { request: populatedRequest },
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/mentorship/sessions
// @desc    Schedule a mentorship session (Mentor only, for an accepted request)
// @access  Private (Mentor)
router.post('/sessions', protect, authorize('MENTOR'), validateSessionSchedule, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { mentorshipRequestId, scheduledAt, durationMin, meetingLink } = req.body;
    const request = await MentorshipRequest.findById(mentorshipRequestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    if (request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule this request',
      });
    }

    if (request.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'Request must be accepted before scheduling',
      });
    }

    const existingSession = await Session.findOne({ mentorshipRequest: mentorshipRequestId });
    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Session already scheduled for this request',
      });
    }

    const session = await Session.create({
      mentorshipRequest: mentorshipRequestId,
      mentor: request.mentor,
      entrepreneur: request.entrepreneur,
      scheduledAt: new Date(scheduledAt),
      durationMin,
      meetingLink,
      status: 'SCHEDULED',
    });

    // Notify entrepreneur
    await createNotification({
      recipientId: request.entrepreneur,
      type: 'MENTORSHIP_UPDATE',
      message: `${req.user.name} scheduled a session on ${new Date(scheduledAt).toLocaleString()}`,
      relatedLinkId: session._id.toString(),
      relatedLinkType: 'MENTORSHIP_SESSION',
    });

    res.status(201).json({
      success: true,
      message: 'Session scheduled successfully',
      data: { session },
    });
  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/mentorship/entrepreneur/stats
// @desc    Get entrepreneur mentorship statistics
// @access  Private (Entrepreneur)
router.get('/entrepreneur/stats', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    const entrepreneurId = req.user._id;

    // Count active mentorships (ACCEPTED, SCHEDULED)
    const activeMentorships = await MentorshipRequest.countDocuments({
      entrepreneur: entrepreneurId,
      status: { $in: ['ACCEPTED', 'SCHEDULED'] },
    });

    res.json({
      success: true,
      data: { activeMentorships },
    });
  } catch (error) {
    console.error('Get entrepreneur mentorship stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/mentorship/stats
// @desc    Get mentor dashboard statistics
// @access  Private (Mentor)
router.get('/stats', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const mentorId = req.user._id;

    // Count pending requests
    const pendingRequests = await MentorshipRequest.countDocuments({
      mentor: mentorId,
      status: 'PENDING',
    });

    // Count upcoming sessions (scheduled sessions with future date)
    const upcomingSessions = await Session.countDocuments({
      mentor: mentorId,
      status: 'SCHEDULED',
      scheduledAt: { $gte: new Date() },
    });

    // Count total unique mentees (entrepreneurs with accepted, scheduled, or completed requests)
    const totalMentees = await MentorshipRequest.distinct('entrepreneur', {
      mentor: mentorId,
      status: { $in: ['ACCEPTED', 'SCHEDULED', 'COMPLETED'] },
    });

    res.json({
      success: true,
      data: {
        pendingRequests,
        upcomingSessions,
        totalMentees: totalMentees.length,
      },
    });
  } catch (error) {
    console.error('Get mentor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/mentorship/sessions/mentor
// @desc    Get sessions for current mentor
// @access  Private (Mentor)
router.get('/sessions/mentor', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const sessions = await Session.find({ mentor: req.user._id })
      .sort({ scheduledAt: 1 })
      .populate('entrepreneur', 'name email')
      .populate('mentorshipRequest', 'topic status');

    res.json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    console.error('Get mentor sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/mentorship/sessions/entrepreneur
// @desc    Get sessions for current entrepreneur
// @access  Private (Entrepreneur)
router.get('/sessions/entrepreneur', protect, authorize('ENTREPRENEUR'), async (req, res) => {
  try {
    const sessions = await Session.find({ entrepreneur: req.user._id })
      .sort({ scheduledAt: 1 })
      .populate('mentor', 'name email')
      .populate('mentorshipRequest', 'topic status');

    res.json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    console.error('Get entrepreneur sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/mentorship/sessions/:id/feedback
// @desc    Submit feedback for a completed session (Entrepreneur only)
// @access  Private (Entrepreneur)
router.post('/sessions/:id/feedback', protect, authorize('ENTREPRENEUR'), validateFeedback, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.entrepreneur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this session',
      });
    }

    // Only allow feedback after the scheduled time
    if (session.scheduledAt > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can be submitted after the session time',
      });
    }

    let feedback = await SessionFeedback.findOne({ session: session._id });
    if (feedback) {
      feedback.rating = req.body.rating;
      feedback.comments = req.body.comments;
      await feedback.save();
    } else {
      feedback = await SessionFeedback.create({
        session: session._id,
        mentor: session.mentor,
        entrepreneur: session.entrepreneur,
        rating: req.body.rating,
        comments: req.body.comments,
      });
    }

    // Mark session as completed
    session.status = 'COMPLETED';
    await session.save();

    // Notify mentor
    await createNotification({
      recipientId: session.mentor,
      type: 'MENTORSHIP_UPDATE',
      message: `${req.user.name} submitted feedback for your session`,
      relatedLinkId: session._id.toString(),
      relatedLinkType: 'MENTORSHIP_SESSION',
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback },
    });
  } catch (error) {
    console.error('Submit session feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/mentorship/requests/:id/reject
// @desc    Reject a mentorship request (Mentor only)
// @access  Private (Mentor)
router.patch('/requests/:id/reject', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Check if the mentor owns this request
    if (request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request is not in pending status',
      });
    }

    request.status = 'REJECTED';
    await request.save();

    // Create notification for entrepreneur
    await createNotification({
      recipientId: request.entrepreneur,
      type: 'MENTORSHIP_UPDATE',
      message: `${req.user.name} declined your mentorship request: "${request.topic}"`,
      relatedLinkId: request._id.toString(),
      relatedLinkType: 'MENTORSHIP',
    });

    res.json({
      success: true,
      message: 'Mentorship request rejected',
      data: { request },
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PATCH /api/mentorship/requests/:id/schedule
// @desc    Schedule a mentorship session (Mentor only)
// @access  Private (Mentor)
router.patch('/requests/:id/schedule', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date is required',
      });
    }

    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Check if the mentor owns this request
    if (request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule this request',
      });
    }

    if (!['ACCEPTED', 'SCHEDULED'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Request must be accepted before scheduling',
      });
    }

    request.status = 'SCHEDULED';
    request.scheduledDate = new Date(scheduledDate);
    await request.save();

    const populatedRequest = await MentorshipRequest.findById(request._id)
      .populate('entrepreneur', 'name email')
      .populate('mentor', 'name email');

    // Create notification for entrepreneur
    await createNotification({
      recipientId: request.entrepreneur,
      type: 'MENTORSHIP_UPDATE',
      message: `Session scheduled with ${req.user.name} for "${request.topic}" on ${new Date(scheduledDate).toLocaleString()}`,
      relatedLinkId: request._id.toString(),
      relatedLinkType: 'MENTORSHIP',
    });

    res.json({
      success: true,
      message: 'Session scheduled successfully',
      data: { request: populatedRequest },
    });
  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/mentorship/activity
// @desc    Get mentorship activity overview (Admin only)
// @access  Private (Admin)
router.get('/admin/activity', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const requests = await MentorshipRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('entrepreneur', 'name email')
      .populate('mentor', 'name email')
      .limit(100); // Limit to recent 100 requests

    // Get statistics
    const stats = {
      total: await MentorshipRequest.countDocuments(),
      pending: await MentorshipRequest.countDocuments({ status: 'PENDING' }),
      accepted: await MentorshipRequest.countDocuments({ status: 'ACCEPTED' }),
      scheduled: await MentorshipRequest.countDocuments({ status: 'SCHEDULED' }),
      completed: await MentorshipRequest.countDocuments({ status: 'COMPLETED' }),
      rejected: await MentorshipRequest.countDocuments({ status: 'REJECTED' }),
    };

    res.json({
      success: true,
      data: {
        requests,
        stats,
      },
    });
  } catch (error) {
    console.error('Get mentorship activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

