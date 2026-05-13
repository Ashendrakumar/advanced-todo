const express = require('express');
const router = express.Router();
const stepController = require('../controllers/step.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/:id/steps', requireRole('admin', 'lead'), stepController.addStep);
router.put('/:id/steps/:stepId', requireRole('admin', 'lead'), stepController.updateStep);
router.delete('/:id/steps/:stepId', requireRole('admin', 'lead'), stepController.deleteStep);

module.exports = router;
