'use client';

import React from 'react';
import { useCart } from './CartContext';
import { TrendingUp, Lock, CheckCircle, Sparkles, Award } from 'lucide-react';
import { TIER_THRESHOLDS } from '../constants';

export const TierProgressBar: React.FC = () => {
  const { summary } = useCart();
  const { nextTier, kgToNextTier, tier, totalWeight } = summary;

  // Tier color schemes
  const tierColors = {
    'Base': { bg: 'from-slate-600 to-slate-700', icon: 'bg-slate-500', text: 'text-slate-300', accent: 'text-slate-400' },
    'Silver': { bg: 'from-slate-400 to-slate-500', icon: 'bg-slate-300', text: 'text-white', accent: 'text-slate-200' },
    'Gold': { bg: 'from-amber-400 to-amber-600', icon: 'bg-amber-300', text: 'text-white', accent: 'text-amber-100' },
    'Platinum': { bg: 'from-slate-300 to-slate-400', icon: 'bg-slate-200', text: 'text-slate-900', accent: 'text-slate-700' },
    'Diamond': { bg: 'from-cyan-400 to-blue-600', icon: 'bg-cyan-300', text: 'text-white', accent: 'text-cyan-100' },
  };

  const currentColors = tierColors[tier as keyof typeof tierColors] || tierColors.Base;
  const progressPercent = Math.min((totalWeight / TIER_THRESHOLDS.DIAMOND) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-floating rounded-3xl overflow-hidden mb-6 border border-slate-700/50 relative animate-fadeIn">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-600/10 via-transparent to-seafoam-600/10 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            
            {/* Modern Tier Status */}
            <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-card bg-gradient-to-br ${currentColors.bg} transition-all duration-500`}>
                    {tier === 'Base' ? 
                      <Lock className="w-6 h-6" /> : 
                      tier === 'Diamond' ? 
                        <Sparkles className="w-6 h-6" /> : 
                        <Award className="w-6 h-6" />
                    }
                 </div>
                 <div>
                    <div className="flex items-baseline gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Current Tier</span>
                        <span className={`text-2xl font-display font-extrabold leading-none bg-gradient-to-r ${currentColors.bg} bg-clip-text text-transparent`}>
                          {tier === 'Base' ? 'Standard' : tier}
                        </span>
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-1.5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-seafoam-400"></div>
                        Total Order: <span className="text-white font-bold">{totalWeight.toFixed(1)} kg</span>
                    </div>
                 </div>
            </div>

            {/* Modern Incentive Card */}
            {nextTier && (
                <div className="flex items-center gap-4 bg-gradient-to-r from-ocean-500/20 to-seafoam-500/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-ocean-400/30 shadow-glow animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shadow-glow">
                      <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-white flex items-center gap-2 justify-end">
                            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-300 to-seafoam-300 uppercase font-extrabold">{nextTier}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                            Add <strong className="text-white font-bold">{kgToNextTier.toFixed(1)}kg</strong> more
                        </div>
                    </div>
                </div>
            )}
            
            {!nextTier && (
                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-seafoam-500/20 to-seafoam-600/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-seafoam-400/30">
                    <Sparkles className="w-5 h-5 text-seafoam-300" />
                    <span className="text-sm font-bold text-seafoam-300 uppercase tracking-wider">Best Prices Active</span>
                </div>
            )}

        </div>
        
        {/* Modern Gradient Progress Bar */}
        <div className="h-2 bg-slate-950/50 w-full relative overflow-hidden">
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-ocean-400 via-seafoam-400 to-ocean-500 transition-all duration-700 ease-out shadow-glow-green" 
                style={{ width: `${progressPercent}%` }} 
            />
            {/* Shimmer effect */}
            <div 
                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                style={{ width: `${progressPercent}%` }}
            />
        </div>
    </div>
  );
};