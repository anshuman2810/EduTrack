const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'parent'],
      default: 'teacher',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    // Teacher specific fields
    employeeId: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: 'Teacher',
    },
    qualification: {
      type: String,
      default: '',
    },
    assignedClasses: [
      {
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      },
    ],
    // Parent specific fields
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian', ''],
      default: '',
    },
    occupation: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
