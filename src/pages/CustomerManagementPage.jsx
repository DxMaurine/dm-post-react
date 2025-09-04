import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { customerAPI } from '../api'; // Pastikan path sesuai
import React from 'react';

const CustomerManagementPage = () => {
  const { setSnackbar } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    customer_type: 'Umum' 
  });

  // Token tidak perlu diambil manual lagi

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data);
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
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (customer = null) => {
    setCurrentCustomer(customer);
    setFormData(customer ? { 
      name: customer.name, 
      email: customer.email, 
      phone: customer.phone, 
      address: customer.address, 
      customer_type: customer.customer_type || 'Umum' 
    } : { 
      name: '', 
      email: '', 
      phone: '', 
      address: '', 
      customer_type: 'Umum' 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCustomer) {
        await customerAPI.update(currentCustomer.id, formData);
        setSnackbar({ 
          open: true, 
          message: 'Pelanggan berhasil diperbarui!', 
          severity: 'success' 
        });
      } else {
        await customerAPI.create(formData);
        setSnackbar({ 
          open: true, 
          message: 'Pelanggan berhasil dibuat!', 
          severity: 'success' 
        });
      }
      fetchCustomers();
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

  const handleDelete = async (customerId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      try {
        await customerAPI.delete(customerId);
        setSnackbar({ 
          open: true, 
          message: 'Pelanggan berhasil dihapus!', 
          severity: 'success' 
        });
        fetchCustomers();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        });
      }
    }
  };

  const getCustomerTypeBadge = (type) => {
    let bgColor = '';
    let textColor = '';
    
    switch(type) {
      case 'Member':
        bgColor = 'bg-indigo-100 dark:bg-indigo-900/50';
        textColor = 'text-indigo-800 dark:text-indigo-300';
        break;
      case 'VIP':
        bgColor = 'bg-amber-100 dark:bg-amber-900/50';
        textColor = 'text-amber-800 dark:text-amber-300';
        break;
      default: // Umum
        bgColor = 'bg-emerald-100 dark:bg-emerald-900/50';
        textColor = 'text-emerald-800 dark:text-emerald-300';
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="w-full  p-6 bg-gray-50 dark:bg-[var(--bg-default)] rounded-xl">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Customer Management</h1>
            <p className="text-gray-500 dark:text-[var(--text-muted)]">Manage and organize your customer data</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-medium py-2.5 px-6 rounded-lg flex items-center transition-colors duration-200 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--border-default)] flex-1 flex flex-col overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-secondary)] flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-800 dark:text-[var(--text-default)]">Customer List</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari customers..."
                className="pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-64 bg-white dark:bg-[var(--bg-default)] border border-gray-300 dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
              <thead className="bg-gray-50 dark:bg-[var(--bg-default)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loyalty Points</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member ID</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        No customers found
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">{customer.name}</div>
                            <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">{customer.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-[var(--text-default)]">{customer.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-[var(--text-muted)] max-w-xs">{customer.address || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCustomerTypeBadge(customer.customer_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-[var(--text-default)]">{customer.loyalty_points}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-muted)]">
                        {customer.customer_uuid || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenModal(customer)} 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(customer.id)} 
                            className="text-red-600 dark:text-red-400 hover:text-red-900 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-secondary)] flex items-center justify-between">
            <div className="flex-1 flex justify-between items-center">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-[var(--border-default)] text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[var(--bg-default)] hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {[1, 2, 3, 4, 5].map((page) => (
                      <a
                        key={page}
                        href="#"
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === 1 ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-300' : 'bg-white dark:bg-[var(--bg-secondary)] border-gray-300 dark:border-[var(--border-default)] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        {page}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-[var(--border-default)] text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[var(--bg-default)] hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Ubah Pelanggan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-[var(--border-default)]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-[var(--border-default)]">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">
                {currentCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Customer Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, customer_type: 'Umum'})}
                      className={`py-2 px-3 rounded-lg border transition-colors text-sm ${formData.customer_type === 'Umum' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-medium' : 'bg-white dark:bg-[var(--bg-default)] border-gray-300 dark:border-[var(--border-default)] text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)]'}`}
                    >
                      Umum
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, customer_type: 'Member'})}
                      className={`py-2 px-3 rounded-lg border transition-colors text-sm ${formData.customer_type === 'Member' ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 font-medium' : 'bg-white dark:bg-[var(--bg-default)] border-gray-300 dark:border-[var(--border-default)] text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)]'}`}
                    >
                      Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, customer_type: 'VIP'})}
                      className={`py-2 px-3 rounded-lg border transition-colors text-sm ${formData.customer_type === 'VIP' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-medium' : 'bg-white dark:bg-[var(--bg-default)] border-gray-300 dark:border-[var(--border-default)] text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)]'}`}
                    >
                      VIP
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Address</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-colors duration-200 bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]" 
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-5 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg font-medium text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-default)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[var(--primary-color)] rounded-lg font-medium text-white hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
                >
                  {currentCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;