'use client';

import React, { useState, useEffect } from 'react';
import { Product, PricingTier } from '../types';
import { useCart } from './CartContext';
import { Plus, Minus, Info, Check, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isBronzeTierEnabled?: boolean;
}

// --- Image Mapping System ---
// Using high-reliability Wikimedia Commons URLs
const FISH_IMAGES: Record<string, string> = {
  'anchovy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Engraulis_encrasicolus_Logon.jpg/640px-Engraulis_encrasicolus_Logon.jpg',
  'barramundi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lates_calcarifer_01.jpg/640px-Lates_calcarifer_01.jpg',
  'barracuda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sphyraena_barracuda_%28Great_barracuda%29.jpg/640px-Sphyraena_barracuda_%28Great_barracuda%29.jpg',
  'black kingfish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Scomberomorus_commerson.jpg/640px-Scomberomorus_commerson.jpg',
  'king fish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Scomberomorus_commerson.jpg/640px-Scomberomorus_commerson.jpg',
  'seer fish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Scomberomorus_commerson.jpg/640px-Scomberomorus_commerson.jpg',
  'black pomfret': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Pampus_argenteus.jpg/640px-Pampus_argenteus.jpg',
  'cobia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Rachycentron_canadum_P1060037.jpg/640px-Rachycentron_canadum_P1060037.jpg',
  'crab': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Scylla_serrata.jpg/640px-Scylla_serrata.jpg',
  'emperor fish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lethrinus_nebulosus.jpg/640px-Lethrinus_nebulosus.jpg',
  'grey mullet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mugil_cephalus.jpg/640px-Mugil_cephalus.jpg',
  'lizard fish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Synodus_variegatus_Red_Sea.jpg/640px-Synodus_variegatus_Red_Sea.jpg',
  'mackerel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Scomber_scombrus.jpg/640px-Scomber_scombrus.jpg',
  'mahi mahi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Coryphaena_hippurus.jpg/640px-Coryphaena_hippurus.jpg',
  'pearl spot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Etroplus_suratensis.jpg/640px-Etroplus_suratensis.jpg',
  'red snapper': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Lutjanus_campechanus.jpg/640px-Lutjanus_campechanus.jpg',
  'ribbon fish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Trichiurus_lepturus_P1050819.jpg/640px-Trichiurus_lepturus_P1050819.jpg',
  'sail fish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Istiophorus_platypterus.jpg/640px-Istiophorus_platypterus.jpg',
  'sardine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sardinops_sagax.jpg/640px-Sardinops_sagax.jpg',
  'squid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Loligo_vulgaris.jpg/640px-Loligo_vulgaris.jpg',
  'japanese threadfin bream': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Nemipterus_japonicus.jpg/640px-Nemipterus_japonicus.jpg',
  'tilapia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Oreochromis_niloticus_01.jpg/640px-Oreochromis_niloticus_01.jpg',
  'tomato grouper': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Cephalopholis_sonnerati.jpg/640px-Cephalopholis_sonnerati.jpg',
  'trevally': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Caranx_ignobilis_P1050604.jpg/640px-Caranx_ignobilis_P1050604.jpg',
  'tuna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Thunnus_albacares.jpg/640px-Thunnus_albacares.jpg',
  'yellow fin tuna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Thunnus_albacares.jpg/640px-Thunnus_albacares.jpg'
};

