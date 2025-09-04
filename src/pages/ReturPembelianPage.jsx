import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPlus, FiTrash2, FiChevronDown, FiCalendar, FiUser, FiTruck, FiDollarSign } from 'react-icons/fi';
import PurchaseReturnList from '../components/PurchaseReturnList';
import { purchaseReturnAPI } from '../api';
import React from 'react';

// Helper function to format currency
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID').format(number);
};

const ReturPembelianPage = () => {
  const { setSnackbar } = useOutletContext();
  const [returns, setReturns] = useState([]);
  const [formData, setFormData] = useState({
    returnNumber: `RET-${new Date().getTime().toString().slice(-6)}`,
    returnDate: new Date().toISOString().slice(0, 10),
    invoiceNumber: '',
    invoiceDate: '',
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
    setFormData({ ...formData, [name]: value });
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
        invoiceNumber: '',
        invoiceDate: '',
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
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--layout-bg-dark)] rounded-xl p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <PurchaseReturnList returns={returns} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-4">Form Retur Pembelian</h1>
          <p className="text-gray-600 dark:text-[var(--text-muted)]">Isi formulir retur pembelian dengan lengkap dan benar</p>
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
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                  className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                  className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                  className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                <thead className="bg-gray-50 dark:bg-[var(--bg-default)]">
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
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          name="productName"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          min="1"
                          className="w-20 p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          name="unit"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-20 p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)] appearance-none "
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
                            type="number"
                            name="price"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-28 p-2 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                          className="w-full p-2 border border-gray-300 dark:border-[var(--border-default)] rounded focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                    <div className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg bg-gray-50 dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]">
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
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                      className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] appearance-none dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                        className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                    className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                      className="w-full p-2.5 pl-8 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
                className="w-full p-2.5 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
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
      </div>
    </div>
  );
};

export default ReturPembelianPage;
