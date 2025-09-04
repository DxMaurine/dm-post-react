import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { productAPI } from '../api';




const StockOpname = () => {
  const { setSnackbar } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [physicalStock, setPhysicalStock] = useState('');
  const [notes, setNotes] = useState('');

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
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 mx-auto bg-white dark:bg-[var(--bg-default)] rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Stok Opname</h2>
        <p className="text-gray-500 dark:text-[var(--text-muted)]">Penyesuaian stok fisik dengan sistem</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-2">Pilih Produk *</label>
            <div className="relative">
              <select
                value={selectedProduct}
                onChange={handleProductChange}
                className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 appearance-none bg-white dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-default)]"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-2">Jumlah Stok Fisik *</label>
            <input
              type="number"
              value={physicalStock}
              onChange={(e) => setPhysicalStock(e.target.value)}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200"
              placeholder="Masukkan jumlah stok fisik"
              min="0"
              required
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-2">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] dark:text-[var(--text-default)] dark:bg-[var(--bg-secondary)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200"
              placeholder="Contoh: Stok rusak, stok hilang, dll."
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] rounded-xl text-white font-medium shadow-md transition-all duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Simpan Stok Opname
          </button>
        </div>
      </form>

      {/* Current Stock Summary */}
      {selectedProduct && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-[var(--border-default)]">
          <h3 className="text-lg font-medium text-gray-800 dark:text-[var(--text-default)] mb-2">Ringkasan Stok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[var(--bg-secondary)] p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Stok Sistem</div>
              <div className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">
                {products.find(p => p.id == selectedProduct)?.stock || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-[var(--bg-secondary)] p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Stok Fisik</div>
              <div className={`text-xl font-bold ${
                physicalStock > (products.find(p => p.id == selectedProduct)?.stock || 0) ? 'text-green-600 dark:text-green-400' : 
                physicalStock < (products.find(p => p.id == selectedProduct)?.stock || 0) ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-[var(--text-default)]'
              }`}>
                {physicalStock || 0}
              </div>
            </div>
            <div className="md:col-span-2 bg-white dark:bg-[var(--bg-secondary)] p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Selisih</div>
              <div className={`text-xl font-bold ${
                physicalStock > (products.find(p => p.id == selectedProduct)?.stock || 0) ? 'text-green-600 dark:text-green-400' : 
                physicalStock < (products.find(p => p.id == selectedProduct)?.stock || 0) ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-[var(--text-default)]'
              }`}>
                {physicalStock - (products.find(p => p.id == selectedProduct)?.stock || 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOpname;
