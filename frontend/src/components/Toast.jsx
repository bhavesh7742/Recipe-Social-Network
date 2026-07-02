import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300',
    error: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/40 text-rose-800 dark:text-rose-300',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/40 text-amber-800 dark:text-amber-300',
    info: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800/40 text-sky-800 dark:text-sky-300'
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow max-w-sm w-full">
      <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 ${typeStyles[type] || typeStyles.success}`}>
        {icons[type] || icons.success}
        <div className="flex-1 text-sm font-medium leading-relaxed pr-2">
          {message}
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
