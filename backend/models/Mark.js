const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    academicRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentAcademicRecord',
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
      default: 'F',
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Absent'],
      default: 'Pass',
    },
    remarks: {
      type: String,
      default: '',
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Function to calculate grade and percentage
markSchema.pre('save', function (next) {
  if (this.maxMarks > 0) {
    this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100 * 10) / 10;
  }
  const pct = this.percentage;
  if (pct >= 90) this.grade = 'A+';
  else if (pct >= 80) this.grade = 'A';
  else if (pct >= 70) this.grade = 'B+';
  else if (pct >= 60) this.grade = 'B';
  else if (pct >= 50) this.grade = 'C';
  else if (pct >= 35) this.grade = 'D';
  else this.grade = 'F';

  this.status = pct >= 35 ? 'Pass' : 'Fail';
  next();
});

markSchema.index({ exam: 1, student: 1 }, { unique: true });
markSchema.index({ student: 1, academicYear: 1 });

module.exports = mongoose.model('Mark', markSchema);
