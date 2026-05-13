const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', projectController.getDashboardStats);
router.get('/', projectController.getProjects);
router.post('/', requireRole('admin', 'lead'), projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', requireRole('admin', 'lead'), projectController.updateProject);
router.delete('/:id', requireRole('admin', 'lead'), projectController.deleteProject);
router.post('/:id/invite', requireRole('admin', 'lead'), projectController.inviteMember);
router.delete('/:id/members/:userId', requireRole('admin', 'lead'), projectController.removeMember);

module.exports = router;
