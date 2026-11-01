const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-16)
      // Strict verification using environment variable secret only; zero fallback defaults!
      if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not configured on server.');
        return res.status(500).json({ message: 'Authentication subsystem configuration error' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found with this token' });
      }

      // SECURITY HARDENING (OBS-10): Verify account active status on every request
      if (req.user.status && req.user.status === 'Suspended') {
        return res.status(403).json({ message: 'Access Denied: Account is suspended.' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
