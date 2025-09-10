import React from 'react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPlus, FiList, FiSearch, FiEdit, FiTrash2, FiUserPlus, FiX } from 'react-icons/fi';
import { supplierAPI } from '../api'; // Pastikan path sesuai
import Swal from 'sweetalert2';

const SupplierManagementPage = () => {
  const { setSnackbar } = useOutletContext();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const canModify = user && (user.role === 'admin' || user.role === 'manager');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (supplier = null) => {
    setCurrentSupplier(supplier);
    setFormData(supplier ? { name: supplier.name, email: supplier.email, phone: supplier.phone, address: supplier.address } : { name: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSupplier) {
        await supplierAPI.update(currentSupplier.id, formData);
        setSnackbar({ 
          open: true, 
          message: 'Supplier berhasil diperbarui!', 
          severity: 'success' 
        });
      } else {
        await supplierAPI.create(formData);
        setSnackbar({ 
          open: true, 
          message: 'Supplier berhasil dibuat!', 
          severity: 'success' 
        });
      }
      fetchSuppliers();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (supplierId) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan dapat mengembalikan data supplier ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await supplierAPI.delete(supplierId);
        Swal.fire(
          'Terhapus!',
          'Supplier berhasil dihapus.',
          'success'
        );
        fetchSuppliers();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire(
          'Gagal!',
          errorMessage,
          'error'
        );
      }
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm)) ||
    (supplier.address && supplier.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full p-6 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Manajemen Supplier</h1>
            <p className="text-gray-500 dark:text-[var(--text-muted)]">Kelola dan atur data supplier Anda</p>

          </div>
          {canModify && (
            <button 
              onClick={() => handleOpenModal()} 
              className="bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-medium py-2.5 px-6 rounded-lg flex items-center transition-colors duration-200 shadow-md"
            >
              <FiPlus className="h-5 w-5 mr-2" />
              Tambah Supplier
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--border-default)] flex-1 flex flex-col overflow-hidden">

          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-secondary)] flex justify-between items-center">

            <div className="flex items-center">
              <FiList className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="font-medium text-gray-700 dark:text-[var(--text-default)]">Daftar Supplier</span>
            </div>
            <div className="relative">

              <input
                type="text"
                placeholder="Cari supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-64 bg-white dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
              />
              <FiSearch className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
              <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kontak</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alamat</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">

                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">

                      <div className="flex flex-col items-center justify-center">
                        <FiUserPlus className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />

                        Belum ada supplier
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors duration-150">

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                            {supplier.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">{supplier.name}</div>
                            <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">{supplier.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-[var(--text-default)]">{supplier.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs dark:text-[var(--text-muted)]">{supplier.address || '-'}</div>

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canModify && (
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleOpenModal(supplier)} 
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                              title="Ubah"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(supplier.id)} 
                              className="text-red-600 dark:text-red-400 hover:text-red-900 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                              title="Hapus"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Ubah Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl w-full max-w-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-secondary)]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-default)]">

                {currentSupplier ? 'Ubah Supplier' : 'Tambah Supplier Baru'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 dark:text-gray-300 hover:text-gray-500 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Nama Lengkap</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Nomor Telepon</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Alamat</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]" rows="3"></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[var(--bg-secondary)] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                  {currentSupplier ? 'Simpan Perubahan' : 'Tambah Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagementPage;