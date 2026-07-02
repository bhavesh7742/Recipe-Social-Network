const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleLikeRecipe,
  toggleSaveRecipe,
  addComment,
  deleteComment
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Configure Multer validation filters
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, webp)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.route('/')
  .get(getRecipes)
  .post(protect, upload.single('image'), createRecipe);

router.route('/:id')
  .get(getRecipeById)
  .put(protect, upload.single('image'), updateRecipe)
  .delete(protect, deleteRecipe);

router.put('/:id/like', protect, toggleLikeRecipe);
router.put('/:id/save', protect, toggleSaveRecipe);
router.post('/:id/comment', protect, addComment);
router.delete('/comment/:commentId', protect, deleteComment);

module.exports = router;