const getFishImage = (name: string) => {
  const lowerName = name.toLowerCase();
  // Sort keys by length descending to match "black kingfish" before "king fish"
  const keys = Object.keys(FISH_IMAGES).sort((a, b) => b.length - a.length);
  
  for (const key of keys) {
    if (lowerName.includes(key)) {
      return FISH_IMAGES[key];
    }
  }
  // Fallback image (Fresh Fish Market)
  return 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=600';
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, isBronzeTierEnabled = false }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart, summary } = useCart();
  const [showTierInfo, setShowTierInfo] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(getFishImage(product.englishName));
  const [showMinQtyWarning, setShowMinQtyWarning] = useState(false);
  
  const cartItem = cartItems.find(item => item.productId === product.id);
  const isInCart = !!cartItem;
  const quantity = cartItem ? cartItem.quantity : 0;
  
  // Local state for the input field to allow typing
  const [inputValue, setInputValue] = useState(quantity > 0 ? quantity.toString() : '');

  useEffect(() => {
    if (quantity > 0) {
        setInputValue(quantity.toString());
    }
  }, [quantity]);

  const getCurrentPrice = () => {
    switch (summary.tier) {
      case PricingTier.Bronze: return product.priceBronze || product.priceSilver;
      case PricingTier.Diamond: return product.priceDiamond;
      case PricingTier.Platinum: return product.pricePlatinum;
      case PricingTier.Gold: return product.priceGold;
      default: return product.priceSilver;
    }
  };

  const price = getCurrentPrice();
  const basePrice = product.priceBronze && summary.tier === PricingTier.Bronze ? product.priceBronze : product.priceSilver;
  const isDiscounted = price < basePrice;
  const formatPrice = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
        setInputValue(val);
        if (isInCart) {
            const num = parseFloat(val);
            if (!isNaN(num) && num > 0) {
                updateQuantity(product.id, num);
            }
        }
    }
  };

  const handleBlur = () => {
      if (isInCart && (inputValue === '' || parseFloat(inputValue) === 0)) {
          removeFromCart(product.id);
          setInputValue('');
      }
  };

  const increment = () => {
    const current = parseFloat(inputValue) || 0;
    const next = Math.floor(current) + 1;
    setInputValue(next.toString());
    if (isInCart) updateQuantity(product.id, next);
  };

  const decrement = () => {
    const current = parseFloat(inputValue) || 0;
    if (current > 10) {
        const next = Math.max(10, Math.floor(current) - 1);
        setInputValue(next.toString());
        if (isInCart) updateQuantity(product.id, next);
    } else if (current === 10 || current < 10) {
        setInputValue('');
        if (isInCart) removeFromCart(product.id);
    }
  };

  const handleAddAction = () => {
      const qty = parseFloat(inputValue);
      if (!isNaN(qty) && qty > 0) {
          if (qty < 10) {
              setShowMinQtyWarning(true);
              setInputValue('10');
              setTimeout(() => setShowMinQtyWarning(false), 3000);
              return;
          }
          addToCart(product.id, qty);
      } else {
          setInputValue('10');
          addToCart(product.id, 10);
      }
  };

  // Determine visual cues for preparation
  const isSteak = product.preparation.toLowerCase().includes('steak') || product.preparation.toLowerCase().includes('cut');
  const isCleaned = product.preparation.toLowerCase().includes('cleaned');

  return (
    <div className={`
        group relative transition-all duration-500 ease-out border-b border-slate-100/50 last:border-0
        ${isInCart ? 'bg-gradient-to-r from-seafoam-50/40 via-seafoam-50/20 to-transparent' : 'bg-white hover:bg-slate-50/50'}
    `}>
        {/* Minimum Quantity Warning Toast */}
        {showMinQtyWarning && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Minimum 10kg Required</p>
                <p className="text-xs opacity-90">Quantity adjusted to 10kg</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Modern Gradient Indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
            isInCart 
            ? 'bg-gradient-to-b from-seafoam-400 via-seafoam-500 to-seafoam-600 shadow-glow-green' 
            : 'bg-transparent group-hover:bg-gradient-to-b group-hover:from-ocean-200 group-hover:to-ocean-300'
        }`} />

        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start pl-8">
            
            {/* 1. Modern Image Card with Overlay */}
            <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 border border-slate-200/50 bg-gradient-to-br from-slate-100 to-slate-50 group/img">
                <img 
                    src={imgSrc} 
                    alt={product.englishName}
                    onError={() => setImgSrc('https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=600')} 
                    className={`w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110 ${isSteak ? 'scale-125' : 'scale-105'}`}
                />
                
                {/* Modern Glass Morphism Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 backdrop-blur-md py-2 text-center border-t border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em] leading-none block">
                        {product.preparation}
                    </span>
                </div>
                
                {/* Check Badge with Animation */}
                {isInCart && (
                    <div className="absolute -top-1 -right-1 p-2 bg-gradient-to-br from-seafoam-400 to-seafoam-600 text-white rounded-full shadow-lg shadow-seafoam-500/50 z-10 animate-scaleIn">
                        <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                )}
                
                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
            </div>

            {/* 2. Product Details - Modern Typography */}
            <div className="flex-1 min-w-0 text-center sm:text-left w-full space-y-3">
                <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-bold text-slate-900 leading-tight tracking-tight">
                        {product.englishName}
                    </h3>
                    <span className="font-malayalam text-slate-500 text-sm font-medium">
                        {product.malayalamName}
                    </span>
                </div>
                
                {/* Modern Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all duration-300 ${
                         product.preparation === 'Whole' 
                         ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200/50 shadow-sm' 
                         : 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200/50 shadow-sm'
                     }`}>
                        {product.preparation}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
                        {product.sizeSpec}
                    </span>
                </div>
                
                {/* Tier Info Button with Icon */}
                <div className="flex justify-center sm:justify-start">
                     <button 
                        onClick={() => setShowTierInfo(!showTierInfo)}
                        className="text-xs font-semibold text-ocean-600 hover:text-ocean-800 transition-all duration-300 flex items-center gap-1.5 group/btn hover:bg-ocean-50 px-3 py-1.5 rounded-lg"
                    >
                        <Info className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:rotate-12" />
                        {showTierInfo ? 'Hide Pricing' : 'View Tier Pricing'}
                    </button>
                </div>

                {/* Modern Collapsible Pricing Table */}
                {showTierInfo && (
                    <div className="mt-3 p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200/50 shadow-soft text-xs">
                                                                                                                        <div className={`grid ${isBronzeTierEnabled && product.priceBronze ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-3 sm:gap-4 auto-rows-fr`}>
                            {isBronzeTierEnabled && product.priceBronze && (
                                                                                                                                    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-5 rounded-2xl bg-amber-50 border border-amber-200 text-center w-full">
                                <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wide leading-tight">🥉 Bronze</div>
                                <div className="font-mono font-semibold text-amber-700 text-xs leading-tight break-words">{formatPrice(product.priceBronze)}</div>
                              </div>
                            )}
                                                                                                                                <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-5 rounded-2xl hover:bg-white transition-colors text-center w-full">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide leading-tight">Silver</div>
                                <div className="font-mono font-semibold text-slate-700 text-xs leading-tight break-words">{formatPrice(product.priceSilver)}</div>
                            </div>
                                                                                                                                <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/30 text-center w-full">
                                <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wide leading-tight">Gold</div>
                                <div className="font-mono font-bold text-amber-800 text-xs leading-tight break-words">{formatPrice(product.priceGold)}</div>
                            </div>
                                                                                                                                <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 border border-slate-300/30 text-center w-full">
                                <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wide leading-tight">Platinum</div>
                                <div className="font-mono font-bold text-slate-800 text-xs leading-tight break-words">{formatPrice(product.pricePlatinum)}</div>
                            </div>
                                                                                                                                <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-5 rounded-2xl bg-gradient-to-br from-ocean-50 to-ocean-100/50 border border-ocean-200/30 text-center w-full">
                                <div className="text-[10px] uppercase font-bold text-ocean-700 tracking-wide leading-tight">Diamond</div>
                                <div className="font-mono font-bold text-ocean-800 text-xs leading-tight break-words">{formatPrice(product.priceDiamond)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Modern Pricing & Controls */}
            <div className="flex flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
                
                {/* Price Display - Enhanced Typography */}
                <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Price per Kg</span>
                    <div className="flex flex-col items-center sm:items-end leading-none mt-2">
                        {isDiscounted && (
                            <span className="text-xs line-through text-slate-300 font-mono mb-1">
                                {formatPrice(basePrice)}
                            </span>
                        )}
                        <span className={`font-mono font-extrabold text-3xl tracking-tight transition-all duration-500 ${
                            isInCart 
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-seafoam-600 to-seafoam-500' 
                            : 'text-slate-900'
                        }`}>
                            {formatPrice(price)}
                        </span>
                    </div>
                </div>

                {/* Modern Control Panel */}
                <div className="flex items-center gap-3">
                    {/* Sleek Weight Controls */}
                    <div className="flex items-center bg-white border-2 border-slate-200/60 rounded-xl shadow-card hover:shadow-hover hover:border-ocean-300 transition-all duration-300 h-12 overflow-hidden">
                        <button 
                            onClick={decrement}
                            className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-300 active:scale-90"
                        >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <div className="w-24 h-full relative border-x-2 border-slate-100">
                             <input 
                                type="number"
                                min="0"
                                step="0.5"
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="0"
                                className="w-full h-full text-center font-bold text-slate-900 focus:outline-none focus:bg-ocean-50/30 text-base transition-colors duration-300"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-slate-300 pointer-events-none tracking-wider">
                                KG
                            </span>
                        </div>
                        <button 
                            onClick={increment}
                            className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-300 active:scale-90"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Modern Action Button */}
                    {isInCart ? (
                        <button 
                            onClick={() => removeFromCart(product.id)}
                            className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-seafoam-100 to-seafoam-50 text-seafoam-600 border-2 border-seafoam-200/50 hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:border-red-200 transition-all duration-500 shadow-card hover:shadow-hover group/btn"
                            title="Remove from order"
                        >
                            <Check className="w-5 h-5 block group-hover/btn:hidden transition-transform" strokeWidth={3} />
                            <Trash2 className="w-5 h-5 hidden group-hover/btn:block transition-transform" strokeWidth={2.5} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleAddAction}
                            disabled={!inputValue || parseFloat(inputValue) <= 0}
                            className={`
                                h-12 px-7 rounded-xl font-bold text-sm shadow-card transition-all duration-500 flex items-center gap-2
                                ${!inputValue || parseFloat(inputValue) <= 0 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200/50' 
                                    : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 hover:shadow-hover active:scale-95 border-2 border-transparent hover:border-slate-600'}
                            `}
                        >
                            Add
                        </button>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};