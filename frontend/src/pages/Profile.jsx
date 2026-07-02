import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, BookOpen, Bookmark, Edit, Users, X, Check, Save } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { ProfileHeaderSkeleton } from '../components/SkeletonLoader';
import Toast from '../components/Toast';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const isOwnProfile = currentUser && currentUser.username === username;

  const [profileUser, setProfileUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Follower modals/toggles
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [modalListType, setModalListType] = useState('followers'); // 'followers' or 'following'

  // Profile Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [updating, setUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes', 'saved'
  const [toast, setToast] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchProfileData = async () => {
    try {
      const res = await api.get(`/users/profile/${username}`);
      if (res.data && res.data.success) {
        setProfileUser(res.data.user);
        setRecipes(res.data.recipes);
        setBio(res.data.user.bio || '');
        setProfilePicture(res.data.user.profilePicture || '');
        
        setIsFollowing(currentUser ? res.data.user.followers?.some(f => f._id === currentUser._id) : false);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error retrieving user profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedRecipes = async () => {
    if (!isOwnProfile) return;
    try {
      const res = await api.get('/users/saved');
      if (res.data && res.data.success) {
        setSavedRecipes(res.data.savedRecipes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfileData();
  }, [username, currentUser]);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedRecipes();
    }
  }, [activeTab]);

  const handleFollow = async () => {
    if (!currentUser) {
      setToast({ message: 'Please sign in to follow users', type: 'error' });
      return;
    }

    try {
      const res = await api.put(`/users/follow/${profileUser._id}`);
      if (res.data && res.data.success) {
        setIsFollowing(res.data.isFollowing);
        // Refresh local stats
        fetchProfileData();
        setToast({ 
          message: res.data.isFollowing ? `Followed @${profileUser.username}` : `Unfollowed @${profileUser.username}`, 
          type: 'success' 
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const res = await updateProfile(bio, profilePicture);
    setUpdating(false);

    if (res.success) {
      setIsEditing(false);
      fetchProfileData();
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } else {
      setToast({ message: res.message || 'Error updating profile', type: 'error' });
    }
  };

  const openConnectionModal = (type) => {
    setModalListType(type);
    setShowFollowersModal(true);
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><ProfileHeaderSkeleton /></div>;
  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold">Profile not found</h3>
        <Link to="/" className="text-primary-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  // Handle local uploaded image vs absolute url
  const avatarSrc = profileUser.profilePicture?.startsWith('/uploads')
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profileUser.profilePicture}`
    : profileUser.profilePicture;

  const connectionList = modalListType === 'followers' ? profileUser.followers : profileUser.following;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Profile Picture */}
          <div className="h-28 w-28 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-md shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt={profileUser.username} className="h-full w-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-primary-600 dark:text-primary-400" />
            )}
          </div>

          {/* User Meta Details */}
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  @{profileUser.username}
                </h1>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  {profileUser.role === 'admin' ? 'Administrator' : 'Master Chef'}
                </p>
              </div>

              {/* Follow or Edit Profile buttons */}
              <div className="flex gap-2 justify-center md:justify-end">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Profile Bio */}
            <p className="text-slate-600 dark:text-slate-350 text-sm max-w-2xl leading-relaxed">
              {profileUser.bio || 'This chef hasn\'t written a bio yet. Keep cooking!'}
            </p>

            {/* User Statistics counts */}
            <div className="flex justify-center md:justify-start gap-8 pt-2">
              <div className="text-center md:text-left">
                <span className="block text-lg font-black text-slate-800 dark:text-slate-150">{recipes.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipes</span>
              </div>

              <button
                onClick={() => openConnectionModal('followers')}
                className="text-center md:text-left hover:opacity-80 transition-opacity"
              >
                <span className="block text-lg font-black text-slate-800 dark:text-slate-150">
                  {profileUser.followers?.length || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Followers</span>
              </button>

              <button
                onClick={() => openConnectionModal('following')}
                className="text-center md:text-left hover:opacity-80 transition-opacity"
              >
                <span className="block text-lg font-black text-slate-800 dark:text-slate-150">
                  {profileUser.following?.length || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Following</span>
              </button>
            </div>

          </div>

        </div>

        {/* Inline Bio/Avatar Editing Form panel */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4 max-w-xl animate-fade-in">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Update Profile Details</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Profile bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                placeholder="Share something about your cooking journey..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-150 text-xs focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Avatar Image Web URL (Or local base64/URL)
              </label>
              <input
                type="text"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://images.unsplash.com/... or paste image path"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-150 text-xs focus:bg-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                {updating ? 'Saving...' : 'Save details'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Grid Tab Views */}
      <div className="space-y-6">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-colors ${
              activeTab === 'recipes'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Authored Recipes ({recipes.length})</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-colors ${
                activeTab === 'saved'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Saved Bookmarks</span>
            </button>
          )}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'recipes' ? (
          recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} onUpdate={fetchProfileData} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-850 shadow-sm space-y-3">
              <User className="h-10 w-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-350">No Recipes Posted Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">This author hasn't shared any culinary creations yet.</p>
              {isOwnProfile && (
                <Link
                  to="/recipe/create"
                  className="inline-block mt-2 px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-primary-700"
                >
                  Post First Recipe
                </Link>
              )}
            </div>
          )
        ) : (
          savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} onUpdate={fetchSavedRecipes} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-850 shadow-sm space-y-3">
              <Bookmark className="h-10 w-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-350">No Saved Bookmarks</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Bookmark recipes from your feeds to save them here for quick access.</p>
              <Link
                to="/"
                className="inline-block mt-2 px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-primary-700"
              >
                Browse Recipes Feed
              </Link>
            </div>
          )
        )}

      </div>

      {/* Followers / Following Modal overlay */}
      {showFollowersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4 shrink-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" />
                {modalListType === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scroll content list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {connectionList && connectionList.length > 0 ? (
                connectionList.map((connUser) => (
                  <div key={connUser._id} className="flex items-center gap-3">
                    
                    <Link
                      to={`/profile/${connUser.username}`}
                      onClick={() => setShowFollowersModal(false)}
                      className="flex items-center gap-3 hover:opacity-85 min-w-0"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden border shrink-0">
                        {connUser.profilePicture ? (
                          <img
                            src={connUser.profilePicture.startsWith('/uploads')
                              ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${connUser.profilePicture}`
                              : connUser.profilePicture}
                            alt={connUser.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                          @{connUser.username}
                        </h4>
                        <p className="text-xs text-slate-450 truncate max-w-[190px]">
                          {connUser.bio || 'Chef enthusiast'}
                        </p>
                      </div>
                    </Link>

                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-slate-400 font-semibold">
                  No accounts in this list.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

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
