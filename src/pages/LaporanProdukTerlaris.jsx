import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { reportAPI } from '../api'; // Pastikan path sesuai
import React from 'react';

const cardStyles = [
  { bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/20', title: 'text-yellow-800 dark:text-yellow-200', value: 'text-yellow-600 dark:text-yellow-300', subtitle: 'text-yellow-700 dark:text-yellow-400' },
  { bg: 'bg-gray-50 dark:bg-gray-500/10', border: 'border-gray-200 dark:border-gray-500/20', title: 'text-gray-800 dark:text-gray-200', value: 'text-gray-600 dark:text-gray-300', subtitle: 'text-gray-700 dark:text-gray-400' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', title: 'text-amber-800 dark:text-amber-200', value: 'text-amber-600 dark:text-amber-300', subtitle: 'text-amber-700 dark:text-amber-400' },
  { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/20', title: 'text-green-800 dark:text-green-200', value: 'text-green-600 dark:text-green-300', subtitle: 'text-green-700 dark:text-green-400' },
  { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', title: 'text-blue-800 dark:text-blue-200', value: 'text-blue-600 dark:text-blue-300', subtitle: 'text-blue-700 dark:text-blue-400' },
];

const LaporanProdukTerlaris = () => {
  const { setSnackbar } = useOutletContext();
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      setLoading(true);
      try {
        const response = await reportAPI.getBestSelling();
        setTopSellingProducts(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Error fetching top selling products:", errorMessage);
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, [setSnackbar]);

  // Function to get rank badge color
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 2: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
      case 3: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white dark:bg-[var(--bg-default)] rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Laporan Produk Terlaris</h2>
          <p className="text-gray-500 dark:text-[var(--text-muted)]">Daftar produk dengan penjualan tertinggi</p>
        </div>
      </div>

      {/* Top 5 Products Summary Cards */}
      {!loading && topSellingProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {topSellingProducts.slice(0, 5).map((product, index) => {
            const style = cardStyles[index] || cardStyles[4]; // Fallback for safety
            return (
              <div key={`card-${product.id || index}`} className={`${style.bg} p-4 rounded-xl border ${style.border} flex flex-col`}>
                <div className={`text-sm font-medium ${style.title}`}>Peringkat #{index + 1}</div>
                <div className={`text-lg font-bold ${style.value} mt-1 truncate flex-grow`} title={product.name}>
                  {product.name || '-'}
                </div>
                <div className={`text-sm ${style.subtitle} mt-2`}>
                  {product.total_quantity_sold || 0} unit terjual
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
          <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Peringkat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produk</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-xl">Jumlah Terjual</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="ml-4 w-full">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : topSellingProducts.length > 0 ? (
              topSellingProducts.map((product, index) => (
                <tr key={product.id || `product-${index}`} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRankColor(index + 1)}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">SKU: {product.sku || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{product.total_quantity_sold}</div>
                    <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">unit terjual</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada data produk terlaris yang tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanProdukTerlaris;