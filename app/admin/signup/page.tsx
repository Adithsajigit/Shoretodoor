'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle2, Fish } from 'lucide-react';

export default function AdminSignup() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@shoretodoor.uk');
  const [password, setPassword] = useState('admin@shoretodoor.uk');
  const [confirmPassword, setConfirmPassword] = useState('admin@shoretodoor.uk');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Check if email is authorized for admin access
    if (!isAdmin(email)) {
      setError('Access Denied: This email is not authorized for admin access. Only pre-approved admin emails can create admin accounts.');
      setLoading(false);
      return;
    }

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters');
      } else {
        setError('Signup failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-seafoam-50 flex items-center justify-center p-4">
        <div className="text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-seafoam-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-floating animate-scaleIn">
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Account Created! 🎉</h2>
          <p className="text-slate-600 mb-2">Admin account successfully created</p>
          <p className="text-sm text-slate-500">Redirecting to login page...</p>
          <div className="mt-6">
            <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-ocean-500 to-seafoam-500 rounded-full animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-seafoam-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-ocean-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-seafoam-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-ocean-500 to-seafoam-500 shadow-floating mb-4">
            <Fish className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ocean-700 to-seafoam-600 mb-2">
            Shore to Door
          </h1>
          <p className="text-slate-600 font-medium">Create Admin Account</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-floating border border-slate-200/50 p-8">
          {/* Info Badge */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200/50 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <UserPlus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-sm font-bold text-purple-700">One-Time Setup</div>
              <div className="text-xs text-slate-600">Create your admin account</div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-red-700 mb-1">Error</div>
                <div className="text-xs text-red-600">{error}</div>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                  placeholder="admin@shoretodoor.uk"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-ocean-500 to-seafoam-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wider"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/admin/login')}
                className="text-ocean-600 hover:text-ocean-700 font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Back to Store */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-ocean-600 hover:text-ocean-700 font-medium transition-colors"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    </div>
  );
}
