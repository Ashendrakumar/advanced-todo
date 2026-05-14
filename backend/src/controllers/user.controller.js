const crypto = require("crypto");
const User = require("../models/user.model");
const { sendInviteEmail } = require("../utils/mailer");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "lead", "user", "guest"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { email, name } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      user.role = "lead";
      await user.save();
      return res.json({ message: "User promoted to lead", user });
    }
    const inviteToken = crypto.randomBytes(32).toString("hex");
    user = await User.create({
      name: name || "New Lead",
      email,
      role: "lead",
      inviteToken,
      invitedBy: req.user._id,
      isVerified: false,
    });
    await sendInviteEmail(email, name, inviteToken, req.user.name);
    res.status(201).json({ message: "Lead invite sent", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
