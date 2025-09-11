import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { reportAPI } from '../api';
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

  const getPerformanceClass = (sales) => {
    if (sales > 10000000) return 'high';
    if (sales > 5000000) return 'medium';
    return 'low';
  };

  const performanceClasses = {
    high: 'bg-[var(--success-color)]/10 text-[var(--success-color)]',
    medium: 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]',
    low: 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
  };

  const legendClasses = {
    high: 'bg-[var(--success-color)]/20',
    medium: 'bg-[var(--primary-color)]/20',
    low: 'bg-[var(--bg-tertiary)]',
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-[var(--bg-primary)] rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-default)]">Laporan Penjualan per Kasir</h2>
          <p className="text-[var(--text-muted)] mt-2">Ringkasan performa penjualan masing-masing kasir</p>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && salesByCashier.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-default)] p-4 rounded-xl">
            <div className="text-sm font-medium text-[var(--text-muted)]">Total Kasir Aktif</div>
            <div className="text-2xl font-bold text-[var(--text-default)] mt-1">
              {salesByCashier.length}
            </div>
          </div>
          <div className="bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 p-4 rounded-xl">
            <div className="text-sm font-medium text-[var(--primary-color)]/80">Total Penjualan</div>
            <div className="text-2xl font-bold text-[var(--primary-color)] mt-1">
              {formatRupiah(salesByCashier.reduce((sum, cashier) => sum + parseFloat(cashier.total_sales), 0))}
            </div>
          </div>
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-default)] p-4 rounded-xl">
            <div className="text-sm font-medium text-[var(--text-muted)]">Total Transaksi</div>
            <div className="text-2xl font-bold text-[var(--text-default)] mt-1">
              {salesByCashier.reduce((sum, cashier) => sum + cashier.total_transactions, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Cashier Table */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-[var(--border-default)]">
        <table className="min-w-full divide-y divide-[var(--border-default)]">
          <thead className="bg-[var(--bg-tertiary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider rounded-tl-xl">Kasir</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total Penjualan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Transaksi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider rounded-tr-xl">Rata-rata</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-primary)] divide-y divide-[var(--border-default)]">
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
                <tr key={index} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] font-bold">
                        {cashier.cashier_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[var(--text-default)]">{cashier.cashier_name}</div>
                        <div className="text-sm text-[var(--text-muted)]">ID: {cashier.cashier_id || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`px-3 py-1 inline-flex text-sm font-semibold rounded-md ${performanceClasses[getPerformanceClass(parseFloat(cashier.total_sales))]}`}>
                      {formatRupiah(Math.round(cashier.total_sales))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[var(--text-default)]">
                    {cashier.total_transactions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-[var(--success-color)]">
                    {cashier.total_transactions > 0 ? formatRupiah(Math.round(cashier.total_sales / cashier.total_transactions)) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-[var(--text-muted)]">
                  Tidak ada data penjualan per kasir yang tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Performance Legend */}
      {!loading && salesByCashier.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center text-xs text-[var(--text-muted)]">
          <span className="mr-4 mb-2 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${legendClasses.high}`}></span>
            Penjualan &gt; 10jt
          </span>
          <span className="mr-4 mb-2 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${legendClasses.medium}`}></span>
            Penjualan &gt; 5jt
          </span>
          <span className="mr-4 mb-2 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${legendClasses.low}`}></span>
            Penjualan Lainnya
          </span>
        </div>
      )}
    </div>
  );
};

export default LaporanPerKasir;