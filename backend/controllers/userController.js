const User = require('../models/User');
const Recipe = require('../models/Recipe');

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username profilePicture bio')
      .populate('following', 'username profilePicture bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recipes authored by this user
    const recipes = await Recipe.find({ author: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        role: user.role,
        createdAt: user.createdAt
      },
      recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio,
          profilePicture: updatedUser.profilePicture,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Follow or Unfollow a user
// @route   PUT /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );
      
      await currentUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: 'User unfollowed successfully',
        isFollowing: false
      });
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await currentUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: 'User followed successfully',
        isFollowing: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's saved recipes
// @route   GET /api/users/saved
// @access  Private
exports.getSavedRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedRecipes',
      populate: {
        path: 'author',
        select: 'username profilePicture'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      savedRecipes: user.savedRecipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get suggestions for who to follow
// @route   GET /api/users/suggestions
// @access  Private
exports.getFollowSuggestions = async (req, res) => {
  try {
    // Get users that current user is NOT following, excluding current user
    const currentUser = await User.findById(req.user.id);
    const excludeIds = [...currentUser.following, currentUser._id];

    // Get 5 random suggestions
    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select('username profilePicture bio')
      .limit(5);

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
