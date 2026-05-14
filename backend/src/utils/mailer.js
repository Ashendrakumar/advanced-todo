const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px; margin: 0 auto; background: #f8fafc;
`;
const btnStyle = `
  display: inline-block; background: #4F46E5; color: #fff;
  padding: 12px 28px; border-radius: 8px; text-decoration: none;
  font-weight: 600; margin: 20px 0;
`;

exports.sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;
  await transporter.sendMail({
    from: `"Project Todo" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verify your email — Project Todo",
    html: `<div style="${baseStyle}">
      <div style="background:#fff;padding:40px;border-radius:12px;margin:20px 0">
        <h2 style="color:#1e1b4b">Hello, ${name}! 👋</h2>
        <p style="color:#475569">Please verify your email to get started with Project Todo.</p>
        <a href="${url}" style="${btnStyle}">Verify Email</a>
        <p style="color:#94a3b8;font-size:13px">This link expires in 24 hours.</p>
      </div>
    </div>`,
  });
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
  await transporter.sendMail({
    from: `"Project Todo" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Reset your password — Project Todo",
    html: `<div style="${baseStyle}">
      <div style="background:#fff;padding:40px;border-radius:12px;margin:20px 0">
        <h2 style="color:#1e1b4b">Password Reset Request</h2>
        <p style="color:#475569">Hi ${name}, click below to reset your password.</p>
        <a href="${url}" style="${btnStyle}">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px">Link expires in 1 hour. Ignore if you didn't request this.</p>
      </div>
    </div>`,
  });
};

exports.sendInviteEmail = async (email, name, token, inviterName) => {
  const url = `${process.env.FRONTEND_URL}/auth/accept-invite/${token}`;
  await transporter.sendMail({
    from: `"Project Todo" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `You've been invited as Lead — Project Todo`,
    html: `<div style="${baseStyle}">
      <div style="background:#fff;padding:40px;border-radius:12px;margin:20px 0">
        <h2 style="color:#1e1b4b">You're invited! 🎉</h2>
        <p style="color:#475569">${inviterName} has invited you as a <strong>Lead</strong> on Project Todo.</p>
        <a href="${url}" style="${btnStyle}">Accept Invitation</a>
      </div>
    </div>`,
  });
};

exports.sendProjectInviteEmail = async (
  email,
  projectName,
  token,
  inviterName,
) => {
  const url = `${process.env.FRONTEND_URL}/auth/accept-invite/${token}`;
  await transporter.sendMail({
    from: `"Project Todo" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `You've been added to "${projectName}" — Project Todo`,
    html: `<div style="${baseStyle}">
      <div style="background:#fff;padding:40px;border-radius:12px;margin:20px 0">
        <h2 style="color:#1e1b4b">Project Invitation 📋</h2>
        <p style="color:#475569">${inviterName} has invited you to collaborate on <strong>${projectName}</strong>.</p>
        <a href="${url}" style="${btnStyle}">Join Project</a>
      </div>
    </div>`,
  });
};
