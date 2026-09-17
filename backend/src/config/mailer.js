import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendVerificationEmail = async (toEmail, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Devixo" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your Devixo account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to Devixo</h2>
        <p>Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${verifyUrl}" style="display:inline-block; background:#111827; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin-top:12px;">Verify Email</a>
        <p style="margin-top:24px; color:#888; font-size:13px;">Or paste this link in your browser: <br/>${verifyUrl}</p>
      </div>`,
  });
};
