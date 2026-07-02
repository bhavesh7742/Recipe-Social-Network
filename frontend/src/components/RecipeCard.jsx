import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Clock, Flame, User, MessageCircle } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';

export default function RecipeCard({ recipe, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [likesCount, setLikesCount] = useState(recipe.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(user ? recipe.likes?.includes(user._id) : false);
  const [isSaved, setIsSaved] = useState(user ? user.savedRecipes?.includes(recipe._id) : false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Sync state if recipe changes
  useEffect(() => {
    setLikesCount(recipe.likes?.length || 0);
    setIsLiked(user ? recipe.likes?.includes(user._id) : false);
    setIsSaved(user ? user.savedRecipes?.includes(recipe._id) : false);
  }, [recipe, user]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (likeLoading) return;

    setLikeLoading(true);
    // Optimistic UI updates
    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const res = await api.put(`/recipes/${recipe._id}/like`);
      if (res.data && res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      console.error('Error liking recipe:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (saveLoading) return;

    setSaveLoading(true);
    // Optimistic UI
    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      const res = await api.put(`/recipes/${recipe._id}/save`);
      if (res.data && res.data.success) {
        setIsSaved(res.data.isSaved);
        // Sync user context savedRecipes
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      setIsSaved(previousSaved);
      console.error('Error bookmarking recipe:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
    Hard: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
  };

  // Convert relative url to absolute for backend uploads, else use directly
  const imageSrc = recipe.image?.startsWith('/uploads')
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${recipe.image}`
    : recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      
      {/* Recipe Cover Image */}
      <Link to={`/recipe/${recipe._id}`} className="relative h-48 sm:h-52 block overflow-hidden shrink-0">
        <img
          src={imageSrc}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Floating Badge */}
        <span className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          {recipe.category}
        </span>

        {/* Difficulty Floating Badge */}
        <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${difficultyColors[recipe.difficulty] || difficultyColors.Medium}`}>
          {recipe.difficulty}
        </span>
      </Link>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Preparation & Cook Time */}
          <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold mb-3">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              {totalTime} mins
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-400" />
              {recipe.ingredients?.length || 0} ingredients
            </span>
          </div>

          {/* Title */}
          <Link to={`/recipe/${recipe._id}`}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
              {recipe.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
            {recipe.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          
          {/* Author info */}
          <Link
            to={`/profile/${recipe.author?.username}`}
            className="flex items-center gap-2 group/author hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
              {recipe.author?.profilePicture ? (
                <img
                  src={recipe.author.profilePicture.startsWith('/uploads')
                    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${recipe.author.profilePicture}`
                    : recipe.author.profilePicture}
                  alt={recipe.author.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover/author:text-primary-600 dark:group-hover/author:text-primary-400">
              @{recipe.author?.username || 'chef'}
            </span>
          </Link>

          {/* Engagement counts / toggles */}
          <div className="flex items-center gap-3">
            
            {/* Like Toggle */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs font-semibold p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                isLiked
                  ? 'text-rose-500 hover:text-rose-600'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`h-4 w-4 transition-transform active:scale-125 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                isSaved
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
