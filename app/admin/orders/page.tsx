'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  ShoppingCart,
  Users, 
  Package,
  LogOut,
  BarChart3,
  Loader2,
  ShieldAlert,
  Search,
  Trash2,
  Eye,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  X
} from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  malayalamName: string;
  packaging: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    address: string;
  };
  items: OrderItem[];
  summary: {
    totalWeight: number;
    subtotal: number;
    tier: string;
    totalSavings?: number;
  };
  remarks?: string;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  invoiceUrl?: string;
  invoiceGeneratedAt?: any;
}

export default function AdminOrders() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else if (!isAdmin(currentUser.email)) {
        setUnauthorized(true);
        setLoading(false);
      } else {
        setUser(currentUser);
        loadOrders();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery) ||
        order.customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: Timestamp.now() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.summary.subtotal, 0);
  const totalWeight = filteredOrders.reduce((sum, order) => sum + order.summary.totalWeight, 0);

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fadeIn">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldAlert className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-red-700 mb-3">Access Denied</h2>
          <p className="text-slate-700 mb-2 font-medium">You are not authorized to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-ocean-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar user={user} onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ocean-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ocean-600">
                  Orders Management
                </h1>
                <p className="text-xs text-slate-500">View and manage all orders</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Orders</p>
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{filteredOrders.length}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">£{totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Weight</p>
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalWeight.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Pending Orders</p>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, phone, company, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <button
                onClick={loadOrders}
                disabled={refreshing}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-600">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Orders will appear here when customers place them'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {order.customer.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                        <span>{order.customer.companyName}</span>
                        <span>{order.customer.email}</span>
                        <span>{order.customer.phone}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Order ID: {order.id}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        £{order.summary.subtotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {order.summary.totalWeight.toFixed(1)} kg • {order.summary.tier}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    {order.invoiceUrl && (
                      <>
                        <a
                          href={order.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Invoice
                        </a>
                        <a
                          href={order.invoiceUrl}
                          download
                          className="px-4 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Invoice
                        </a>
                      </>
                    )}
                    
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="px-4 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {expandedOrder === order.id ? 'Hide' : 'View'} Items
                      {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-4 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expandable Items Section */}
                {expandedOrder === order.id && (
                  <div className="border-t border-slate-200 bg-slate-50 p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Order Items ({order.items.length})</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-slate-900">
                                {item.productName}
                                <span className="text-slate-500 ml-2">({item.malayalamName})</span>
                              </h5>
                              <div className="flex gap-4 mt-1 text-sm text-slate-600">
                                <span>Packaging: {item.packaging}</span>
                                <span>Quantity: {item.quantity} kg</span>
                                <span>Price: £{item.price.toFixed(2)}/kg</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-slate-900">
                                £{item.lineTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Remarks Section */}
                    {order.remarks && (
                      <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <h5 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Order Remarks
                        </h5>
                        <p className="text-sm text-amber-800 whitespace-pre-wrap">{order.remarks}</p>
                      </div>
                    )}
                    
                    {/* Delivery Address */}
                    <div className="mt-6 bg-white rounded-lg p-4 border border-slate-200">
                      <h5 className="font-semibold text-slate-900 mb-2">Delivery Address</h5>
                      <p className="text-sm text-slate-700">{order.customer.address}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
