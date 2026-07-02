import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Users, BookOpen, MessageSquare, Trash2, ArrowLeft, BarChart3, AlertTriangle, UserMinus } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { PageLoader, TableSkeleton } from '../components/SkeletonLoader';
import Toast from '../components/Toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user]);

  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users')
      ]);

      if (analyticsRes.data && analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }
      
      if (usersRes.data && usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to retrieve administrative analytics', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleDeleteUser = async (userId, targetUsername) => {
    if (userId === user._id) {
      setToast({ message: 'You cannot delete your own admin account!', type: 'error' });
      return;
    }

    if (window.confirm(`Are you sure you want to delete user @${targetUsername} and all their posted recipes/comments? This cannot be undone.`)) {
      try {
        const res = await api.delete(`/admin/users/${userId}`);
        if (res.data && res.data.success) {
          setToast({ message: `User @${targetUsername} deleted successfully`, type: 'success' });
          fetchAdminData(); // Refresh list & counts
        }
      } catch (err) {
        console.error(err);
        setToast({ message: 'Error deleting user', type: 'error' });
      }
    }
  };

  const handleDeleteInappropriateRecipe = async (recipeId, recipeTitle) => {
    if (window.confirm(`Are you sure you want to remove recipe "${recipeTitle}" for inappropriate content?`)) {
      try {
        const res = await api.delete(`/recipes/${recipeId}`);
        if (res.data && res.data.success) {
          setToast({ message: 'Recipe removed successfully', type: 'success' });
          fetchAdminData(); // Refresh list & counts
        }
      } catch (err) {
        console.error(err);
        setToast({ message: 'Error removing recipe', type: 'error' });
      }
    }
  };

  if (loading) return <PageLoader />;
  if (!analytics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Admin Moderation Center
            </h1>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Control panels and dashboard statistics</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Feed
        </button>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* Metric Users */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{analytics.totalUsers}</span>
            <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Members</span>
          </div>
        </div>

        {/* Metric Recipes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{analytics.totalRecipes}</span>
            <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Recipes</span>
          </div>
        </div>

        {/* Metric Comments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{analytics.totalComments}</span>
            <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Comments</span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Category Breakdown Stats & Flagged Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-start">
        
        {/* Categories Bar chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-50 pb-3">
            <BarChart3 className="h-5 w-5 text-primary-500" />
            Category Recipe Distribution
          </h3>
          
          <div className="space-y-4">
            {analytics.categoryStats && analytics.categoryStats.length > 0 ? (
              analytics.categoryStats.map((stat) => {
                const percentage = Math.round((stat.count / analytics.totalRecipes) * 100) || 0;
                return (
                  <div key={stat.category} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-350">{stat.category}</span>
                      <span className="text-slate-400 font-bold">{stat.count} recipes ({percentage}%)</span>
                    </div>
                    {/* HSL tailored progress bar */}
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-orange-500"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-slate-400 py-6">No category distribution data</div>
            )}
          </div>
        </div>

        {/* Recipes moderation table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-55 pb-3">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            Recipes moderation (Trending list)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5">Title</th>
                  <th className="py-2.5">Author</th>
                  <th className="py-2.5 text-center">Likes</th>
                  <th className="py-2.5 text-right">Moderator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {analytics.trendingRecipes?.map((recipe) => (
                  <tr key={recipe._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="py-3 max-w-[200px] truncate pr-2">
                      <Link to={`/recipe/${recipe._id}`} className="hover:underline font-bold text-slate-800 dark:text-slate-200">
                        {recipe.title}
                      </Link>
                    </td>
                    <td className="py-3">@{recipe.author?.username}</td>
                    <td className="py-3 text-center">{recipe.likesCount}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteInappropriateRecipe(recipe._id, recipe.title)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors"
                        title="Remove Recipe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* User Accounts Moderation list */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-55 pb-3">
          <ShieldCheck className="h-5 w-5 text-indigo-500" />
          Member Directory & Account Management
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="py-3 px-2">Member</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Joined</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-355">
              {usersList.map((usr) => (
                <tr key={usr._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border">
                        {usr.profilePicture ? (
                          <img
                            src={usr.profilePicture.startsWith('/uploads')
                              ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${usr.profilePicture}`
                              : usr.profilePicture}
                            alt={usr.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] font-extrabold uppercase text-slate-500">
                            {usr.username.substring(0,2)}
                          </span>
                        )}
                      </div>
                      <Link to={`/profile/${usr.username}`} className="hover:underline font-bold text-slate-800 dark:text-slate-200">
                        @{usr.username}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3.5 px-2">{usr.email}</td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      usr.role === 'admin' 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-slate-400">{new Date(usr.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => handleDeleteUser(usr._id, usr.username)}
                      disabled={usr.role === 'admin'}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title={usr.role === 'admin' ? 'Cannot delete admins' : 'Delete user'}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
