const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Comment = require('./models/Comment');

// Load environment variables
dotenv.config();

const usersData = [
  {
    username: 'admin',
    email: 'admin@recipenet.com',
    password: 'adminpassword123',
    bio: 'Official RecipeNet platform administrator and culinary quality moderator.',
    profilePicture: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
    role: 'admin'
  },
  {
    username: 'gordon_chef',
    email: 'gordon@recipenet.com',
    password: 'gordonpassword123',
    bio: 'Professional Michelin-starred chef. Passionate about fresh ingredients and perfect plating.',
    profilePicture: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150',
    role: 'user'
  },
  {
    username: 'sarah_bakes',
    email: 'sarah@recipenet.com',
    password: 'sarahpassword123',
    bio: 'Home baker and pastry enthusiast. Making life sweet, one cake at a time.',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'user'
  }
];

const recipesData = [
  {
    title: 'Gourmet Beef Burger',
    description: 'A juicy, thick flame-grilled beef burger seasoned with garlic powder, smoked paprika, topped with premium cheddar cheese, caramelized onions, crisp lettuce, and signature garlic aioli inside a toasted brioche bun.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    ingredients: [
      '500g Ground Beef (80/20 lean to fat)',
      '1 tsp Smoked Paprika',
      '1 tsp Garlic Powder',
      '4 slices Cheddar Cheese',
      '1 large Onion (sliced & caramelized)',
      '4 Brioche Burger Buns',
      'Lettuce, tomato, and pickles',
      '2 tbsp Garlic Aioli'
    ],
    cookingSteps: [
      'In a bowl, mix ground beef, smoked paprika, garlic powder, salt, and pepper. Shape into 4 burger patties.',
      'Heat a grill pan over medium-high heat. Grill patties for 4-5 minutes on each side.',
      'Place a cheddar cheese slice on top of each patty in the last minute of cooking; cover to melt cheese.',
      'Toast brioche buns, spread garlic aioli on base, layer with lettuce, tomato, beef patty, pickles, and caramelized onions. Serve hot!'
    ],
    prepTime: 15,
    cookTime: 15,
    difficulty: 'Easy',
    category: 'Lunch',
    tags: ['burger', 'beef', 'lunch', 'grill', 'comfort-food']
  },
  {
    title: 'Grandma’s Chocolate Fudge Cake',
    description: 'Rich, moist chocolate cake layered with decadent, glossy chocolate fudge icing. A crowd-pleasing classic dessert that is easy to make and melts in your mouth.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    ingredients: [
      '2 cups All-Purpose Flour',
      '2 cups Granulated Sugar',
      '3/4 cup Unsweetened Cocoa Powder',
      '2 tsp Baking Powder',
      '1.5 tsp Baking Soda',
      '1 tsp Salt',
      '2 large Eggs',
      '1 cup Milk',
      '1/2 cup Vegetable Oil',
      '1 cup Boiling Water (critical for chocolate blooming)'
    ],
    cookingSteps: [
      'Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.',
      'In a large bowl, whisk together flour, sugar, cocoa, baking powder, baking soda, and salt.',
      'Add eggs, milk, and oil. Beat on medium speed for 2 minutes. Stir in boiling water (batter will be thin).',
      'Pour into prepared pans and bake for 30 to 35 minutes until a toothpick inserted in the center comes out clean.',
      'Cool completely, ice with chocolate frosting, and assemble the layers.'
    ],
    prepTime: 20,
    cookTime: 35,
    difficulty: 'Medium',
    category: 'Dessert',
    tags: ['cake', 'chocolate', 'dessert', 'baking', 'sweet']
  },
  {
    title: 'Creamy Tuscan Garlic Chicken Pasta',
    description: 'An elegant Italian-inspired dinner plate featuring golden pan-seared chicken breast, baby spinach, sun-dried tomatoes, and penne tossed in a rich, creamy garlic parmesan sauce.',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800',
    ingredients: [
      '300g Penne Pasta',
      '2 Large Chicken Breasts (halved horizontally)',
      '2 tbsp Olive Oil',
      '3 cloves Garlic (minced)',
      '1/2 cup Sun-dried Tomatoes (drained)',
      '2 cups Fresh Spinach',
      '1 cup Heavy Cream',
      '1/2 cup Grated Parmesan Cheese'
    ],
    cookingSteps: [
      'Cook penne pasta in a pot of salted boiling water according to package instructions. Drain and set aside.',
      'Season chicken breasts with salt, pepper, and Italian seasoning. Pan-fry in olive oil until golden and fully cooked, then slice into strips.',
      'In the same pan, sauté minced garlic for 1 minute. Add sun-dried tomatoes and fresh spinach until spinach is wilted.',
      'Pour in heavy cream, bring to a simmer, then stir in grated parmesan cheese until the sauce thickens.',
      'Toss pasta and sliced chicken in the Tuscan cream sauce. Garnish with more parmesan and serve.'
    ],
    prepTime: 15,
    cookTime: 20,
    difficulty: 'Medium',
    category: 'Dinner',
    tags: ['pasta', 'chicken', 'tuscan', 'dinner', 'creamy', 'italian']
  },
  {
    title: 'Healthy Avocado Toast with Poached Egg',
    description: 'Sourdough toast topped with creamy mashed avocado seasoned with lemon juice, sea salt, chili flakes, and finished with a perfectly poached organic egg.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
    ingredients: [
      '2 thick slices Sourdough Bread',
      '1 ripe Haas Avocado',
      '1 tsp Lemon juice',
      '2 Fresh Organic Eggs',
      '1/2 tsp Red Chili flakes',
      'Freshly ground Black Pepper and Sea Salt'
    ],
    cookingSteps: [
      'Toast sourdough slices until golden brown and crispy.',
      'Mash avocado flesh in a bowl with lemon juice, sea salt, and black pepper.',
      'Poach eggs: bring a pot of water to a gentle simmer with a drop of vinegar, stir to form a vortex, drop eggs in, and cook for 3 minutes.',
      'Spread avocado mash evenly over toast, place poached eggs on top, and sprinkle with chili flakes. Serve immediately.'
    ],
    prepTime: 10,
    cookTime: 5,
    difficulty: 'Easy',
    category: 'Breakfast',
    tags: ['breakfast', 'avocado', 'toast', 'egg', 'healthy']
  }
];

