'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { TrendingUp, Award, Sparkles, Zap, Gift } from 'lucide-react';

export const FloatingTierWidget: React.FC = () => {
  const { summary } = useCart();
  const { tier, nextTier, kgToNextTier, totalWeight } = summary;
  const [showPulse, setShowPulse] = useState(false);

  // Show pulse animation when close to next tier (within 5kg)
  useEffect(() => {
    if (nextTier && kgToNextTier <= 5) {
      setShowPulse(true);
    } else {
      setShowPulse(false);
    }
  }, [nextTier, kgToNextTier]);

  // Don't show if no items in cart (AFTER all hooks)
  if (summary.items.length === 0) return null;

  // Tier color schemes
  const tierColors = {
    'Base': { 
      gradient: 'from-slate-600 via-slate-500 to-slate-600',
      glow: 'shadow-slate-500/50',
      bg: 'bg-slate-500',
      text: 'text-slate-600',
      lightBg: 'bg-slate-50',
      border: 'border-slate-300'
    },
    'Silver': { 
      gradient: 'from-slate-400 via-slate-300 to-slate-400',
      glow: 'shadow-slate-400/50',
      bg: 'bg-slate-400',
      text: 'text-slate-600',
      lightBg: 'bg-slate-50',
      border: 'border-slate-300'
    },
    'Gold': { 
      gradient: 'from-amber-500 via-amber-400 to-amber-500',
      glow: 'shadow-amber-500/50',
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      lightBg: 'bg-amber-50',
      border: 'border-amber-300'
    },
    'Platinum': { 
      gradient: 'from-slate-300 via-slate-200 to-slate-300',
      glow: 'shadow-slate-300/50',
      bg: 'bg-slate-300',
      text: 'text-slate-700',
      lightBg: 'bg-slate-50',
      border: 'border-slate-300'
    },
    'Diamond': { 
      gradient: 'from-cyan-500 via-blue-500 to-cyan-500',
      glow: 'shadow-cyan-500/50',
      bg: 'bg-cyan-500',
      text: 'text-cyan-600',
      lightBg: 'bg-cyan-50',
      border: 'border-cyan-300'
    },
  };

  const currentColors = tierColors[tier as keyof typeof tierColors] || tierColors.Base;
  const progressPercent = nextTier ? Math.max(5, Math.min(95, ((totalWeight / (totalWeight + kgToNextTier)) * 100))) : 100;

  return (
    <>
      {/* Main Floating Widget - Always Expanded, More Prominent */}
      <div className="fixed left-4 right-4 lg:left-auto lg:right-4 bottom-24 lg:bottom-8 z-40 animate-fadeIn lg:max-w-sm">
        <div className={`bg-white rounded-2xl shadow-floating border-2 ${currentColors.border} overflow-hidden transition-all duration-300 ${
          showPulse ? 'animate-pulse ring-4 ring-ocean-400/50' : ''
        }`}>
          
          {/* Colorful Header Bar */}
          <div className={`h-2 bg-gradient-to-r ${currentColors.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>

          <div className="p-4">
            {/* Current Tier Badge - Large and Prominent */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentColors.gradient} shadow-lg ${currentColors.glow}`}>
                  {tier === 'Diamond' ? (
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                  ) : (
                    <Award className="w-6 h-6 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">Your Tier</div>
                  <div className={`text-xl font-extrabold ${currentColors.text}`}>
                    {tier === 'Base' ? 'STANDARD' : tier.toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Weight Badge */}
              <div className={`${currentColors.lightBg} px-4 py-2 rounded-xl border ${currentColors.border}`}>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold text-center">Total</div>
                <div className={`text-lg font-bold ${currentColors.text} text-center`}>{totalWeight.toFixed(1)}kg</div>
              </div>
            </div>

            {/* Next Tier Section - Eye-Catching */}
            {nextTier ? (
              <div className={`p-4 rounded-xl bg-gradient-to-br from-ocean-50 via-white to-seafoam-50 border-2 border-ocean-300 relative overflow-hidden ${
                showPulse ? 'ring-2 ring-ocean-400 ring-offset-2' : ''
              }`}>
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ocean-100/30 to-transparent animate-shimmer" />
                
                <div className="relative z-10">
                  {/* Unlock Message */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-400 to-seafoam-500 flex items-center justify-center shadow-lg shadow-ocean-500/50 animate-bounce-slow">
                      <Zap className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-ocean-700 uppercase tracking-wider">Unlock Next Tier</div>
                      <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ocean-600 to-seafoam-600">
                        {nextTier.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar - Large and Clear */}
                  <div className="mb-3">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs font-semibold text-slate-600">Progress</span>
                      <span className="text-lg font-bold text-ocean-600">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-ocean-500 via-seafoam-400 to-ocean-500 rounded-full transition-all duration-700 shadow-lg"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  </div>

                  {/* Add More CTA */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-ocean-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-ocean-500" strokeWidth={2.5} />
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Add just</div>
                        <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ocean-600 to-seafoam-600">
                          {kgToNextTier.toFixed(1)}kg
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">to unlock</div>
                      <div className="text-sm font-bold text-ocean-600">{nextTier} pricing!</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gradient-to-br from-seafoam-50 to-seafoam-100 border-2 border-seafoam-300 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                <div className="relative z-10">
                  <Sparkles className="w-8 h-8 text-seafoam-600 mx-auto mb-2 animate-bounce-slow" strokeWidth={2.5} />
                  <div className="text-lg font-bold text-seafoam-700 mb-1">🎉 BEST TIER UNLOCKED!</div>
                  <div className="text-xs text-seafoam-600 font-medium">You're getting the lowest prices available</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
