'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/admin/login');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-seafoam-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
        <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-ocean-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h1>
        <p className="text-slate-600 mb-6">
          This ordering system is private and requires a valid order link.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 text-left">
          <p className="font-semibold mb-2">To place an order:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Contact your supplier</li>
            <li>Request a personalized order link</li>
            <li>Use the link provided to access the order form</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500 mt-6">
          Redirecting to login...
        </p>
      </div>
    </div>
  );
}
