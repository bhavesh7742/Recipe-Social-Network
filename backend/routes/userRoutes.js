const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  followUser,
  getSavedRecipes,
  getFollowSuggestions
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile/:username', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/follow/:id', protect, followUser);
router.get('/saved', protect, getSavedRecipes);
router.get('/suggestions', protect, getFollowSuggestions);

module.exports = router;
