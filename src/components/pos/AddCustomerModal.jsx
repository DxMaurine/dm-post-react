import { useState, useEffect, useRef } from 'react';
import React from 'react';

const AddCustomerModal = ({ show, onClose, onSave, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'Umum',
  });

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Auto-focus the name input when modal opens
      setTimeout(() => nameInputRef.current?.focus(), 100);
    } else {
      // Reset form when modal is closed
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: 'Umum',
      });
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onError('Nama pelanggan tidak boleh kosong!');
      return;
    }
    onSave(formData);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[var(--border-default)]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">
            Tambah Pelanggan Baru
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-default)] focus:outline-none transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Nama Pelanggan *</label>
              <input ref={nameInputRef} type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">No. Telepon</label>
                <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]" />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Alamat</label>
              <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]"></textarea>
            </div>
            <div>
              <label htmlFor="customer_type" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Tipe Pelanggan</label>
              <select name="customer_type" id="customer_type" value={formData.customer_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)]">
                <option value="Umum">Umum</option>
                <option value="Member">Member</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg font-medium text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-default)]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--primary-color)] rounded-lg font-medium text-white hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
            >
              Simpan Pelanggan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
