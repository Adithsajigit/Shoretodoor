'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Fish, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Package,
  LogOut,
  Settings,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Bell,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Star,
  Award,
  Zap,
  Activity,
  CreditCard,
  FileText,
  Mail,
  Phone,
  MapPin,
  TrendingDown,
  RefreshCw,
  Plus,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else if (!isAdmin(currentUser.email)) {
        // User is logged in but not an admin
        setUnauthorized(true);
        setLoading(false);
        // Auto logout and redirect after showing error
        setTimeout(async () => {
          await signOut(auth);
          router.push('/');
        }, 3000);
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-floating animate-pulse">
            <ShieldAlert className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-red-700 mb-3">Access Denied</h2>
          <p className="text-slate-700 mb-2 font-medium">You are not authorized to access the admin panel.</p>
          <p className="text-sm text-slate-600 mb-6">Only authorized administrators can access this area.</p>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
            <p className="text-xs text-red-600">Redirecting to store in 3 seconds...</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-ocean-500 to-seafoam-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Go to Store Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search orders, customers, products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-3">
                {/* View Store */}
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2.5 bg-gradient-to-r from-ocean-500 to-seafoam-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">View Store</span>
                </button>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Title & Quick Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-slate-600 mt-1">Welcome back, {user?.email?.split('@')[0]}!</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-500/30 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">Coming Soon</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Real-time data integration pending</span>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-seafoam-500 to-seafoam-600 flex items-center justify-center shadow-lg shadow-seafoam-500/30 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">Coming Soon</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Order tracking integration pending</span>
            </div>
          </div>

          {/* Active Customers Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Active Customers</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">Coming Soon</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Customer data integration pending</span>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Total Products</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">42</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>From product catalog</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-ocean-500 via-seafoam-500 to-ocean-500 rounded-2xl border border-ocean-300 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">🐟 Shore to Door Admin Panel</h3>
                  <p className="text-ocean-100 text-lg mb-4">Manage your Kerala fresh fish wholesale business</p>
                  <p className="text-ocean-50 text-sm">This dashboard will display real-time order data, customer analytics, and sales metrics once integrated with your database.</p>
                </div>
                <Fish className="w-32 h-32 text-white/20" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/')}
                className="p-6 bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-xl border-2 border-ocean-200 hover:border-ocean-400 transition-all hover:shadow-lg group text-left"
              >
                <Fish className="w-10 h-10 text-ocean-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-slate-900 mb-1">View Store</p>
                <p className="text-sm text-slate-600">Browse your product catalog</p>
              </button>
              
              <button 
                onClick={() => router.push('/admin/customers')}
                className="p-6 bg-gradient-to-br from-seafoam-50 to-seafoam-100 rounded-xl border-2 border-seafoam-200 hover:border-seafoam-400 transition-all hover:shadow-lg group text-left"
              >
                <Users className="w-10 h-10 text-seafoam-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-slate-900 mb-1">Manage Customers</p>
                <p className="text-sm text-slate-600">Create and manage users</p>
              </button>
              
              <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg group text-left">
                <BarChart3 className="w-10 h-10 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-slate-900 mb-1">View Analytics</p>
                <p className="text-sm text-slate-600">Coming soon</p>
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
