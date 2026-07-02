import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, Key, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [receivedCode, setReceivedCode] = useState(''); // Saved for local test display
  const [toast, setToast] = useState(null);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setToast({ message: 'Please enter your email', type: 'error' });
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setToast({ message: 'Reset code generated successfully!', type: 'success' });
      setReceivedCode(res.resetCode);
      setStep(2);
    } else {
      setToast({ message: res.message || 'Error creating reset code', type: 'error' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmPassword) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    const res = await resetPassword(resetCode, newPassword);
    setLoading(false);

    if (res.success) {
      setToast({ message: 'Password reset successfully! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setToast({ message: res.message || 'Failed to reset password. Please check your PIN.', type: 'error' });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 mb-4 shadow-inner">
            <Key className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {step === 1 
              ? 'Enter your email to generate a simulation PIN code' 
              : 'Enter the recovery PIN code and your new password'
            }
          </p>
        </div>

        {/* Step 1: Request code Form */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all shadow-md"
              >
                {loading ? 'Generating Code...' : 'Get Reset PIN'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Hitting mock reset */}
        {step === 2 && (
          <div className="space-y-6 mt-8">
            
            {/* Visual simulation assistance */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
                <span>Simulation Email Box</span>
              </div>
              <p>Because there is no email SMTP server, the system has returned the generated PIN. Use it below to reset:</p>
              <div className="font-mono text-center font-extrabold text-lg select-all bg-white dark:bg-slate-950 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/20 text-slate-800 dark:text-slate-100 tracking-widest my-2">
                {receivedCode}
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleResetPassword}>
              
              {/* Reset PIN Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  6-Digit Recovery PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="pl-10 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm tracking-wider"
                    placeholder="Enter 6-digit PIN"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm"
                    placeholder="•••••••• (Min 6 chars)"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md"
                >
                  {loading ? 'Resetting Password...' : 'Save & Update'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Back to Login link */}
        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
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
