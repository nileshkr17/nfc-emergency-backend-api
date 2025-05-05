const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  uniqueId: { type: String, unique: true },
  name: String,
  bloodGroup: String,
  allergies: String,
  medicalConditions: String,
  emergencyContact: String,
  email: String,
  otpHash: String,
  otpExpiry: Date,
  otpSentAt: Date, // New field
  isOtpVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
