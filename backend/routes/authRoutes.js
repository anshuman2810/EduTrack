const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-16 & OBS-02)
// Enforce environment-only secret and reasonable expiration lifetime (8 hours instead of 30 days)
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in environment');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '8h' });
};

// In-Memory Brute-Force Rate Limiter (Human Remediation - OBS-01)
const loginAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_PERIOD_MS = 15 * 60 * 1000; // 15 minutes

const checkRateLimit = (key) => {
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < LOCKOUT_PERIOD_MS) {
      const waitMins = Math.ceil((LOCKOUT_PERIOD_MS - elapsed) / 60000);
      return { allowed: false, waitMins };
    } else {
      // Lockout expired; reset counter
      loginAttempts.delete(key);
      return { allowed: true };
    }
  }
  return { allowed: true };
};

const recordFailedAttempt = (key) => {
  const record = loginAttempts.get(key) || { attempts: 0, lastAttempt: Date.now() };
  record.attempts += 1;
  record.lastAttempt = Date.now();
  loginAttempts.set(key, record);
};

const clearFailedAttempts = (key) => {
  loginAttempts.delete(key);
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (with Rate Limiting - OBS-01)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown_ip';
    const rateLimitKey = `${clientIp}_${(email || '').toLowerCase().trim()}`;

    // Rate limit check
    const rateStatus = checkRateLimit(rateLimitKey);
    if (!rateStatus.allowed) {
      return res.status(429).json({
        message: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${rateStatus.waitMins} minute(s).`,
      });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('students')
      .populate({
        path: 'assignedClasses.class',
        select: 'name code',
      })
      .populate({
        path: 'assignedClasses.section',
        select: 'name roomNumber',
      })
      .populate({
        path: 'assignedClasses.subject',
        select: 'name code',
      });

    if (!user) {
      recordFailedAttempt(rateLimitKey);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Account status check (OBS-10)
    if (user.status && user.status === 'Suspended') {
      return res.status(403).json({ message: 'Access Denied: This account has been suspended.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      recordFailedAttempt(rateLimitKey);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Clear rate limit on successful authentication
    clearFailedAttempts(rateLimitKey);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      employeeId: user.employeeId,
      designation: user.designation,
      assignedClasses: user.assignedClasses,
      students: user.students,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('students')
      .populate('assignedClasses.class')
      .populate('assignedClasses.section')
      .populate('assignedClasses.subject');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.avatar = req.body.avatar || user.avatar;

    // SECURITY HARDENING (OBS-06): Verify current password before permitting password change
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({
          message: 'Current password is required to authorize password update.',
        });
      }

      const isCurrentMatch = await user.matchPassword(req.body.currentPassword);
      if (!isCurrentMatch) {
        return res.status(401).json({
          message: 'Current password verification failed. Password was not changed.',
        });
      }

      if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
        return res.status(400).json({
          message: 'New password must be at least 8 characters in length.',
        });
      }

      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

module.exports = router;
