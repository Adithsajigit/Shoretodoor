'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminAuth';
import AdminSidebar from '@/components/AdminSidebar';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Package, DollarSign, ShoppingCart,
  Fish, Award, Calendar, Percent, ArrowUp, ArrowDown, Loader2, ShieldAlert, ChevronDown, ChevronUp, Sparkles, Settings
} from 'lucide-react';
import { generateGeminiInsights } from '@/app/actions/gemini';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  totalAmount: number;
  totalWeight: number;
  orderDate: Date;
  status: string;
  tier?: string;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: { name: string; preparation: string; packaging: string; quantity: number; revenue: number }[];
  topCustomers: { name: string; orders: number; revenue: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  productCategoryBreakdown: { name: string; value: number }[];
  tierDistribution: { tier: string; count: number; revenue: number }[];
  dailySales: { date: string; sales: number }[];
}

const COLORS = ['#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    topProducts: [],
    topCustomers: [],
    revenueByMonth: [],
    productCategoryBreakdown: [],
    tierDistribution: [],
    dailySales: []
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  // Gemini State
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<{
    summary: string;
    trends: { title: string; description: string; type: string }[];
    recommendations: { title: string; description: string }[];
    chartData?: any;
    chartType?: string;
    chartTitle?: string;
  } | null>(null);
  const [isGeminiMinimized, setIsGeminiMinimized] = useState(false);

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
      fetchAnalyticsData();
    }
  }, [authorized, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate = new Date(0); // Beginning of time
      if (timeRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (timeRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (timeRange === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Fetch products to get preparation data
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsMap = new Map();
      const productsByName = new Map();
      productsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const productInfo = {
          preparation: data.preparation || 'Whole',
          packaging: data.packaging || 'N/A'
        };
        // Index by ID
        productsMap.set(doc.id, productInfo);
        // Also index by English name for fallback lookup
        if (data.englishName) {
          productsByName.set(data.englishName.toLowerCase(), productInfo);
        }
      });

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const allOrders: Order[] = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerName: data.customer?.name || '',
        customerEmail: data.customer?.email || '',
        items: data.items || [],
        totalAmount: data.summary?.subtotal || 0,
        totalWeight: data.summary?.totalWeight || 0,
        orderDate: data.createdAt?.toDate() || new Date(),
        status: data.status || 'completed',
        tier: data.summary?.tier || 'Unknown'
      };
    });      // Filter by time range
      const orders = allOrders.filter(order => order.orderDate >= startDate);

      // Fetch customers
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;
      const totalCustomers = new Set(orders.map(o => o.customerEmail)).size;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Top Products
      const productStats = new Map<string, { name: string; preparation: string; packaging: string; quantity: number; revenue: number }>();
      orders.forEach(order => {
        order.items.forEach((item: any) => {
          const productName = item.productName || 'Unknown';
          // Get preparation and packaging from products collection
          // Try by productId first, then by name, then use order item data
          let productData = productsMap.get(item.productId);
          if (!productData && productName) {
            productData = productsByName.get(productName.toLowerCase());
          }
          
          const preparation = item.preparation || productData?.preparation || 'Whole';
          const packaging = item.packaging || productData?.packaging || 'N/A';
          // Create unique key combining name, preparation, and packaging
          const key = `${productName}|${preparation}|${packaging}`;
          
          const existing = productStats.get(key) || { name: productName, preparation, packaging, quantity: 0, revenue: 0 };
          productStats.set(key, {
            name: productName,
            preparation,
            packaging,
            quantity: existing.quantity + (item.quantity || 0),
            revenue: existing.revenue + (item.lineTotal || 0)
          });
        });
      });
      const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.revenue - a.revenue);

      // Top Customers
      const customerStats = new Map<string, { orders: number; revenue: number }>();
      orders.forEach(order => {
        const existing = customerStats.get(order.customerEmail) || { orders: 0, revenue: 0 };
        customerStats.set(order.customerEmail, {
          orders: existing.orders + 1,
          revenue: existing.revenue + order.totalAmount
        });
      });
      const topCustomers = Array.from(customerStats.entries())
        .map(([email, stats]) => ({
          name: orders.find(o => o.customerEmail === email)?.customerName || email,
          ...stats
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Revenue by Month (last 12 months)
      const monthlyRevenue = new Map<string, { revenue: number; orders: number }>();
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return d.toLocaleString('default', { month: 'short', year: 'numeric' });
      });

      last12Months.forEach(month => monthlyRevenue.set(month, { revenue: 0, orders: 0 }));

      orders.forEach(order => {
        const month = order.orderDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        const existing = monthlyRevenue.get(month) || { revenue: 0, orders: 0 };
        monthlyRevenue.set(month, {
          revenue: existing.revenue + order.totalAmount,
          orders: existing.orders + 1
        });
      });

      const revenueByMonth = Array.from(monthlyRevenue.entries())
        .map(([month, stats]) => ({ month, ...stats }));

      // Product Category Breakdown (by packaging type)
      const categoryStats = new Map<string, number>();
      orders.forEach(order => {
        order.items.forEach((item: any) => {
          const category = item.packaging || 'Other';
          categoryStats.set(category, (categoryStats.get(category) || 0) + (item.lineTotal || 0));
        });
      });
      const productCategoryBreakdown = Array.from(categoryStats.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Tier Distribution
      const tierStats = new Map<string, { count: number; revenue: number }>();
      orders.forEach(order => {
        const orderTier = order.tier || 'Unknown';
        
        const existing = tierStats.get(orderTier) || { count: 0, revenue: 0 };
        tierStats.set(orderTier, {
          count: existing.count + 1,
          revenue: existing.revenue + order.totalAmount
        });
      });
      const tierDistribution = Array.from(tierStats.entries())
        .map(([tier, stats]) => ({ tier, ...stats }));

      // Daily Sales (last 30 days)
      const dailySalesMap = new Map<string, number>();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
      });

      last30Days.forEach(date => dailySalesMap.set(date, 0));

      orders.forEach(order => {
        const date = order.orderDate.toISOString().split('T')[0];
        if (dailySalesMap.has(date)) {
          dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + order.totalAmount);
        }
      });

      const dailySales = Array.from(dailySalesMap.entries())
        .map(([date, sales]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales
        }));

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        topProducts,
        topCustomers,
        revenueByMonth,
        productCategoryBreakdown,
        tierDistribution,
        dailySales
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };



  const generateGeminiAnalysis = async () => {
    setGeminiLoading(true);
    try {
      const prompt = `
        You are a business analyst for a fish import business. Analyze the following sales data and provide strategic insights.
        
        Data:
        - Total Revenue: £${analytics.totalRevenue}
        - Total Orders: ${analytics.totalOrders}
        - Average Order Value: £${analytics.averageOrderValue}
        - Top Products: ${analytics.topProducts.slice(0, 5).map(p => `${p.name} (${p.quantity}kg)`).join(', ')}
        - Top Customers: ${analytics.topCustomers.slice(0, 3).map(c => c.name).join(', ')}
        - Revenue Trend (Last 12 months): ${JSON.stringify(analytics.revenueByMonth)}
        
        Please provide:
        1. A concise summary of business performance (max 2 sentences).
        2. 3 Key trends observed (classify as positive, negative, or risk).
        3. 3 Actionable recommendations for growth.
        4. A JSON object for a custom chart that would visualize an interesting insight.
        
        Format the response as a JSON object with this structure:
        {
          "summary": "Concise summary text...",
          "trends": [
            { "title": "Trend Title", "description": "Short description", "type": "positive" | "negative" | "risk" }
          ],
          "recommendations": [
            { "title": "Action Title", "description": "Short actionable description" }
          ],
          "chartData": [ { "name": "Label", "value": 100 }, ... ],
          "chartType": "bar" | "pie" | "line",
          "chartTitle": "Title of the chart"
        }
        Only return the JSON object, no markdown code blocks.
      `;

      const result = await generateGeminiInsights(prompt);

      if (result.success && result.data) {
        setGeminiAnalysis({
          summary: result.data.summary,
          trends: result.data.trends,
          recommendations: result.data.recommendations,
          chartData: result.data.chartData,
          chartType: result.data.chartType,
          chartTitle: result.data.chartTitle
        });
        setIsGeminiMinimized(false); // Auto-expand when new data arrives
      } else {
        throw new Error(result.error || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Gemini analysis error:', error);
      alert('Failed to generate analysis. Please check your configuration.');
    } finally {
      setGeminiLoading(false);
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

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;
  const formatNumber = (num: number) => new Intl.NumberFormat('en-GB').format(num);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-ocean-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                  <p className="text-slate-600">Comprehensive business insights and metrics</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Time Range Selector */}
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
                  {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        timeRange === range
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : range.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>



          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading analytics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gemini AI Section */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">AI Business Intelligence</h2>
                        <p className="text-slate-300 text-sm">Powered by Gemini 1.5 Flash</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={generateGeminiAnalysis}
                        disabled={geminiLoading}
                        className="px-6 py-2 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {geminiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Insights
                          </>
                        )}
                      </button>
                      {geminiAnalysis && (
                        <button
                          onClick={() => setIsGeminiMinimized(!isGeminiMinimized)}
                          className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                          title={isGeminiMinimized ? "Expand" : "Minimize"}
                        >
                          {isGeminiMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {geminiAnalysis && !isGeminiMinimized && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
                      <div className="lg:col-span-2 space-y-6">
                        {/* Summary */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h3 className="text-lg font-semibold mb-3 text-blue-300 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Executive Summary
                          </h3>
                          <p className="text-slate-200 leading-relaxed text-lg">
                            {geminiAnalysis.summary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Trends */}
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold mb-4 text-purple-300 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              Key Trends
                            </h3>
                            <div className="space-y-4">
                              {geminiAnalysis.trends.map((trend, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                    trend.type === 'positive' ? 'bg-green-400' : 
                                    trend.type === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                                  }`} />
                                  <div>
                                    <h4 className="font-medium text-slate-200 text-sm">{trend.title}</h4>
                                    <p className="text-slate-400 text-xs mt-1">{trend.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold mb-4 text-emerald-300 flex items-center gap-2">
                              <Award className="w-5 h-5" />
                              Recommendations
                            </h3>
                            <div className="space-y-4">
                              {geminiAnalysis.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs font-bold">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-200 text-sm">{rec.title}</h4>
                                    <p className="text-slate-400 text-xs mt-1">{rec.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-1">
                        {geminiAnalysis.chartData && (
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10 h-full min-h-[300px]">
                            <h3 className="text-lg font-semibold mb-4 text-orange-300">
                              {geminiAnalysis.chartTitle || 'AI Projected Trend'}
                            </h3>
                            <div className="h-[250px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                {geminiAnalysis.chartType === 'pie' ? (
                                  <PieChart>
                                    <Pie
                                      data={geminiAnalysis.chartData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                    >
                                      {geminiAnalysis.chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Legend />
                                  </PieChart>
                                ) : (
                                  <BarChart data={geminiAnalysis.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                )}
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!geminiAnalysis && !geminiLoading && (
                    <div className="text-center py-8 text-slate-400 bg-white/5 rounded-xl border border-white/10 border-dashed">
                      <p>Click "Generate Insights" to analyze your sales data with AI.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-ocean-500 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 opacity-80" />
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold opacity-90 mb-1">Total Revenue</h3>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                </div>

                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingCart className="w-8 h-8 opacity-80" />
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold opacity-90 mb-1">Total Orders</h3>
                  <p className="text-3xl font-bold">{formatNumber(analytics.totalOrders)}</p>
                </div>

                <div className="bg-violet-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 opacity-80" />
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold opacity-90 mb-1">Active Customers</h3>
                  <p className="text-3xl font-bold">{formatNumber(analytics.totalCustomers)}</p>
                </div>

                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 opacity-80" />
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Percent className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold opacity-90 mb-1">Avg. Order Value</h3>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.averageOrderValue)}</p>
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Revenue Trend (Last 12 Months)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.revenueByMonth}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0EA5E9" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Daily Sales Trend */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Daily Sales (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={{ fill: '#8B5CF6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Fish className="w-5 h-5 text-green-600" />
                    Products by Revenue
                  </h3>
                  <div className="space-y-3">
                    {(showAllProducts ? analytics.topProducts : analytics.topProducts.slice(0, 5)).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-slate-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.preparation} • {product.packaging}</p>
                            <p className="text-sm text-slate-600">{product.quantity.toFixed(0)} kg sold</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))}
                  </div>
                  {analytics.topProducts.length > 5 && (
                    <button
                      onClick={() => setShowAllProducts(!showAllProducts)}
                      className="mt-4 w-full py-2 px-4 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllProducts ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          See More ({analytics.topProducts.length - 5} more)
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-pink-600" />
                    Customers by Revenue
                  </h3>
                  <div className="space-y-3">
                    {(showAllCustomers ? analytics.topCustomers : analytics.topCustomers.slice(0, 5)).map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-slate-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{customer.name}</p>
                            <p className="text-sm text-slate-600">{customer.orders} orders</p>
                          </div>
                        </div>
                        <p className="font-bold text-pink-600">{formatCurrency(customer.revenue)}</p>
                      </div>
                    ))}
                  </div>
                  {analytics.topCustomers.length > 5 && (
                    <button
                      onClick={() => setShowAllCustomers(!showAllCustomers)}
                      className="mt-4 w-full py-2 px-4 bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllCustomers ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          See More ({analytics.topCustomers.length - 5} more)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Packaging Type Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Revenue by Packaging Type
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.productCategoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.productCategoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Tier Distribution */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Revenue by Pricing Tier
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.tierDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="tier" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
