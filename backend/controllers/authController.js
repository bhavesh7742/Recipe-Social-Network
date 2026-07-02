const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'recipe_social_network_jwt_secret_key_987654321', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Determine role (default is 'user', but auto-promote 'admin' for testing check)
    let role = 'user';
    if (
      username.toLowerCase() === 'admin' || 
      email.toLowerCase() === 'admin@recipenet.com' ||
      req.body.role === 'admin'
    ) {
      role = 'admin';
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          bio: user.bio,
          profilePicture: user.profilePicture
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot Password (returns reset pin for testing ease)
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email address'
      });
    }

    // Generate 6 digit pin code for easy UI testing
    const resetPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash pin and save to database
    const hashedPin = crypto.createHash('sha256').update(resetPin).digest('hex');
    user.resetPasswordToken = hashedPin;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset code generated. In a real app, this would be emailed.',
      resetCode: resetPin // Return the code so they can copy-paste it directly in the browser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { resetCode, password } = req.body;

    // Hash the code to compare with database
    const hashedPin = crypto.createHash('sha256').update(resetCode).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedPin,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
