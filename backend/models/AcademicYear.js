const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Academic year name is required (e.g. 2024-25)'],
      unique: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// When an academic year is set as current, ensure others are set to false
academicYearSchema.pre('save', async function (next) {
  if (this.isCurrent) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

module.exports = mongoose.model('AcademicYear', academicYearSchema);
