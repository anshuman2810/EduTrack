const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
    },
    category: {
      type: String,
      enum: ['Academic', 'Behavioral', 'Attendance', 'General', 'Doubt / Question'],
      default: 'General',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
    },
    reply: {
      type: String,
      default: '',
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Replied', 'Reviewed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
