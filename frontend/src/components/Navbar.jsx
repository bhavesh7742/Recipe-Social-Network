import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Home, Compass, PlusSquare, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Feed', icon: <Home className="h-5 w-5" /> },
    { path: '/explore', label: 'Explore', icon: <Compass className="h-5 w-5" /> },
    { path: '/recipe/create', label: 'Create', icon: <PlusSquare className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-500 font-bold text-xl group transition-all shrink-0">
            <ChefHat className="h-7 w-7 transition-transform group-hover:rotate-12 duration-300" />
            <span className="bg-gradient-to-r from-primary-600 to-orange-500 bg-clip-text text-transparent group-hover:opacity-95">RecipeNet</span>
          </Link>

          {/* Desktop Nav Items */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Admin Access Link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-rose-600'
                  }`}
                >
                  <ShieldAlert className="h-5 w-5" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right Area Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={`/profile/${user.username}`}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all ${
                    isActive(`/profile/${user.username}`)
                      ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/10 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center overflow-hidden shrink-0 border border-primary-200 dark:border-primary-900">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                  <span className="text-sm font-semibold">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu and theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {user && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
            {!user && (
              <Link to="/login" className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700">
                Log In
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && user && (
        <div className="md:hidden animate-fade-in border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                isActive(link.path)
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                isActive('/admin')
                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="h-5 w-5" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <Link
            to={`/profile/${user.username}`}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
              isActive(`/profile/${user.username}`)
                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <User className="h-5 w-5" />
            <span>My Profile ({user.username})</span>
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
