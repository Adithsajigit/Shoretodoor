'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { TierProgressBar } from '@/components/TierProgressBar';
import { FloatingTierWidget } from '@/components/FloatingTierWidget';
import { useCart } from '@/components/CartContext';
import { usePackagePrices } from '@/components/usePackagePrices';
import { ShoppingCart, Package, Box, ChevronRight, Search, X, Filter } from 'lucide-react';

// --- Desktop Ledger Component (Right Column) ---
const DesktopLedger = ({ onCheckout, customerName, isBronzeTierEnabled }: { 
  onCheckout: () => void; 
  customerName?: string;
  isBronzeTierEnabled?: boolean;
}) => {
  const { summary, removeFromCart } = useCart();
  const formatPrice = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-ocean-50/20 to-white backdrop-blur-2xl rounded-3xl shadow-2xl shadow-ocean-300/30 border border-white/80 sticky top-28 flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_70%)]"></div>
      
      {/* Ultra Modern Gradient Header */}
      <div className="relative z-10 bg-gradient-to-br from-ocean-600 via-ocean-700 to-slate-900 text-white p-7 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-seafoam-400/10 to-transparent"></div>
        <div className="relative z-10">
          {customerName && (
            <div className="mb-4 pb-4 border-b border-white/15">
              <p className="text-[10px] text-ocean-200 uppercase tracking-[0.2em] font-bold">Ordering as</p>
              <p className="text-base font-bold text-white mt-1.5">{customerName}</p>
            </div>
          )}
          <div className="flex justify-between items-center mb-3">
              <h3 className="font-display text-3xl font-extrabold tracking-tight">Your Order</h3>
          </div>
          <div className="flex justify-between text-sm text-ocean-100">
               <span className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-seafoam-400 shadow-lg shadow-seafoam-400/50"></div>
                 Items: <span className="font-bold text-white">{summary.items.length}</span>
               </span>
               <span className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-ocean-300 shadow-lg shadow-ocean-300/50"></div>
                 Weight: <span className="font-bold text-white">{summary.totalWeight.toFixed(1)}kg</span>
               </span>
          </div>
        </div>
      </div>
      
      {/* Scrollable Items with Ultra Modern Cards */}
      <div className="relative z-10 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/30 via-white to-slate-50/30">
        {summary.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-24 h-24 bg-gradient-to-br from-ocean-100 via-ocean-50 to-slate-50 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-ocean-200/40">
                <ShoppingCart className="w-10 h-10 text-ocean-400" />
            </div>
            <p className="font-bold text-slate-700 text-xl">Your order is empty</p>
            <p className="text-sm mt-2 text-slate-400">Browse and add items to get started.</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
              {summary.items.map((item, index) => (
                <div 
                  key={item.productId} 
                  className="relative overflow-hidden bg-gradient-to-br from-white via-ocean-50/20 to-white p-5 rounded-2xl border border-ocean-200/40 shadow-lg hover:shadow-2xl hover:shadow-ocean-200/30 transition-all duration-300 flex justify-between group hover:border-ocean-400/60 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-ocean-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex-1">
                        <div className="font-bold text-slate-900 text-base leading-tight">{item.product.englishName}</div>
                        <div className="text-[10px] text-ocean-600 uppercase tracking-wider mt-1 font-semibold">{item.product.packaging}</div>
                        <div className="flex items-center gap-2 mt-3">
                             <span className="text-xs font-mono font-bold bg-gradient-to-r from-ocean-500 to-ocean-600 px-3 py-1.5 rounded-lg text-white shadow-md">{item.quantity} kg</span>
                             <span className="text-[11px] text-slate-500 font-medium">× {formatPrice(item.price)}</span>
                        </div>
                    </div>
                    <div className="relative z-10 text-right flex flex-col justify-between">
                        <div className="font-mono font-extrabold text-slate-900 text-lg">{formatPrice(item.lineTotal)}</div>
                        <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 text-[11px] font-bold hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all self-end px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                            Remove
                        </button>
                    </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Ultra Modern Footer with Enhanced Gradient */}
      <div className="relative z-10 bg-gradient-to-t from-white via-slate-50/50 to-white border-t border-ocean-200/40 p-7 shadow-2xl">
            <div className="space-y-3.5 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Subtotal Weight</span>
                    <span className="font-bold text-slate-900">{summary.totalWeight.toFixed(2)} kg</span>
                </div>
                
                {summary.totalSavings > 0 && (
                     <div className="flex justify-between text-sm p-2.5 rounded-xl bg-gradient-to-r from-seafoam-50 to-seafoam-100/50 border border-seafoam-200/50 animate-pulse">
                        <span className="text-seafoam-700 font-bold flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-seafoam-500"></div>
                          Tier Savings
                        </span>
                        <span className="font-bold text-seafoam-700">-{formatPrice(summary.totalSavings)}</span>
                    </div>
                )}

                <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-slate-300">
                    <span className="font-display text-xl font-bold text-slate-800">Total</span>
                    <span className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-seafoam-600 to-ocean-600">{formatPrice(summary.subtotal)}</span>
                </div>
            </div>
            
            {/* Minimum Order Warning */}
            {!isBronzeTierEnabled && summary.totalWeight > 0 && summary.totalWeight < 100 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-800 font-semibold">
                        ⚠️ Minimum order: 100kg
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                        Add {(100 - summary.totalWeight).toFixed(1)}kg more to checkout
                    </p>
                </div>
            )}
            
            {/* Bronze Tier Badge */}
            {isBronzeTierEnabled && summary.totalWeight > 0 && summary.totalWeight < 100 && (
                <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl">
                    <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700">
                        🥉 Bronze Tier Pricing Active
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                        Special pricing for orders below 100kg
                    </p>
                </div>
            )}
            
            <button 
                onClick={onCheckout}
                disabled={summary.items.length === 0 || (!isBronzeTierEnabled && summary.totalWeight < 100)}
                className={`w-full font-bold py-5 px-6 rounded-2xl shadow-xl transform transition-all duration-300 flex items-center justify-center gap-3 text-base ${
                    summary.items.length === 0 || (!isBronzeTierEnabled && summary.totalWeight < 100)
                    ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-ocean-600 via-ocean-700 to-ocean-800 hover:from-ocean-500 hover:via-ocean-600 hover:to-ocean-700 text-white shadow-ocean-400/40 hover:shadow-2xl hover:shadow-ocean-400/50 active:scale-95'
                }`}
            >
                <span className="text-lg font-extrabold">
                    {!isBronzeTierEnabled && summary.totalWeight < 100 ? `Need ${(100 - summary.totalWeight).toFixed(0)}kg more` : 'Proceed to Checkout'}
                </span>
                <ChevronRight className="w-4 h-4" />
            </button>
      </div>
    </div>
  );
};

