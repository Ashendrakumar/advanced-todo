const Project = require('../models/project.model');

exports.addItem = async (req, res) => {
  try {
    const { text, description, tag } = req.body;
    const project = await Project.findById(req.params.id);
    const step = project.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    step.items.push({ text, description, tag, order: step.items.length });
    await project.save();
    const populated = await Project.findById(project._id).populate('owner lead members.user', 'name email avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { text, description, tag, order } = req.body;
    const project = await Project.findById(req.params.id);
    const step = project.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    const item = step.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (text !== undefined) item.text = text;
    if (description !== undefined) item.description = description;
    if (tag !== undefined) item.tag = tag;
    if (order !== undefined) item.order = order;
    await project.save();
    const populated = await Project.findById(project._id).populate('owner lead members.user', 'name email avatar role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleItem = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const step = project.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    const item = step.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.isCompleted = !item.isCompleted;
    item.completedBy = item.isCompleted ? req.user._id : undefined;
    item.completedAt = item.isCompleted ? new Date() : undefined;
    await project.save();
    const populated = await Project.findById(project._id).populate('owner lead members.user', 'name email avatar role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const step = project.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    step.items = step.items.filter(i => i._id.toString() !== req.params.itemId);
    await project.save();
    const populated = await Project.findById(project._id).populate('owner lead members.user', 'name email avatar role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
