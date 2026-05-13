const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.get('/:id', todoController.getTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

router.post('/:id/steps', todoController.addStep);
router.post('/:id/steps/:stepId/items', todoController.addItem);
router.post('/:id/items', todoController.addItem);
router.patch('/:id/steps/:stepId/items/:itemId/toggle', todoController.toggleItem);
router.delete('/:id/steps/:stepId/items/:itemId', todoController.deleteItem);

module.exports = router;
