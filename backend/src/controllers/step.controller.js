const Project = require('../models/project.model');

exports.addStep = async (req, res) => {
  try {
    const { title, description, color, textColor } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.steps.push({ title, description, color, textColor, order: project.steps.length });
    await project.save();
    const populated = await Project.findById(project._id).populate('owner lead members.user', 'name email avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStep = async (req, res) => {
  try {
    const { title, description, color, textColor, order } = req.body;
    const project = await Project.findById(req.params.id);
    const step = project.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    if (title !== undefined) step.title = title;
    if (description !== undefined) step.description = description;
    if (color !== undefined) step.color = color;
    if (textColor !== undefined) step.textColor = textColor;
    if (order !== undefined) step.order = order;
    await project.save();
    const populated = await Project.findById(project._id).populate('owner lead members.user', 'name email avatar role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStep = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.steps = project.steps.filter(s => s._id.toString() !== req.params.stepId);
    await project.save();
    const populated = await Project.findById(project._id).populate('owner lead members.user', 'name email avatar role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
