import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Clock, Flame, RotateCcw, AlertTriangle, ChefHat } from 'lucide-react';
import { api } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/SkeletonLoader';
import Toast from '../components/Toast';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState('');
  const [maxTime, setMaxTime] = useState('');
  
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchFilteredRecipes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      if (maxTime) params.maxTime = maxTime;

      const res = await api.get('/recipes', { params });
      if (res.data && res.data.success) {
        setRecipes(res.data.recipes);
      }
    } catch (err) {
      console.error('Error filtering recipes:', err);
      setToast({ message: 'Error retrieving filtered recipes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Run filter query on state or URL params change
  useEffect(() => {
    fetchFilteredRecipes();
  }, [category, difficulty, maxTime]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Update URL search parameters
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (difficulty) newParams.difficulty = difficulty;
    if (maxTime) newParams.maxTime = maxTime;
    setSearchParams(newParams);
    fetchFilteredRecipes();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setMaxTime('');
    setSearchParams({});
    // Fetch immediately after reset state
    setTimeout(() => {
      fetchFilteredRecipes();
    }, 100);
  };

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Salad', 'Appetizer', 'Snacks', 'Beverages'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const timeLimits = [
    { label: 'Under 15 Mins', value: '15' },
    { label: 'Under 30 Mins', value: '30' },
    { label: 'Under 60 Mins', value: '60' },
    { label: 'Under 2 Hours', value: '120' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Top Search bar & Filters toggle */}
      <div className="space-y-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes by name, tags, or ingredients..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm shadow-sm"
            />
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
          </div>
          
          <button
            type="submit"
            className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl text-sm shadow-sm hidden sm:block shrink-0"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3.5 border rounded-2xl text-sm font-bold flex items-center gap-2 transition-all ${
              showFilters || category || difficulty || maxTime
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </form>

        {/* Expanded Filters Drawer panel */}
        {(showFilters || category || difficulty || maxTime) && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-md animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary-500" />
                Refine Recipes
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Recipe Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm"
                >
                  <option value="">All Levels</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              {/* Cooking time limit */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Total Cooking Time
                </label>
                <select
                  value={maxTime}
                  onChange={(e) => setMaxTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm"
                >
                  <option value="">Any Time</option>
                  {timeLimits.map((limit) => (
                    <option key={limit.value} value={limit.value}>{limit.label}</option>
                  ))}
                </select>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Grid Results */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          {search ? `Search Results for "${search}"` : 'Explore Culinary Creations'}
          <span className="text-sm font-medium text-slate-400 ml-2">({recipes.length} found)</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} onUpdate={fetchFilteredRecipes} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
              <ChefHat className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Recipes Match Your Search</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
              Try adjusting your query, category selections, difficulty limits, or cooking time filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
