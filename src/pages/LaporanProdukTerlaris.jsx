import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { reportAPI } from '../api';
import React from 'react';

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

  const getRankClasses = (rank) => {
    if (rank === 1) return 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]';
    if (rank === 2 || rank === 3) return 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]/80';
    return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-[var(--bg-primary)] rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-default)]">Laporan Produk Terlaris</h2>
          <p className="text-[var(--text-muted)]">Daftar produk dengan penjualan tertinggi</p>
        </div>
      </div>

      {/* Top 5 Products Summary Cards */}
      {!loading && topSellingProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {topSellingProducts.slice(0, 5).map((product, index) => (
            <div key={`card-${product.id || index}`} 
                 className={`p-4 rounded-xl border-2 flex flex-col ${getRankClasses(index + 1).replace('text-', 'border-')}`}>
              <div className="text-sm font-medium dark:text-white opacity-80">Peringkat #{index + 1}</div>
              <div className="text-lg font-bold dark:text-white mt-1 truncate flex-grow" title={product.name}>
                {product.name || '-'}
              </div>
              <div className="text-sm  dark:text-white opacity-90 mt-2">
                {product.total_quantity_sold || 0} unit terjual
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl shadow-sm border border-[var(--border-default)]">
        <table className="min-w-full divide-y divide-[var(--border-default)]">
          <thead className="bg-[var(--bg-tertiary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider rounded-tl-xl">Peringkat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Produk</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider rounded-tr-xl">Jumlah Terjual</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-primary)] divide-y divide-[var(--border-default)]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 w-12 bg-[var(--bg-default)] rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-[var(--bg-tertiary)] animate-pulse"></div>
                      <div className="ml-4 w-full">
                        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse mb-2"></div>
                        <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-6 w-20 bg-[var(--bg-tertiary)] rounded animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : topSellingProducts.length > 0 ? (
              topSellingProducts.map((product, index) => (
                <tr key={product.id || `product-${index}`} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRankClasses(index + 1)}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] font-bold">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[var(--text-default)]">{product.name}</div>
                        <div className="text-sm text-[var(--text-muted)]">SKU: {product.sku || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-lg font-bold text-[var(--text-default)]">{product.total_quantity_sold}</div>
                    <div className="text-sm text-[var(--text-muted)]">unit terjual</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-[var(--text-muted)]">
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