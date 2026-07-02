const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');

// @desc    Get dashboard analytics (users count, recipe counts, category stats, trending)
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalComments = await Comment.countDocuments();

    // Aggregate category counts
    const categoryStats = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get top 5 trending recipes
    const trendingRecipes = await Recipe.aggregate([
      {
        $addFields: { likesCount: { $size: '$likes' } }
      },
      {
        $sort: { likesCount: -1, createdAt: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Populate authors on aggregation output
    const populatedTrending = await Recipe.populate(trendingRecipes, {
      path: 'author',
      select: 'username profilePicture'
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalRecipes,
        totalComments,
        categoryStats,
        trendingRecipes: populatedTrending
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a user (cascades deletes for owned recipes/comments)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an administrator account'
      });
    }

    // Delete recipes authored by this user
    await Recipe.deleteMany({ author: user._id });
    
    // Delete comments authored by this user
    await Comment.deleteMany({ author: user._id });

    // Delete the user
    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
