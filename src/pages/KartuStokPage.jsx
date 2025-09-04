import { useState } from 'react';
import KartuStokReport from '../components/KartuStokReport';
import { productAPI } from '../api'; // Changed from generic api to productAPI
import { FiSearch, FiX, FiChevronRight } from 'react-icons/fi';
import React from 'react';

const KartuStokPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      // Migrated to use productAPI.search()
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto dark:bg-[var(--bg-default)] rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Laporan Kartu Stok</h1>
        {selectedProduct && (
          <button 
            onClick={clearSelection}
            className="flex items-center text-sm text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] bg-blue-100 dark:bg-blue-500/10 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-blue-500/20"
          >
            <FiX className="mr-1" /> Ganti Produk
          </button>
        )}
      </div>
      
      {!selectedProduct ? (
        <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-[var(--text-default)] mb-4">Pilih Produk</h2>
          <form onSubmit={handleSearch} className="relative">
            <div className={`flex items-center border ${searchFocused ? 'border-[var(--primary-color)] ring-2 ring-blue-100 dark:ring-blue-500/20' : 'border-gray-300 dark:border-[var(--border-default)]'} rounded-lg transition-all duration-200`}>
              <div className="pl-3 text-gray-400 dark:text-[var(--text-muted)]">
                <FiSearch />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Cari nama atau kode produk..."
                className="flex-grow px-3 py-3 focus:outline-none bg-transparent dark:text-[var(--text-default)]"
              />
              <button 
                type="submit" 
                disabled={!searchTerm.trim() || isLoading}
                className={`px-4 py-2 m-1 rounded-md transition-colors ${(!searchTerm.trim() || isLoading) ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)]'} text-white`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mencari...
                  </span>
                ) : 'Cari'}
              </button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <ul className="mt-3 border border-gray-200 dark:border-[var(--border-default)] rounded-lg divide-y divide-gray-200 dark:divide-[var(--border-default)] max-h-80 overflow-y-auto shadow-inner">
              {searchResults.map(product => (
                <li 
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="p-4 hover:bg-blue-50 dark:hover:bg-[var(--primary-color)]/10 cursor-pointer transition-colors duration-150 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-[var(--text-default)]">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-green-400">Stok: {product.stock}</p>
                  </div>
                  <FiChevronRight className="text-gray-400 dark:text-[var(--text-muted)]" />
                </li>
              ))}
            </ul>
          )}

          {searchTerm && searchResults.length === 0 && !isLoading && (
            <div className="mt-4 p-4 text-center text-gray-500 dark:text-[var(--text-muted)]">
              Produk tidak ditemukan
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-[var(--text-default)] mb-3">Produk Terpilih</h2>
            <p className="text-gray-800 font-medium dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] shadow-md p-2 rounded-md">{selectedProduct.name} <span className="text-gray-500 text-sm dark:text-[var(--text-muted)]">(Stok: {selectedProduct.stock})</span></p>
          </div>
          
          <KartuStokReport productId={selectedProduct.id} />
        </div>
      )}
    </div>
  );
};

export default KartuStokPage;
