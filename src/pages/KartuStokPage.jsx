import { useState } from 'react';
import KartuStokReport from '../components/KartuStokReport';
import { productAPI } from '../api';
import { FiSearch, FiX, FiChevronRight, FiBox, FiFileText, FiRefreshCw } from 'react-icons/fi';
import React from 'react';

const KartuStokPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]); // Clear results when search term is empty
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await productAPI.search(searchTerm);
      setSearchResults(response.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchTerm('');
    setSearchResults([]);
  };

  const clearSelection = () => {
    setSelectedProduct(null);
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <FiFileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Laporan Kartu Stok</h1>
              <p className="text-blue-100 dark:text-blue-200 mt-1">
                Pantau pergerakan stok produk dengan detail
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {!selectedProduct ? (
        /* Search Section */
        <div className="bg-white dark:bg-[var(--card-bg-dark)] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[var(--border-default)]">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <FiSearch className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">
              Cari Produk
            </h2>
          </div>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className={`flex items-center border ${searchFocused ? 'border-[var(--primary-color)] ring-2 ring-blue-100 dark:ring-blue-500/20' : 'border-gray-300 dark:border-[var(--border-default)]'} rounded-xl transition-all duration-200 overflow-hidden`}>
              <div className="pl-4 text-gray-400 dark:text-[var(--text-muted)]">
                <FiSearch size={18} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Clear search results when input is cleared
                  if (!e.target.value.trim()) {
                    setSearchResults([]);
                  }
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Masukkan nama atau kode produk..."
                className="flex-grow px-4 py-4 focus:outline-none bg-transparent dark:text-[var(--text-default)] placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button 
                type="submit" 
                disabled={!searchTerm.trim() || isLoading}
                className={`px-6 py-4 m-1 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  (!searchTerm.trim() || isLoading) 
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed dark:text-[var(--text-muted)]' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 hover:from-blue-600 hover:to-indigo-700 text-white'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <FiRefreshCw className="animate-spin mr-2" size={16} />
                    Mencari...
                  </span>
                ) : 'Cari Produk'}
              </button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl p-4 border border-gray-200 dark:border-[var(--border-default)]">
              <h3 className="font-medium text-gray-700 dark:text-[var(--text-default)] mb-3">
                Hasil Pencarian ({searchResults.length} produk ditemukan)
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchResults.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="p-4 bg-white dark:bg-[var(--bg-default)] rounded-lg border border-gray-200 dark:border-[var(--border-default)] hover:border-[var(--primary-color)] dark:hover:border-[var(--primary-color)] cursor-pointer transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <FiBox className="text-blue-600 dark:text-blue-400" size={18} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-[var(--text-default)] group-hover:text-[var(--primary-color)]">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600 dark:text-[var(--text-muted)]">
                              Kode: {product.id}
                            </span>
                            <span className={`text-sm font-medium ${
                              product.stock <= 1 ? 'text-red-500' :
                              product.stock <= 5 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              Stok: {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                      <FiChevronRight className="text-gray-400 group-hover:text-[var(--primary-color)] transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm && searchResults.length === 0 && !isLoading && (
            <div className="text-center py-8 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-[var(--border-default)]">
              <FiBox className="mx-auto text-gray-400 dark:text-[var(--text-muted)] mb-3" size={32} />
              <p className="text-gray-500 dark:text-[var(--text-muted)]">
                Tidak ada produk yang ditemukan untuk "{searchTerm}"
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Coba dengan kata kunci yang berbeda
              </p>
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[var(--bg-secondary)] dark:to-blue-900/10 rounded-xl border border-dashed border-gray-300 dark:border-[var(--border-default)]">
              <FiSearch className="mx-auto text-gray-400 dark:text-[var(--text-muted)] mb-3" size={32} />
              <p className="text-gray-500 dark:text-[var(--text-muted)]">
                Masukkan nama atau kode produk untuk memulai pencarian
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Report Section */
        <div className="bg-white dark:bg-[var(--card-bg-dark)] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                <FiBox className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">
                  Laporan Kartu Stok
                </h2>
                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)]">
                  Detail pergerakan stok untuk produk terpilih
                </p>
              </div>
            </div>
            {selectedProduct && (
              <button 
                onClick={clearSelection}
                className="flex items-center text-sm bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <FiX className="mr-2" />
                Ganti Produk
              </button>
            )}
          </div>

          {/* Selected Product Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white dark:bg-blue-900/30 p-3 rounded-lg">
                  <FiBox className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-[var(--text-default)]">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600 dark:text-[var(--text-muted)]">
                      Kode: {selectedProduct.id}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      selectedProduct.stock <= 1 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      selectedProduct.stock <= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      Stok: {selectedProduct.stock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Report Component */}
          <KartuStokReport productId={selectedProduct.id} />
        </div>
      )}
    </div>
  );
};

export default KartuStokPage;