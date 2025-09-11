import { useState, useEffect, useMemo } from "react";
import { FiX, FiSearch, FiPackage } from "react-icons/fi";
import { productAPI } from "../api"; 
import React from 'react';

const CatalogModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
  if (isOpen) {
    setLoading(true);
    const cacheBuster = import.meta.env.DEV ? `?t=${Date.now()}` : "";
    // New way:
    productAPI.getAll(cacheBuster)
      .then(response => setProducts(response.data))
      // eslint-disable-next-line no-unused-vars
      .catch(err => {
        // Handle product loading error
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }
}, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lowercasedTerm = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        String(product.id).includes(lowercasedTerm) ||
        (product.barcode && product.barcode.includes(lowercasedTerm))
    );
  }, [products, searchTerm]);

  const colorClasses = [
    "border-l-blue-500 bg-blue-50 ",
    "border-l-green-500 bg-green-50",
    "border-l-yellow-500 bg-yellow-50",
    "border-l-red-500 bg-red-50",
    "border-l-indigo-500 bg-indigo-50",
    "border-l-purple-500 bg-purple-50",
    "border-l-pink-500 bg-pink-50",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FiPackage className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Katalog Produk
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white dark:bg-[var(--bg-secondary)] rounded-full hover:text-gray-300 p-2 rounded-full hover:bg-red-500 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama, kode, atau barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg dark:text-[var(--text-muted)] text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`p-4 rounded-lg border-l-4 shadow-sm transition-transform hover:scale-[1.02] ${
                      colorClasses[index % colorClasses.length]
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="text-sm text-gray-500">Stok</p>
                        <p className="text-2xl font-semibold text-gray-700">
                          {product.stock}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 text-right">Harga</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {product.price.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <FiPackage className="mx-auto h-16 w-16 text-gray-300" />
                  <p className="mt-4 text-lg">Produk tidak ditemukan.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;
