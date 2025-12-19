import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const createEmailVerificationToken = async (userId) => {
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await EmailVerificationToken.create({
    user: userId,
    token,
    expiresAt,
  });
  return token;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      role,
      name: name || email.split('@')[0], // Use email prefix if name not provided
      verificationMethod: 'NONE',
      verificationStatus: 'UNVERIFIED',
    });

    // Create email verification token (email sending should be wired here)
    const emailVerificationToken = await createEmailVerificationToken(user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
          verificationMethod: user.verificationMethod,
          isActive: user.isActive,
          emailVerificationToken, // expose for development; replace with email send in production
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
          verificationMethod: user.verificationMethod,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/auth/send-verification
// @desc    Generate email verification token (simulated send)
// @access  Private
router.post('/send-verification', protect, async (req, res) => {
  try {
    // If already verified, skip
    if (req.user.verificationStatus === 'VERIFIED' && req.user.verificationMethod === 'EMAIL') {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Invalidate existing unused tokens for this user
    await EmailVerificationToken.deleteMany({
      user: req.user._id,
      used: false,
    });

    const token = await createEmailVerificationToken(req.user._id);

    // NOTE: Integrate an email service here to send the token link.
    res.json({
      success: true,
      message: 'Verification token generated. (In production, this is emailed.)',
      data: {
        token, // exposed for development
      },
    });
  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const record = await EmailVerificationToken.findOne({ token });
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    if (record.used || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired',
      });
    }

    const user = await User.findById(record.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.verificationStatus = 'VERIFIED';
    user.verificationMethod = 'EMAIL';
    user.verificationRejectionReason = null;
    await user.save();

    record.used = true;
    await record.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
          verificationMethod: user.verificationMethod,
        },
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

