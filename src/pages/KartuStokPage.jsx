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
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await productAPI.search(searchTerm);
      setSearchResults(response.data);
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

  const getStockColor = (stock) => {
    if (stock <= 1) return 'text-[var(--danger-color)]';
    if (stock <= 5) return 'text-[var(--warning-color)]';
    return 'text-[var(--success-color)]';
  };

  const getStockBgColor = (stock) => {
    if (stock <= 1) return 'bg-[var(--danger-color)]/10';
    if (stock <= 5) return 'bg-[var(--warning-color)]/10';
    return 'bg-[var(--success-color)]/10';
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <FiFileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Laporan Kartu Stok</h1>
              <p className="text-white/80 mt-1">Pantau pergerakan stok produk dengan detail</p>
            </div>
          </div>
        </div>
      </div>
      
      {!selectedProduct ? (
        /* Search Section */
        <div className="bg-[var(--bg-primary)] p-6 rounded-xl shadow-lg border-2 border-[var(--border-default)]">
          <div className="flex items-center mb-6">
            <div className="bg-[var(--primary-color)]/10 p-2 rounded-lg mr-3">
              <FiSearch className="text-[var(--text-default)]" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-default)]">Cari Produk</h2>
          </div>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className={`flex items-center border ${searchFocused ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20' : 'border-[var(--border-default)]'} rounded-xl transition-all duration-200 overflow-hidden`}>
              <div className="pl-4 text-[var(--text-default)]">
                <FiSearch size={18} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value.trim()) {
                    setSearchResults([]);
                  }
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Masukkan nama atau kode produk..."
                className="flex-grow px-4 py-4 focus:outline-none bg-transparent text-[var(--text-default)] placeholder-[var(--text-default)]/80"
              />
              <button 
                type="submit" 
                disabled={!searchTerm.trim() || isLoading}
                className={`px-6 py-4 m-1 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  (!searchTerm.trim() || isLoading) 
                    ? 'bg-[var(--bg-tertiary)] cursor-not-allowed text-[var(--text-default)]' 
                    : 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white'
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
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-default)]">
              <h3 className="font-medium text-[var(--text-default)] mb-3">Hasil Pencarian ({searchResults.length} produk ditemukan)</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchResults.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary-color)] cursor-pointer transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-[var(--primary-color)]/10 p-2 rounded-lg">
                          <FiBox className="text-[var(--primary-color)]" size={18} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[var(--text-default)] group-hover:text-[var(--primary-color)]">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-[var(--text-muted)]">Kode: {product.id}</span>
                            <span className={`text-sm font-medium ${getStockColor(product.stock)}`}>Stok: {product.stock}</span>
                          </div>
                        </div>
                      </div>
                      <FiChevronRight className="text-[var(--text-muted)] group-hover:text-[var(--primary-color)] transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm && searchResults.length === 0 && !isLoading && (
            <div className="text-center py-8 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)]">
              <FiBox className="mx-auto text-[var(--text-default)] mb-3" size={32} />
              <p className="text-[var(--text-default)]">Tidak ada produk yang ditemukan untuk "{searchTerm}"</p>
              <p className="text-sm text-[var(--text-default)]/80 mt-1">Coba dengan kata kunci yang berbeda</p>
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--primary-color)]/5 rounded-xl border border-dashed border-[var(--border-default)]">
              <FiSearch className="mx-auto text-[var(--text-default)] mb-3" size={32} />
              <p className="text-[var(--text-default)]">Masukkan nama atau kode produk untuk memulai pencarian</p>
            </div>
          )}
        </div>
      ) : (
        /* Report Section */
        <div className="bg-[var(--bg-primary)] p-6 rounded-xl shadow-lg border border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-[var(--primary-color)]/10 p-2 rounded-lg mr-3">
                <FiBox className="text-[var(--primary-color)]" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-default)]">Laporan Kartu Stok</h2>
                <p className="text-sm text-[var(--text-muted)]">Detail pergerakan stok untuk produk terpilih</p>
              </div>
            </div>
            {selectedProduct && (
              <button 
                onClick={clearSelection}
                className="flex items-center text-sm bg-[var(--danger-color)] hover:bg-[var(--danger-color-hover)] text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <FiX className="mr-2" />
                Ganti Produk
              </button>
            )}
          </div>

          {/* Selected Product Card */}
          <div className="bg-[var(--primary-color)]/5 p-4 rounded-xl mb-6 border border-[var(--primary-color)]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-[var(--primary-color)]/10 p-3 rounded-lg">
                  <FiBox className="text-[var(--primary-color)]" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-default)]">{selectedProduct.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-[var(--text-muted)]">Kode: {selectedProduct.id}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full  dark:text-[var(--text-default)] ${getStockBgColor(selectedProduct.stock)} ${getStockColor(selectedProduct.stock)}`}>
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