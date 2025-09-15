import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { discountAPI } from '../api'; // Import the API service
import Swal from 'sweetalert2';
import React from 'react';

const formatRupiah = (amount) => {
  return 'Rp' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const DiscountManagementPage = () => {
  const { setSnackbar } = useOutletContext();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage',
    value: '',
    start_date: '',
    end_date: '',
    active: true,
    customer_type: '',
  });
  const [editingDiscount, setEditingDiscount] = useState(null);
  

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await discountAPI.getAll();
      setDiscounts(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat diskon';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDiscount(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingDiscount(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingDiscount) {
        await discountAPI.update(editingDiscount.id, editingDiscount);
      } else {
        await discountAPI.create(newDiscount);
      }

      setSnackbar({ open: true, message: 'Diskon berhasil disimpan!', severity: 'success' });
      setNewDiscount({
        code: '',
        type: 'percentage',
        value: '',
        start_date: '',
        end_date: '',
        active: true,
        customer_type: '',
      });
      setEditingDiscount(null);
      fetchDiscounts();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menyimpan diskon';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount({
      ...discount,
      start_date: discount.start_date ? new Date(discount.start_date).toISOString().split('T')[0] : '',
      end_date: discount.end_date ? new Date(discount.end_date).toISOString().split('T')[0] : '',
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan dapat mengembalikan diskon ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setLoading(true);
      setError(null);
      try {
        await discountAPI.delete(id);
        Swal.fire(
          'Terhapus!',
          'Diskon berhasil dihapus.',
          'success'
        );
        fetchDiscounts();
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Gagal menghapus diskon';
        setError(errorMessage);
        Swal.fire(
          'Gagal!',
          errorMessage,
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const isExpired = (discount) => {
    if (!discount.end_date) return false;
    const endOfDay = new Date(discount.end_date);
    endOfDay.setHours(23, 59, 59, 999); // Set ke akhir hari
    return endOfDay < new Date(); // Bandingkan dengan waktu sekarang
  };

  // Function to get customer type color
  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'Umum':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ASN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Dropshipper':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="w-full max-w-7xl p-6 bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Manajemen Diskon & Promo</h2>
          <p className="text-gray-500 dark:text-[var(--text-muted)]">Kelola diskon dan promo untuk pelanggan</p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 border-2 border-gray-200 dark:border-[var(--border-default)] rounded-xl bg-gray-50 dark:bg-[var(--bg-secondary)] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">
            {editingDiscount ? 'Edit Diskon' : 'Tambah Diskon Baru'}
          </h3>
          {editingDiscount && (
            <button
              type="button"
              onClick={() => setEditingDiscount(null)}
              className="text-gray-400 dark:text-[var(--text-muted)] hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[var(--bg-default)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Kode Diskon</label>
            <input
              type="text"
              name="code"
              value={editingDiscount ? editingDiscount.code : newDiscount.code}
              onChange={editingDiscount ? handleEditChange : handleChange}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Tipe Diskon</label>
            <select
              name="type"
              value={editingDiscount ? editingDiscount.type : newDiscount.type}
              onChange={editingDiscount ? handleEditChange : handleChange}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
              required
            >
              <option value="percentage">Persentase (%)</option>
              <option value="fixed">Jumlah Tetap (Rp)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">
              Nilai {editingDiscount?.type === 'percentage' || newDiscount.type === 'percentage' ? '(%)' : '(Rp)'}
            </label>
            <input
              type="number"
              name="value"
              value={editingDiscount ? editingDiscount.value : newDiscount.value}
              onChange={editingDiscount ? handleEditChange : handleChange}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
              step={editingDiscount?.type === 'percentage' || newDiscount.type === 'percentage' ? "0.01" : "1"}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Tipe Pelanggan</label>
            <select
              name="customer_type"
              value={editingDiscount ? editingDiscount.customer_type : newDiscount.customer_type}
              onChange={editingDiscount ? handleEditChange : handleChange}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
            >
              <option value="">Semua Pelanggan</option>
              <option value="Umum">Umum</option>
              <option value="ASN">ASN</option>
              <option value="Dropshipper">Dropshipper</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Tanggal Mulai</label>
            <input
              type="date"
              name="start_date"
              value={editingDiscount ? editingDiscount.start_date : newDiscount.start_date}
              onChange={editingDiscount ? handleEditChange : handleChange}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Tanggal Berakhir</label>
            <input
              type="date"
              name="end_date"
              value={editingDiscount ? editingDiscount.end_date : newDiscount.end_date}
              onChange={editingDiscount ? handleEditChange : handleChange}
              className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all duration-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={editingDiscount ? editingDiscount.active : newDiscount.active}
              onChange={editingDiscount ? handleEditChange : handleChange}
              className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 dark:border-[var(--border-default)] rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-[var(--text-default)]">Diskon Aktif</label>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] rounded-lg text-white font-medium shadow-md transition-all duration-200 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Simpan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Discounts Table */}
      <div className="overflow-x-auto rounded-xl overflow-hidden shadow-sm border-2 border-gray-100 dark:border-[var(--border-default)]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
          <thead className="bg-gray-50 dark:bg-[var(--bg-default)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider rounded-tl-xl">Kode</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Tipe</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Nilai</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Pelanggan</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Mulai</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Berakhir</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider rounded-tr-xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                  </div>
                </td>
              </tr>
            ) : discounts.length > 0 ? (
              discounts.map((discount, index) => (
                <tr key={discount.id} className={index % 2 === 0 ? 'bg-white dark:bg-[var(--bg-secondary)]' : 'bg-gray-50 dark:bg-[var(--bg-secondary)]'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">
                    <span className="font-mono bg-blue-100/50 dark:bg-blue-500 text-blue-700 dark:text-white px-2 py-1 rounded-md">{discount.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-muted)]">
                    {discount.type === 'percentage' ? 'Persentase' : 'Tetap'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    {discount.type === 'percentage' ? (
                      <span className="font-mono bg-blue-100/50 dark:bg-blue-500 text-blue-700 dark:text-white px-2 py-1 rounded-md">{discount.value}%</span>
                    ) : (
                      <span className="font-mono bg-blue-100/50 dark:bg-blue-500 text-blue-700 dark:text-white px-2 py-1 rounded-md">{formatRupiah(discount.value)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCustomerTypeColor(discount.customer_type)}`}>
                      {discount.customer_type || 'Semua'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-[var(--text-muted)]">
                    {discount.start_date ? new Date(discount.start_date).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-[var(--text-muted)]">
                    {discount.end_date ? new Date(discount.end_date).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      discount.active
                        ? isExpired(discount)
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-400' // Kuning: Kadaluarsa
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' // Hijau: Aktif
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400' // Merah: Nonaktif manual
                    }`}>
                      {discount.active
                        ? isExpired(discount)
                          ? 'Kadaluarsa'
                          : 'Aktif'
                        : 'Nonaktif'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-600 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors duration-200"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-600 dark:hover:text-red-700 p-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
                        title="Hapus"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-[var(--text-muted)]">
                  Tidak ada data diskon yang tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default DiscountManagementPage;
