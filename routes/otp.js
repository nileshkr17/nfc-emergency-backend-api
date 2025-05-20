const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const { sendOtp, sendOtpExpired, sendOtpVerified } = require('../utils/sendOtp');

// Send OTP
router.post('/send', async (req, res) => {
  try {
    const { uniqueId } = req.body;

    const user = await UserProfile.findOne({ uniqueId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();

    // Check 1-minute cooldown
    if (user.otpSentAt && (now - user.otpSentAt < 60 * 1000)) {
      const waitTime = Math.ceil((60 * 1000 - (now - user.otpSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitTime} seconds before requesting a new OTP.`
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(otp, salt);

    user.otpHash = hash;
    user.otpExpiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 mins
    user.otpSentAt = now; // Store time OTP was sent
    user.isOtpVerified = false;

    await user.save();
    await sendOtp(user.email, otp);

    res.json({ message: 'OTP sent successfully' });
    console.log(`OTP sent to ${user.email}: ${otp}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { uniqueId, otp } = req.body;

    const user = await UserProfile.findOne({ uniqueId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      if (!user.isOtpVerified) await sendOtpExpired(user.email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid OTP' });

    user.isOtpVerified = true;
    await user.save();
    await sendOtpVerified(user.email);

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
