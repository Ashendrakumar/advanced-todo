const SimpleTodo = require('../models/todo.model');

exports.createTodo = async (req, res) => {
  try {
    const { title, description, visibility, useSteps } = req.body;
    const todo = await SimpleTodo.create({
      title, description, visibility: req.user.role === 'guest' ? 'private' : visibility,
      owner: req.user._id, useSteps
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTodos = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query;
    if (role === 'admin') query = {};
    else if (role === 'lead') query = { $or: [{ owner: _id }, { visibility: 'public' }] };
    else query = { $or: [{ owner: _id }, { visibility: 'public' }] };
    const todos = await SimpleTodo.find(query).populate('owner', 'name email avatar').sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const todo = await SimpleTodo.findById(req.params.id).populate('owner', 'name email avatar');
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    const canAccess = req.user.role === 'admin' ||
      todo.owner._id.toString() === req.user._id.toString() ||
      todo.visibility === 'public';
    if (!canAccess) return res.status(403).json({ message: 'Access denied' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const todo = await SimpleTodo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (todo.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(todo, req.body);
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await SimpleTodo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (todo.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await todo.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addStep = async (req, res) => {
  try {
    const todo = await SimpleTodo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    todo.steps.push({ title: req.body.title, order: todo.steps.length });
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { text, description } = req.body;
    const todo = await SimpleTodo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    let step;
    if (req.params.stepId) {
      step = todo.steps.id(req.params.stepId);
    } else {
      if (todo.steps.length === 0) todo.steps.push({ title: 'Items', order: 0 });
      step = todo.steps[0];
    }
    if (!step) return res.status(404).json({ message: 'Step not found' });
    step.items.push({ text, description, order: step.items.length });
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleItem = async (req, res) => {
  try {
    const todo = await SimpleTodo.findById(req.params.id);
    const step = todo.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    const item = step.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.isCompleted = !item.isCompleted;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const todo = await SimpleTodo.findById(req.params.id);
    const step = todo.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    step.items = step.items.filter(i => i._id.toString() !== req.params.itemId);
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
