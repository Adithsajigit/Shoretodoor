'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { FloatingTierWidget } from '@/components/FloatingTierWidget';
import { useCart } from '@/components/CartContext';
import { usePackagePrices } from '@/components/usePackagePrices';
import { ShoppingCart, Package, Box, ChevronRight, Search, X, Sparkles, TrendingUp, Award, Zap, AlertCircle, Info } from 'lucide-react';

export default function OrderForm({ customerData, orderToken }: { 
  customerData?: {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    pricingPackageId?: string;
    pricingPackageName?: string;
    bronzeTierEnabled?: boolean;
  };
  orderToken?: string;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [packagingType, setPackagingType] = useState<'Thermal Box' | 'Vacuum Pack'>('Thermal Box');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { products, loading } = usePackagePrices(customerData?.pricingPackageId);
  const { summary, removeFromCart, setIsBronzeTierEnabled, setPricingProducts } = useCart();
  
  const isBronzeTierEnabled = customerData?.bronzeTierEnabled || false;
  const formatPrice = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p);

  useEffect(() => {
    setIsBronzeTierEnabled(isBronzeTierEnabled);
  }, [isBronzeTierEnabled, setIsBronzeTierEnabled]);

  useEffect(() => {
    const normalizedProducts: Product[] = products.map(p => ({
      id: p.id,
      code: p.code,
      englishName: p.englishName,
      malayalamName: p.malayalamName || '',
      preparation: p.preparation || '',
      packaging: p.packaging || '',
      sizeSpec: (p as any).sizeSpec || p.unit || 'kg',
      priceBronze: p.priceBronze,
      priceDiamond: p.priceDiamond,
      pricePlatinum: p.pricePlatinum,
      priceGold: p.priceGold,
      priceSilver: p.priceSilver,
    }));

    setPricingProducts(normalizedProducts);
    return () => setPricingProducts(null);
  }, [products, setPricingProducts]);

  const filteredProducts = products.filter(p => {
    const matchesPackaging = p.packaging === packagingType;
    const matchesSearch = p.englishName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.malayalamName.includes(searchTerm);
    return matchesPackaging && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-50">
      
      {/* Next-Gen Glassmorphic Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-[#FEFEFE] shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6 flex-1 sm:flex-none h-16 sm:h-[4.5rem]">
              <div className="relative group flex-shrink-0 h-full">
                <img src="/logo.PNG" alt="Logo" className="h-full w-auto max-h-full rounded-xl object-contain" />
              </div>
              <div className="flex-1 sm:flex-none text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
                  Shore to Door
                </h1>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-0.5">Premium Seafood Delivery</p>
              </div>
            </div>
            
            {customerData?.name && (
              <div className="hidden md:flex items-center gap-4 bg-gradient-to-br from-blue-50 to-cyan-50 px-5 py-3 rounded-2xl border border-blue-100/50 shadow-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Welcome back</p>
                  <p className="text-sm font-bold text-gray-900">{customerData.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Advanced Search & Filter Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-blue-50/30 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.05),_transparent_70%)] pointer-events-none"></div>
              
              <div className="relative space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search premium seafood..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/80 border-2 border-blue-100/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-400 text-sm font-medium shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Packaging Type Switcher */}
                <div className="flex gap-2 p-1.5 bg-gray-100/70 rounded-2xl">
                  <button
                    onClick={() => setPackagingType('Thermal Box')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                      packagingType === 'Thermal Box'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    Thermal Box
                  </button>
                  <button
                    onClick={() => setPackagingType('Vacuum Pack')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                      packagingType === 'Vacuum Pack'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Vacuum Pack
                  </button>
                </div>
                <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-100 text-[12px] text-gray-700 rounded-xl px-3 py-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="leading-snug space-y-0.5">
                    <p><span className="font-semibold text-gray-800">Thermal Box:</span> cleaned fish and whole fish available.</p>
                    <p><span className="font-semibold text-gray-800">Vacuum Pack:</span> cleaned fish with portioned cuts; whole fish not available.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Premium Selection</h2>
                      <p className="text-xs text-gray-500">{filteredProducts.length} products available</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="py-32 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Loading products...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <div key={product.id} style={{ animationDelay: `${index * 30}ms` }} className="animate-fadeIn">
                      <ProductCard
                        product={{ ...product, sizeSpec: product.sizeSpec ?? '' } as Product}
                        isBronzeTierEnabled={isBronzeTierEnabled}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-32 flex flex-col items-center justify-center">
                    <Search className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="font-semibold text-gray-600">No products found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart Sidebar - Beautiful & Professional */}
          <div className="lg:sticky lg:top-24 space-y-4" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
            
            {/* Beautiful Cart Card */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-2xl border border-gray-100 flex flex-col" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
              
              {/* Beautiful Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold">Shopping Cart</h2>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <span>{summary.items.length} items</span>
                  <span>•</span>
                  <span>{summary.totalWeight.toFixed(1)} kg total</span>
                </div>
              </div>

              {/* Beautiful Items List */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                {summary.items.length === 0 ? (
                  <div className="py-20 text-center px-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                    <p className="text-sm text-gray-600">Start adding products</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {summary.items.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-2 border-blue-200 hover:border-blue-300 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                              {item.product.englishName || 'Product'}
                            </h4>
                            {item.product.malayalamName && (
                              <p className="text-xs text-gray-600 leading-tight">{item.product.malayalamName}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">{item.product.packaging}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200 text-xs text-gray-700">
                          <span>{item.quantity} kg × {formatPrice(item.price)}</span>
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(item.lineTotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clean Footer */}
              <div className="border-t border-gray-100 bg-white">
                {/* Warning - Minimal emphasis */}
                {!isBronzeTierEnabled && summary.totalWeight > 0 && summary.totalWeight < 100 && (
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-start gap-2 text-sm text-amber-800">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <div>
                        <p className="font-semibold">Minimum order 100kg</p>
                        <p className="text-xs">Add {(100 - summary.totalWeight).toFixed(1)}kg more to proceed</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total - Compact */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Total weight</span>
                      <span className="font-semibold text-gray-700">{summary.totalWeight.toFixed(1)} kg</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-xs text-gray-600">Total amount</span>
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(summary.subtotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button - Clean */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    disabled={summary.items.length === 0 || (!isBronzeTierEnabled && summary.totalWeight < 100)}
                    className={`w-full py-4 rounded-lg font-semibold text-base transition-all ${
                      summary.items.length === 0 || (!isBronzeTierEnabled && summary.totalWeight < 100)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {summary.items.length === 0
                      ? 'Cart empty — add products'
                      : !isBronzeTierEnabled && summary.totalWeight < 100
                      ? `Add ${(100 - summary.totalWeight).toFixed(0)}kg more`
                      : 'Proceed to checkout'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Cart Footer */}
      {summary.items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50">
          {/* Subtle Tier Progress Bar */}
          {summary.nextTier && summary.totalWeight > 0 && (
            <div className="px-6 pt-3 pb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {summary.tier} Tier
                </span>
                <span className="text-[10px] text-gray-400">
                  {summary.kgToNextTier.toFixed(0)}kg to {summary.nextTier}
                </span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((summary.totalWeight) / (summary.nextTier === 'Silver' ? 100 : summary.nextTier === 'Gold' ? 250 : summary.nextTier === 'Platinum' ? 500 : 1000)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase">Order Total</p>
              <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {formatPrice(summary.subtotal)}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all"
            >
              View Cart
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-lg text-sm">{summary.items.length}</span>
            </button>
          </div>
        </div>
      )}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} customerData={customerData} orderToken={orderToken} />
    </div>
  );
}
