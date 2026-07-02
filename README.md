# Recipe Social Network

### **Intern Details**
* **Intern ID**: `COD93721` (Placeholder - Please replace with your actual ID)
* **Full Name**: `John Doe` (Placeholder - Please replace with your actual Name)
* **Project Name**: `Recipe Social Network`
* **Domain**: `MERN Stack Web Development`

---

## 📖 Introduction
A comprehensive, advanced social media platform built using the MERN stack. The **Recipe Social Network** enables cooking enthusiasts and professional chefs to share recipes, discover culinary ideas, interact via comments and likes, build a follower network, and save bookmarks. It features a stunning modern responsive UI, dark/light mode switches, toast notifications, skeleton loading animations, and moderator administrative metrics dashboards.

---

## 🛠️ Tech Stack
* **Frontend**: React.js, Tailwind CSS, Lucide Icons, Axios, React Router v6
* **Backend**: Node.js, Express.js, Multer (Local Image Storage uploads)
* **Database**: MongoDB, Mongoose ODM
* **Security & Auth**: JWT (JSON Web Tokens) Bearer Authentication, bcryptjs (Password Hashing)

---

## 🚀 Key Features

1. **Secure Authentication**
   * Member Registration & Secure Login.
   * State-persistent JWT Bearer tokens.
   * Forgot Password flow featuring local simulation PIN displays.

2. **Chef User Profiles**
   * Update profile details (biography and avatar profile pictures).
   * Connection networks (Follow/Unfollow chefs).
   * Interactive modals showing Followers and Following members.
   * Personal dashboard displaying authored recipes and saved bookmarks.

3. **Recipe Creation & Editing**
   * Multi-part forms supporting description, category, difficulty levels, prep/cook time, and tag inputs.
   * Dynamic lists to add/remove ingredients and steps.
   * Image file upload (via Multer local disk storage) or external URL pasting.

4. **Social & Engagement Features**
   * Real-time Likes toggle with optimistic UI counters.
   * Real-time Bookmarks/Saves to personal accounts.
   * Interactive ingredients checklist and step-by-step checkboxes for cooking assistance.
   * Discussion forums: post comments, read member comments, and delete comments.

5. **Advanced Search & Filtering**
   * Global keyword query matches on titles, description texts, or tags.
   * Filter side drawers: category selection, difficulty levels, and total cooking time limit filters.
   * Tabbed feeds toggle: Recent Recipes, Trending Recipes (likes-based aggregation), and Following Feed.

6. **Admin Moderation & Analytics**
   * Analytics widgets displaying total member counts, recipe volume, and comments.
   * Visual progress distributions showing recipe counts per category.
   * Moderation lists: view member accounts, delete inappropriate member accounts, and delete inappropriate recipe posts.

7. **Visual Excellence (UI/UX)**
   * Mobile-first responsive grid layouts.
   * Dark/Light mode theme switching.
   * Pulsing skeleton loading layouts and page loaders.
   * Floating toast notifications.

---

## 📁 Folder Structure

```
Recipe Social Network/
├── backend/
│   ├── config/
│   │   └── db.js             # MongoDB Connection Configuration
│   ├── controllers/
│   │   ├── adminController.js # Analytics & moderation controls
│   │   ├── authController.js  # Registration, login, password recoveries
│   │   ├── recipeController.js# CRUD, likes, comments, saved recipes
│   │   └── userController.js  # Profiles, followers, follow suggestion
│   ├── middleware/
│   │   ├── adminMiddleware.js # Role restriction checks
│   │   └── authMiddleware.js  # JWT token validation filters
│   ├── models/
│   │   ├── Comment.js         # Mongoose Comment schema
│   │   ├── Recipe.js          # Mongoose Recipe schema
│   │   └── User.js            # Mongoose User schema (with hashing)
│   ├── routes/
│   │   ├── adminRoutes.js     # Admin endpoints mount mapping
│   │   ├── authRoutes.js      # Auth endpoints mapping
│   │   ├── recipeRoutes.js    # Recipes CRUD & social mapping
│   │   └── userRoutes.js      # Users following & profiles mapping
│   ├── uploads/               # Destination for local image uploads
│   ├── .env.example           # Backend environment vars keys
│   ├── .env                   # Local backend configuration
│   ├── package.json           # Backend dependencies and scripts
│   ├── seed.js                # Database seeder script
│   └── server.js              # Express entry startup server
├── frontend/
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Premium Glassmorphism Navbar
│   │   │   ├── RecipeCard.jsx      # Interactive Recipe Card item
│   │   │   ├── SkeletonLoader.jsx  # Pulsing loader frames
│   │   │   ├── ThemeToggle.jsx     # Sun/Moon mode selector
│   │   │   └── Toast.jsx           # Floating status alert component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Session persistence & Axios API
│   │   │   └── ThemeContext.jsx    # Dark Mode preferences state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx  # Administrator control console
│   │   │   ├── CreateRecipe.jsx    # Dual-purpose publish/edit form
│   │   │   ├── Explore.jsx         # Search and multi-variable filters
│   │   │   ├── ForgotPassword.jsx  # Password recovery panel
│   │   │   ├── Home.jsx            # Feed dashboards & suggestions
│   │   │   ├── Login.jsx           # Sign in form
│   │   │   ├── Profile.jsx         # User stats, follows, bookmarked grids
│   │   │   ├── RecipeDetail.jsx    # Cooking lists and comments thread
│   │   │   └── Register.jsx        # Account signup form
│   │   ├── App.jsx            # Routing mappings
│   │   ├── index.css          # Tailwind CSS global styling
│   │   └── main.jsx           # React app mount entry
│   ├── .env.example           # Frontend environment vars keys
│   ├── .env                   # Local frontend endpoint
│   ├── index.html             # Client HTML base
│   ├── package.json           # Frontend packages and build scripts
│   ├── postcss.config.js      # PostCSS configurations
│   ├── tailwind.config.js     # Tailwind CSS configuration rules
│   └── vite.config.js         # Vite configuration settings
├── package.json               # Root scripts to run both apps
└── README.md                  # Comprehensive project manual
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/recipe_social_network
JWT_SECRET=recipe_social_network_jwt_secret_key_987654321
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔌 API Documentation

All API requests should be sent to the base URL: `http://localhost:5000/api`

