const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Create a recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      cookingSteps,
      prepTime,
      cookTime,
      difficulty,
      category,
      tags,
      image
    } = req.body;

    // Parse ingredients and cooking steps if they are sent as strings
    let parsedIngredients = ingredients;
    if (typeof ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (e) {
        parsedIngredients = ingredients.split(',').map(i => i.trim());
      }
    }

    let parsedSteps = cookingSteps;
    if (typeof cookingSteps === 'string') {
      try {
        parsedSteps = JSON.parse(cookingSteps);
      } catch (e) {
        parsedSteps = cookingSteps.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    let parsedTags = tags || [];
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Handle image file if uploaded, otherwise use the text field (base64 or URL)
    let imageUrl = image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const recipe = await Recipe.create({
      title,
      description,
      image: imageUrl,
      ingredients: parsedIngredients,
      cookingSteps: parsedSteps,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      difficulty,
      category,
      tags: parsedTags,
      author: req.user.id
    });

    res.status(201).json({
      success: true,
      recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all recipes (with search, category, cookTime filters, & sorting)
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res) => {
  try {
    const { search, category, difficulty, maxTime, sort } = req.query;
    
    // Build query filter
    let matchQuery = {};

    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      matchQuery.category = category;
    }

    if (difficulty) {
      matchQuery.difficulty = difficulty;
    }

    if (maxTime) {
      // Find where prepTime + cookTime <= maxTime
      matchQuery.$expr = {
        $lte: [{ $add: ['$prepTime', '$cookTime'] }, Number(maxTime)]
      };
    }

    let recipes;

    if (sort === 'trending') {
      // Sort by likes array size, then by creation date
      recipes = await Recipe.aggregate([
        { $match: matchQuery },
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { likesCount: -1, createdAt: -1 } }
      ]);
      
      // Populate author details after aggregation
      recipes = await Recipe.populate(recipes, {
        path: 'author',
        select: 'username profilePicture'
      });
    } else if (sort === 'feed' && req.user) {
      // Get recipes from followed users
      const user = await User.findById(req.user.id);
      matchQuery.author = { $in: user.following };
      
      recipes = await Recipe.find(matchQuery)
        .populate('author', 'username profilePicture')
        .sort({ createdAt: -1 });
    } else {
      // Default: recent recipes
      recipes = await Recipe.find(matchQuery)
        .populate('author', 'username profilePicture')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get a single recipe detail with comments
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username profilePicture bio followers')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.status(200).json({
      success: true,
      recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Make sure user is owner or admin
    if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this recipe'
      });
    }

    const {
      title,
      description,
      ingredients,
      cookingSteps,
      prepTime,
      cookTime,
      difficulty,
      category,
      tags,
      image
    } = req.body;

    // Parsing checks
    let parsedIngredients = ingredients !== undefined ? ingredients : recipe.ingredients;
    if (ingredients !== undefined && typeof ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (e) {
        parsedIngredients = ingredients.split(',').map(i => i.trim());
      }
    }

    let parsedSteps = cookingSteps !== undefined ? cookingSteps : recipe.cookingSteps;
    if (cookingSteps !== undefined && typeof cookingSteps === 'string') {
      try {
        parsedSteps = JSON.parse(cookingSteps);
      } catch (e) {
        parsedSteps = cookingSteps.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    let parsedTags = tags !== undefined ? tags : recipe.tags;
    if (tags !== undefined && typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    let imageUrl = image !== undefined ? image : recipe.image;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        title: title || recipe.title,
        description: description || recipe.description,
        image: imageUrl,
        ingredients: parsedIngredients,
        cookingSteps: parsedSteps,
        prepTime: prepTime !== undefined ? Number(prepTime) : recipe.prepTime,
        cookTime: cookTime !== undefined ? Number(cookTime) : recipe.cookTime,
        difficulty: difficulty || recipe.difficulty,
        category: category || recipe.category,
        tags: parsedTags
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Make sure user is owner or admin
    if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ recipe: recipe._id });
    
    // Delete recipe
    await Recipe.deleteOne({ _id: recipe._id });

    res.status(200).json({
      success: true,
      message: 'Recipe removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Like / Unlike a recipe
// @route   PUT /api/recipes/:id/like
// @access  Private
exports.toggleLikeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check if user already liked this recipe
    const isLiked = recipe.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike recipe
      recipe.likes = recipe.likes.filter(
        (id) => id.toString() !== req.user.id.toString()
      );
      await recipe.save();
      
      res.status(200).json({
        success: true,
        message: 'Recipe unliked successfully',
        likesCount: recipe.likes.length,
        isLiked: false
      });
    } else {
      // Like recipe
      recipe.likes.push(req.user.id);
      await recipe.save();

      res.status(200).json({
        success: true,
        message: 'Recipe liked successfully',
        likesCount: recipe.likes.length,
        isLiked: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save / Unsave a recipe
// @route   PUT /api/recipes/:id/save
// @access  Private
exports.toggleSaveRecipe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const isSaved = user.savedRecipes.includes(recipeId);

    if (isSaved) {
      // Unsave
      user.savedRecipes = user.savedRecipes.filter(
        (id) => id.toString() !== recipeId.toString()
      );
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Recipe removed from bookmarks',
        isSaved: false
      });
    } else {
      // Save
      user.savedRecipes.push(recipeId);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Recipe saved to bookmarks',
        isSaved: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add comment to recipe
// @route   POST /api/recipes/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const recipeId = req.params.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const comment = await Comment.create({
      recipe: recipeId,
      author: req.user.id,
      content
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'username profilePicture'
    );

    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/recipes/comment/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate('recipe');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Get the recipe associated with this comment
    const recipe = comment.recipe;

    // Check if the user is comment author, recipe author, or admin
    if (
      comment.author.toString() !== req.user.id &&
      recipe.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await Comment.deleteOne({ _id: comment._id });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
