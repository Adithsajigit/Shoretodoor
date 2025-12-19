'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import { ShieldCheck, Mail, Lock, AlertCircle, Fish } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and is admin
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isAdmin(user.email)) {
        router.push('/admin/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email is authorized before attempting login
      if (!isAdmin(email)) {
        setError('Access Denied: You are not authorized to access the admin panel');
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError('Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-slate-600 font-medium">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-floating border border-slate-200/50 p-8">
          {/* Security Badge */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-ocean-50 to-seafoam-50 rounded-xl border border-ocean-200/50 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-sm font-bold text-ocean-700">Secure Login</div>
              <div className="text-xs text-slate-600">Protected by Firebase Authentication</div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-red-700 mb-1">Login Failed</div>
                <div className="text-xs text-red-600">{error}</div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="admin@example.com"
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
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Only authorized administrators can access this panel
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
