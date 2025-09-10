import { useEffect, useState, useCallback, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { formatDate } from '../utils';
import { transactionAPI, userAPI } from '../api';
import { SettingsContext } from '../context/SettingsContext';
import PrintDialog from '../components/PrintDialog';
import React from 'react';

const HistoryPage = () => {
  const { setSnackbar } = useOutletContext();
  const { settings } = useContext(SettingsContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ERROR_STATE, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState('daily');

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedCashierId, setSelectedCashierId] = useState('');

  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [transactionDataForPrint, setTransactionDataForPrint] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setCurrentUser(userData);
      if (userData.role === 'kasir') {
        setSelectedCashierId(userData.id);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
      const fetchUsers = async () => {
        try {
          const response = await userAPI.getAll();
          setUsers(response.data);
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message;
          setSnackbar({
            open: true,
            message: `Error fetching users: ${errorMessage}`,
            severity: 'error'
          });
        }
      };
      fetchUsers();
    }
  }, [currentUser, setSnackbar]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let params = { mode: filter };
    if (currentUser) {
      if (currentUser.role === 'kasir') {
        params.cashierId = currentUser.id;
      } else if (selectedCashierId) {
        params.cashierId = selectedCashierId;
      }
    }
    try {
      const response = await transactionAPI.getAll(params);
      setHistory(response.data.history || []);
      setChartData(response.data.chart || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: `Error: ${errorMessage}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filter, setSnackbar, currentUser, selectedCashierId]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [fetchData, currentUser]);

  const handlePrintReceipt = async (trx) => {
    try {
      const response = await transactionAPI.getById(trx.id);
      const detailedTrx = response.data;

      setTransactionDataForPrint({
        transactionId: detailedTrx.transaction_code,
        cashierName: detailedTrx.cashier_name || 'N/A',
        settings,
        cartItems: detailedTrx.items,
        totalBelanja: parseFloat(detailedTrx.subtotal) || 0,
        applied_discount_value: parseFloat(detailedTrx.applied_discount_value) || 0,
        pointsDiscount: parseFloat(detailedTrx.points_discount) || 0,
        finalTotal: parseFloat(detailedTrx.total) || 0,
        bayar: parseFloat(detailedTrx.bayar) || 0,
        kembalian: parseFloat(detailedTrx.kembalian) || 0,
        customerName: (typeof detailedTrx.customer === 'string' ? detailedTrx.customer : detailedTrx.customer?.name) || detailedTrx.customer_type || 'Guest',
        selectedCustomer: detailedTrx.customer,
        pointsEarned: detailedTrx.points_earned,
        updatedTotalPoints: detailedTrx.updatedTotalPoints,
        isCopy: true
      });

      setShowPrintDialog(true);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setSnackbar({
        open: true,
        message: `Gagal mengambil data cetak: ${errorMessage}`,
        severity: 'error'
      });
    }
  };

  // Summary Calculations
  const transactions = history.filter(item => item.record_type === 'transaction');
  const salesReturns = history.filter(item => item.record_type === 'sales_return');

  const totalSales = transactions.reduce((acc, trx) => acc + (parseFloat(trx.total) || 0), 0);
  const totalReturns = salesReturns.reduce((acc, ret) => acc + (parseFloat(ret.total_amount) || 0), 0);
  const netSales = totalSales - totalReturns;
  const transactionCount = transactions.length;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm dark:shadow-gray-700/50">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-2">Histori Transaksi</h1>
            <p className="text-gray-600 dark:text-[var(--text-muted)]">Lihat semua catatan transaksi dan retur penjualan.</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-lg p-1">
            {/* Filter by Date */}
            <button
              onClick={() => setFilter('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'daily'
                ? 'bg-white dark:bg-[var(--bg-secondary)] text-[var(--primary-color)] shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setFilter('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'monthly'
                ? 'bg-white dark:bg-[var(--bg-secondary)] text-[var(--primary-color)] shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setFilter('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'yearly'
                ? 'bg-white dark:bg-[var(--bg-secondary)] text-[var(--primary-color)] shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Yearly
            </button>

            {/* Filter by Cashier (only for Admin/Manager) */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <div className="relative">
                <select
                  value={selectedCashierId}
                  onChange={(e) => setSelectedCashierId(e.target.value)}
                  className="appearance-none px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Cashiers</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username} ({user.role})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Transaksi</h3>
            <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{transactionCount}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Penjualan Kotor</h3>
            <p className="text-2xl font-bold mt-1 text-green-700 dark:text-green-300">
              Rp {totalSales.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">Total Retur</h3>
            <p className="text-2xl font-bold mt-1 text-orange-700 dark:text-orange-300">
              Rp {totalReturns.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Penjualan Bersih</h3>
            <p className="text-2xl font-bold mt-1 text-purple-700 dark:text-purple-300">
              Rp {netSales.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)] p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">Sales Performance</h2>
          </div>

          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: filter === 'daily' ? 60 : 40 }}
                >
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'hsl(215 27.9% 26.9%)' : '#e5e7eb'} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickFormatter={(label) => {
                      if (filter === 'daily') return formatDate(label);
                      if (filter === 'monthly') {
                        const date = new Date(label);
                        return date.toLocaleString('id-ID', { month: 'short' });
                      }
                      if (typeof label === 'string' && label.match(/^\d{4}$/)) return label;
                      const date = new Date(label);
                      return isNaN(date) ? label : date.getFullYear().toString();
                    }}
                    tick={{
                      angle: filter === 'daily' ? -45 : 0,
                      textAnchor: filter === 'daily' ? 'end' : 'middle',
                      fontSize: 11,
                      fill: isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#6b7280'
                    }}
                    height={filter === 'daily' ? 70 : filter === 'monthly' ? 50 : 40}
                    axisLine={{ stroke: isDarkMode ? 'hsl(215 27.9% 26.9%)' : '#e5e7eb' }}
                    tickLine={{ stroke: isDarkMode ? 'hsl(215 27.9% 26.9%)' : '#e5e7eb' }}
                    interval={filter === 'yearly' ? Math.max(1, Math.floor(chartData.length / 10)) :
                      chartData.length > 10 ? Math.ceil(chartData.length / 10) : 0}
                  />
                  <YAxis
                    tickFormatter={(value) => `Rp ${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)}`}
                    stroke={isDarkMode ? 'hsl(215 27.9% 26.9%)' : '#e5e7eb'}
                    tick={{ fontSize: 11, fill: isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? 'hsl(215 28% 17%)' : 'rgba(255, 255, 255, 0.96)',
                      borderColor: isDarkMode ? 'hsl(215 27.9% 26.9%)' : '#e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: isDarkMode ? '#e2e8f0' : '#1f2937',
                    }}
                    formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total Sales']}
                    labelFormatter={(label) => {
                      if (filter === 'daily') return formatDate(label);
                      if (filter === 'monthly') {
                        const date = new Date(label);
                        return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                      }
                      return label;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--primary-color)"
                    name="Total Sales"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500 dark:text-[var(--text-muted)]">Tidak ada data untuk ditampilkan pada grafik.</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">Transaction Details</h2>
            <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
              {history.length} records found
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-[var(--border-default)]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
              <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type/Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cashier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                {history.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-gray-500 dark:text-[var(--text-muted)]">
                      Tidak ada riwayat transaksi
                    </td>
                  </tr>
                )}
                {history.map((item) => {
                  if (item.record_type === 'shift_close') {
                    return (
                      <tr key={`shift-${item.id}`} className="bg-gray-100 dark:bg-gray-800/50">
                        <td colSpan="7" className="px-4 py-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wider">
                          --- Shift ditutup oleh {item.cashier_name} pada {new Date(item.datetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} ---
                        </td>
                      </tr>
                    );
                  } else if (item.record_type === 'sales_return') {
                    return (
                      <tr key={`return-${item.id}`} className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-800 dark:text-red-200">
                          {formatDate(item.return_date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-300">
                          {item.return_time}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-800 dark:text-red-200">
                          <span className="font-semibold">[RETUR]</span> Trx #{item.transaction_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-800 dark:text-red-200">
                          -Rp {(parseFloat(item.total_amount) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-300">
                          {item.cashier_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 align-top">
                          <details className="cursor-pointer">
                            <summary className="hover:underline">View items</summary>
                            <ul className="mt-2 pl-4 space-y-1 text-gray-700 dark:text-gray-400">
                              {item.items?.map((itemDetail, i) => (
                                <li key={i} className="flex justify-between">
                                  <span>{itemDetail.name} × {itemDetail.qty}</span>
                                  <span>Rp {(parseFloat(itemDetail.price) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {/* No action button for returns for now */}
                        </td>
                      </tr>
                    );
                  } else {
                    // It's a transaction
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {item.jam}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--text-default)]">
                          {(typeof item.customer === 'string' ? item.customer : item.customer?.name) || item.customer_type || 'Guest'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-[var(--text-default)]">
                          Rp {(parseFloat(item.total) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {item.cashier_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 align-top">
                          <details className="cursor-pointer">
                            <summary className="hover:underline">View items</summary>
                            <ul className="mt-2 pl-4 space-y-1 text-gray-700 dark:text-gray-400">
                              {item.items?.map((itemDetail, i) => (
                                <li key={i} className="flex justify-between">
                                  <span>{itemDetail.name} × {itemDetail.qty}</span>
                                  <span>Rp {(parseFloat(itemDetail.price) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => handlePrintReceipt(item)}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-1 px-3 rounded-lg text-xs"
                          >
                            Cetak Struk
                          </button>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-[var(--bg-secondary)] border-t-2 border-gray-200 dark:border-[var(--border-default)] sticky bottom-0">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-sm font-medium text-right text-gray-700 dark:text-gray-200">
                    Total Penjualan Bersih:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-[var(--text-default)]">
                    Rp {netSales.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <PrintDialog
        show={showPrintDialog}
        onClose={() => {
          setShowPrintDialog(false);
          setTransactionDataForPrint(null); // Bersihkan data setelah ditutup
        }}
        {...transactionDataForPrint}
      />
    </>
  );
};

export default HistoryPage;
