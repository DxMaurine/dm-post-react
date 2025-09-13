import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { productAPI } from '../api';
import { FiPackage, FiClipboard, FiTrendingUp, FiTrendingDown, FiCheck, FiRefreshCw } from 'react-icons/fi';

const StockOpname = () => {
  const { setSnackbar } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [physicalStock, setPhysicalStock] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Gagal mengambil data produk.', 
        severity: 'error' 
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    const product = products.find(p => p.id == productId);
    if (product) {
      setPhysicalStock(product.stock);
    } else {
      setPhysicalStock('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || typeof physicalStock === 'undefined' || physicalStock < 0) {
      setSnackbar({ 
        open: true, 
        message: 'Harap pilih produk dan masukkan jumlah stok fisik yang valid.', 
        severity: 'warning' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await productAPI.adjustStock({
        product_id: selectedProduct,
        new_stock_quantity: Number(physicalStock),
        notes,
      });

      setSnackbar({ 
        open: true, 
        message: 'Stok opname berhasil dicatat!', 
        severity: 'success' 
      });
      setSelectedProduct('');
      setPhysicalStock('');
      setNotes('');
      fetchProducts();

    } catch (err) {
      console.error("Error submitting stock adjustment:", err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Terjadi kesalahan pada server.', 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductData = products.find(p => p.id == selectedProduct);
  const systemStock = selectedProductData?.stock || 0;
  const difference = physicalStock - systemStock;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-xl mr-4">
            <FiClipboard size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Stok Opname</h2>
            <p className="text-blue-100 dark:text-blue-200 mt-1">
              Penyesuaian stok fisik dengan sistem
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg border-2 border-gray-200 dark:border-[var(--border-default)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-3">
                Pilih Produk <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="text-gray-400 dark:text-[var(--text-muted)]" size={18} />
                </div>
                <select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 appearance-none bg-white dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-default)]"
                  disabled={loadingProducts}
                >
                  <option value="" disabled>Pilih Produk</option>
                  {loadingProducts ? (
                    <option>Memuat produk...</option>
                  ) : products.length === 0 ? (
                    <option>Tidak ada produk ditemukan.</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok Sistem: {p.stock || 0})
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-[var(--text-muted)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Physical Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-3">
                Jumlah Stok Fisik <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiTrendingUp className="text-gray-400 dark:text-[var(--text-muted)]" size={18} />
                </div>
                <input
                  type="number"
                  value={physicalStock}
                  onChange={(e) => setPhysicalStock(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[var(--border-default)] dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200"
                  placeholder="Masukkan jumlah stok fisik"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-3">
                Catatan
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <svg className="h-5 w-5 text-gray-400 dark:text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[var(--border-default)] dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 resize-none"
                  placeholder="Contoh: Stok rusak, stok hilang, dll."
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" size={18} />
                  Memproses...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" size={18} />
                  Simpan Stok Opname
                </>
              )}
            </button>
          </div>
        </form>

        {/* Current Stock Summary */}
        {selectedProduct && (
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[var(--bg-secondary)] dark:to-blue-900/10 rounded-xl border border-gray-200 dark:border-[var(--border-default)]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)] mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-blue-500" size={20} />
              Ringkasan Stok
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[var(--bg-default)] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-default)]">
                <div className="text-sm text-gray-500 dark:text-[var(--text-muted)] mb-2">Stok Sistem</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)]">
                  {systemStock}
                </div>
              </div>
              <div className="bg-white dark:bg-[var(--bg-default)] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-default)]">
                <div className="text-sm text-gray-500 dark:text-[var(--text-muted)] mb-2">Stok Fisik</div>
                <div className={`text-2xl font-bold ${
                  physicalStock > systemStock ? 'text-green-600 dark:text-green-700' : 
                  physicalStock < systemStock ? 'text-red-600 dark:text-red-600' : 'text-gray-800 dark:text-[var(--text-default)]'
                }`}>
                  {physicalStock || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-[var(--bg-default)] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-default)]">
                <div className="text-sm text-gray-500 dark:text-[var(--text-muted)] mb-2">Selisih</div>
                <div className={`text-2xl font-bold flex items-center ${
                  difference > 0 ? 'text-green-600 dark:text-green-700' : 
                  difference < 0 ? 'text-red-600 dark:text-red-600' : 'text-gray-800 dark:text-[var(--text-default)]'
                }`}>
                  {difference > 0 && <FiTrendingUp className="mr-1" />}
                  {difference < 0 && <FiTrendingDown className="mr-1" />}
                  {difference}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockOpname;