import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Flame, User, Heart, Bookmark, MessageSquare, Send, Trash2, ShieldCheck, ArrowLeft, CheckSquare, Square, ChefHat, Plus, Check } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { PageLoader } from '../components/SkeletonLoader';
import Toast from '../components/Toast';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Interactive cooking checklists
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});
  
  // Social/Comments State
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fetchRecipeDetails = async () => {
    try {
      const res = await api.get(`/recipes/${id}`);
      if (res.data && res.data.success) {
        const data = res.data.recipe;
        setRecipe(data);
        setLikesCount(data.likes?.length || 0);
        setIsLiked(user ? data.likes?.includes(user._id) : false);
        setIsSaved(user ? user.savedRecipes?.includes(data._id) : false);
        setIsFollowing(user ? data.author?.followers?.includes(user._id) : false);
      }
    } catch (err) {
      console.error('Error fetching recipe detail:', err);
      setToast({ message: 'Recipe not found or server error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.put(`/recipes/${recipe._id}/like`);
      if (res.data && res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Error liking:', err);
    }
  };

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.put(`/recipes/${recipe._id}/save`);
      if (res.data && res.data.success) {
        setIsSaved(res.data.isSaved);
        setToast({
          message: res.data.isSaved ? 'Saved to bookmarks' : 'Removed from bookmarks',
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  const handleFollowAuthor = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.put(`/users/follow/${recipe.author._id}`);
      if (res.data && res.data.success) {
        setIsFollowing(res.data.isFollowing);
        setToast({
          message: res.data.isFollowing 
            ? `Followed @${recipe.author.username}` 
            : `Unfollowed @${recipe.author.username}`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error following:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/recipes/${recipe._id}/comment`, { content: commentText.trim() });
      if (res.data && res.data.success) {
        // Append new comment to recipe comments
        setRecipe((prev) => ({
          ...prev,
          comments: [...prev.comments, res.data.comment]
        }));
        setCommentText('');
        setToast({ message: 'Comment posted successfully!', type: 'success' });
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setToast({ message: 'Failed to post comment', type: 'error' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/recipes/comment/${commentId}`);
      if (res.data && res.data.success) {
        setRecipe((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c._id !== commentId)
        }));
        setToast({ message: 'Comment deleted successfully', type: 'success' });
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setToast({ message: 'Failed to delete comment', type: 'error' });
    }
  };

  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        const res = await api.delete(`/recipes/${recipe._id}`);
        if (res.data && res.data.success) {
          navigate('/');
        }
      } catch (err) {
        console.error('Error deleting recipe:', err);
        setToast({ message: 'Failed to delete recipe', type: 'error' });
      }
    }
  };

  if (loading) return <PageLoader />;
  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold">Recipe not found</h3>
        <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">Go back home</Link>
      </div>
    );
  }

  // Convert image URL to point to backend server if needed
  const imageSrc = recipe.image?.startsWith('/uploads')
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${recipe.image}`
    : recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Main Details Banner split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Cover Photo & Fast Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-md aspect-video">
            <img src={imageSrc} alt={recipe.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Overlay Category tag */}
            <div className="absolute bottom-6 left-6">
              <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                {recipe.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-2 drop-shadow-sm">
                {recipe.title}
              </h1>
            </div>
          </div>

          {/* Times & Difficulty stats bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex justify-around items-center text-center shadow-sm">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Difficulty</div>
              <span className={`text-sm font-extrabold px-3 py-1 rounded-full border shadow-sm ${
                recipe.difficulty === 'Easy' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                recipe.difficulty === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
              }`}>
                {recipe.difficulty}
              </span>
            </div>
            
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
            
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 justify-center">
                <Clock className="h-3.5 w-3.5" /> Prep
              </div>
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{recipe.prepTime}m</span>
            </div>

            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />

            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 justify-center">
                <Clock className="h-3.5 w-3.5" /> Cook
              </div>
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{recipe.cookTime}m</span>
            </div>

            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />

            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Time</div>
              <span className="text-base font-extrabold text-primary-600 dark:text-primary-400">{totalTime} mins</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recipe Story</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {recipe.description}
            </p>
          </div>
        </div>

        {/* Author Card & Main Social Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Author Details box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            <Link to={`/profile/${recipe.author?.username}`}>
              <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center overflow-hidden border-2 border-primary-200 dark:border-primary-800 mb-3 shadow-inner">
                {recipe.author?.profilePicture ? (
                  <img
                    src={recipe.author.profilePicture.startsWith('/uploads')
                      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${recipe.author.profilePicture}`
                      : recipe.author.profilePicture}
                    alt={recipe.author.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                )}
              </div>
            </Link>
            
            <Link to={`/profile/${recipe.author?.username}`}>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-primary-600 transition-colors">
                @{recipe.author?.username}
              </h4>
            </Link>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{recipe.author?.bio || 'Passionate foodie chef'}</p>

            <div className="flex gap-2 mt-4 w-full justify-center">
              {/* Follow Toggle */}
              {user && user._id !== recipe.author?._id && (
                <button
                  onClick={handleFollowAuthor}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow Chef'}
                </button>
              )}

              {/* Author modification edit/delete buttons */}
              {user && (user._id === recipe.author?._id || user.role === 'admin') && (
                <>
                  <Link
                    to={`/recipe/edit/${recipe._id}`}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDeleteRecipe}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Social interact floating bars */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-around">
            
            {/* Heart Likes */}
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-1.5 text-xs font-semibold p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
                isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Heart className={`h-6 w-6 active:scale-125 transition-transform ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount} Likes</span>
            </button>

            {/* Bookmarks */}
            <button
              onClick={handleSave}
              className={`flex flex-col items-center gap-1.5 text-xs font-semibold p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
                isSaved ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bookmark className={`h-6 w-6 active:scale-125 transition-transform ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Comment counter indicator */}
            <div className="flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-400 p-2.5">
              <MessageSquare className="h-6 w-6 text-slate-400" />
              <span>{recipe.comments?.length || 0} Comments</span>
            </div>

          </div>

        </div>

      </div>

      {/* Cooking Ingredients & Steps split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Ingredients Checklist (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Ingredients
          </h3>
          <p className="text-slate-400 text-xs mb-5 font-semibold">Check items off as you prepare them in your kitchen:</p>
          
          <div className="space-y-3.5">
            {recipe.ingredients?.map((ing, idx) => {
              const isChecked = !!checkedIngredients[idx];
              return (
                <div
                  key={idx}
                  onClick={() => setCheckedIngredients({ ...checkedIngredients, [idx]: !isChecked })}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-950/40 dark:bg-emerald-950/10 text-slate-400 dark:text-slate-500 line-through'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isChecked ? (
                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-sm font-semibold">{ing}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cooking Steps checklists (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary-500" />
            Cooking Steps
          </h3>
          <p className="text-slate-400 text-xs mb-5 font-semibold">Follow step-by-step and check completed tasks:</p>
          
          <div className="space-y-6">
            {recipe.cookingSteps?.map((step, idx) => {
              const isStepDone = !!completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => setCompletedSteps({ ...completedSteps, [idx]: !isStepDone })}
                  className={`flex gap-4 items-start cursor-pointer select-none group p-2 rounded-2xl transition-all ${
                    isStepDone ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 border text-xs font-bold transition-colors ${
                    isStepDone
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium leading-relaxed ${
                      isStepDone
                        ? 'text-slate-400 dark:text-slate-500 line-through'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Comment Section (Grid) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-500" />
          Community Discussion
          <span className="text-xs font-medium text-slate-400 ml-1">({recipe.comments?.length || 0})</span>
        </h3>

        {/* Comment form (only authenticated) */}
        {user ? (
          <form onSubmit={handleAddComment} className="flex gap-3 items-start">
            <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-primary-600" />
              )}
            </div>
            <div className="flex-1 relative">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts or ask a question about this recipe..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white resize-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 dark:disabled:bg-slate-850 text-white disabled:text-slate-400 transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 text-center text-sm font-semibold text-slate-500">
            Please{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
              Sign In
            </Link>{' '}
            to participate in comments and discussions.
          </div>
        )}

        {/* Comments Listing */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {recipe.comments && recipe.comments.length > 0 ? (
            recipe.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 items-start group/comment">
                
                <Link to={`/profile/${comment.author?.username}`} className="shrink-0">
                  <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    {comment.author?.profilePicture ? (
                      <img src={comment.author.profilePicture.startsWith('/uploads')
                        ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${comment.author.profilePicture}`
                        : comment.author.profilePicture} alt={comment.author.username} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </Link>

                <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/profile/${comment.author?.username}`} className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:underline">
                        @{comment.author?.username}
                      </Link>
                      {comment.author?.role === 'admin' && (
                        <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          <ShieldCheck className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                {/* Comment Delete for author or admin */}
                {user && (user._id === comment.author?._id || user.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 self-center opacity-0 group-hover/comment:opacity-100 transition-opacity shrink-0"
                    title="Delete Comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

              </div>
            ))
          ) : (
            <div className="text-center py-6 text-sm text-slate-400 font-medium">
              No comments yet. Share your experience or questions first!
            </div>
          )}
        </div>

      </section>

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
