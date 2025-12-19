
'use client';

import React, { useState } from 'react';
import { useCart } from './CartContext';
import { CustomerDetails } from '../types';
import { submitOrder } from '../services/orderService';
import { CheckCircle, X, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData?: {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    bronzeTierEnabled?: boolean;
  };
  orderToken?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  customerData,
  orderToken
}) => {
  const { summary, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [formData, setFormData] = useState<CustomerDetails>({
    name: customerData?.name || '',
    companyName: customerData?.company || '',
    email: customerData?.email || '',
    address: customerData?.address || '',
    phone: customerData?.phone || ''
  });

  // Update form when customer data is provided
  React.useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name,
        companyName: customerData.company,
        email: customerData.email,
        address: `${customerData.address}, ${customerData.city}, ${customerData.state} - ${customerData.pincode}`,
        phone: customerData.phone
      });
    }
  }, [customerData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum 100kg total order (skip for bronze tier customers)
    const isBronzeTierEnabled = customerData?.bronzeTierEnabled || false;
    if (!isBronzeTierEnabled && summary.totalWeight < 100) {
      alert(`Minimum order quantity is 100kg. Your current order is ${summary.totalWeight.toFixed(1)}kg. Please add ${(100 - summary.totalWeight).toFixed(1)}kg more.`);
      return;
    }
    
    setLoading(true);

    try {
      // Save the order total before clearing cart
      const currentTotal = summary.subtotal;
      
      const result = await submitOrder({
        summary,
        customer: formData,
        orderToken,
        remarks
      });
      
      if (result.success) {
        setOrderTotal(currentTotal);
        setSuccess(true);
        setTimeout(() => clearCart(), 500);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit order.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-floating border border-slate-200/50 animate-scaleIn">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-green animate-bounce">
                    <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
                <h2 className="font-display text-4xl font-bold text-slate-900 mb-3">Order Placed Successfully! 🎉</h2>
                <p className="text-slate-600 mb-2 text-lg">Thank you for your order!</p>
                <p className="text-sm text-slate-500 mb-8">
                    Order Total: <span className="font-bold text-slate-900">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(orderTotal)}</span>
                </p>
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">What's Next?</p>
                    <p className="text-sm text-slate-700">We'll process your order and contact you with delivery details.</p>
                </div>
                <button 
                    onClick={() => {
                        setSuccess(false);
                        onClose();
                    }}
                    className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 shadow-hover active:scale-95"
                >
                    Close
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-floating max-w-2xl w-full flex flex-col max-h-[95vh] my-auto border border-slate-200/50 animate-scaleIn">
        
        {/* Modern Header with Gradient */}
        <div className="p-4 sm:p-7 border-b border-slate-200/50 flex justify-between items-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-ocean-600/20 to-transparent"></div>
            <div className="relative z-10">
                <h2 className="font-display text-xl sm:text-3xl font-bold text-white">Place Your Order</h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium">Review and confirm your order</p>
            </div>
            <button 
              onClick={onClose} 
              className="relative z-10 p-2 sm:p-2.5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-300 text-white border border-white/10"
            >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>

        <div className="p-4 sm:p-8 overflow-y-auto flex-1">
            {/* Products List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Order Items</h3>
                <div className="space-y-3">
                    {summary.items.map((item) => (
                        <div key={item.productId} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 text-sm">{item.product.englishName}</h4>
                                    {item.product.malayalamName && (
                                        <p className="text-xs text-slate-600">{item.product.malayalamName}</p>
                                    )}
                                    <p className="text-xs text-slate-500 mt-1">{item.product.packaging}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
                                <span className="text-slate-600">{item.quantity} kg × {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(item.price)}</span>
                                <span className="font-semibold text-slate-900">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(item.lineTotal)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Remarks Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Order Remarks (Optional)</h3>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    placeholder="Add any special instructions or remarks for this order..."
                    className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200/60 rounded-xl px-5 py-3.5 text-slate-900 focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 outline-none transition-all duration-300 resize-none placeholder:text-slate-400 shadow-sm hover:border-ocean-300"
                />
            </div>

            {/* Modern Summary Card */}
            <div className="bg-gradient-to-br from-seafoam-50 via-seafoam-50/50 to-ocean-50/30 border-2 border-seafoam-200/50 rounded-2xl p-4 sm:p-6 mb-8 shadow-card">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex-1">
                        <span className="text-xs text-seafoam-700 font-bold uppercase tracking-[0.15em]">Total Payable</span>
                        <p className="font-display text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mt-1 break-words">
                            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(summary.subtotal)}
                        </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm px-5 py-3 rounded-xl border border-slate-200/50 shadow-sm self-start sm:self-auto">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</span>
                        <span className="font-bold text-slate-900 text-xl">{summary.totalWeight.toFixed(1)} kg</span>
                    </div>
                </div>
            </div>

            {/* Customer Info Display - Only show if customer data exists */}
            {customerData && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Delivery Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Name</p>
                            <p className="text-slate-900 font-medium mt-1 break-words">{formData.name}</p>
                        </div>
                        {formData.companyName && (
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Company</p>
                                <p className="text-slate-900 font-medium mt-1 break-words">{formData.companyName}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
                            <p className="text-slate-900 font-medium mt-1 break-all">{formData.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Phone</p>
                            <p className="text-slate-900 font-medium mt-1 break-words">{formData.phone}</p>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <p className="text-xs text-slate-500 font-semibold uppercase">Delivery Address</p>
                            <p className="text-slate-900 font-medium mt-1 break-words">{formData.address}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern Form - Only show if NO customer data */}
            {!customerData && (
            <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Name *</label>
                        <input 
                          required 
                          name="name" 
                          type="text" 
                          value={formData.name} 
                          onChange={handleChange}
                          className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200/60 rounded-xl px-5 py-3.5 text-slate-900 focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 outline-none transition-all duration-300 placeholder:text-slate-400 shadow-sm hover:border-ocean-300"
                          placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name *</label>
                        <input 
                          required 
                          name="companyName" 
                          type="text" 
                          value={formData.companyName} 
                          onChange={handleChange}
                          className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200/60 rounded-xl px-5 py-3.5 text-slate-900 focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 outline-none transition-all duration-300 placeholder:text-slate-400 shadow-sm hover:border-ocean-300"
                          placeholder="Your Company Ltd."
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                        <input 
                          required 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={handleChange}
                          className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200/60 rounded-xl px-5 py-3.5 text-slate-900 focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 outline-none transition-all duration-300 placeholder:text-slate-400 shadow-sm hover:border-ocean-300"
                          placeholder="john@company.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                        <input 
                          required 
                          name="phone" 
                          type="tel" 
                          value={formData.phone} 
                          onChange={handleChange}
                          className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200/60 rounded-xl px-5 py-3.5 text-slate-900 focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 outline-none transition-all duration-300 placeholder:text-slate-400 shadow-sm hover:border-ocean-300"
                          placeholder="+44 7700 900000"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Address *</label>
                    <textarea 
                      required 
                      name="address" 
                      rows={3} 
                      value={formData.address} 
                      onChange={handleChange}
                      className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200/60 rounded-xl px-5 py-3.5 text-slate-900 focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 outline-none transition-all duration-300 resize-none placeholder:text-slate-400 shadow-sm hover:border-ocean-300"
                      placeholder="Enter your complete delivery address..."
                    />
                </div>
            </form>
            )}
        </div>

        {/* Modern Footer */}
        <div className="p-6 border-t border-slate-200/50 bg-gradient-to-t from-slate-50/50 to-white rounded-b-3xl flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-7 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-slate-200"
            >
                Cancel
            </button>
            <button 
                type={customerData ? "button" : "submit"}
                form={customerData ? undefined : "checkoutForm"}
                onClick={customerData ? handleSubmit : undefined}
                disabled={loading}
                className="px-8 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-seafoam-600 hover:to-seafoam-700 text-white font-bold rounded-xl shadow-hover transition-all duration-300 transform active:scale-95 flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? 'Placing Order...' : 'Place Order'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};
