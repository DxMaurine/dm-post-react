import React from 'react';

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { productAPI } from '../api';




const PenerimaanBarang = () => {
  const { setSnackbar } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white dark:bg-[var(--bg-default)] rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-[var(--text-default)]">Penerimaan Barang</h2>
        <p className="text-gray-600 dark:text-[var(--text-muted)] mt-2">Formulir pencatatan barang masuk ke inventori</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">
              Produk <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2.5 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
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

          {/* Quantity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">
              Jumlah <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
              placeholder="Masukkan jumlah"
              min="1"
              disabled={isLoading}
            />
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">
              Supplier <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-4 py-2.5 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
              placeholder="Nama supplier"
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-gray-700 dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
              placeholder="Contoh: No. faktur, kondisi barang, dll."
              rows="3"
              disabled={isLoading}
            ></textarea>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              'Simpan Penerimaan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PenerimaanBarang;
