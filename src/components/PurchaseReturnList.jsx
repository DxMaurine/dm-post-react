import { useState } from 'react';
import { FiList, FiEdit, FiTrash2 } from 'react-icons/fi';
import UpdatePurchaseReturnStatusModal from './UpdatePurchaseReturnStatusModal';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import React from 'react';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    default: // pending
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
  }
};

const PurchaseReturnList = ({ returns, onUpdateStatus, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Custom SweetAlert configuration
  const showSweetAlert = (config) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const defaultConfig = {
      background: isDarkMode ? 'var(--bg-secondary)' : '#ffffff',
      color: isDarkMode ? 'var(--text-default)' : '#000000',
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      },
      customClass: {
        popup: 'rounded-3xl shadow-2xl border border-gray-200 dark:border-[var(--border-default)] !max-w-sm !text-sm',
        title: 'text-lg font-bold mb-1',
        content: 'text-xs leading-relaxed',
        confirmButton: 'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg',
        cancelButton: 'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg mr-2'
      },
      buttonsStyling: false,
      allowOutsideClick: true,
      allowEscapeKey: true,
      focusConfirm: true
    };
    
    return Swal.fire({
      ...defaultConfig,
      ...config
    });
  };

  const handleOpenModal = (purchaseReturn) => {
    setSelectedReturn(purchaseReturn);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedReturn(null);
    setIsModalOpen(false);
  };

  const handleSaveStatus = async (returnId, status) => {
    if (onUpdateStatus) {
      await onUpdateStatus(returnId, status);
    }
    handleCloseModal();
  };

  const handleDelete = async (purchaseReturn) => {
    const result = await showSweetAlert({
      icon: 'warning',
      title: 'Hapus Retur Pembelian? 🗑️',
      html: `<div class="text-center">
               <p class="mb-2">Apakah Anda yakin ingin menghapus retur ini?</p>
               <div class="bg-gray-100 dark:bg-[var(--bg-default)] p-3 rounded-lg mt-3">
                 <p class="font-bold text-[var(--primary-color)]">${purchaseReturn.return_number}</p>
                 <p class="text-sm text-[var(--text-muted)]">Supplier: ${purchaseReturn.supplier_name}</p>
                 <p class="text-sm text-[var(--text-muted)]">Total: Rp ${purchaseReturn.total_return.toLocaleString('id-ID')}</p>
               </div>
               <p class="text-sm mt-3 text-red-600 dark:text-red-400">⚠️ Data yang dihapus tidak dapat dikembalikan!</p>
             </div>`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'var(--primary-color)',
      iconColor: '#f59e0b'
    });

    if (result.isConfirmed && onDelete) {
      await onDelete(purchaseReturn.id);
    }
  };


  if (!returns || returns.length === 0) {
    return (
      <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)] mb-6">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-blue-600 dark:bg-blue-500 mr-3 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Retur Pembelian Terakhir</h2>
        </div>
        <p className="text-gray-500 dark:text-[var(--text-muted)]">Belum ada data retur pembelian.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)] mb-6">
        <div className="flex items-center mb-4">
          <FiList className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Retur Pembelian Terakhir</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
            <thead className="bg-gray-50 dark:bg-[var(--bg-default)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No. Retur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-[var(--text-default)]">{ret.return_number}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(ret.return_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{ret.supplier_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Rp {ret.total_return.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(ret.status)}`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(ret)}
                        className="text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] transition-colors duration-200"
                        title="Edit Status"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ret)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        title="Hapus Retur"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <UpdatePurchaseReturnStatusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        purchaseReturn={selectedReturn}
        onSave={handleSaveStatus}
      />
    </>
  );
};

export default PurchaseReturnList;
