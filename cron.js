const cron = require('node-cron');
const UserProfile = require('./models/UserProfile');

cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const result = await UserProfile.updateMany(
      { otpExpiry: { $lt: now } },
      { $set: { otpHash: null, otpExpiry: null, isOtpVerified: false } }
    );
    console.log(`Expired OTPs cleared: ${result.modifiedCount}`);
  } catch (err) {
    console.error('Failed to clear expired OTPs:', err);
  }
});
console.log('Cron job scheduled to run daily at midnight.');