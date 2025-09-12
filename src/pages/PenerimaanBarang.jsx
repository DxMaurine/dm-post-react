import React from 'react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { productAPI } from '../api';
import { FiPackage, FiTruck, FiPlus, FiRefreshCw, FiCheck } from 'react-icons/fi';

const PenerimaanBarang = () => {
  const { setSnackbar } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productAPI.getAll();
        setProducts(response.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Gagal memuat data produk',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [setSnackbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !quantity || !supplier) {
      setSnackbar({
        open: true,
        message: 'Harap isi semua kolom yang wajib diisi.',
        severity: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await productAPI.receiveStock({
        product_id: selectedProduct,
        quantity: parseInt(quantity, 10),
        supplier,
        notes,
      });

      setSnackbar({
        open: true,
        message: 'Penerimaan barang berhasil dicatat!',
        severity: 'success',
      });

      // Reset form
      setSelectedProduct('');
      setQuantity('');
      setSupplier('');
      setNotes('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Terjadi kesalahan pada server.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-xl mr-4">
            <FiTruck size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Penerimaan Barang</h2>
            <p className="text-green-100 dark:text-green-200 mt-1">
              Formulir pencatatan barang masuk ke inventori
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-gray-200 dark:border-[var(--border-default)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">
                Produk <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="text-gray-400 dark:text-[var(--text-muted)]" size={18} />
                </div>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 pl-10 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
                  disabled={isLoading}
                >
                  <option value="" disabled>Pilih Produk</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">
                Jumlah <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPlus className="text-gray-400 dark:text-[var(--text-muted)]" size={18} />
                </div>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 pl-10 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
                  placeholder="Masukkan jumlah"
                  min="1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Supplier */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">
                Supplier <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiTruck className="text-gray-400 dark:text-[var(--text-muted)]" size={18} />
                </div>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-4 py-3 pl-10 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
                  placeholder="Nama supplier"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Catatan</label>
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <svg className="h-5 w-5 text-gray-400 dark:text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 pl-10 text-gray-700 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200 resize-none"
                  placeholder="Contoh: No. faktur, kondisi barang, dll."
                  rows="3"
                  disabled={isLoading}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800 hover:from-green-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" size={18} />
                  Memproses...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" size={18} />
                  Simpan Penerimaan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PenerimaanBarang;