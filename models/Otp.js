const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

module.exports = mongoose.model('Otp', OtpSchema);
