const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a recipe title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a recipe description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    default: ''
  },
  ingredients: {
    type: [String],
    required: [true, 'Please add at least one ingredient']
  },
  cookingSteps: {
    type: [String],
    required: [true, 'Please add at least one cooking step']
  },
  prepTime: {
    type: Number,
    required: [true, 'Please provide preparation time in minutes']
  },
  cookTime: {
    type: Number,
    required: [true, 'Please provide cooking time in minutes']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Salad', 'Appetizer', 'Snacks', 'Beverages']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate comments
RecipeSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'recipe',
  justOne: false
});

module.exports = mongoose.model('Recipe', RecipeSchema);
