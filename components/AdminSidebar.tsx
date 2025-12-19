'use client';

import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, ShoppingCart, Users, Package, Globe, Fish, LogOut, DollarSign, TrendingUp } from 'lucide-react';

interface AdminSidebarProps {
  user: { email: string | null } | null;
  onLogout: () => void;
}

export default function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      path: '/admin/dashboard',
    },
    {
      name: 'Analytics',
      icon: TrendingUp,
      path: '/admin/analytics',
    },
    {
      name: 'Orders',
      icon: ShoppingCart,
      path: '/admin/orders',
    },
    {
      name: 'Customers',
      icon: Users,
      path: '/admin/customers',
    },
    {
      name: 'Products',
      icon: Package,
      path: '/admin/products',
    },
    {
      name: 'Pricing Packages',
      icon: DollarSign,
      path: '/admin/pricing-packages',
    },
    {
      name: 'View Store',
      icon: Globe,
      path: '/',
    },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex-shrink-0 flex flex-col shadow-2xl sticky top-0 h-screen overflow-hidden">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-400 to-seafoam-400 flex items-center justify-center shadow-lg shadow-ocean-500/50">
            <Fish className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Shore to Door</h1>
            <p className="text-slate-400 text-xs font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 hover:scrollbar-thumb-slate-600">
        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-ocean-500 to-seafoam-500 text-white shadow-lg shadow-ocean-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section - Sticky at bottom */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0 bg-slate-900">
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-seafoam-400 flex items-center justify-center font-bold text-white">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
