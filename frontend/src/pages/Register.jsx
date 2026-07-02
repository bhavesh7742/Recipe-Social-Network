import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      setToast({ message: 'All fields are required', type: 'error' });
      return;
    }

    if (username.length < 3) {
      setToast({ message: 'Username must be at least 3 characters', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    const res = await register(username, email, password);
    setLoading(false);

    if (res.success) {
      setToast({ message: 'Account registered successfully!', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } else {
      setToast({ message: res.message || 'Registration failed. Try again.', type: 'error' });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 mb-4 shadow-inner">
            <ChefHat className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join the community and explore endless recipes
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white dark:focus:bg-slate-900"
                  placeholder="chef_master"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white dark:focus:bg-slate-900"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white dark:focus:bg-slate-900"
                  placeholder="•••••••• (Min 6 chars)"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white dark:focus:bg-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
              </span>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline"
            >
              Sign in instead
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>

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
