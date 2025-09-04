import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPlus, FiTrash2, FiPrinter, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { productAPI } from '../api'; // Import the productAPI module

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
      const response = await productAPI.getAll(); // Use the API method
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
    <div className="w-full h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 bg-gray-50 dark:bg-[var(--layout-bg-dark)] rounded-lg shadow-sm overflow-hidden">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)]">Manajemen Cetak Barcode</h1>
        <p className="text-gray-600 dark:text-[var(--text-muted)]">Pilih produk dan tentukan jumlah label untuk dicetak massal.</p>
      </div>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden">
        {/* Product List */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-default)] flex flex-col transition-all duration-300">
          <div className="p-3 md:p-4 border-b border-gray-200 dark:border-[var(--border-default)]">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Cari produk berdasarkan nama atau barcode..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent bg-white dark:bg-[var(--bg-default)] text-gray-800 dark:text-[var(--text-default)] transition-all"
              />
              <button 
                onClick={() => setShowProducts(!showProducts)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-700 dark:hover:text-[var(--text-default)] transition-colors"
              >
                {showProducts ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </button>
            </div>
          </div>
          
          <div 
            className={`flex-grow overflow-hidden transition-all duration-300 ${showProducts ? 'max-h-[calc(100vh-250px)]' : 'max-h-0'}`}
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-[var(--text-muted)] flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mb-2"></div>
                Memuat produk...
              </div>
            ) : (
              <div className="overflow-y-auto h-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                  <thead className="bg-gray-50 dark:bg-[var(--bg-default)] sticky top-0">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Produk</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Barcode</th>
                      <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Stok</th>
                      <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors">
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">{p.name}</div>
                            <div className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{p.category}</div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-[var(--text-muted)]">
                            {p.barcode || <span className="text-gray-400 dark:text-gray-500">-</span>}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              p.stock > 10 
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' 
                                : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                            <button 
                              onClick={() => addToQueue(p)} 
                              className="text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] font-medium text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded-md flex items-center gap-1 transition-colors"
                            >
                              <FiPlus size={12} /> Tambah
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 md:px-6 py-4 text-center text-gray-500 dark:text-[var(--text-muted)]">
                          {searchTerm ? 'Produk tidak ditemukan' : 'Gunakan kolom pencarian untuk menemukan produk'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Print Queue */}
        <div className="lg:col-span-1 bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-default)] flex flex-col">
          <div className="p-3 md:p-4 border-b border-gray-200 dark:border-[var(--border-default)]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)] flex items-center gap-2">
              <FiPrinter className="text-[var(--primary-color)]" />
              Daftar Cetak
              {printQueue.length > 0 && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {printQueue.length} item
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-3 md:p-4 space-y-2">
            {printQueue.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-[var(--text-muted)] py-8 flex flex-col items-center">
                <FiPrinter className="text-gray-300 dark:text-[var(--bg-default)] mb-2" size={24} />
                <p>Daftar cetak kosong</p>
                <p className="text-xs mt-1">Tambahkan produk dari daftar</p>
              </div>
            ) : (
              printQueue.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[var(--bg-default)] rounded-md border border-gray-200 dark:border-[var(--border-default)] hover:border-blue-300 dark:hover:border-[var(--primary-color)] transition-colors">
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-[var(--text-default)] truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] font-mono truncate">{item.barcode || 'No barcode'}</p>
                  </div>
                  <input 
                    type="number" 
                    value={item.printQty} 
                    onChange={e => updateQuantity(item.id, e.target.value)} 
                    className="w-14 text-center border border-gray-300 dark:border-[var(--border-default)] rounded-md py-1 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent bg-white dark:bg-[var(--bg-secondary)] text-gray-800 dark:text-[var(--text-default)] transition-all" 
                    min="1" 
                  />
                  <button 
                    onClick={() => removeFromQueue(item.id)} 
                    className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-md transition-colors"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 md:p-4 border-t border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-default)] rounded-b-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 dark:text-[var(--text-default)]">Total Label:</span>
              <span className="font-bold text-lg text-[var(--primary-color)]">{totalLabels}</span>
            </div>
            <button 
              onClick={handleGeneratePrintPage} 
              disabled={printQueue.length === 0}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                printQueue.length > 0 
                  ? 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-semibold shadow-md' 
                  : 'bg-gray-200 dark:bg-[var(--bg-secondary)] text-gray-500 dark:text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              <FiPrinter size={16} /> Buat Halaman Cetak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeManagementPage;
