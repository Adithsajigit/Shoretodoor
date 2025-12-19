'use client';

import React from 'react';
import { useCart } from './CartContext';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { MIN_ORDER_WEIGHT } from '../constants';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { summary, removeFromCart } = useCart();
  const formatPrice = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p);
  const isValidOrder = summary.totalWeight >= MIN_ORDER_WEIGHT;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Modern Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-all duration-500 animate-fadeIn" 
        onClick={onClose} 
      />
      
      {/* Modern Sidebar Panel with Slide Animation */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-gradient-to-br from-white to-slate-50 shadow-floating flex flex-col transform transition-transform duration-500 animate-slideInRight">
        
        {/* Modern Header with Gradient */}
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-ocean-600/20 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold text-white">Your Order</h2>
            <p className="text-xs text-slate-300 uppercase tracking-[0.15em] mt-1.5 font-semibold">Review & Checkout</p>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 p-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl text-white shadow-card border border-white/10 active:scale-95 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white">
          {summary.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8 animate-fadeIn">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-6 shadow-soft">
                <ShoppingBag className="w-12 h-12 opacity-20" />
              </div>
              <p className="font-semibold text-lg text-slate-600">No items added yet.</p>
              <p className="text-sm text-slate-400 mt-2">Start adding fish to your order</p>
              <button 
                onClick={onClose} 
                className="mt-8 px-8 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold rounded-xl shadow-hover active:scale-95 transition-all duration-300"
              >
                Return to Menu
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/50 p-2">
                 {summary.items.map((item, index) => (
                    <div 
                      key={item.productId} 
                      className="p-5 bg-white rounded-xl mb-2 shadow-card hover:shadow-hover transition-all duration-300 flex justify-between items-start animate-fadeIn border border-slate-200/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex-1">
                            <div className="font-bold text-slate-900 text-lg leading-tight">{item.product.englishName}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1.5 mb-3">{item.product.packaging}</div>
                            <div className="inline-flex items-center text-sm bg-gradient-to-r from-ocean-50 to-ocean-100 px-3 py-1.5 rounded-lg text-ocean-700 border border-ocean-200/50 shadow-sm">
                                <span className="font-bold mr-1.5">{item.quantity} kg</span>
                                <span className="text-xs opacity-60">× {formatPrice(item.price)}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col justify-between h-full pl-4">
                             <div className="font-mono font-extrabold text-slate-900 text-xl">{formatPrice(item.lineTotal)}</div>
                             <button 
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-500 p-2.5 hover:bg-red-50 rounded-xl self-end -mr-2 mt-3 transition-all duration-300 hover:scale-110 active:scale-95 group"
                                title="Remove item"
                             >
                                <Trash2 className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                             </button>
                        </div>
                    </div>
                 ))}
            </div>
          )}
        </div>

        {/* Modern Footer with Gradient */}
        <div className="p-6 bg-gradient-to-t from-white via-white to-slate-50/50 border-t border-slate-200/50 shadow-2xl">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-slate-500 text-sm font-medium">
              <span>Total Weight</span>
              <span className="font-bold text-slate-900">{summary.totalWeight.toFixed(2)} kg</span>
            </div>
             {/* Modern Savings Badge */}
             {summary.totalSavings > 0 && (
                <div className="flex justify-between p-3 rounded-xl bg-gradient-to-r from-seafoam-50 to-seafoam-100/50 border border-seafoam-200/50 shadow-sm">
                    <span className="text-seafoam-700 font-bold text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-seafoam-500"></div>
                      Tier Savings Applied
                    </span>
                    <span className="font-bold text-seafoam-700">-{formatPrice(summary.totalSavings)}</span>
                </div>
            )}
            <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-slate-300">
              <span className="font-display font-bold text-2xl text-slate-900">Total</span>
              <span className="font-display font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-seafoam-600 to-ocean-600">{formatPrice(summary.subtotal)}</span>
            </div>
          </div>

          {!isValidOrder && (
            <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200/50 text-red-800 text-sm rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0 animate-ping" />
                <p className="leading-relaxed">
                  <span className="font-semibold">Minimum order {MIN_ORDER_WEIGHT}kg.</span> Add <span className="font-bold text-red-700">{(MIN_ORDER_WEIGHT - summary.totalWeight).toFixed(1)}kg</span> more to checkout.
                </p>
            </div>
          )}

          <button
            disabled={!isValidOrder}
            onClick={onCheckout}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-card ${
              isValidOrder 
              ? 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-seafoam-600 hover:to-seafoam-700 text-white shadow-hover active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Checkout Securely</span>
          </button>
        </div>
      </div>
    </div>
  );
};