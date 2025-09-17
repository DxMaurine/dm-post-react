import { useEffect, useState, useCallback, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { formatDate } from '../utils';
import { transactionAPI, userAPI } from '../api';
import { SettingsContext } from '../context/SettingsContext';
import PrintDialog from '../components/PrintDialog';
import {FiFileText,FiArrowDown,FiArrowUp, FiDollarSign} from 'react-icons/fi';
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-[var(--bg-primary)]/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm shadow-lg rounded-lg border border-[var(--border-default)]">
          <p className="label text-sm text-[var(--text-default)]">{formatDate(label)}</p>
          <p className="intro text-lg font-bold text-[var(--primary-color)]">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const SummaryCard = ({ icon, title, value, colorClass }) => (
    <div className={`bg-[var(--bg-secondary)] p-4 rounded-xl shadow-md border-l-4 ${colorClass}`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg mr-4 bg-opacity-20 ${colorClass.replace('border', 'bg').replace('-500', '-500/10')}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-[var(--text-default)]">{title}</h3>
          <p className="text-xl font-bold mt-1 text-[var(--text-default)]">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 bg-[var(--bg-primary)] rounded-xl shadow-lg">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-default)] mb-2">Histori Transaksi</h1>
            <p className="text-[var(--text-default)]">Lihat semua catatan transaksi dan retur penjualan.</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 bg-[var(--bg-tertiary)] rounded-lg p-1">
            {/* Filter by Date */}
            <button
              onClick={() => setFilter('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'daily'
                ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow'
                : 'text-[var(--text-default)] hover:bg-[var(--bg-primary)]'}`}
            >
              Harian
            </button>
            <button
              onClick={() => setFilter('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'monthly'
                ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow'
                : 'text-[var(--text-default)] hover:bg-[var(--bg-primary)]'}`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setFilter('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'yearly'
                ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow'
                : 'text-[var(--text-default)] hover:bg-[var(--bg-primary)]'}`}
            >
              Tahunan
            </button>

            {/* Filter by Cashier (only for Admin/Manager) */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <div className="relative">
                <select
                  value={selectedCashierId}
                  onChange={(e) => setSelectedCashierId(e.target.value)}
                  className="appearance-none w-full md:w-auto px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-default)] text-[var(--text-default)] border border-[var(--border-default)] focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                >
                  <option value="">Semua Kasir</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username} ({user.role})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            icon={<FiFileText className="text-slate-500 dark:text-[var(--text-default)]" />} 
            title="Total Transaksi" 
            value={transactionCount} 
            colorClass="border-slate-500" 
          />
          <SummaryCard 
            icon={<FiArrowUp className="text-green-500 dark:text-[var(--text-default)]" />} 
            title="Penjualan Kotor" 
            value={`Rp ${totalSales.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`} 
            colorClass="border-green-500" 
          />
          <SummaryCard 
            icon={<FiArrowDown className="text-red-500" />} 
            title="Total Retur" 
            value={`Rp ${totalReturns.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`} 
            colorClass="border-red-500" 
          />
          <SummaryCard 
            icon={<FiDollarSign className="text-[var(--text-default)]" />} 
            title="Penjualan Bersih" 
            value={`Rp ${netSales.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`} 
            colorClass="border-[var(--primary-color)]" 
          />
        </div>

        {/* Chart Section */}
        <div className="bg-[var(--bg-primary)] rounded-xl shadow-sm border-2 border-[var(--border-default)] p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-default)]">Performa Penjualan</h2>
          </div>

          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: filter === 'daily' ? 60 : 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
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
                    tick={{ angle: filter === 'daily' ? -45 : 0, textAnchor: filter === 'daily' ? 'end' : 'middle', fontSize: 11, fill: 'var(--text-default)' }}
                    height={filter === 'daily' ? 70 : filter === 'monthly' ? 50 : 40}
                    axisLine={{ stroke: 'var(--border-default)' }}
                    tickLine={{ stroke: 'var(--border-default)' }}
                    interval={filter === 'yearly' ? Math.max(1, Math.floor(chartData.length / 10)) : chartData.length > 10 ? Math.ceil(chartData.length / 10) : 0}
                  />
                  <YAxis
                    tickFormatter={(value) => `Rp ${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)}`}
                    stroke="var(--border-default)"
                    tick={{ fontSize: 11, fill: 'var(--text-default)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-default)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', color: 'var(--text-default)' }}/>
                  <Bar dataKey="total" fill="var(--primary-color)" name="Total Sales" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-[var(--text-default)]">Tidak ada data untuk ditampilkan pada grafik.</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-[var(--bg-primary)] rounded-xl shadow-sm border-2 border-[var(--border-default)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-default)]">Detail Transaksi</h2>
            <div className="text-sm text-[var(--text-default)]">{history.length} data ditemukan</div>
          </div>

          <div className="overflow-auto rounded-lg border border-[var(--border-default)]">
            <table className="min-w-full divide-y divide-[var(--border-default)]">
              <thead className="bg-[var(--bg-default)] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-default)] uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-default)] uppercase tracking-wider">Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-default)] uppercase tracking-wider">Tipe/Pelanggan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-default)] uppercase tracking-wider">Jumlah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-default)] uppercase tracking-wider">Kasir</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-default)] uppercase tracking-wider">Detail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-default)] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-primary)] divide-y divide-[var(--border-default)]">
                {history.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-[var(--text-default)]">Tidak ada riwayat transaksi</td>
                  </tr>
                )}
                {history.map((item) => {
                  if (item.record_type === 'shift_close') {
                    return (
                      <tr key={`shift-${item.id}`} className="bg-indigo-500/10">
                        <td colSpan="7" className="px-4 py-2 text-center text-sm font-semibold text-amber-700 dark:text-[var(--text-default)] tracking-wider">
                          --- Shift ditutup oleh {item.cashier_name} pada {new Date(item.datetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} ---
                        </td>
                      </tr>
                    );
                  } else if (item.record_type === 'sales_return') {
                    const isCancelled = item.status === 'CANCELLED';
                    return (
                      <tr key={`return-${item.id}`} className={`${isCancelled ? 'bg-gray-500/10 opacity-60' : 'bg-red-500/10'} hover:bg-red-500/20 transition-colors`}>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${isCancelled ? 'text-gray-500 line-through' : 'text-red-500'}`}>{formatDate(item.return_date)}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isCancelled ? 'text-gray-500 line-through' : 'text-red-500/80'}`}>{item.return_time}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isCancelled ? 'text-gray-500 line-through' : 'text-red-500'}`}>
                          <span className="font-semibold">[RETUR]</span> Trx #{item.transaction_id}
                          {isCancelled && <span className="ml-2 text-xs font-bold text-gray-500 py-0.5 px-2 rounded-full bg-gray-200">DIBATALKAN</span>}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${isCancelled ? 'text-gray-500 line-through' : 'text-red-500'}`}>-Rp {(parseFloat(item.total_amount) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isCancelled ? 'text-gray-500 line-through' : 'text-red-500/80'}`}>{item.cashier_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-[var(--text-default)] align-top">
                          {isCancelled ? (
                            <div>
                              <p className="font-semibold text-gray-600">Alasan Batal:</p>
                              <p className="text-xs">{item.cancellation_reason}</p>
                            </div>
                          ) : (
                            <details className="cursor-pointer">
                              <summary className="hover:underline text-[var(--primary-color)]">Lihat item</summary>
                              <ul className="mt-2 pl-4 space-y-1">
                                {item.items?.map((itemDetail, i) => (
                                  <li key={i} className="flex justify-between text-xs">
                                    <span>{itemDetail.name} × {itemDetail.qty}</span>
                                    <span>Rp {(parseFloat(itemDetail.price) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"></td>
                      </tr>
                    );
                  } else {
                    // It's a transaction
                    return (
                      <tr key={item.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--text-default)]">{formatDate(item.tanggal)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--text-default)]">{item.jam}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--text-default)]">{(typeof item.customer === 'string' ? item.customer : item.customer?.name) || item.customer_type || 'Guest'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-[var(--text-default)]">Rp {(parseFloat(item.total) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--text-default)]">{item.cashier_name || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--primary-color)] align-top">
                          <details className="cursor-pointer">
                            <summary className="hover:underline">Lihat item</summary>
                            <ul className="mt-2 pl-4 space-y-1 text-[var(--text-default)]">
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
                            className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/20 font-semibold py-1 px-3 rounded-lg text-xs transition-colors"
                          >
                            Cetak Struk
                          </button>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
              <tfoot className="bg-[var(--bg-tertiary)] border-t-2 border-[var(--border-default)] sticky bottom-0">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-sm font-medium text-right text-[var(--text-default)]">
                    Total Penjualan Bersih:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-[var(--text-default)]">
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