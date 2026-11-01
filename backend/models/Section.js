const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required (e.g. A, B, Science)'],
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    roomNumber: {
      type: String,
      default: '',
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    capacity: {
      type: Number,
      default: 40,
    },
  },
  {
    timestamps: true,
  }
);

// Unique combination of class and section name
sectionSchema.index({ class: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
