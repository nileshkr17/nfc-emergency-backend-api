const transporter = require('./transporter');

const sendOtp = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your OTP for NFC Emergency Card',
    html: `<p>Your OTP is: <strong>${otp}</strong><br>This is valid for 1 minutes.</p>`
  };
  await transporter.sendMail(mailOptions);
};

const sendOtpExpired = async (toEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'OTP Expired',
    html: `<p>Your OTP has expired. Please request a new one.</p>`
  };
  await transporter.sendMail(mailOptions);
};

const sendOtpVerified = async (toEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'OTP Verification Successful',
    html: `<p>Your OTP has been successfully verified.</p>`
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOtp,
  sendOtpExpired,
  sendOtpVerified
};
