import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPlus, FiTrash2, FiChevronDown, FiCalendar, FiUser, FiTruck, FiDollarSign, FiRepeat } from 'react-icons/fi';
import PurchaseReturnList from '../components/PurchaseReturnList';
import { purchaseReturnAPI, productAPI } from '../api';
import React from 'react';

// Helper function to format currency
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID').format(number);
};

// Generator nomor faktur: F-RET-DD-MM-YY
const genInvoiceNumber = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `FRET-${dd}-${mm}-${yy}`;
};

const ReturPembelianPage = () => {
  const { setSnackbar } = useOutletContext();
  const [returns, setReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({}); // { index: [products] }
  const [suggestionOverlay, setSuggestionOverlay] = useState({ open: false, index: null });
  const [notFound, setNotFound] = useState({ open: false, index: null, query: '' });
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', barcode: '', price: 0, harga_beli: 0, unit: 'pcs', stock: 0 });
  const [formData, setFormData] = useState({
    returnNumber: `RET-${new Date().getTime().toString().slice(-6)}`,
    returnDate: new Date().toISOString().slice(0, 10),
    invoiceNumber: genInvoiceNumber(new Date().toISOString().slice(0, 10)),
    invoiceDate: new Date().toISOString().slice(0, 10),
    supplierName: '',
    supplierCode: '',
    supplierContact: '',
    items: [{ 
      productCode: '', 
      productName: '', 
      quantity: 1, 
      unit: 'pcs', 
      price: '' || 0, 
      total: 0,
      reason: '' 
    }],
    subtotal: 0,
    discount: 0,
    tax: 0,
    totalReturn: 0,
    returnMethod: 'refund',
    refundRef: '',
    approvedBy: '',
    supplierRep: '',
    notes: '',
    status: 'processed',
    shippingInfo: '',
  });

  const fetchReturns = async () => {
    try {
      const response = await purchaseReturnAPI.getAll();
      setReturns(response.data);
    } catch (error) {
      console.error('Error fetching purchase returns:', error);
      setSnackbar({ 
        open: true, 
        message: 'Gagal memuat data retur', 
        severity: 'error' 
      });
    }
  };

  useEffect(() => {
    fetchReturns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load master produk untuk autocomplete
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await productAPI.getAll();
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Gagal memuat produk:', e);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleUpdateStatus = async (returnId, status) => {
    try {
      await purchaseReturnAPI.updateStatus(returnId, { status });
      setSnackbar({ 
        open: true, 
        message: 'Status retur berhasil diperbarui', 
        severity: 'success' 
      });
      fetchReturns();
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Gagal memperbarui status', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (returnId) => {
    try {
      await purchaseReturnAPI.delete(returnId);
      setSnackbar({ 
        open: true, 
        message: 'Retur pembelian berhasil dihapus', 
        severity: 'success' 
      });
      fetchReturns();
    } catch (error) {
      console.error('Error deleting return:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Gagal menghapus retur pembelian', 
        severity: 'error' 
      });
    }
  };

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalReturn = subtotal - formData.discount + formData.tax;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      totalReturn
    }));
  }, [formData.items, formData.discount, formData.tax]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'invoiceDate') {
        next.invoiceNumber = genInvoiceNumber(value);
      }
      return next;
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...formData.items];
    items[index][name] = name === 'quantity' || name === 'price' ? parseFloat(value) || '' : value;
    
    // Calculate item total if quantity or price changes
    if (name === 'quantity' || name === 'price') {
      items[index].total = items[index].quantity * items[index].price;
    }
    
    setFormData({ ...formData, items });
  };

  // Khusus harga: input berformat Rupiah tanpa .00
  const handlePriceChange = (index, rawValue) => {
    const digits = (rawValue || '').toString().replace(/\D/g, '');
    const price = digits ? parseInt(digits, 10) : '';
    const items = [...formData.items];
    items[index].price = price;
    items[index].total = (items[index].quantity || 0) * (price || 0);
    setFormData({ ...formData, items });
  };

  // Autocomplete: update suggestions berdasarkan input
  const updateSuggestions = (index, raw) => {
    const v = (raw || '').toString().trim().toLowerCase();
    if (!v) {
      setSuggestions(prev => ({ ...prev, [index]: [] }));
      return;
    }
    const matches = products
      .filter(p =>
        (p.name && p.name.toLowerCase().includes(v)) ||
        (p.id && p.id.toString().includes(v)) ||
        (p.barcode && p.barcode.toString().includes(v))
      )
      .slice(0, 8);
    setSuggestions(prev => ({ ...prev, [index]: matches }));
  };

  const handleProductNameChange = (index, value) => {
    const items = [...formData.items];
    items[index].productName = value;
    setFormData({ ...formData, items });
    updateSuggestions(index, value);
    setSuggestionOverlay({ open: true, index });
  };

  const handleProductCodeChange = (index, value) => {
    const items = [...formData.items];
    items[index].productCode = value;
    setFormData({ ...formData, items });
    updateSuggestions(index, value);
    setSuggestionOverlay({ open: true, index });
  };

  const selectProductForItem = (index, product) => {
    const items = [...formData.items];
    items[index].productCode = product?.id ?? product?.barcode ?? '';
    items[index].productName = product?.name ?? '';
    if (!items[index].price || items[index].price === '') {
      items[index].price = product?.harga_beli ?? product?.price ?? 0;
      items[index].total = (items[index].quantity || 0) * (items[index].price || 0);
    }
    if (!items[index].unit) items[index].unit = 'pcs';
    setFormData({ ...formData, items });
    setSuggestions(prev => ({ ...prev, [index]: [] }));
    setSuggestionOverlay({ open: false, index: null });
  };

  const handleProductBlur = (index) => {
    const name = formData.items[index]?.productName?.trim();
    const code = formData.items[index]?.productCode?.toString().trim();
    if (!name && !code) return;
    const exists = products.some(p =>
      (name && p.name?.toLowerCase() === name.toLowerCase()) ||
      (code && (p.id?.toString() === code || p.barcode?.toString() === code))
    );
    if (!exists) {
      setNotFound({ open: true, index, query: name || code });
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async () => {
    try {
      const payload = {
        name: newProduct.name,
        barcode: newProduct.barcode || null,
        price: parseFloat(newProduct.price) || 0,
        harga_beli: parseFloat(newProduct.harga_beli) || 0,
        unit: newProduct.unit || 'pcs',
        stock: parseInt(newProduct.stock, 10) || 0,
      };
      const res = await productAPI.create(payload);
      const created = res.data;
      setProducts(prev => [created, ...prev]);
      if (notFound.index !== null) {
        selectProductForItem(notFound.index, created);
      }
      setShowAddProductModal(false);
      setNotFound({ open: false, index: null, query: '' });
      setSnackbar({ open: true, message: 'Produk berhasil ditambahkan.', severity: 'success' });
    } catch (e) {
      console.error('Gagal menambah produk:', e);
      setSnackbar({ open: true, message: e.response?.data?.message || 'Gagal menambah produk', severity: 'error' });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { 
        productCode: '', 
        productName: '', 
        quantity: 1, 
        unit: 'pcs', 
        price: '' || 0, 
        total: 0,
        reason: '' 
      }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData({ ...formData, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await purchaseReturnAPI.create(formData);
      
      setSnackbar({ 
        open: true, 
        message: 'Retur pembelian berhasil disimpan!', 
        severity: 'success' 
      });
      
      fetchReturns(); // Refresh the list
      
      // Reset form
      setFormData({
        returnNumber: `RET-${new Date().getTime().toString().slice(-6)}`,
        returnDate: new Date().toISOString().slice(0, 10),
        invoiceNumber: genInvoiceNumber(new Date().toISOString().slice(0, 10)),
        invoiceDate: new Date().toISOString().slice(0, 10),
        supplierName: '',
        supplierCode: '',
        supplierContact: '',
        items: [{ 
          productCode: '', 
          productName: '', 
          quantity: 1, 
          unit: 'pcs', 
          price: '' || 0, 
          total: 0,
          reason: '' 
        }],
        subtotal: 0,
        discount: 0,
        tax: 0,
        totalReturn: 0,
        returnMethod: 'refund',
        refundRef: '',
        approvedBy: '',
        supplierRep: '',
        notes: '',
        status: 'processed',
        shippingInfo: '',
      });
      
    } catch (error) {
      console.error('Error saving purchase return:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Gagal menyimpan retur pembelian',
        severity: 'error'
      });
    }
  };




  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl p-6 md:p-1">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <FiRepeat size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Retur Pembelian</h1>
              <p className="text-blue-100 dark:text-blue-200 mt-1">
                Kelola dan buat data retur pembelian ke supplier
              </p>
            </div>
          </div>
        </div>

        <PurchaseReturnList returns={returns} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />

        <div className="mb-6 mt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-4">Form Retur Pembelian Baru</h2>
          <p className="text-gray-600 dark:text-[var(--text-default)]">Isi formulir retur pembelian dengan lengkap dan benar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Header */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-[var(--primary-color)] mr-3 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Informasi Dokumen</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Nomor Retur</label>
                <div className="relative">
                  <input
                    type="text"
                    name="returnNumber"
                    value={formData.returnNumber}
                    onChange={handleInputChange}
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    required
                  />
                  <span className="absolute left-3 top-3 text-gray-400 dark:text-[var(--text-muted)]">#</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Tanggal Retur</label>
                <div className="relative">
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    required
                  />
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400 dark:text-[var(--text-muted)]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Nomor Faktur</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor faktur"
                  className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Tanggal Faktur</label>
                <div className="relative">
                  <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 pl-10 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                  />
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400 dark:text-[var(--text-muted)]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Nama Supplier</label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  placeholder="Cari atau masukkan nama supplier"
                  className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-[var(--text-default)]">Kode Supplier</label>
                <input
                  type="text"
                  name="supplierCode"
                  value={formData.supplierCode}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-[var(--primary-color)] mr-3 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Barang Diretur</h2>
            </div>

            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Kode Barang</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Nama Barang</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Jumlah</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Satuan</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Harga Satuan</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Alasan Retur</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          name="productCode"
                          value={item.productCode}
                          onChange={(e) => handleProductCodeChange(index, e.target.value)}
                          onBlur={() => handleProductBlur(index)}
                          className="w-full p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap relative">
                        <input
                          type="text"
                          name="productName"
                          value={item.productName}
                          onChange={(e) => handleProductNameChange(index, e.target.value)}
                          onBlur={() => handleProductBlur(index)}
                          className="w-full p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                          placeholder={productsLoading ? 'Memuat produk...' : 'Ketik nama produk'}
                        />
                        {/* Saran dipindah ke overlay */}
                        {null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          min="1"
                          className="w-20 p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          name="unit"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-20 p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] appearance-none "
                        >
                          <option value="pcs">pcs</option>
                          <option value="kg">kg</option>
                          <option value="m">m</option>
                          <option value="l">l</option>
                          <option value="pack">pack</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="relative">
                          <span className="absolute left-2 top-2.5 text-gray-500 dark:text-[var(--text-muted)]">Rp</span>
                          <input
                            type="text"
                            name="price"
                            value={item.price === '' ? '' : formatRupiah(item.price)}
                            onChange={(e) => handlePriceChange(index, e.target.value)}
                            className="w-28 p-2 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-[var(--text-default)]">
                        Rp {item.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          name="reason"
                          value={item.reason}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1 rounded-full hover:bg-red-500/10 transition-colors"
                          disabled={formData.items.length <= 1}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-4 flex items-center text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] dark:text-[var(--primary-color)]"
            >
              <FiPlus className="mr-1" /> Tambah Baris Barang
            </button>
          </div>

          {/* Financial Summary */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-[var(--primary-color)] mr-3 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Ringkasan Keuangan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Subtotal</label>
                  <div className="relative">
                    <div className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg bg-gray-50 dark:bg-[var(--bg-secondary)] text-gray-900 dark:text-[var(--text-default)]">
                      <span className="absolute left-2 top-2.5 text-gray-500 dark:text-[var(--text-muted)]">Rp</span>
                      <span className="font-medium">{formatRupiah(formData.subtotal)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Diskon</label>
                  <div className="relative">
                    <span className="absolute left-2 top-2.5 text-gray-500 dark:text-[var(--text-muted)]">Rp</span>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">PPN</label>
                  <div className="relative">
                    <span className="absolute left-2 top-2.5 text-gray-500 dark:text-[var(--text-muted)]">Rp</span>
                    <input
                      type="number"
                      name="tax"
                      value={formData.tax}
                      onChange={handleInputChange}
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Metode Retur</label>
                  <div className="relative">
                    <select
                      name="returnMethod"
                      value={formData.returnMethod}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] appearance-none dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    >
                      <option value="refund">Pengembalian Dana</option>
                      <option value="replace">Penggantian Barang</option>
                      <option value="credit">Pemotongan Hutang</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400 dark:text-[var(--text-muted)] pointer-events-none" />
                  </div>

                </div>
              </div>

              <div className="bg-blue-50 dark:bg-[var(--primary-color)]/10 p-4 rounded-lg border border-blue-100 dark:border-[var(--primary-color)]/30">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Total Retur</label>
                  <div className="relative">
                    <div className="w-full p-2.5 pl-8 border border-blue-200 dark:border-[var(--primary-color)]/50 rounded-lg bg-blue-50 dark:bg-transparent">
                      <span className="absolute left-2 top-2.5 text-blue-600 dark:text-[var(--primary-color)]">Rp</span>
                      <span className="font-semibold text-blue-800 dark:text-[var(--primary-color)]">{formatRupiah(formData.totalReturn)}</span>
                    </div>
                  </div>
                </div>

                {formData.returnMethod === 'refund' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Referensi Pengembalian</label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-2 top-3 text-gray-500 dark:text-[var(--text-muted)]" />
                      <input
                        type="text"
                        name="refundRef"
                        value={formData.refundRef}
                        onChange={handleInputChange}
                        placeholder="Nomor referensi"
                        className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Approval and Notes */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)]">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-[var(--primary-color)] mr-3 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Persetujuan & Catatan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Disetujui Oleh</label>
                  <div className="relative">
                    <FiUser className="absolute left-2 top-3 text-gray-500 dark:text-[var(--text-muted)]" />
                    <input
                      type="text"
                      name="approvedBy"
                      value={formData.approvedBy}
                      onChange={handleInputChange}
                      placeholder="Nama penanggung jawab"
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Perwakilan Supplier</label>
                  <div className="relative">
                    <FiUser className="absolute left-2 top-3 text-gray-500 dark:text-[var(--text-muted)]" />
                    <input
                      type="text"
                      name="supplierRep"
                      value={formData.supplierRep}
                      onChange={handleInputChange}
                      placeholder="Nama perwakilan supplier"
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Status Retur</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                  >
                    <option value="processed">Diproses</option>
                    <option value="completed">Selesai</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Info Pengiriman</label>
                  <div className="relative">
                    <FiTruck className="absolute left-2 top-3 text-gray-500 dark:text-[var(--text-muted)]" />
                    <input
                      type="text"
                      name="shippingInfo"
                      value={formData.shippingInfo}
                      onChange={handleInputChange}
                      placeholder="No. resi, kurir, dll."
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Catatan Tambahan</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                placeholder="Syarat khusus, ketentuan retur, atau informasi tambahan lainnya..."
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-medium rounded-lg shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
            >
              Simpan Retur Pembelian
            </button>
          </div>
        </form>

        {/* Overlay Saran Produk */}
        {suggestionOverlay.open && Array.isArray(suggestions[suggestionOverlay.index]) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40" onClick={() => setSuggestionOverlay({ open: false, index: null })}>
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-xl p-4 w-full max-w-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold mb-2 text-gray-800 dark:text-[var(--text-default)]">Pilih Barang</h3>
              <div className="max-h-80 overflow-auto divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                {suggestions[suggestionOverlay.index].length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 dark:text-[var(--text-muted)]">Tidak ada produk cocok.</div>
                ) : (
                  suggestions[suggestionOverlay.index].map((p) => (
                    <div key={p.id} className="p-3 hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] cursor-pointer" onClick={() => selectProductForItem(suggestionOverlay.index, p)}>
                      <div className="text-sm text-gray-800 dark:text-[var(--text-default)]">{p.name}</div>
                      <div className="text-xs text-gray-500 dark:text-[var(--text-muted)]">ID: {p.id}{p.barcode ? ` • Barcode: ${p.barcode}` : ''}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 text-right">
                <button className="px-3 py-1.5 border border-gray-300 dark:border-[var(--border-default)] rounded text-sm" onClick={() => setSuggestionOverlay({ open: false, index: null })}>Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* Popup: Produk tidak ditemukan */}
        {notFound.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-xl p-5 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)] mb-2">Produk tidak ditemukan</h3>
              <p className="text-sm text-gray-600 dark:text-[var(--text-muted)]">"{notFound.query}" belum termasuk produk yang ada saat ini.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg text-gray-700 dark:text-[var(--text-default)] hover:bg-gray-50 dark:hover:bg-[var(--bg-default)]"
                  onClick={() => setNotFound({ open: false, index: null, query: '' })}
                >
                  Catat saja
                </button>
                <button
                  className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white rounded-lg"
                  onClick={() => { setNewProduct(prev => ({ ...prev, name: notFound.query })); setShowAddProductModal(true); }}
                >
                  Tambah ke database
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Tambah Produk */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-xl p-5 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)] mb-3">Tambah Produk Baru</h3>
              <div className="grid grid-cols-1 gap-3">
                <input name="name" value={newProduct.name} onChange={handleNewProductChange} className="p-2 border rounded dark:bg-[var(--bg-secondary)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]" placeholder="Nama produk" />
                <input name="barcode" value={newProduct.barcode} onChange={handleNewProductChange} className="p-2 border rounded dark:bg-[var(--bg-secondary)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]" placeholder="Barcode/SKU (opsional)" />
                <input name="harga_beli" value={newProduct.harga_beli} onChange={handleNewProductChange} className="p-2 border rounded dark:bg-[var(--bg-secondary)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]" placeholder="Harga Beli" type="number" />
                <input name="price" value={newProduct.price} onChange={handleNewProductChange} className="p-2 border rounded dark:bg-[var(--bg-secondary)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]" placeholder="Harga Jual (opsional)" type="number" />
                <input name="stock" value={newProduct.stock} onChange={handleNewProductChange} className="p-2 border rounded dark:bg-[var(--bg-secondary)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]" placeholder="Stok awal" type="number" />
                <select name="unit" value={newProduct.unit} onChange={handleNewProductChange} className="p-2 border rounded dark:bg-[var(--bg-secondary)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]">
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="m">m</option>
                  <option value="l">l</option>
                  <option value="pack">pack</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg" onClick={() => { setShowAddProductModal(false); setNotFound({ open: false, index: null, query: '' }); }}>Batal</button>
                <button className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white rounded-lg" onClick={handleCreateProduct}>Simpan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturPembelianPage;