### 🔑 Authentication Routes (`/auth`)
* `POST /auth/register` - Create user profile. Returns JWT token. (Body: `username`, `email`, `password`)
* `POST /auth/login` - Verify password and login user. Returns JWT. (Body: `email`, `password`)
* `POST /auth/forgotpassword` - Request a password reset code. Returns 6-digit PIN in JSON for local testing. (Body: `email`)
* `POST /auth/resetpassword` - Reset password using 6-digit PIN. (Body: `resetCode`, `password`)
* `GET /auth/me` - Retrieve current logged-in user session. [AUTH PROTECTED]

### 🍔 Recipe Routes (`/recipes`)
* `GET /recipes` - Fetch recipes. Supports query filters: `?search=pasta&category=Dinner&difficulty=Medium&maxTime=30&sort=trending`.
* `POST /recipes` - Publish a recipe (supports Multipart file upload for `image` or text string for `image` URL). [AUTH PROTECTED]
* `GET /recipes/:id` - Fetch single recipe details along with populated comments.
* `PUT /recipes/:id` - Update owned recipe details (supports Multipart image files). [AUTH PROTECTED]
* `DELETE /recipes/:id` - Remove recipe post. [AUTH PROTECTED]
* `PUT /recipes/:id/like` - Toggle like status on recipe. [AUTH PROTECTED]
* `PUT /recipes/:id/save` - Toggle saved bookmarks status on recipe. [AUTH PROTECTED]
* `POST /recipes/:id/comment` - Post a comment to a recipe. (Body: `content`) [AUTH PROTECTED]
* `DELETE /recipes/comment/:commentId` - Remove comment from a recipe. [AUTH PROTECTED]

### 👤 User Routes (`/users`)
* `GET /users/profile/:username` - Get chef details and list of their recipes.
* `PUT /users/profile` - Update bio description and avatar picture URL. [AUTH PROTECTED]
* `PUT /users/follow/:id` - Toggle following profile of another user. [AUTH PROTECTED]
* `GET /users/saved` - Fetch bookmarks for current user. [AUTH PROTECTED]
* `GET /users/suggestions` - Suggest 5 users current user doesn't follow. [AUTH PROTECTED]

### 🛡️ Admin Routes (`/admin`)
* `GET /admin/analytics` - Fetch counts and categories distributions. [ADMIN PROTECTED]
* `GET /admin/users` - Fetch full user account index. [ADMIN PROTECTED]
* `DELETE /admin/users/:id` - Moderate deletion of user account (cascades deletion of recipes/comments). [ADMIN PROTECTED]

---

## 🏃 Installation & Running Instructions

### **Prerequisites**
1. **Node.js** installed on your workstation.
2. **MongoDB** service running locally (or access to a MongoDB Atlas cluster URL).

### **Execution Instructions**

1. **Clone the Repository** and enter the folder:
   ```bash
   cd "Recipe Social Network"
   ```

2. **Install all packages** for both folders from the root level:
   ```bash
   npm run install-all
   ```

3. **Seed Database** with realistic starter accounts and posts:
   ```bash
   cd backend
   node seed.js
   cd ..
   ```
   *(Note: The seed script registers `admin@recipenet.com` with password `adminpassword123` so you can log in directly as an administrator).*

4. **Launch the applications**:
   * To run the backend API server (port 5000):
     ```bash
     npm run server
     ```
   * To run the React client interface (port 5173):
     ```bash
     npm run client
     ```

5. Open your browser and navigate to `http://localhost:5173` to browse the social network.

---

## 📸 Screenshots & Output Images
*(Insert screenshots of the working MERN app inside these placeholder slots)*

### 1. Welcome Feed & Toggles (Light Theme)
![Home Screen Feed Placeholder](https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800)

### 2. Welcome Feed & Toggles (Dark Theme)
*(Image demonstrating the glassmorphic dark mode cards)*

### 3. Detailed Recipes View & Interactive Checklist
*(Image demonstrating the checking off ingredients and comments)*

### 4. Create & Edit Recipe Form
*(Image demonstrating dynamic list inputs)*

### 5. Administrative Dashboard (Analytics and Management Charts)
*(Image demonstrating bar distribution progress grids)*

---

## 📑 Documentation Section
* Detailed developer configurations are available inside the codebase code blocks.
* Authentication endpoints require passing the Bearer authorization header `Authorization: Bearer <token>`.
* All responsive classes are coded using native Tailwind CSS configurations (`sm:`, `md:`, `lg:` prefix utilities).

---

## 🔗 GitHub Repository
* **GitHub Link Placeholder**: `https://github.com/your-github-username/recipe-social-network`
