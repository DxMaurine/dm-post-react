import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPlus, FiTrash2, FiPrinter, FiSearch, FiServer, FiPackage, FiDownload } from 'react-icons/fi';
import { productAPI } from '../api';

const BarcodeManagementPage = () => {
  const { setSnackbar } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [printQueue, setPrintQueue] = useState([]);
  const [showProducts, setShowProducts] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Gagal memuat data produk', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setShowProducts(true);
    } else {
      setShowProducts(false);
    }
  }, [searchTerm]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToQueue = (product) => {
    if (printQueue.some(item => item.id === product.id)) {
      setSnackbar({ 
        open: true, 
        message: `${product.name} sudah ada di daftar cetak.`, 
        severity: 'warning' 
      });
      return;
    }
    setPrintQueue(prev => [...prev, { ...product, printQty: 1 }]);
  };

  const removeFromQueue = (productId) => {
    setPrintQueue(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    const newQty = Math.max(1, parseInt(qty, 10) || 1);
    setPrintQueue(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, printQty: newQty } : item
      )
    );
  };

  const handleGeneratePrintPage = () => {
    if (printQueue.length === 0) {
      setSnackbar({ 
        open: true, 
        message: 'Daftar cetak masih kosong.', 
        severity: 'warning' 
      });
      return;
    }
    localStorage.setItem('barcodePrintQueue', JSON.stringify(printQueue));
    window.electron.openBarcodePrinter();
  };

  const totalLabels = printQueue.reduce((acc, item) => acc + (item.printQty || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-xl mr-4">
            <FiServer size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manajemen Cetak Barcode</h1>
            <p className="text-blue-100 dark:text-blue-200 mt-1">
              Pilih produk dan tentukan jumlah label untuk dicetak massal
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg mb-6 "></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow ">
        {/* Product List Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg border-2 border-gray-200 dark:border-[var(--border-default)] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-[var(--border-default)]">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 dark:bg-yellow-500 p-2 rounded-lg mr-3">
                <FiSearch className="text-blue-600 dark:text-[var(--text-default)]" size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">
                Daftar Produk
              </h2>
            </div>
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Cari produk berdasarkan nama atau barcode..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent bg-white dark:bg-[var(--bg-secondary)] text-gray-800 dark:text-[var(--text-default)] transition-all"
              />
            </div>
          </div>
          
          <div className={`flex-grow overflow-hidden transition-all duration-300 ${showProducts ? 'max-h-[calc(100vh-250px)]' : 'max-h-0'}`}>
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-[var(--text-muted)] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--primary-color)] mb-3"></div>
                <p>Memuat produk...</p>
              </div>
            ) : (
              <div className="overflow-y-auto h-full">
                {filteredProducts.length > 0 ? (
                  <div className="p-4 space-y-3">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id} 
                        className="flex items-center justify-between p-4 bg-white dark:bg-[var(--bg-secondary)] rounded-lg border border-gray-200 dark:border-[var(--border-default)] hover:border-[var(--primary-color)] dark:hover:border-[var(--primary-color)] transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4 flex-grow">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <FiPackage className="text-blue-600 dark:text-[var(--text-muted)]" size={18} />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-semibold text-gray-800 dark:text-[var(--text-default)] truncate group-hover:text-[var(--primary-color)]">
                              {product.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
                                {product.category}
                              </span>
                              <span className="text-xs font-mono text-gray-400 dark:text-[var(--text-default)]">
                                {product.barcode || 'No barcode'}
                              </span>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                product.stock > 10 
                                  ? 'bg-green-100 dark:bg-green-700 text-green-800 dark:text-white' 
                                  : 'bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300'
                              }`}>
                                Stok: {product.stock}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => addToQueue(product)} 
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <FiPlus size={16} />
                          <span>Tambah</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-[var(--text-muted)]">
                    <FiSearch className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={32} />
                    <p>{searchTerm ? 'Produk tidak ditemukan' : 'Gunakan kolom pencarian untuk menemukan produk'}</p>
                    {searchTerm && (
                      <p className="text-sm mt-1">Coba dengan kata kunci yang berbeda</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Print Queue Section */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg border-2 border-gray-200 dark:border-[var(--border-default)] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-[var(--border-default)]">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 dark:bg-green-500 p-2 rounded-lg mr-3">
                <FiPrinter className="text-purple-600 dark:text-[var(--text-default)]" size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">
                Daftar Cetak
              </h2>
              {printQueue.length > 0 && (
                <span className="ml-auto bg-blue-100 dark:bg-[var(--bg-default)] text-blue-800 dark:text-[var(--text-default)] text-xs font-medium px-2.5 py-1 rounded-full">
                  {printQueue.length} item
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {printQueue.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-[var(--text-muted)] py-8 flex flex-col items-center">
                <FiPrinter className="text-gray-300 dark:text-gray-600 mb-3" size={32} />
                <p>Daftar cetak kosong</p>
                <p className="text-sm mt-1">Tambahkan produk dari daftar</p>
              </div>
            ) : (
              printQueue.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl border-2 border-gray-200 dark:border-[var(--border-default)] hover:border-blue-300 dark:hover:border-[var(--primary-color)] transition-colors">
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-[var(--text-default)] truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] font-mono truncate">{item.barcode || 'No barcode'}</p>
                  </div>
                  <input 
                    type="number" 
                    value={item.printQty} 
                    onChange={e => updateQuantity(item.id, e.target.value)} 
                    className="w-16 text-center border border-gray-300 dark:border-[var(--border-default)] rounded-lg py-2 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent bg-white dark:bg-[var(--bg-default)] text-gray-800 dark:text-[var(--text-default)] transition-all" 
                    min="1" 
                  />
                  <button 
                    onClick={() => removeFromQueue(item.id)} 
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Hapus dari daftar"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700 dark:text-[var(--text-default)]">Total Label:</span>
              <span className="font-bold text-xl text-[var(--primary-color)]">{totalLabels}</span>
            </div>
            <button 
              onClick={handleGeneratePrintPage} 
              disabled={printQueue.length === 0}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                printQueue.length > 0 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-700 dark:to-indigo-800 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold shadow-md' 
                  : 'bg-gray-200 dark:bg-[var(--bg-secondary)] text-gray-500 dark:text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              <FiDownload size={18} />
              <span>Buat Halaman Cetak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeManagementPage;