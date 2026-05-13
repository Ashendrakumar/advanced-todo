const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/:id/steps/:stepId/items', requireRole('admin', 'lead'), itemController.addItem);
router.put('/:id/steps/:stepId/items/:itemId', requireRole('admin', 'lead'), itemController.updateItem);
router.patch('/:id/steps/:stepId/items/:itemId/toggle', itemController.toggleItem);
router.delete('/:id/steps/:stepId/items/:itemId', requireRole('admin', 'lead'), itemController.deleteItem);

module.exports = router;
