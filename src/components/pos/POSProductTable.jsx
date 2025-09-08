import React from 'react';
import { FiPlus, FiPackage, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const POSProductTable = ({ products, loading, error, onAddToCart }) => {
  
  const getStockStatus = (stock) => {
    if (stock <= 1) return { color: 'red', text: 'Stok Habis' };
    if (stock <= 5) return { color: 'yellow', text: 'Stok Terbatas' };
    return { color: 'green', text: 'Stok Tersedia' };
  };

  const getStockIcon = (stock) => {
    if (stock <= 1) return <FiAlertTriangle className="text-red-500 dark:text-red-400" size={16} />;
    if (stock <= 5) return <FiAlertTriangle className="text-yellow-500 dark:text-yellow-400" size={16} />;
    return <FiCheckCircle className="text-green-500 dark:text-green-400" size={16} />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--card-bg-dark)] rounded-xl shadow-md border border-gray-200 dark:border-[var(--border-default)] p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-[var(--primary-color)] mb-4"></div>
          <p className="text-blue-600 dark:text-[var(--primary-color)] font-medium">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[var(--card-bg-dark)] rounded-xl shadow-md border border-gray-200 dark:border-[var(--border-default)] p-6 text-center">
        <div className="flex flex-col items-center justify-center text-red-500 dark:text-red-400">
          <FiAlertTriangle size={32} className="mb-3" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-white dark:bg-[var(--card-bg-dark)] rounded-xl shadow-lg border border-gray-200 dark:border-[var(--border-default)] overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-blue-700 to-green-900 dark:bg-[var(--primary-color)] text-white px-4 py-3">
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-lg mr-3">
            <FiPackage size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Daftar Produk</h3>
            <p className="text-blue-100 dark:text-blue-200 text-sm">
              {products.length} produk tersedia
            </p>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className=" overflow-x-auto max-h-[50vh]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-pink-700 to-blue-600 dark:bg-[var(--primary-color)] text-white px-4 py-3">
              <th className="px-4 py-3 text-left font-semibold text-sm">Kode</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Nama Produk</th>
              <th className="px-4 py-3 text-right font-semibold text-sm">Harga</th>
              <th className="px-4 py-3 text-center font-semibold text-sm">Stok</th>
              <th className="px-4 py-3 text-center font-semibold text-sm">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[var(--border-default)] dark:bg-[var(--bg-default)] ">
            {products.length > 0 ? (
              products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr 
                    key={product.id} 
                    className="hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)] transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-600 dark:text-[var(--text-muted)] bg-gray-100 dark:bg-[var(--bg-secondary)] px-2 py-1 rounded-md text-xs">
                        {product.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-[var(--text-default)]">
                        {product.name}
                      </div>
                      {product.category && (
                        <div className="text-xs text-gray-500 dark:text-[var(--text-muted)] mt-1">
                          {product.category}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-lg font-bold text-gray-800 dark:text-[var(--text-default)]">
                        Rp {product.price?.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Dot Indicator */}
                        <div className={`w-3 h-3 rounded-full ${
                          stockStatus.color === 'red' ? 'bg-red-500' :
                          stockStatus.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div className="font-bold text-gray-800 dark:text-[var(--text-default)] text-lg">
                          {product.stock}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[var(--text-muted)] mt-1">
                        {stockStatus.text}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                          product.stock <= 0
                            ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 dark:bg-[var(--primary-color)] text-white hover:from-blue-600 hover:to-indigo-700 dark:hover:bg-[var(--primary-color-hover)]'
                        }`}
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock <= 0}
                        title={product.stock <= 0 ? 'Stok habis' : 'Tambah ke keranjang'}
                      >
                        <FiPlus size={16} />
                        <span>Tambah</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-[var(--text-muted)]">
                    <FiPackage size={48} className="mb-3 opacity-50" />
                    <p className="text-lg font-medium">Tidak ada produk yang ditemukan</p>
                    <p className="text-sm">Coba gunakan kata kunci pencarian yang berbeda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] px-4 py-3 border-t border-gray-200 dark:border-[var(--border-default)]">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-[var(--text-muted)]">
            Menampilkan {products.length} produk
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-[var(--text-muted)]">Stok Tersedia</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-[var(--text-muted)]">Stok Terbatas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-[var(--text-muted)]">Stok Habis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSProductTable;