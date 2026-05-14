const crypto = require("crypto");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const { sendProjectInviteEmail } = require("../utils/mailer");

exports.createProject = async (req, res) => {
  try {
    const { name, description, color, isPublic } = req.body;
    const project = await Project.create({
      name,
      description,
      color,
      isPublic,
      owner: req.user._id,
      lead: req.user._id,
      members: [
        {
          user: req.user._id,
          role: req.user.role === "lead" ? "lead" : "user",
        },
      ],
    });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { projectAccess: project._id },
    });
    const populated = await Project.findById(project._id).populate(
      "owner lead members.user",
      "name email avatar role",
    );
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let projects;
    const { role, _id } = req.user;
    if (role === "admin") {
      projects = await Project.find()
        .populate("owner lead members.user", "name email avatar role")
        .sort({ createdAt: -1 });
    } else if (role === "lead") {
      projects = await Project.find({
        $or: [{ owner: _id }, { lead: _id }, { "members.user": _id }],
      })
        .populate("owner lead members.user", "name email avatar role")
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ "members.user": _id })
        .populate("owner lead members.user", "name email avatar role")
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "owner lead members.user",
      "name email avatar role",
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    // Check access
    const { role, _id } = req.user;
    if (role !== "admin") {
      const isMember = project.members.some(
        (m) => m.user._id.toString() === _id.toString(),
      );
      if (!isMember) return res.status(403).json({ message: "Access denied" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, color, isPublic, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color, isPublic, status },
      { new: true },
    ).populate("owner lead members.user", "name email avatar role");
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    let user = await User.findOne({ email });
    if (!user) {
      const inviteToken = crypto.randomBytes(32).toString("hex");
      user = await User.create({
        name: email.split("@")[0],
        email,
        role: "user",
        inviteToken,
        invitedBy: req.user._id,
        isVerified: false,
      });
      await sendProjectInviteEmail(
        email,
        project.name,
        inviteToken,
        req.user.name,
      );
    }

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === user._id.toString(),
    );
    if (!alreadyMember) {
      project.members.push({ user: user._id, role: "user" });
      await project.save();
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { projectAccess: project._id },
      });
    }

    const populated = await Project.findById(project._id).populate(
      "owner lead members.user",
      "name email avatar role",
    );
    res.json({ message: "Member invited", project: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId,
    );
    await project.save();
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { projectAccess: project._id },
    });
    const populated = await Project.findById(project._id).populate(
      "owner lead members.user",
      "name email avatar role",
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query =
      role === "admin"
        ? {}
        : { $or: [{ owner: _id }, { "members.user": _id }] };
    const projects = await Project.find(query);

    let totalItems = 0,
      completedItems = 0;
    const projectStats = projects.map((p) => {
      const s = p.stats;
      totalItems += s.total;
      completedItems += s.completed;
      return {
        _id: p._id,
        name: p.name,
        color: p.color,
        status: p.status,
        stats: s,
      };
    });

    res.json({
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      completedProjects: projects.filter((p) => p.status === "completed")
        .length,
      totalItems,
      completedItems,
      overallPercent:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      projects: projectStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
