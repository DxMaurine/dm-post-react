import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NotificationPanel from '../components/NotificationPanel';
import SummaryCard from '../components/SummaryCard';
import { formatDate } from '../utils';
import { 
  productAPI, 
  transactionAPI, 
  salesReturnAPI, 
  purchaseReturnAPI 
} from '../api'; // Import all required API modules
import { LicenseStatusBadge, ActivationDialog } from '../components/activation';

const Dashboard = () => {
  const navigate = useNavigate();
  const { setSnackbar } = useOutletContext();
  const [dashboardData, setDashboardData] = useState({
    totalSalesToday: 0,
    topProduct: { name: 'N/A', sales: 0 },
    lowStockCount: 0,
    lowStockProducts: [],
    salesReturnCount: 0,
    weeklySales: [],
    recentTransactions: [],
    topProducts: [],
    salesTrend: 'up',
    salesPercentageChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [purchaseReturnNotifs, setPurchaseReturnNotifs] = useState([]);
  
  // Activation system states
  const [showActivationModal, setShowActivationModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use Promise.all with API modules
      const [
        productsRes, 
        transactionsRes, 
        returnsRes, 
        purchaseReturnsRes
      ] = await Promise.all([
        productAPI.getAll(),
        transactionAPI.getAll(),
        salesReturnAPI.getAll(),
        purchaseReturnAPI.getAll()
      ]);

      // Process data
      const productsData = productsRes.data;
      const transactionsData = (transactionsRes.data.history || []).filter(t => t.record_type !== 'shift_close');
      const returnsData = returnsRes.data;
      const purchaseReturnsData = purchaseReturnsRes.data;

      // Notifications for purchase returns
      const pendingReturns = purchaseReturnsData
        .filter(pr => pr.status === 'processed')
        .map(pr => ({
          id: pr.id,
          title: `Retur #${pr.return_number}`,
          message: `Status: ${pr.status}. Klik untuk melihat detail.`,
          date: pr.return_date,
          path: '/retur-pembelian'
        }));
      
      // Notifications for low stock
      const lowStockItems = productsData.filter(p => p.stock < 10);
      const lowStockNotifications = lowStockItems.map(p => ({
          id: `ls-${p.id}`,
          title: `Stok Menipis: ${p.name}`,
          message: `Stok tersisa: ${p.stock}. Segera lakukan pengadaan.`,
          date: new Date().toISOString(),
          path: '/data-barang'
      }));

      setPurchaseReturnNotifs([...pendingReturns, ...lowStockNotifications]);

      // Calculate metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const salesToday = transactionsData
        .filter(t => new Date(t.tanggal).setHours(0, 0, 0, 0) === today.getTime())
        .reduce((acc, t) => acc + t.total, 0);

      const productSales = {};
      transactionsData.forEach(t => {
        t.items.forEach(item => {
          productSales[item.name] = (productSales[item.name] || 0) + item.qty;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      const topProduct = topProducts.length > 0 ? topProducts[0] : { name: 'N/A', sales: 0 };

      const lowStockCount = lowStockItems.length;
      const lowStockProducts = lowStockItems.map(p => p.name);

      // Weekly sales data for chart
      const weeklySales = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const sales = transactionsData
          .filter(t => new Date(t.tanggal).setHours(0, 0, 0, 0) === date.getTime())
          .reduce((acc, t) => acc + t.total, 0);
          
        return {
          date: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          sales,
          fullDate: date
        };
      }).reverse();

      // Calculate sales trend vs yesterday
      let salesTrend = 'up';
      let salesPercentageChange = 0;
      if (weeklySales.length >= 2) {
        const todaySales = weeklySales[6].sales;
        const yesterdaySales = weeklySales[5].sales;

        if (yesterdaySales > 0) {
          salesPercentageChange = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
        } else if (todaySales > 0) {
          salesPercentageChange = 100;
        }

        salesTrend = todaySales >= yesterdaySales ? 'up' : 'down';
      }

     const recentTransactions = transactionsData
      .slice(-5)
      .map(t => ({
        id: t.id,
        date: t.tanggal, // Simpan original date value
        total: t.total,
        items: t.items.length,
        paymentMethod: t.payment_method || 'Cash'
      }));

      setDashboardData({
        totalSalesToday: salesToday,
        topProduct,
        lowStockCount,
        lowStockProducts,
        salesReturnCount: returnsData.length,
        weeklySales,
        recentTransactions,
        topProducts,
        salesTrend,
        salesPercentageChange,
      });

    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSnackbar({ 
        open: true, 
        message: `Error fetching dashboard data: ${err.response?.data?.message || err.message}`, 
        severity: 'error' 
      });
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl shadow-md">
      {/* Header */}
      <header className="bg-white dark:bg-[var(--bg-secondary)] shadow-sm rounded-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-[var(--text-default)]">Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* License Status Badge */}
            <LicenseStatusBadge onActivationClick={() => setShowActivationModal(true)} />
            
            <div className="text-sm bg-blue-50 dark:bg-[var(--bg-default)] dark:text-[var(--text-default)] text-blue-600 px-3 py-1 rounded-full font-medium flex items-center gap-2">
              <span>
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              <span className="border-l border-blue-200 pl-2">
                {new Date().toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            <div className="relative">
              <NotificationPanel
                onClose={() => setIsNotificationOpen(true)}
                notifications={purchaseReturnNotifs}
                isOpen={isNotificationOpen} 
                
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? ' dark:text-green-600 text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'sales' ? 'dark:text-blue text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'inventory' ? 'dark:text-yellow text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Inventory
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Today's Sales"
            value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(dashboardData.totalSalesToday)}
            icon="currency"
            color="blue"
            trend={dashboardData.salesTrend}
            percentage={`${Math.abs(dashboardData.salesPercentageChange).toFixed(0)}%`}
          />
          <SummaryCard 
            title="Top Product"
            value={dashboardData.topProduct.name}
            subtitle={`${dashboardData.topProduct.sales} sold`}
            icon="star"
            color="green"
          />
          <SummaryCard 
            title="Low Stock"
            value={`${dashboardData.lowStockCount} items`}
            subtitle={dashboardData.lowStockProducts.length > 0 ? dashboardData.lowStockProducts.slice(0, 2).join(', ') + (dashboardData.lowStockProducts.length > 2 ? '...' : '') : 'All stock is sufficient'}
            icon="warning"
            color="orange"
          />
          <SummaryCard 
            title="Returns"
            value={`${dashboardData.salesReturnCount} transactions`}
            icon="return"
            color="red"
          />
        </div>

        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-md lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-muted)]">Top 5 Best Selling Products</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-50 dark:bg-slate-500 dark:text-white text-blue-600 rounded-full">This Week</button>
                <button className="px-3 py-1 text-xs bg-gray-50 dark:bg-slate-500 dark:text-white text-gray-600 rounded-full">Last Week</button>
              </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart margin={{ right: 100 }}>
                  <Pie dataKey="sales" nameKey="name" data={dashboardData.topProducts} innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                    {dashboardData.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Recent Transactions</h2>
              <button onClick={() => navigate('/history')} className="text-sm font-medium transition text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] dark:text-[var(--primary-color)] dark:hover:text-[var(--primary-color-hover)]">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-50 dark:bg-slate-700 dark:text-white text-blue-700">
                    <th className="px-4 py-2 text-left font-semibold">ID</th>
                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Payment</th>
                    <th className="px-4 py-2 text-right font-semibold">Total</th>
                    <th className="px-4 py-2 text-right font-semibold">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-[var(--primary-color-hover)]">
                      <td className="px-4 py-2 font-medium text-gray-800 dark:text-[var(--text-muted)]">#{transaction.id}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-[var(--text-muted)]">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-[var(--text-muted)]">{transaction.paymentMethod}</td>
                      <td className="px-4 py-2 text-right text-gray-800 dark:text-[var(--text-muted)] font-semibold">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(transaction.total)}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600 dark:text-[var(--text-muted)]">{transaction.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      {/* Activation Dialog */}
      <ActivationDialog 
        open={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        required={false}
        onActivated={() => {
          setShowActivationModal(false);
          setSnackbar({
            open: true,
            message: '🎉 Aktivasi berhasil! Aplikasi sekarang unlimited.',
            severity: 'success'
          });
        }}
      />
    </div>
  );
};



// Enhanced Bar Chart Component
const EnhancedBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.sales), 10) || 1;
  const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200', 'bg-blue-100'];

  return (
    <div className="h-full">
      <div className="flex items-end h-48 space-x-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <div 
                className={`w-3/4 ${colors[index]} rounded-t hover:opacity-90 transition`}
                style={{ height: `${(item.sales / maxValue) * 100}%` }}
              ></div>
              <p className="text-xs text-gray-500 mt-2">{item.date}</p>
              <p className="text-xs font-medium text-gray-700 mt-1">
                {item.sales > 0 ? 
                  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.sales) 
                  : '-'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transaction Item Component
const TransactionItem = ({ transaction }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer">
      <div className="flex items-center">
        <div className="p-2 bg-blue-50 rounded-lg mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-800">#{transaction.id}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span>{transaction.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="mx-1">•</span>
            <span>{transaction.paymentMethod}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-800">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(transaction.total)}
        </p>
        <p className="text-xs text-gray-500">{transaction.items} items</p>
      </div>
    </div>
  );
};



export default Dashboard;