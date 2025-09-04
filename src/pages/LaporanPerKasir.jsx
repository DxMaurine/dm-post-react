import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { reportAPI } from '../api'; // Pastikan path sesuai
import React from 'react';

const formatRupiah = (amount) => {
  return 'Rp' + amount.toLocaleString('id-ID');
};

const LaporanPerKasir = () => {
  const { setSnackbar } = useOutletContext();
  const [salesByCashier, setSalesByCashier] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesByCashier = async () => {
      setLoading(true);
      try {
        const response = await reportAPI.getSalesByCashier();
        setSalesByCashier(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesByCashier();
  }, [setSnackbar]);

  // Function to get performance color based on sales
  const getPerformanceColor = (sales) => {
    if (sales > 10000000) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    if (sales > 5000000) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white dark:bg-[var(--bg-default)] rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Laporan Penjualan per Kasir</h2>
          <p className="text-gray-500 dark:text-[var(--text-muted)] mt-2">Ringkasan performa penjualan masing-masing kasir</p>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && salesByCashier.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Kasir Aktif</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300 mt-1">
              {salesByCashier.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 p-4 rounded-xl">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">Total Penjualan</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-300 mt-1">
              {formatRupiah(salesByCashier.reduce((sum, cashier) => sum + parseFloat(cashier.total_sales), 0))}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 p-4 rounded-xl">
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Transaksi</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-300 mt-1">
              {salesByCashier.reduce((sum, cashier) => sum + cashier.total_transactions, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Cashier Table */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
          <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Kasir</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Penjualan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaksi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-xl">Rata-rata</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                  </div>
                </td>
              </tr>
            ) : salesByCashier.length > 0 ? (
              salesByCashier.map((cashier, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                        {cashier.cashier_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">{cashier.cashier_name}</div>
                        <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">ID: {cashier.cashier_id || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`px-3 py-1 inline-flex text-sm font-semibold rounded-md ${getPerformanceColor(parseFloat(cashier.total_sales))}`}>
                      {formatRupiah(Math.round(cashier.total_sales))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-[var(--text-default)]">
                    {cashier.total_transactions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">
                    {cashier.total_transactions > 0 ? formatRupiah(Math.round(cashier.total_sales / cashier.total_transactions)) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-[var(--text-muted)]">
                  Tidak ada data penjualan per kasir yang tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Performance Legend */}
      {!loading && salesByCashier.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center text-xs text-gray-500 dark:text-[var(--text-muted)]">
          <span className="mr-4 mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/50 mr-2"></span>
            Penjualan = Rp 10.000.000
          </span>
          <span className="mr-4 mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-2"></span>
            Penjualan = Rp 5.000.000
          </span>
          <span className="mr-4 mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-700/50 mr-2"></span>
            Penjualan lainnya
          </span>
        </div>
      )}
    </div>
  );
};

export default LaporanPerKasir;