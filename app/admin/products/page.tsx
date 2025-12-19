'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { Product } from '@/types';
import { Plus, Edit2, Trash2, Save, X, Search, Fish, Loader2, ShieldAlert } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    englishName: '',
    malayalamName: '',
    preparation: 'Whole',
    packaging: 'Thermal Box',
    sizeSpec: '',
    priceDiamond: 0,
    pricePlatinum: 0,
    priceGold: 0,
    priceSilver: 0
  });

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
      fetchProducts();
    }
  }, [authorized]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setProducts(productsData.sort((a, b) => a.englishName.localeCompare(b.englishName)));
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.englishName || !formData.code) {
      alert('Please fill in required fields (Code and English Name)');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      alert('Product added successfully!');
      setShowAddForm(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleUpdate = async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...formData,
        updatedAt: new Date()
      });
      alert('Product updated successfully!');
      setEditingId(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      englishName: '',
      malayalamName: '',
      preparation: 'Whole',
      packaging: 'Thermal Box',
      sizeSpec: '',
      priceDiamond: 0,
      pricePlatinum: 0,
      priceGold: 0,
      priceSilver: 0
    });
  };

  const filteredProducts = products.filter(product =>
    product.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.malayalamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-ocean-500 rounded-xl flex items-center justify-center shadow-lg">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Products Management</h1>
              <p className="text-slate-600">Manage fish products, prices, and inventory</p>
            </div>
          </div>
        </div>
        {/* Search and Add Button */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, code, or Malayalam name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                resetForm();
              }}
              className="px-6 py-2.5 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex gap-6">
            <div>
              <p className="text-sm text-slate-600">Total Products</p>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Filtered Results</p>
              <p className="text-2xl font-bold text-blue-600">{filteredProducts.length}</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 01/CL/TH/1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  English Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Anchovy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Malayalam Name
                </label>
                <input
                  type="text"
                  value={formData.malayalamName}
                  onChange={(e) => setFormData({ ...formData, malayalamName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., നെത്തോലി"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preparation</label>
                <select
                  value={formData.preparation}
                  onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Whole</option>
                  <option>Cleaned</option>
                  <option>Gutted</option>
                  <option>Steaks</option>
                  <option>Fillets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Packaging</label>
                <select
                  value={formData.packaging}
                  onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Thermal Box</option>
                  <option>Vacuum Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size Spec</label>
                <input
                  type="text"
                  value={formData.sizeSpec}
                  onChange={(e) => setFormData({ ...formData, sizeSpec: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1-2 kg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">💎 Diamond Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceDiamond}
                  onChange={(e) => setFormData({ ...formData, priceDiamond: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">🏆 Platinum Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePlatinum}
                  onChange={(e) => setFormData({ ...formData, pricePlatinum: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">🥇 Gold Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceGold}
                  onChange={(e) => setFormData({ ...formData, priceGold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">🥈 Silver Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceSilver}
                  onChange={(e) => setFormData({ ...formData, priceSilver: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Update Product' : 'Save Product'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  cancelEdit();
                }}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Preparation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">💎 Diamond</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">🏆 Platinum</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">🥇 Gold</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">🥈 Silver</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{product.code}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{product.englishName}</p>
                        <p className="text-sm text-slate-600">{product.malayalamName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {product.preparation}<br/>
                      <span className="text-xs text-slate-500">{product.packaging}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.sizeSpec}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">£{product.priceDiamond?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">£{product.pricePlatinum?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">£{product.priceGold?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">£{product.priceSilver?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.englishName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Fish className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No products found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or add a new product</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
