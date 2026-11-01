const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    // The unique, permanent QR token that never changes across grades/years
    qrToken: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    photo: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      default: '',
    },
    nationality: {
      type: String,
      default: 'Indian',
    },
    religion: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    parentInfo: {
      fatherName: { type: String, default: '' },
      fatherPhone: { type: String, default: '' },
      fatherOccupation: { type: String, default: '' },
      fatherEmail: { type: String, default: '' },
      motherName: { type: String, default: '' },
      motherPhone: { type: String, default: '' },
      motherOccupation: { type: String, default: '' },
      motherEmail: { type: String, default: '' },
      guardianName: { type: String, default: '' },
      guardianPhone: { type: String, default: '' },
      guardianRelation: { type: String, default: '' },
    },
    parentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Graduated', 'Transferred', 'Suspended'],
      default: 'Active',
    },
    customFields: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Student', studentSchema);
