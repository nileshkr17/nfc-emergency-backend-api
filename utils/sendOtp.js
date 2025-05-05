const transporter = require('./transporter');

const sendOtp = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your OTP for NFC Emergency Card',
    html: `<p>Your OTP is: <strong>${otp}</strong><br>This is valid for 1 minutes.</p>`
  };
  await transporter.sendMail(mailOptions);
  console.log(`OTP sent to ${toEmail}`);
};

const sendOtpExpired = async (toEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'OTP Expired',
    html: `<p>Your OTP has expired. Please request a new one.</p>`
  };
  await transporter.sendMail(mailOptions);
  console.log(`OTP expired notification sent to ${toEmail}`);
};

const sendOtpVerified = async (toEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'OTP Verification Successful',
    html: `<p>Your OTP has been successfully verified.</p>`
  };
  await transporter.sendMail(mailOptions);
  console.log(`OTP verification success notification sent to ${toEmail}`);
};

module.exports = {
  sendOtp,
  sendOtpExpired,
  sendOtpVerified
};
