const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInviteEmail,
} = require("../utils/mailer");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    let user = await User.findOne({ email });
    if (user && user.isVerified)
      return res.status(400).json({ message: "Email already registered" });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    if (user) {
      user.name = name;
      user.password = password;
      user.verificationToken = verificationToken;
    } else {
      user = new User({
        name,
        email,
        password,
        verificationToken,
        role: "user",
      });
    }
    await user.save();

    await sendVerificationEmail(email, name, verificationToken);
    res
      .status(201)
      .json({ message: "Registration successful. Please verify your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const token = signToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`);
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.json({
        message: "If that email exists, a reset link was sent.",
      });
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    await sendPasswordResetEmail(email, user.name, token);
    res.json({ message: "Password reset email sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.acceptInvite = async (req, res) => {
  try {
    const { token, password, name } = req.body;
    const user = await User.findOne({
      inviteToken: token,
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired invite token" });
    user.password = password;
    user.name = name || user.name;
    user.inviteToken = undefined;
    user.invitedBy = undefined;
    user.isVerified = true;
    await user.save();
    res.json({ message: "Invite accepted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.guestAccess = async (req, res) => {
  try {
    const guestEmail = `guest_${Date.now()}@projecttodo.guest`;
    const user = await User.create({
      name: "Guest User",
      email: guestEmail,
      role: "guest",
      isVerified: true,
      authProvider: "local",
    });
    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
