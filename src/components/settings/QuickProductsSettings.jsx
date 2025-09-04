import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, settingsAPI } from '../../api';
import { useOutletContext } from 'react-router-dom';

// A simple color palette for the buttons
const colorOptions = ['default', 'red', 'green', 'yellow', 'blue', 'purple'];

const colorClassMap = {
  default: 'bg-slate-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const QuickProductsSettings = () => {
  const { setSnackbar } = useOutletContext();
  const [allProducts, setAllProducts] = useState([]);
  const [quickProducts, setQuickProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAllProducts = useCallback(async () => {
    try {
      const response = await productAPI.getAll();
      setAllProducts(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Gagal memuat semua produk.', severity: 'error' });
      console.error(error);
    }
  }, [setSnackbar]);

  const fetchQuickProducts = useCallback(async () => {
    try {
      const response = await settingsAPI.getQuickProducts();
      const formattedQuickProducts = response.data.map(p => ({
        product_id: p.id,
        name: p.name,
        display_order: p.display_order,
        color: p.color || 'default'
      }));
      setQuickProducts(formattedQuickProducts);
    } catch (error) {
      setSnackbar({ open: true, message: 'Gagal memuat produk cepat.', severity: 'error' });
      console.error(error);
    }
  }, [setSnackbar]);

  useEffect(() => {
    fetchAllProducts();
    fetchQuickProducts();
  }, [fetchAllProducts, fetchQuickProducts]);

  const handleAddProduct = (product) => {
    if (quickProducts.some(p => p.product_id === product.id)) {
      setSnackbar({ open: true, message: 'Produk sudah ada di daftar.', severity: 'warning' });
      return;
    }
    const newQuickProduct = {
      product_id: product.id,
      name: product.name,
      display_order: quickProducts.length,
      color: 'default'
    };
    setQuickProducts([...quickProducts, newQuickProduct]);
  };

  const handleRemoveProduct = (productId) => {
    setQuickProducts(quickProducts.filter(p => p.product_id !== productId));
  };

  const handleMove = (index, direction) => {
    const newProducts = [...quickProducts];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newProducts.length) return;
    
    [newProducts[index], newProducts[newIndex]] = [newProducts[newIndex], newProducts[index]];
    
    setQuickProducts(newProducts);
  };

  const handleColorChange = (productId, newColor) => {
    setQuickProducts(quickProducts.map(p => 
      p.product_id === productId ? { ...p, color: newColor } : p
    ));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const dataToSave = quickProducts.map((p, index) => ({
        product_id: p.product_id,
        display_order: index,
        color: p.color
      }));
      await settingsAPI.updateQuickProducts(dataToSave);
      setSnackbar({ open: true, message: 'Pengaturan produk cepat berhasil disimpan!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Gagal menyimpan perubahan.', severity: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-100 dark:bg-transparent rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[var(--text-default)]">Pengaturan Produk Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: All Products */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-[var(--text-default)]">Daftar Semua Produk</h3>
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md mb-4 bg-gray-50 dark:bg-[var(--bg-secondary)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
          />
          <ul className="h-96 overflow-y-auto">
            {filteredProducts.map(product => (
              <li key={product.id} className="flex items-center justify-between p-2 border-b dark:border-[var(--border-default)] text-gray-800 dark:text-[var(--text-muted)]">
                <span>{product.name}</span>
                <button
                  onClick={() => handleAddProduct(product)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Tambah
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Selected Quick Products */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-[var(--text-default)]">Produk Cepat Terpilih</h3>
          <ul className="h-96 overflow-y-auto">
            {quickProducts.map((product, index) => (
              <li key={product.product_id} className="flex items-center justify-between p-2 border-b dark:border-[var(--border-default)]">
                <div className="flex-grow">
                  <span className="font-semibold text-gray-800 dark:text-[var(--text-default)]">{product.name}</span>
                  <div className="flex items-center mt-1 space-x-1">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(product.product_id, color)}
                        className={`w-6 h-6 rounded-full border-2 ${product.color === color ? 'border-[var(--primary-color)]' : 'border-transparent'} ${colorClassMap[color]}`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col">
                    <button onClick={() => handleMove(index, -1)} disabled={index === 0} className="px-2 py-0.5 text-gray-600 dark:text-[var(--text-muted)] disabled:opacity-50">▲</button>
                    <button onClick={() => handleMove(index, 1)} disabled={index === quickProducts.length - 1} className="px-2 py-0.5 text-gray-600 dark:text-[var(--text-muted)] disabled:opacity-50">▼</button>
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(product.product_id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 text-right">
        <button
          onClick={handleSaveChanges}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 dark:bg-[var(--primary-color)] dark:hover:bg-[var(--primary-color-hover)]"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
};

export default QuickProductsSettings;
