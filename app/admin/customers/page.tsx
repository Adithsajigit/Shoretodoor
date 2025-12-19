'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import { createOrderLink, getCustomerLinks, OrderLink } from '@/lib/orderLinks';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Fish, 
  Users, 
  Package,
  LogOut,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Loader2,
  ShieldAlert,
  Globe,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  X,
  Save,
  Building2,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Copy,
  Clock,
  ExternalLink
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pricingPackageId?: string;
  pricingPackageName?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [linkExpiry, setLinkExpiry] = useState<Date | null>(null);
  const [customerLinks, setCustomerLinks] = useState<OrderLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    pricingPackageId: ''
  });

  // Pricing packages state
  const [pricingPackages, setPricingPackages] = useState<any[]>([]);

  // Link generation form state
  const [linkDuration, setLinkDuration] = useState({
    value: 24,
    unit: 'hours' // minutes, hours, days
  });
  const [enableBronzeTier, setEnableBronzeTier] = useState(false);

  // Load customers from Firebase
  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const loadedCustomers: Customer[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedCustomers.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company || '',
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          pricingPackageId: data.pricingPackageId || '',
          pricingPackageName: data.pricingPackageName || 'Default',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      setCustomers(loadedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      setErrorMessage('Failed to load customers. Please refresh the page.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Load pricing packages
  const loadPricingPackages = async () => {
    try {
      const packagesRef = collection(db, 'pricingPackages');
      const querySnapshot = await getDocs(packagesRef);
      const packages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPricingPackages(packages);
    } catch (error) {
      console.error('Error loading pricing packages:', error);
    }
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else if (!isAdmin(currentUser.email)) {
        setUnauthorized(true);
        setLoading(false);
        setTimeout(async () => {
          await auth.signOut();
          router.push('/');
        }, 3000);
      } else {
        setUser(currentUser);
        setLoading(false);
        loadCustomers(); // Load customers when admin is authenticated
        loadPricingPackages(); // Load pricing packages
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setErrorMessage('');
      
      // Add customer to Firebase Firestore
      const customersRef = collection(db, 'customers');
      
      // Get pricing package name
      const selectedPackage = pricingPackages.find(p => p.id === formData.pricingPackageId);
      
      const docRef = await addDoc(customersRef, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || '',
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        pricingPackageId: formData.pricingPackageId || '',
        pricingPackageName: selectedPackage?.name || 'Default',
        createdAt: Timestamp.now(),
        createdBy: user?.email || 'admin'
      });

      // Add to local state for immediate UI update
      const newCustomer: Customer = {
        id: docRef.id,
        ...formData,
        pricingPackageName: selectedPackage?.name || 'Default',
        createdAt: new Date().toISOString()
      };

      setCustomers([newCustomer, ...customers]);
      setShowAddModal(false);
      setSuccessMessage('Customer created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        state: 'Kerala',
        pincode: '',
        pricingPackageId: ''
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      setErrorMessage('Failed to create customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'customers', id));
      
      // Remove from local state
      setCustomers(customers.filter(c => c.id !== id));
      
      setSuccessMessage('Customer deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setErrorMessage('Failed to delete customer. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedCustomer) return;

    try {
      setSaving(true);
      setErrorMessage('');

      // Convert duration to minutes
      let durationMinutes = linkDuration.value;
      if (linkDuration.unit === 'hours') {
        durationMinutes = linkDuration.value * 60;
      } else if (linkDuration.unit === 'days') {
        durationMinutes = linkDuration.value * 24 * 60;
      }

      const result = await createOrderLink(
        selectedCustomer.id,
        selectedCustomer.name,
        selectedCustomer.email,
        durationMinutes,
        user?.email || 'admin',
        enableBronzeTier
      );

      setGeneratedLink(result.linkUrl);
      setLinkExpiry(result.expiresAt);
      setSuccessMessage('Order link generated successfully!');
      
      // Reload customer links
      await loadCustomerLinks(selectedCustomer.id);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error generating link:', error);
      setErrorMessage('Failed to generate link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadCustomerLinks = async (customerId: string) => {
    try {
      setLoadingLinks(true);
      const links = await getCustomerLinks(customerId);
      setCustomerLinks(links);
    } catch (error) {
      console.error('Error loading customer links:', error);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleOpenLinkModal = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setGeneratedLink('');
    setLinkExpiry(null);
    setShowLinkModal(true);
    await loadCustomerLinks(customer.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Link copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fadeIn">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldAlert className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-red-700 mb-3">Access Denied</h2>
          <p className="text-slate-700 mb-2 font-medium">You are not authorized to access the admin panel.</p>
          <p className="text-sm text-slate-600 mb-6">Only authorized administrators can access this area.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search customers by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="px-4 py-2.5 text-slate-700 hover:text-ocean-600 font-medium rounded-xl transition-all text-sm flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button
                  onClick={() => router.push('/admin/orders')}
                  className="px-4 py-2.5 text-slate-700 hover:text-ocean-600 font-medium rounded-xl transition-all text-sm flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Orders</span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2.5 bg-ocean-500 text-white font-semibold rounded-xl hover:bg-ocean-600 transition-all text-sm flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">View Store</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-700">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Customer Management</h2>
              <p className="text-slate-600 mt-1">Create and manage customer accounts</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-ocean-500 text-white font-semibold rounded-xl hover:bg-ocean-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Customer
            </button>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loadingCustomers ? (
              <div className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-ocean-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Loading customers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Pricing</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">No customers found</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {searchQuery ? 'Try a different search term' : 'Click "Add Customer" to create your first customer'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-ocean-500 flex items-center justify-center text-white font-bold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{customer.name}</p>
                              {customer.company && (
                                <p className="text-sm text-slate-500">{customer.company}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-4 h-4 text-slate-400" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-4 h-4 text-slate-400" />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>{customer.city}, {customer.state}</p>
                              <p className="text-slate-500">{customer.pincode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-slate-700">
                              {customer.pricingPackageName || 'Default'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenLinkModal(customer)}
                              className="p-2 hover:bg-ocean-50 text-ocean-600 rounded-lg transition-colors"
                              title="Generate order link"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add New Customer</h3>
                <p className="text-sm text-slate-600 mt-0.5">Create a customer account manually</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Company (Optional) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Company/Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all resize-none"
                    rows={2}
                    placeholder="Street address"
                  />
                </div>
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                  >
                    <option value="Kerala">Kerala</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                    placeholder="682001"
                  />
                </div>
              </div>

              {/* Pricing Package */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Pricing Package
                </label>
                <select
                  value={formData.pricingPackageId}
                  onChange={(e) => setFormData({ ...formData, pricingPackageId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                >
                  <option value="">Default Package</option>
                  {pricingPackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Assign a pricing package to this customer
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-ocean-500 text-white font-semibold rounded-xl hover:bg-ocean-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        )}

        {/* Generate Order Link Modal */}
        {showLinkModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-ocean-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Generate Order Link</h2>
                    <p className="text-sm text-white/80">{selectedCustomer.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setGeneratedLink('');
                    setLinkExpiry(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Link Duration Settings */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Link Validity Duration
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      value={linkDuration.value}
                      onChange={(e) => setLinkDuration({ ...linkDuration, value: parseInt(e.target.value) || 1 })}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    />
                    <select
                      value={linkDuration.unit}
                      onChange={(e) => setLinkDuration({ ...linkDuration, unit: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Link will expire after {linkDuration.value} {linkDuration.unit}
                  </p>
                </div>

                {/* Bronze Tier Enable */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableBronzeTier}
                      onChange={(e) => setEnableBronzeTier(e.target.checked)}
                      className="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-amber-700">
                          🥉 Enable Bronze Tier
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">
                        Allow this customer to place orders below 100kg minimum. Special pricing applies.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateLink}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-ocean-500 text-white font-semibold rounded-xl hover:bg-ocean-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5" />
                      Generate New Link
                    </>
                  )}
                </button>

                {/* Generated Link Display */}
                {generatedLink && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-green-700 font-semibold">
                      <CheckCircle2 className="w-5 h-5" />
                      Link Generated Successfully!
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-600">Order Link:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={generatedLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedLink)}
                          className="px-3 py-2 bg-ocean-500 text-white rounded hover:bg-ocean-600 transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                      </div>
                    </div>
                    {linkExpiry && (
                      <p className="text-xs text-slate-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Expires: {linkExpiry.toLocaleString()} ({formatTimeRemaining(linkExpiry)})
                      </p>
                    )}
                  </div>
                )}

                {/* Previous Links */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Previous Links ({customerLinks.length})
                  </h3>
                  {loadingLinks ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 text-ocean-500 animate-spin mx-auto" />
                    </div>
                  ) : customerLinks.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No links generated yet</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {customerLinks.map((link) => {
                        const isExpired = new Date() > link.expiresAt;
                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                        const fullLink = `${baseUrl}/order/${link.token}`;
                        
                        return (
                          <div
                            key={link.id}
                            className={`p-3 rounded-lg border ${
                              !link.isActive || isExpired || link.isUsed
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-green-50 border-green-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  !link.isActive
                                    ? 'bg-red-100 text-red-700'
                                    : isExpired
                                    ? 'bg-orange-100 text-orange-700'
                                    : link.isUsed
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {!link.isActive ? 'Deactivated' : isExpired ? 'Expired' : link.isUsed ? 'Used' : 'Active'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Created: {link.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              {!link.isUsed && !isExpired && link.isActive && (
                                <button
                                  onClick={() => copyToClipboard(fullLink)}
                                  className="text-xs text-ocean-600 hover:text-ocean-700 font-semibold flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 font-mono truncate">
                              {fullLink}
                            </p>
                            {!isExpired && link.isActive && !link.isUsed && (
                              <p className="text-xs text-slate-500 mt-1">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatTimeRemaining(link.expiresAt)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }