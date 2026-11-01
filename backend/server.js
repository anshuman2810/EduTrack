const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION): Fail-fast verification of cryptographic secret
if (!process.env.JWT_SECRET) {
  console.error('FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined.');
  console.error('Application will not start without a cryptographically secure key.');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();

// SECURITY HARDENING: Disable framework fingerprinting
app.disable('x-powered-by');

// SECURITY HARDENING: Enforce institutional security headers (OWASP ASVS / NIST SSDF)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// SECURITY HARDENING: Restrictive CORS Policy (Replaces insecure wildcard *)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://127.0.0.1:5173',
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman in local lab)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve uploaded static files with strict nosniff header
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/academic', require('./routes/academicRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/marks', require('./routes/markRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'EduTrack Student Management & Academic Records Portal API',
  });
});

// Error handling middleware (Human Remediation: Prevent Stack & Schema Leakage - OBS-17)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  // Mongoose CastError (Invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier format.',
    });
  }

  // CORS rejection
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      message: 'Cross-Origin Request Blocked: Origin not authorized.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected internal error occurred.'
        : err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Environment: ${process.env.NODE_ENV || 'development'})`);
});
