const mongoose = require('mongoose');

const studentAcademicRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    rollNumber: {
      type: String,
      default: '',
    },
    subjects: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    isCurrentYear: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Enrolled', 'Promoted', 'Passed', 'Detained'],
      default: 'Enrolled',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One record per student per academic year
studentAcademicRecordSchema.index(
  { student: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'StudentAcademicRecord',
  studentAcademicRecordSchema
);
