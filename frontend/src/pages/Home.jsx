import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, TrendingUp, Users, Sparkles, Plus, Search, ChevronRight, UserPlus, UserCheck } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/SkeletonLoader';
import Toast from '../components/Toast';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [feedType, setFeedType] = useState('recent'); // 'recent', 'feed', 'trending'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      let url = '/recipes';
      if (feedType === 'trending') {
        url = '/recipes?sort=trending';
      } else if (feedType === 'feed') {
        url = '/recipes?sort=feed';
      }
      
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setRecipes(res.data.recipes);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setToast({ message: 'Failed to fetch recipes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) return;
    try {
      const res = await api.get('/users/suggestions');
      if (res.data && res.data.success) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.error('Error fetching follow suggestions:', err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [feedType, user]);

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFollowUser = async (targetId, targetUsername) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.put(`/users/follow/${targetId}`);
      if (res.data && res.data.success) {
        setToast({
          message: res.data.isFollowing 
            ? `Followed @${targetUsername}` 
            : `Unfollowed @${targetUsername}`,
          type: 'success'
        });
        
        // Refresh suggestions and feed
        fetchSuggestions();
        if (feedType === 'feed') {
          fetchRecipes();
        }
      }
    } catch (err) {
      console.error('Error following user:', err);
      setToast({ message: 'Failed to perform follow action', type: 'error' });
    }
  };

  const categories = [
    { name: 'Breakfast', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=100&h=100&fit=crop' },
    { name: 'Lunch', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
    { name: 'Dinner', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop' },
    { name: 'Dessert', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=100&h=100&fit=crop' },
    { name: 'Salad', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Hero Welcome banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-orange-500 to-amber-500 text-white p-8 md:p-12 mb-8 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider mb-4 border border-white/10 uppercase">
            <Sparkles className="h-4 w-4 text-amber-300" />
            Connect, Cook & Share
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Discover the Art of <br />
            Social Cooking
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-6 font-medium max-w-lg">
            Create, share, and save your favorite recipes from kitchen masters worldwide. Follow chefs and like meals.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/recipe/create"
              className="inline-flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-50 transition-colors font-bold px-6 py-3 rounded-2xl shadow-sm text-sm"
            >
              <Plus className="h-5 w-5 text-primary-600" />
              Share Your Recipe
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors font-bold px-6 py-3 rounded-2xl text-sm border border-white/20"
            >
              Explore Recipes
            </Link>
          </div>
        </div>
        {/* Background Decorative Circles */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent hidden md:block rounded-full transform translate-x-20 translate-y-20 scale-150 pointer-events-none" />
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Recipe Feeds Grid (8 cols) */}
        <main className="lg:col-span-8 space-y-6">
          
          {/* Feed Headers & Tab Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setFeedType('recent')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  feedType === 'recent'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Recent Feed
              </button>
              
              <button
                onClick={() => setFeedType('trending')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  feedType === 'trending'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Trending
              </button>

              {user && (
                <button
                  onClick={() => setFeedType('feed')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    feedType === 'feed'
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Following
                </button>
              )}
            </div>

            {/* Quick mini-search form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipe, tag..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </form>
          </div>

          {/* Recipe List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} onUpdate={fetchRecipes} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                <ChefHat className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Recipes Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                {feedType === 'feed' 
                  ? "You haven't followed anyone yet or your friends haven't posted. Check the Recent Feed!" 
                  : "Be the first to post a new recipe in this community!"}
              </p>
              {feedType === 'feed' ? (
                <button
                  onClick={() => setFeedType('recent')}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Explore Recent Feed
                </button>
              ) : (
                <Link
                  to="/recipe/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Post a Recipe
                </Link>
              )}
            </div>
          )}

        </main>

        {/* Right Side: Sidebar Panels (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">

          {/* Quick Categories chips grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Popular Categories
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/explore?category=${cat.name}`}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-xl object-cover" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {cat.name}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Follow Suggestions (Only shown to authenticated users) */}
          {user && suggestions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" />
                Who to Follow
              </h3>
              <div className="space-y-4">
                {suggestions.map((suggestUser) => (
                  <div key={suggestUser._id} className="flex items-center justify-between gap-3">
                    
                    <Link
                      to={`/profile/${suggestUser.username}`}
                      className="flex items-center gap-2.5 min-w-0 hover:opacity-85"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0">
                        {suggestUser.profilePicture ? (
                          <img src={suggestUser.profilePicture} alt={suggestUser.username} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                            {suggestUser.username.substring(0,2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                          @{suggestUser.username}
                        </h4>
                        <p className="text-xs text-slate-400 truncate max-w-[130px]">
                          {suggestUser.bio || 'Chef in training'}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleFollowUser(suggestUser._id, suggestUser.username)}
                      className="inline-flex items-center gap-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/30 dark:hover:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Follow
                    </button>

                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>

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
