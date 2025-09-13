import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FaPrint, FaSearch, FaPlus, FaChevronDown, FaChevronRight, FaFileExcel } from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import ProductModal from '../components/ProductModal';
import { productAPI } from '../api';
import Swal from 'sweetalert2';
import React from 'react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${backendUrl}${imagePath}`;
};

const DataBarang = () => {
  // Reusable Pagination Button Component
  const PaginationButton = ({ onClick, disabled, ariaLabel, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-md border dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 group"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );

  // Icon Components for Pagination
  const FirstPageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 17V7l-5 5 5 5z"/><path d="M11 17V7l-5 5 5 5z"/>
    </svg>
  );

  const PreviousPageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const NextPageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const LastPageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17V7l5 5-5 5z"/><path d="M13 17V7l5 5-5 5z"/>
    </svg>
  );

  const { setSnackbar } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [activeTab, setActiveTab] = useState('all');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      const response = await productAPI.getAll(); // Fetch all products
      const productsToExport = response.data.map(p => ({
        id: p.id,
        barcode: p.barcode,
        name: p.name,
        price: p.price,
        type: p.type,
        jenis: p.jenis,
        ukuran: p.ukuran,
        keyword: p.keyword,
        stock: p.stock,
        harga_beli: p.harga_beli,
      }));

      const worksheet = XLSX.utils.json_to_sheet(productsToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, "DataBarang.xlsx");
      setSnackbar({ open: true, message: 'Data berhasil diexport!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: `Export gagal: ${err.message}`, severity: 'error' });
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json.length === 0) {
          setSnackbar({ open: true, message: 'File Excel kosong atau format tidak sesuai.', severity: 'warning' });
          return;
        }

        // TODO: Add bulk import API call here
        await productAPI.bulkCreate(json);

        setSnackbar({ open: true, message: 'Data berhasil diimport!', severity: 'success' });
        fetchProducts(); // Refresh data
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setSnackbar({ open: true, message: `Import gagal: ${errorMessage}`, severity: 'error' });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input
    event.target.value = null;
  };


  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan dapat mengembalikan barang ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await productAPI.delete(id);
        Swal.fire(
          'Terhapus!',
          'Barang berhasil dihapus.',
          'success'
        );
        fetchProducts();
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        Swal.fire(
          'Gagal!',
          errorMessage,
          'error'
        );
      }
    }
  };

  const handleSave = async (productFormData) => {
    try {
      const productId = productFormData.get('id');

      if (productId) {
        await productAPI.update(productId, productFormData);
        setSnackbar({ open: true, message: 'Barang berhasil diperbarui!', severity: 'success' });
      } else {
        await productAPI.create(productFormData);
        setSnackbar({ open: true, message: 'Barang berhasil ditambahkan!', severity: 'success' });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setSnackbar({ open: true, message: `Gagal menyimpan: ${errorMessage}`, severity: 'error' });
    }
  };

  const _requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const totalHPP = useMemo(() => {
    return products.reduce((acc, product) => {
      const cost = parseFloat(product.harga_beli) || 0;
      const stock = parseInt(product.stock, 10) || 0;
      return acc + (cost * stock);
    }, 0);
  }, [products]);

  const { paginatedProducts, totalPages, startItem, endItem, totalItems } = useMemo(() => {
    // 1. Filter products based on the search term. It's more efficient to filter first.
    let filtered = products.filter(product => {
      const term = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(term) ||
        String(product.id).toLowerCase().includes(term) ||
        (product.keyword && product.keyword.toLowerCase().includes(term)) ||
        (product.barcode && product.barcode.toLowerCase().includes(term))
      );
    });

    // 2. Sort the filtered products only if a sort key is set.
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Place items with null/undefined values at the end for consistency
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // 3. Paginate the results
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    return {
      paginatedProducts,
      totalPages,
      startItem: totalItems > 0 ? startIndex + 1 : 0,
      endItem: endIndex,
      totalItems,
    };
  }, [products, searchTerm, sortConfig, currentPage]);

  const toggleExpandProduct = (id) => {
    setExpandedProduct(expandedProduct === id ? null : id);
  };

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(totalPages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
        <span className="ml-3 text-[var(--text-muted)]">Memuat data barang...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-200">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-bold">Error:</h3>
        </div>
        <p className="mt-2">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
        >
          Coba Lagi
        </button>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-xl mr-4">
            <FiPackage size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Master Data Barang</h2>
            <p className="text-blue-100 dark:text-blue-200 mt-1">
              Kelola data barang Anda di sini
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg mb-6 border-2 border-gray-200 dark:border-[var(--border-default)]">
        <div className="p-6 max-h-screen overflow-y-auto">
          {/* Controls Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-600 dark:text-[var(--text-default)] mr-4">Product Type</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === 'all' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-default)] hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)]'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setActiveTab('standard')}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === 'standard' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-default)] hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)]'}`}
                  >
                    Standard
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === 'inventory' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-default)] hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)]'}`}
                  >
                    Inventory
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, Code, Barcode..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg bg-gray-50 dark:bg-[var(--bg-secondary)] text-gray-900 dark:text-[var(--text-default)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center justify-center"
              >
                <FaFileExcel className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center justify-center"
              >
                <FaFileExcel className="w-4 h-4 mr-2" />
                Import
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleImport}
              />
              <button
                onClick={handleAdd}
                className="bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-medium py-2 px-4 rounded-lg shadow flex items-center justify-center"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add New
              </button>
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={`relative border dark:border-[var(--border-default)] rounded-lg transition-all duration-300 ease-in-out hover:z-10 hover:ring-2 hover:ring-[var(--primary-color)] focus-within:z-10 focus-within:ring-2 focus-within:ring-[var(--primary-color)] ${expandedProduct === product.id ? 'rounded-b-none' : ''}`}
                >
                  {/* Product Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleExpandProduct(product.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-[var(--bg-secondary)] rounded flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={getImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-[var(--text-muted)]">NO IMG</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-[var(--text-default)]">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Code: {product.id} | Barcode: {product.barcode || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-medium text-gray-800 dark:text-[var(--text-default)]">Rp {product.price ? parseFloat(product.price).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}</p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Cost: Rp {product.harga_beli ? parseFloat(product.harga_beli).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock <= 1 ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          product.stock <= 5 ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                          'bg-green-200 text-green-800 dark:bg-green-600 dark:text-white'
                        }`}>
                          {product.stock} in stock
                        </span>
                        {expandedProduct === product.id ? (
                          <FaChevronDown className="ml-4 text-green-500" />
                        ) : (
                          <FaChevronRight className="ml-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedProduct === product.id && (
                    <div className="p-4 bg-gray-50 dark:bg-[var(--bg-default)] border-t border-gray-200 dark:border-[var(--border-default)] rounded-b-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-[var(--text-muted)] mb-2">Product Details</h4>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-800 dark:text-[var(--text-default)]"><span className="text-gray-500 dark:text-[var(--text-muted)]">Type:</span> {product.type || '-'}</p>
                            <p className="text-sm text-gray-800 dark:text-[var(--text-default)]"><span className="text-gray-500 dark:text-[var(--text-muted)]">Jenis:</span> {product.jenis || '-'}</p>
                            <p className="text-sm text-gray-800 dark:text-[var(--text-default)]"><span className="text-gray-500 dark:text-[var(--text-muted)]">Ukuran:</span> {product.ukuran || '-'}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-[var(--text-muted)] mb-2">Pricing</h4>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-800 dark:text-[var(--text-default)]"><span className="text-gray-500 dark:text-[var(--text-muted)]">Harga Beli:</span> Rp {product.harga_beli ? parseFloat(product.harga_beli).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}</p>
                            <p className="text-sm text-gray-800 dark:text-[var(--text-default)]"><span className="text-gray-500 dark:text-[var(--text-muted)]">Harga Jual:</span> Rp {product.price ? parseFloat(product.price).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}</p>
                          </div>
                        </div>
                        <div className="flex items-end justify-end">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-700 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500 px-3 py-1 rounded text-sm flex items-center"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-700 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-500/20 dark:hover:bg-red-500 px-3 py-1 rounded text-sm flex items-center"
                            >
                              Delete
                            </button>
                            <Link
                              to={`/print-barcode/${product.id}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-800 dark:text-green-700 dark:hover:text-green-300 bg-green-50 hover:bg-green-100 dark:bg-green-500 dark:hover:bg-green-500 px-3 py-1 rounded text-sm flex items-center"
                            >
                              <FaPrint className="mr-1" /> Barcode
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-[var(--text-muted)]">
                  {searchTerm ? 'No products found matching your search' : 'No products available'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
              Showing {startItem}-{endItem} of {totalItems}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-[var(--text-default)] border-l pl-4 dark:border-[var(--border-default)]">
              Total Nilai Inventaris: Rp {totalHPP.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <PaginationButton
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <FirstPageIcon />
            </PaginationButton>
            <PaginationButton
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <PreviousPageIcon />
            </PaginationButton>
            <div className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages || 1}</span>
            </div>
            <PaginationButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Next page"
            >
              <NextPageIcon />
            </PaginationButton>
            <PaginationButton
              onClick={handleLastPage}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Last page"
            >
              <LastPageIcon />
            </PaginationButton>
          </div>
        </div>
        </div>
      </div>

      <ProductModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        product={editingProduct}
        onError={(message) => setSnackbar({ open: true, message, severity: 'warning' })}
      />
    </div>
  );
};

export default DataBarang;