// --- Mobile Footer ---
const MobileFooter = ({ onOpenCart }: { onOpenCart: () => void }) => {
  const { summary } = useCart();
  if (summary.items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-2xl border-t border-ocean-200/50 p-6 shadow-2xl shadow-ocean-300/20 lg:hidden z-50 safe-area-bottom animate-slideUp">
        <div className="flex items-center gap-5 max-w-7xl mx-auto">
            <div className="flex-1">
                <p className="text-[11px] text-ocean-600 uppercase tracking-[0.2em] font-bold">Order Total</p>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                    <span className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ocean-700 via-ocean-800 to-slate-900">
                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(summary.subtotal)}
                    </span>
                    <span className="text-sm text-slate-600 font-bold">({summary.totalWeight.toFixed(1)} kg)</span>
                </div>
                {summary.totalSavings > 0 && (
                     <p className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-seafoam-600 to-ocean-600 mt-1">
                        Saved {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(summary.totalSavings)}
                     </p>
                )}
            </div>
            <button 
                onClick={onOpenCart}
                className="bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-800 text-white px-8 py-5 rounded-2xl font-bold shadow-xl shadow-ocean-400/40 active:scale-95 transition-all duration-300 flex items-center gap-3 hover:from-ocean-500 hover:via-ocean-600 hover:to-ocean-700 hover:shadow-2xl hover:shadow-ocean-400/50"
            >
                <span className="text-lg font-extrabold">View Cart</span>
                <div className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-base font-mono font-bold backdrop-blur-sm">
                    {summary.items.length}
                </div>
            </button>
        </div>
    </div>
  );
};

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
  
  // Get products from package prices based on customer's pricing package
  const { products, loading } = usePackagePrices(customerData?.pricingPackageId);
  const { setIsBronzeTierEnabled, setPricingProducts } = useCart();
  
  // Determine if bronze tier is enabled for this customer
  const isBronzeTierEnabled = customerData?.bronzeTierEnabled || false;

  // Set Bronze tier status in cart context when customer data loads
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
    <div className="min-h-screen pb-32 lg:pb-12 bg-gradient-to-br from-slate-50 via-ocean-50/20 to-slate-100">
      
      {/* Ultra Modern Header */}
      <nav className="relative bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 py-6 px-4 sticky top-0 z-50 shadow-xl shadow-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-500/5 via-transparent to-seafoam-500/5"></div>
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
            <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-ocean-400/20 blur-xl rounded-full"></div>
                  <img src="/logo.PNG" alt="Shore to Door Logo" className="relative w-16 h-16 object-contain rounded-2xl" />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-ocean-800 to-slate-900 bg-clip-text text-transparent leading-none">Shore to Door</h1>
                    <p className="text-slate-500 text-[11px] uppercase tracking-[0.25em] font-bold mt-2">Premium Kerala Fresh Fish</p>
                </div>
            </div>
            {/* Contact Info */}
            <div className="flex items-center gap-4">
                 <div className="hidden sm:block text-right bg-gradient-to-br from-ocean-50/80 via-white to-seafoam-50/80 px-5 py-3 rounded-2xl border border-ocean-200/40 shadow-lg shadow-ocean-100/50 backdrop-blur-sm">
                    <p className="text-[10px] uppercase font-bold text-ocean-600 tracking-wider">24/7 Support</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">+44 7700 900000</p>
                 </div>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            
            {/* Left Column: Modern Product List */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6 animate-fadeIn">
                
                {/* Ultra Modern Search & Filter Toolbar */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-ocean-50/30 to-white backdrop-blur-2xl rounded-3xl shadow-2xl shadow-ocean-200/30 border border-white/60 p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_50%)]"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row flex-wrap gap-4">
                    
                    {/* Enhanced Search Input */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400 group-focus-within:text-ocean-600 transition-all" />
                        <input 
                            type="text"
                            placeholder="Search for fresh catch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-12 py-4 text-sm bg-white/80 border-2 border-ocean-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 focus:bg-white transition-all placeholder:text-slate-400 font-medium shadow-lg shadow-ocean-100/20 hover:border-ocean-300 hover:shadow-xl hover:shadow-ocean-100/30"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-700 hover:bg-ocean-50 rounded-xl transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Modern Packaging Filter Tabs */}
                    <div className="flex items-center gap-2 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-2 rounded-2xl border border-slate-200/60 shadow-lg w-full sm:w-auto">
                         <button 
                            onClick={() => setPackagingType('Thermal Box')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                                packagingType === 'Thermal Box' 
                                ? 'bg-gradient-to-br from-ocean-500 to-ocean-600 text-white shadow-xl shadow-ocean-300/40 scale-105' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                            }`}
                        >
                            <Box className="w-4 h-4" />
                            <span>Thermal Box</span>
                        </button>
                        <button 
                            onClick={() => setPackagingType('Vacuum Pack')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                                packagingType === 'Vacuum Pack' 
                                ? 'bg-gradient-to-br from-ocean-500 to-ocean-600 text-white shadow-xl shadow-ocean-300/40 scale-105' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                            }`}
                        >
                            <Package className="w-4 h-4" />
                            <span>Vacuum Pack</span>
                        </button>
                    </div>
                    
                    </div>
                </div>

                {/* Ultra Modern Product List Container */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-300/40 border border-white/80 min-h-[500px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.05),_transparent_60%)]"></div>
                    
                     <div className="relative z-10 bg-gradient-to-r from-ocean-50/40 via-white/60 to-seafoam-50/40 px-7 py-5 border-b border-ocean-200/30 flex justify-between items-center backdrop-blur-xl">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-300/40">
                              <Filter className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                  Available Products
                              </h2>
                              <p className="text-[10px] text-ocean-600 font-semibold mt-0.5">{filteredProducts.length} items in stock</p>
                            </div>
                         </div>
                    </div>
                    
                    <div className="relative z-10 divide-y divide-slate-200/40">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-fadeIn">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-6 shadow-soft">
                                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-600"></div>
                                </div>
                                <p className="font-semibold text-lg text-slate-600">Loading products...</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => (
                                <div key={product.id} style={{ animationDelay: `${index * 30}ms` }} className="animate-fadeIn">
                                  <ProductCard product={product} isBronzeTierEnabled={isBronzeTierEnabled} />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-fadeIn">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-6 shadow-soft">
                                  <Search className="w-10 h-10 opacity-30" />
                                </div>
                                <p className="font-semibold text-lg text-slate-600">
                                  {products.length === 0 ? 'No products available' : `No fish found matching "${searchTerm}"`}
                                </p>
                                {searchTerm && (
                                  <button 
                                      onClick={() => setSearchTerm('')}
                                      className="mt-4 text-sm text-ocean-600 font-bold hover:text-ocean-800 px-6 py-2.5 rounded-xl hover:bg-ocean-50 transition-all"
                                  >
                                      Clear Search
                                  </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Right Column: Ledger (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 relative">
                <DesktopLedger 
                  onCheckout={() => setIsCheckoutOpen(true)} 
                  customerName={customerData?.name}
                  isBronzeTierEnabled={isBronzeTierEnabled}
                />
            </div>

        </div>
      </main>

      {/* Mobile Elements */}
      <MobileFooter onOpenCart={() => setIsCartOpen(true)} />
      
      {/* Floating Tier Widget - Always Visible */}
      <FloatingTierWidget />
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
        }}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        customerData={customerData}
        orderToken={orderToken}
      />
    </div>
  );
}
