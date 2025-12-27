'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { validateOrderLink, markLinkAsUsed } from '@/lib/orderLinks';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import OrderForm from '@/components/OrderForm';

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    pricingPackageId: '',
    pricingPackageName: '',
    bronzeTierEnabled: false
  });

  useEffect(() => {
    const checkLink = async () => {
      try {
        console.log('Validating order link token:', token);
        const result = await validateOrderLink(token);
        console.log('Validation result:', result);
        
        if (result.valid) {
          setValid(true);
          setCustomerData({
            name: result.customerName || '',
            email: result.customerEmail || '',
            phone: result.customerPhone || '',
            company: result.customerCompany || '',
            address: result.customerAddress || '',
            city: result.customerCity || '',
            state: result.customerState || '',
            pincode: result.customerPincode || '',
            pricingPackageId: result.pricingPackageId || '',
            pricingPackageName: result.pricingPackageName || 'Default',
            bronzeTierEnabled: result.bronzeTierEnabled || false
          });
        } else {
          console.error('Link validation failed:', result.error);
          setError(result.error || 'Invalid link');
        }
      } catch (err) {
        console.error('Error validating link:', err);
        setError(`Failed to validate link: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkLink();
    } else {
      setError('No token provided');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-seafoam-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600 font-semibold">Validating your order link...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Invalid Order Link</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="text-sm text-slate-500">
            <p>This link may have:</p>
            <ul className="mt-2 space-y-1 text-left pl-6 list-disc">
              <li>Expired</li>
              <li>Already been used</li>
              <li>Been deactivated</li>
              <li>Invalid token</li>
            </ul>
          </div>
          <p className="text-sm text-slate-600 mt-6">
            Please contact your supplier for a new order link.
          </p>
        </div>
      </div>
    );
  }

  // Valid link - show the order form
  return <OrderForm customerData={customerData} orderToken={token} />;
}
