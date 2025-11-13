const express = require('express');
const { getAdminStats } = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes in this file are protected and admin-only
router.use(protect, restrictTo('admin'));

// @route   GET /api/v1/dashboard/admin-stats
// @desc    Get all stats for the admin dashboard
// @access  Private/Admin
router.get('/admin-stats', getAdminStats);

module.exports = router;