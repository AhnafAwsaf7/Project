import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Logo upload (images only)
const logoDir = path.join(__dirname, '../uploads/profile-logos');
ensureDir(logoDir);
const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, logoDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(null, true);
    }
    cb(new Error('Only image files (png, jpg, jpeg, webp) are allowed for logos.'));
  },
});

// Intro video upload (mp4/webm)
const videoDir = path.join(__dirname, '../uploads/intro-videos');
ensureDir(videoDir);
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videoDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `intro-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.webm'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(null, true);
    }
    cb(new Error('Only MP4 or WebM files are allowed for intro videos.'));
  },
});

// @route   GET /api/profile/me
// @desc    Get current user's complete profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
          verificationMethod: user.verificationMethod,
          verificationRejectionReason: user.verificationRejectionReason,
          profile: user.profile,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/profile/upload/logo
// @desc    Upload company/startup logo and update profile
// @access  Private
router.post('/upload/logo', protect, logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Logo file is required',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const logoUrl = `/uploads/profile-logos/${req.file.filename}`;
    user.set('profile.logoUrl', logoUrl);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logoUrl },
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/profile/upload/intro-video
// @desc    Upload intro video and update profile
// @access  Private
router.post('/upload/intro-video', protect, videoUpload.single('introVideo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Intro video file is required',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const introVideoUrl = `/uploads/intro-videos/${req.file.filename}`;
    user.set('profile.introVideoUrl', introVideoUrl);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Intro video uploaded successfully',
      data: { introVideoUrl },
    });
  } catch (error) {
    console.error('Upload intro video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Validation middleware for profile update
const validateProfileUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('profile.bio').optional().trim(),
  body('profile.location').optional().trim(),
  body('profile.websiteUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true; // Allow empty strings
      // Only validate URL format if value is provided
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(value)) {
        throw new Error('Website URL must be a valid URL (must start with http:// or https://)');
      }
      return true;
    }),
  body('profile.linkedinUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true; // Allow empty strings
      // Only validate URL format if value is provided
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(value)) {
        throw new Error('LinkedIn URL must be a valid URL (must start with http:// or https://)');
      }
      return true;
    }),
  body('profile.achievements').optional().isArray().withMessage('Achievements must be an array'),
  // Startup-specific validation
  body('profile.entrepreneurData.startupName').optional().trim(),
  body('profile.entrepreneurData.startupPitch').optional().trim(),
  body('profile.entrepreneurData.fundingGoal')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Funding goal must be a valid positive number');
      }
      return true;
    }),
  body('profile.entrepreneurData.industryCategory').optional().trim(),
  // Investor-specific validation
  body('profile.investorData.companyName').optional().trim(),
  body('profile.investorData.expertiseArea').optional().isArray().withMessage('Expertise area must be an array'),
  body('profile.investorData.investmentThesis').optional().trim(),
  body('profile.investorData.typicalCheckSize')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Check size must be a valid positive number');
      }
      return true;
    }),
  // Mentor-specific validation
  body('profile.mentorData.expertiseAreas').optional().isArray().withMessage('Expertise areas must be an array'),
  body('profile.mentorData.yearsExperience')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Years of experience must be a valid positive integer');
      }
      return true;
    }),
  body('profile.mentorData.specialization').optional().trim(),
];

// @route   PUT /api/profile/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', protect, validateProfileUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Profile update validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    console.log('Profile update request:', {
      userId: req.user._id,
      body: req.body,
    });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update name if provided
    if (req.body.name) {
      user.name = req.body.name;
    }

    // Update profile fields
    if (req.body.profile) {
      // Initialize profile if it doesn't exist
      if (!user.profile) {
        user.profile = {};
      }

      // Update generic profile fields - preserve existing if not provided
      if (req.body.profile.bio !== undefined) {
        user.set('profile.bio', req.body.profile.bio || '');
      }
      if (req.body.profile.location !== undefined) {
        user.set('profile.location', req.body.profile.location || '');
      }
      if (req.body.profile.websiteUrl !== undefined) {
        user.set('profile.websiteUrl', req.body.profile.websiteUrl || '');
      }
      if (req.body.profile.linkedinUrl !== undefined) {
        user.set('profile.linkedinUrl', req.body.profile.linkedinUrl || '');
      }
      if (req.body.profile.achievements !== undefined) {
        // Ensure achievements is an array and filter out empty strings
        const achievements = Array.isArray(req.body.profile.achievements) 
          ? req.body.profile.achievements.filter(a => a && String(a).trim() !== '') 
          : [];
        user.set('profile.achievements', achievements);
      }

      // Update role-specific data
      if (req.body.profile.entrepreneurData) {
        const entrepreneurData = user.profile.entrepreneurData || {};
        if (req.body.profile.entrepreneurData.startupName !== undefined) {
          entrepreneurData.startupName = req.body.profile.entrepreneurData.startupName || '';
        }
        if (req.body.profile.entrepreneurData.startupPitch !== undefined) {
          entrepreneurData.startupPitch = req.body.profile.entrepreneurData.startupPitch || '';
        }
        if (req.body.profile.entrepreneurData.fundingGoal !== undefined) {
          entrepreneurData.fundingGoal = req.body.profile.entrepreneurData.fundingGoal 
            ? Number(req.body.profile.entrepreneurData.fundingGoal) : 0;
        }
        if (req.body.profile.entrepreneurData.industryCategory !== undefined) {
          entrepreneurData.industryCategory = req.body.profile.entrepreneurData.industryCategory || '';
        }
        user.set('profile.entrepreneurData', entrepreneurData);
      }

      if (req.body.profile.investorData) {
        const investorData = user.profile.investorData || {};
        if (req.body.profile.investorData.companyName !== undefined) {
          investorData.companyName = req.body.profile.investorData.companyName || '';
        }
        if (req.body.profile.investorData.expertiseArea !== undefined) {
          // Ensure expertiseArea is an array
          investorData.expertiseArea = Array.isArray(req.body.profile.investorData.expertiseArea)
            ? req.body.profile.investorData.expertiseArea.filter(e => e && e.trim() !== '')
            : [];
        }
        if (req.body.profile.investorData.investmentThesis !== undefined) {
          investorData.investmentThesis = req.body.profile.investorData.investmentThesis || '';
        }
        if (req.body.profile.investorData.typicalCheckSize !== undefined) {
          investorData.typicalCheckSize = req.body.profile.investorData.typicalCheckSize 
            ? Number(req.body.profile.investorData.typicalCheckSize) : 0;
        }
        user.set('profile.investorData', investorData);
      }

      if (req.body.profile.mentorData) {
        const mentorData = user.profile.mentorData || {};
        if (req.body.profile.mentorData.expertiseAreas !== undefined) {
          // Ensure expertiseAreas is an array
          mentorData.expertiseAreas = Array.isArray(req.body.profile.mentorData.expertiseAreas)
            ? req.body.profile.mentorData.expertiseAreas.filter(e => e && e.trim() !== '')
            : [];
        }
        if (req.body.profile.mentorData.yearsExperience !== undefined) {
          mentorData.yearsExperience = req.body.profile.mentorData.yearsExperience 
            ? parseInt(req.body.profile.mentorData.yearsExperience) : 0;
        }
        if (req.body.profile.mentorData.specialization !== undefined) {
          mentorData.specialization = req.body.profile.mentorData.specialization || '';
        }
        user.set('profile.mentorData', mentorData);
      }
    }

    await user.save({ validateBeforeSave: true });

    // Reload the user to get the saved data
    const savedUser = await User.findById(req.user._id);

    console.log('Profile saved successfully:', {
      userId: savedUser._id,
      achievements: savedUser.profile?.achievements,
      profile: savedUser.profile,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          verificationStatus: savedUser.verificationStatus,
          verificationMethod: savedUser.verificationMethod,
          verificationRejectionReason: savedUser.verificationRejectionReason,
          profile: savedUser.profile,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;



