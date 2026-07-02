const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getUsers,
  deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Secure all admin routes
router.use(protect);
router.use(adminOnly);

router.get('/analytics', getDashboardAnalytics);
router.route('/users')
  .get(getUsers);
router.route('/users/:id')
  .delete(deleteUser);

module.exports = router;
