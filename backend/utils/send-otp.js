require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  pool: true,
  connectionTimeout: 8000,
  socketTimeout: 8000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOtp = async (email, otp) => {
  // Always log OTP to server console for testing & development
  console.log(`\n========================================`);
  console.log(`🔑 OTP CODE FOR ${email}: [ ${otp} ]`);
  console.log(`========================================\n`);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured. Using console OTP logging.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"ShelfWise Library" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "OTP Verification - ShelfWise Library",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #14231d; max-width: 500px;">
          <h2 style="color: #14231d;">ShelfWise Library Verification</h2>
          <p>Your 6-digit OTP verification code is:</p>
          <div style="background: #f4f3ec; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #14231d; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`✅ OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error("⚠️ Email sending failed:", error.message || error);
    console.log(`👉 Fallback: Use OTP [ ${otp} ] to verify ${email}`);
  }
};

module.exports = sendOtp;