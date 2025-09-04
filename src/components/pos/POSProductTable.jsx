import React from 'react';


const POSProductTable = ({ products, loading, error, onAddToCart }) => {
  
  const getStockHighlightClass = (stock) => {
    if (stock <= 1) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (stock <= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    if (stock >= 10) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    return '';
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-md bg-white dark:bg-[var(--sidebar-bg-dark)] max-h-[60vh] overflow-y-auto">
      {loading ? (
        <div className="p-6 text-center text-blue-500 dark:text-blue-400">
          Memuat data produk...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-blue-100 dark:bg-[var(--layout-bg-dark)] text-blue-700 dark:text-white z-10">
            <tr>
              <th className="px-3 py-2 text-left">Kode</th>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-right">Harga</th>
              <th className="px-3 py-2 text-center">Stok</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr 
                  key={product.id} 
                  className={`border-b border-blue-100 dark:bg-[var(--layout-bg-dark)] ${getStockHighlightClass(product.stock)}`}
                >
                  <td className="px-3 py-2 dark:text-gray-200">{product.id}</td>
                  <td className="px-3 py-2 font-semibold dark:text-gray-200">{product.name}</td>
                  <td className="px-3 py-2 text-right dark:text-gray-200">
                    Rp {product.price?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2 text-center font-bold">
                    {product.stock}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 py-1 rounded-lg text-xs font-bold disabled:bg-gray-400 dark:disabled:bg-gray-600"
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      Tambah
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Tidak ada produk yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default POSProductTable;