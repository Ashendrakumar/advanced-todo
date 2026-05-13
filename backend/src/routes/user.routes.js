const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Admin only
router.get('/', requireRole('admin'), userController.getAllUsers);
router.post('/leads', requireRole('admin'), userController.createLead);
router.put('/:id/role', requireRole('admin'), userController.updateUserRole);
router.delete('/:id', requireRole('admin'), userController.deleteUser);

module.exports = router;
