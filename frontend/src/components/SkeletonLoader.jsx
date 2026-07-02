import React from 'react';

// Single recipe card skeleton loader
export function RecipeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200 dark:bg-slate-800 w-full" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

// Full page loader overlay
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse-slow">Loading delicious details...</p>
      </div>
    </div>
  );
}

// Profile page header skeleton loader
export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="h-28 w-28 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-36 mx-auto md:mx-0" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mx-auto md:mx-0" />
            </div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-28 mx-auto md:mx-0" />
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mx-auto md:mx-0" />
          <div className="flex justify-center md:justify-start gap-8 pt-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Table skeleton for admin pages
export function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