const seedDB = async () => {
  try {
    // Connect database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipe_social_network');
    console.log('Seeder: MongoDB Connected...');

    // Clear existing collections
    await User.deleteMany();
    await Recipe.deleteMany();
    await Comment.deleteMany();
    console.log('Seeder: Cleaned existing collections.');

    // Seed Users
    const createdUsers = await User.create(usersData);
    console.log('Seeder: Seeded users successfully.');

    // Map authors to recipes
    const admin = createdUsers[0];
    const gordon = createdUsers[1];
    const sarah = createdUsers[2];

    recipesData[0].author = gordon._id; // Burger by gordon
    recipesData[1].author = sarah._id;  // Cake by sarah
    recipesData[2].author = gordon._id; // Pasta by gordon
    recipesData[3].author = sarah._id;  // Toast by sarah

    // Seed Recipes
    const createdRecipes = await Recipe.create(recipesData);
    console.log('Seeder: Seeded recipes successfully.');

    // Seed cross-social follows
    gordon.following.push(sarah._id);
    sarah.followers.push(gordon._id);

    sarah.following.push(gordon._id);
    gordon.followers.push(sarah._id);

    admin.following.push(gordon._id);
    admin.following.push(sarah._id);
    gordon.followers.push(admin._id);
    sarah.followers.push(admin._id);

    // Seed Likes
    const burger = createdRecipes[0];
    const cake = createdRecipes[1];

    burger.likes.push(sarah._id);
    burger.likes.push(admin._id);
    cake.likes.push(gordon._id);
    cake.likes.push(admin._id);

    await Promise.all([
      gordon.save(),
      sarah.save(),
      admin.save(),
      burger.save(),
      cake.save()
    ]);
    console.log('Seeder: Set up likes and follow networks.');

    // Seed Comments
    await Comment.create([
      {
        recipe: burger._id,
        author: sarah._id,
        content: 'This burger looks incredibly delicious, Gordon! Making it this weekend!'
      },
      {
        recipe: burger._id,
        author: admin._id,
        content: 'Perfect ratios. The garlic aioli adds the best finish.'
      },
      {
        recipe: cake._id,
        author: gordon._id,
        content: 'Lovely texture on the sponge. Outstanding pastry craft!'
      }
    ]);
    console.log('Seeder: Seeded comment logs.');

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
