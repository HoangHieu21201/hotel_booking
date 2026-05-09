// backend/utils/mailer.js
import nodemailer from 'nodemailer';

// Khởi tạo transporter với thông tin từ biến môi trường
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: `"Hotel PMS" <${process.env.MAIL_USERNAME}>`,
    to: toEmail,
    subject: 'Mã xác thực khôi phục mật khẩu (OTP)',
    text: `Mã xác thực của bạn là: ${otpCode}. Mã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.`,
  };
  return transporter.sendMail(mailOptions);
};