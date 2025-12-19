'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { Package, Search, Save, ArrowLeft, Loader2, ShieldAlert, Check } from 'lucide-react';

interface PackagePrice {
  id: string;
  packageId: string;
  productId: string;
  productCode: string;
  productName: string;
  priceBronze?: number;
  priceDiamond: number;
  pricePlatinum: number;
  priceGold: number;
  priceSilver: number;
}

interface PricingPackage {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isBronzeTier?: boolean;
}

export default function EditPackagePricesPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [pkg, setPkg] = useState<PricingPackage | null>(null);
  const [prices, setPrices] = useState<PackagePrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<PackagePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editedPrices, setEditedPrices] = useState<{ [key: string]: PackagePrice }>({});

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await isAdmin(user.email);
        if (adminStatus) {
          setUser(user);
          setAuthorized(true);
        } else {
          router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (authorized && packageId) {
      fetchPackageAndPrices();
    }
  }, [authorized, packageId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPrices(prices);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredPrices(
        prices.filter(
          (p) =>
            p.productName.toLowerCase().includes(term) ||
            p.productCode.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, prices]);

  const fetchPackageAndPrices = async () => {
    try {
      setLoading(true);

      // Get package details
      const packageDoc = await getDoc(doc(db, 'pricingPackages', packageId));
      if (!packageDoc.exists()) {
        alert('Package not found');
        router.push('/admin/pricing-packages');
        return;
      }

      setPkg({ id: packageDoc.id, ...packageDoc.data() } as PricingPackage);

      // Get all prices for this package
      const pricesSnapshot = await getDocs(collection(db, 'packagePrices'));
      const packagePrices = pricesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PackagePrice))
        .filter(p => p.packageId === packageId)
        .sort((a, b) => a.productCode.localeCompare(b.productCode));

      setPrices(packagePrices);
      setFilteredPrices(packagePrices);
    } catch (error) {
      console.error('Error fetching package and prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (priceId: string, tier: string, value: string) => {
    const price = prices.find(p => p.id === priceId);
    if (!price) return;

    const numValue = parseFloat(value) || 0;

    setEditedPrices(prev => ({
      ...prev,
      [priceId]: {
        ...(prev[priceId] || price),
        [`price${tier}`]: numValue
      }
    }));
  };

  const saveAllChanges = async () => {
    if (Object.keys(editedPrices).length === 0) {
      alert('No changes to save');
      return;
    }

    try {
      setSaving(true);

      const updatePromises = Object.entries(editedPrices).map(([priceId, priceData]) => {
        const updateData: any = {
          priceDiamond: priceData.priceDiamond,
          pricePlatinum: priceData.pricePlatinum,
          priceGold: priceData.priceGold,
          priceSilver: priceData.priceSilver,
          updatedAt: new Date()
        };
        
        // Include Bronze tier if this is a Bronze package
        if (pkg?.isBronzeTier && priceData.priceBronze !== undefined) {
          updateData.priceBronze = priceData.priceBronze;
        }
        
        return updateDoc(doc(db, 'packagePrices', priceId), updateData);
      });

      await Promise.all(updatePromises);

      // Update the package's updatedAt
      await updateDoc(doc(db, 'pricingPackages', packageId), {
        updatedAt: new Date()
      });

      alert(`Successfully updated ${Object.keys(editedPrices).length} product prices!`);
      setEditedPrices({});
      fetchPackageAndPrices();
    } catch (error) {
      console.error('Error saving prices:', error);
      alert('Failed to save prices');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentPrice = (priceId: string, tier: string): number => {
    if (editedPrices[priceId]) {
      const value = editedPrices[priceId][`price${tier}` as keyof PackagePrice];
      return typeof value === 'number' ? value : 0;
    }
    const price = prices.find(p => p.id === priceId);
    if (!price) return 0;
    const value = price[`price${tier}` as keyof PackagePrice];
    return typeof value === 'number' ? value : 0;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Unauthorized Access</h2>
          <p className="text-slate-600 mb-4">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/pricing-packages')}
              className="mb-4 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Packages
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${pkg?.isBronzeTier ? 'bg-amber-600' : 'bg-ocean-500'} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {pkg?.name || 'Loading...'}
                  </h1>
                  <p className="text-slate-600">{pkg?.description}</p>
                </div>
              </div>

              {Object.keys(editedPrices).length > 0 && (
                <button
                  onClick={saveAllChanges}
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save {Object.keys(editedPrices).length} Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading prices...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Product Name
                      </th>
                      {pkg?.isBronzeTier && (
                        <th className="px-6 py-4 text-center text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50">
                          🥉 Bronze
                        </th>
                      )}
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                        💎 Diamond
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                        🏆 Platinum
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                        🥇 Gold
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                        🥈 Silver
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPrices.map((price) => (
                      <tr
                        key={price.id}
                        className={`hover:bg-ocean-50 transition-colors ${
                          editedPrices[price.id] ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-mono text-slate-900">
                          {price.productCode}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {price.productName}
                        </td>
                        {pkg?.isBronzeTier && (
                          <td className="px-6 py-4 bg-amber-50">
                            <input
                              type="number"
                              step="0.01"
                              value={getCurrentPrice(price.id, 'Bronze')}
                              onChange={(e) => handlePriceChange(price.id, 'Bronze', e.target.value)}
                              className="w-24 px-3 py-2 text-center border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={getCurrentPrice(price.id, 'Diamond')}
                            onChange={(e) => handlePriceChange(price.id, 'Diamond', e.target.value)}
                            className="w-24 px-3 py-2 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={getCurrentPrice(price.id, 'Platinum')}
                            onChange={(e) => handlePriceChange(price.id, 'Platinum', e.target.value)}
                            className="w-24 px-3 py-2 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={getCurrentPrice(price.id, 'Gold')}
                            onChange={(e) => handlePriceChange(price.id, 'Gold', e.target.value)}
                            className="w-24 px-3 py-2 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={getCurrentPrice(price.id, 'Silver')}
                            onChange={(e) => handlePriceChange(price.id, 'Silver', e.target.value)}
                            className="w-24 px-3 py-2 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPrices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-600">No products found</p>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-slate-600">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">{prices.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Showing</p>
                <p className="text-2xl font-bold text-slate-900">{filteredPrices.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Edited</p>
                <p className="text-2xl font-bold text-yellow-600">{Object.keys(editedPrices).length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Unsaved Changes</p>
                <p className="text-2xl font-bold text-red-600">
                  {Object.keys(editedPrices).length > 0 ? '⚠️' : '✓'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
