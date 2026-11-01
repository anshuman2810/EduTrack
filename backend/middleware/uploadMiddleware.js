const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'student-' + uniqueSuffix + ext);
  },
});

// File filter for images (Human Remediation - OBS-13)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
  const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtAllowed = allowedExtensions.includes(ext);
  const isMimeAllowed = allowedMimetypes.includes(file.mimetype.toLowerCase());

  if (isExtAllowed && isMimeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type: Only legitimate JPEG, PNG, or WebP image files are permitted.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Strict 2 MB max
  fileFilter: fileFilter,
});

// SECURE VERSION 1 (WEEK 6 HUMAN REMEDIATION - OBS-13 / PoC-05):
// Binary Magic-Byte Verification Middleware
// Inspects raw byte headers of the saved file to ensure it is authentic binary image data
const verifyImageMagicBytes = (req, res, next) => {
  if (!req.file) {
    return next(); // No file uploaded, proceed
  }

  const filePath = req.file.path;

  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    let isValid = false;

    // JPEG Signature: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      isValid = true;
    }
    // PNG Signature: 89 50 4E 47 0D 0A 1A 0A
    else if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      isValid = true;
    }
    // WebP Signature: 'RIFF' .... 'WEBP'
    else if (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      isValid = true;
    }

    if (!isValid) {
      // Purge the spoofed file from disk immediately
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message:
          'Security Validation Failed: Uploaded file does not contain valid binary image magic bytes (JPEG/PNG/WebP). Upload rejected.',
      });
    }

    next();
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to complete binary security verification on uploaded image.',
    });
  }
};

module.exports = { upload, verifyImageMagicBytes };
