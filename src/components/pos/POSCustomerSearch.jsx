import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import React from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
const POSCustomerSearch = ({
  customerSearch,
  selectedCustomer,
  searchResults,
  onSearchChange,
  onCustomerSelect,
  onCustomerRemove,
  onAddCustomer, // Tambahkan prop baru
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
        popup: 'rounded-xl p-4 bg-white shadow-2xl border border-gray-200 dark:border-[var(--border-default)] !max-w-sm !text-sm',
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

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Check if there are search results
      if (customerSearch.trim() && searchResults.length === 0) {
        // Show SweetAlert error
        showSweetAlert({
          icon: 'error',
          title: 'Pelanggan Tidak Ditemukan! 😔',
          html: `<div class="text-center">
                   <p class="mb-2">Tidak ditemukan pelanggan dengan nama atau ID:</p>
                   <div class="bg-gray-100 dark:bg-[var(--bg-default)] p-3 rounded-lg mt-3">
                     <p class="font-bold text-[var(--primary-color)]">${customerSearch}</p>
                   </div>
                   <p class="text-sm mt-3 text-[var(--text-muted)]">💡 Coba gunakan kata kunci yang berbeda atau tambah pelanggan baru</p>
                 </div>`,
          confirmButtonText: 'Oke, Mengerti',
          confirmButtonColor: 'var(--primary-color)',
          iconColor: '#ef4444',
          timer: 4000,
          timerProgressBar: true
        });
      } else if (searchResults.length === 1) {
        // Auto-select if only one result
        onCustomerSelect(searchResults[0]);
      }
    }
  };

  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2" data-pos-no-refocus>
      <div className="flex-1 relative">
        <input
          type="text"
          className="w-full bg-white dark:bg-[var(--bg-default)] rounded-lg p-2 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-gray-900 dark:text-[var(--text-muted)] border border-gray-200 dark:border-[var(--border-default)]"
          placeholder="Cari pelanggan (nama atau ID member)..."
          value={customerSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          onKeyDown={handleKeyDown}
        />
        <span className="absolute left-3 top-2.5 text-gray-400 dark:text-[var(--text-muted)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </span>
      </div>

      {/* Tombol Tambah Pelanggan Baru */}
      <button
        onClick={onAddCustomer}
        className="bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white p-2 rounded-lg flex-shrink-0 transition-colors duration-200"
        title="Tambah Pelanggan Baru"
      >
        <FiUserPlus size={24} />
      </button>

      {selectedCustomer && (
        <div className="bg-gray-100 dark:bg-[var(--bg-secondary)] p-2 rounded-lg text-gray-800 dark:text-[var(--text-default)] text-sm font-medium flex items-center gap-2 border border-gray-200 dark:border-[var(--border-default)]">
          <span>Pelanggan: {selectedCustomer.name}</span>
          <span>Poin: {selectedCustomer.loyalty_points}</span>
          <button 
            onClick={onCustomerRemove}
            className="text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {isSearchFocused && searchResults.length > 0 && (
        <div className="absolute mt-12 w-full max-w-md bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-md border border-gray-200 dark:border-[var(--border-default)] max-h-48 overflow-y-auto z-20">
          <ul className="divide-y divide-gray-200 dark:divide-[var(--border-default)]">
            {searchResults.map(customer => (
              <li 
                key={customer.id} 
                className="p-3 hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] cursor-pointer flex justify-between items-center transition-colors duration-200"
                onMouseDown={() => onCustomerSelect(customer)}
              >
                <span className="text-gray-900 dark:text-[var(--text-default)]">
                  {customer.name} ({customer.customer_uuid})
                </span>
                <span className="text-gray-500 dark:text-[var(--text-muted)] text-sm">
                  Poin: {customer.loyalty_points}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default POSCustomerSearch;