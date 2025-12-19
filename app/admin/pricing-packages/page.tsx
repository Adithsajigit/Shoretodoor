'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { Package, Plus, Edit2, Trash2, Copy, Loader2, ShieldAlert, Check, X } from 'lucide-react';

interface PricingPackage {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export default function PricingPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [duplicateSourceId, setDuplicateSourceId] = useState<string | null>(null);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageDescription, setNewPackageDescription] = useState('');
  const [creatingDefault, setCreatingDefault] = useState(false);
  const [creatingBronze, setCreatingBronze] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    if (authorized) {
      fetchPackages();
    }
  }, [authorized]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'pricingPackages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const packagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PricingPackage[];
      setPackages(packagesData);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPackage = async () => {
    try {
      setCreatingDefault(true);
      // Check if default package already exists
      const packagesSnapshot = await getDocs(collection(db, 'pricingPackages'));
      const defaultExists = packagesSnapshot.docs.some(doc => doc.data().isDefault === true);
      
      if (defaultExists) {
        alert('❌ Default package already exists!\n\nPlease delete the duplicate default package first, then create a new one if needed.');
        return;
      }

      // Get all products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          code: data.code,
          englishName: data.englishName,
          name: data.name,
          priceDiamond: data.priceDiamond,
          pricePlatinum: data.pricePlatinum,
          priceGold: data.priceGold,
          priceSilver: data.priceSilver
        };
      });

      if (products.length === 0) {
        alert('No products found! Please migrate products first:\n\n1. Go to /admin/products\n2. Or run the migration tool\n3. Then come back to create pricing packages');
        return;
      }

      console.log(`Found ${products.length} products, creating default package...`);

      // Create default package
      const packageRef = await addDoc(collection(db, 'pricingPackages'), {
        name: 'Default Package',
        description: 'Default pricing for all customers',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Package created, adding products...');

      // Copy all product prices to this package
      const batch = [];
      for (const product of products) {
        batch.push(
          addDoc(collection(db, 'packagePrices'), {
            packageId: packageRef.id,
            productId: product.id,
            productCode: product.code || 'N/A',
            productName: product.englishName || product.name || 'Unknown',
            priceDiamond: product.priceDiamond || 0,
            pricePlatinum: product.pricePlatinum || 0,
            priceGold: product.priceGold || 0,
            priceSilver: product.priceSilver || 0,
            createdAt: new Date()
          })
        );
      }

      await Promise.all(batch);
      console.log('All products added successfully!');
      alert(`✅ Default package created with ${products.length} products!`);
      fetchPackages();
    } catch (error: any) {
      console.error('Error creating default package:', error);
      alert(`Failed to create default package:\n\n${error.message || error}\n\nCheck browser console for details.`);
    } finally {
      setCreatingDefault(false);
    }
  };

  const createBronzeTierPackage = async () => {
    try {
      setCreatingBronze(true);
      // Check if Bronze tier package already exists
      const packagesSnapshot = await getDocs(collection(db, 'pricingPackages'));
      const bronzeExists = packagesSnapshot.docs.some(doc => 
        doc.data().name === 'Bronze Tier Package' && doc.data().isBronzeTier === true
      );
      
      if (bronzeExists) {
        alert('❌ Bronze Tier package already exists!\n\nPlease delete the duplicate bronze package first, then create a new one if needed.');
        return;
      }

      // Get all products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          code: data.code,
          englishName: data.englishName,
          name: data.name,
          priceBronze: data.priceBronze || data.priceSilver || 0, // Use bronze price if exists, fallback to silver
          priceDiamond: data.priceDiamond,
          pricePlatinum: data.pricePlatinum,
          priceGold: data.priceGold,
          priceSilver: data.priceSilver
        };
      });

      if (products.length === 0) {
        alert('No products found! Please migrate products first.');
        return;
      }

      console.log(`Found ${products.length} products, creating Bronze tier package...`);

      // Create bronze tier package
      const packageRef = await addDoc(collection(db, 'pricingPackages'), {
        name: 'Bronze Tier Package',
        description: 'Special pricing for orders below 100kg (Selected customers only)',
        isDefault: false,
        isBronzeTier: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Bronze package created, adding products...');

      // Copy all product prices to this package
      const batch = [];
      for (const product of products) {
        const priceData: any = {
          packageId: packageRef.id,
          productId: product.id,
          productCode: product.code || 'N/A',
          productName: product.englishName || product.name || 'Unknown',
          priceDiamond: product.priceDiamond || 0,
          pricePlatinum: product.pricePlatinum || 0,
          priceGold: product.priceGold || 0,
          priceSilver: product.priceSilver || 0,
          createdAt: new Date()
        };

        // Only add priceBronze if it exists
        if (product.priceBronze !== undefined && product.priceBronze !== null) {
          priceData.priceBronze = product.priceBronze;
        }

        batch.push(addDoc(collection(db, 'packagePrices'), priceData));
      }

      await Promise.all(batch);
      console.log('All products added to Bronze tier package!');
      alert(`✅ Bronze Tier package created with ${products.length} products!`);
      fetchPackages();
    } catch (error: any) {
      console.error('Error creating bronze tier package:', error);
      alert(`Failed to create bronze tier package:\n\n${error.message || error}\n\nCheck browser console for details.`);
    } finally {
      setCreatingBronze(false);
    }
  };

  const duplicatePackage = async (sourcePackageId: string) => {
    if (!newPackageName.trim()) {
      alert('Please enter a package name');
      return;
    }

    try {
      setDuplicating(true);
      // Create new package
      const newPackageRef = await addDoc(collection(db, 'pricingPackages'), {
        name: newPackageName,
        description: newPackageDescription,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Copy all prices from source package
      const pricesSnapshot = await getDocs(
        query(collection(db, 'packagePrices'))
      );
      
      const sourcePrices = pricesSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            packageId: data.packageId,
            productId: data.productId,
            productCode: data.productCode,
            productName: data.productName,
            priceBronze: data.priceBronze,
            priceDiamond: data.priceDiamond,
            pricePlatinum: data.pricePlatinum,
            priceGold: data.priceGold,
            priceSilver: data.priceSilver
          };
        })
        .filter((p: any) => p.packageId === sourcePackageId);

      const batch = [];
      for (const price of sourcePrices) {
        const priceData: any = {
          packageId: newPackageRef.id,
          productId: price.productId,
          productCode: price.productCode,
          productName: price.productName,
          priceDiamond: price.priceDiamond,
          pricePlatinum: price.pricePlatinum,
          priceGold: price.priceGold,
          priceSilver: price.priceSilver,
          createdAt: new Date()
        };

        // Only add priceBronze if it exists
        if (price.priceBronze !== undefined && price.priceBronze !== null) {
          priceData.priceBronze = price.priceBronze;
        }

        batch.push(addDoc(collection(db, 'packagePrices'), priceData));
      }

      await Promise.all(batch);
      
      alert(`Package "${newPackageName}" created with ${sourcePrices.length} products!`);
      setDuplicateSourceId(null);
      setNewPackageName('');
      setNewPackageDescription('');
      fetchPackages();
    } catch (error) {
      console.error('Error duplicating package:', error);
      alert('Failed to duplicate package');
    } finally {
      setDuplicating(false);
    }
  };

  const deletePackage = async (packageId: string, packageName: string) => {
    if (!confirm(`Are you sure you want to delete "${packageName}"? This will also delete all associated prices.`)) {
      return;
    }

    try {
      setDeleting(packageId);
      // Delete all prices in this package
      const pricesSnapshot = await getDocs(collection(db, 'packagePrices'));
      const packagePrices = pricesSnapshot.docs.filter(
        (doc: any) => doc.data().packageId === packageId
      );

      const deletePromises = packagePrices.map(priceDoc => 
        deleteDoc(doc(db, 'packagePrices', priceDoc.id))
      );

      await Promise.all(deletePromises);

      // Delete the package
      await deleteDoc(doc(db, 'pricingPackages', packageId));

      alert('Package deleted successfully!');
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    } finally {
      setDeleting(null);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 flex">
      <AdminSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-ocean-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Pricing Packages</h1>
                  <p className="text-slate-600">Create and manage different price lists for customers</p>
                </div>
              </div>

              {!loading && (
                <div className="flex gap-3">
                  {packages.length === 0 && (
                    <button
                      onClick={createDefaultPackage}
                      disabled={creatingDefault}
                      className="px-6 py-3 bg-ocean-500 text-white rounded-xl hover:bg-ocean-600 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingDefault ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Create Default Package
                        </>
                      )}
                    </button>
                  )}
                  {!packages.some(pkg => (pkg as any).isBronzeTier) && (
                    <button
                      onClick={createBronzeTierPackage}
                      disabled={creatingBronze}
                      className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingBronze ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          🥉 Create Bronze Tier Package
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-ocean-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Pricing Packages</h3>
              <p className="text-slate-600 mb-6">Create your first package to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                  <div className={`p-6 ${
                    pkg.isDefault 
                      ? 'bg-ocean-500' 
                      : (pkg as any).isBronzeTier 
                        ? 'bg-amber-600' 
                        : 'bg-slate-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-xl font-bold ${pkg.isDefault || (pkg as any).isBronzeTier ? 'text-white' : 'text-slate-900'}`}>
                        {(pkg as any).isBronzeTier && '🥉 '}{pkg.name}
                      </h3>
                      {pkg.isDefault && (
                        <span className="px-2 py-1 bg-white/20 text-white text-xs font-bold rounded">
                          DEFAULT
                        </span>
                      )}
                      {(pkg as any).isBronzeTier && (
                        <span className="px-2 py-1 bg-white/20 text-white text-xs font-bold rounded">
                          BRONZE
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${pkg.isDefault || (pkg as any).isBronzeTier ? 'text-white/90' : 'text-slate-600'}`}>
                      {pkg.description}
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push(`/admin/pricing-packages/${pkg.id}`)}
                        className="w-full px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Prices
                      </button>

                      <button
                        onClick={() => {
                          setDuplicateSourceId(pkg.id);
                          setNewPackageName('');
                          setNewPackageDescription('');
                        }}
                        className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate Package
                      </button>

                      <button
                        onClick={() => deletePackage(pkg.id, pkg.name)}
                        disabled={deleting === pkg.id}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === pkg.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Duplicate Package Modal */}
          {duplicateSourceId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Duplicate Package</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      value={newPackageName}
                      onChange={(e) => setNewPackageName(e.target.value)}
                      placeholder="e.g., Pack 1, Premium Customers, etc."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newPackageDescription}
                      onChange={(e) => setNewPackageDescription(e.target.value)}
                      placeholder="Optional description..."
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => duplicatePackage(duplicateSourceId)}
                    disabled={duplicating}
                    className="flex-1 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {duplicating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setDuplicateSourceId(null);
                      setNewPackageName('');
                      setNewPackageDescription('');
                    }}
                    disabled={duplicating}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
