import { forwardRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import React from 'react';

const POSProductSearch = forwardRef(({ search, onSearchChange, onSearchSubmit, onScannerOpen }, ref) => {
  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
      <div className="flex-1 relative">
        <input 
          ref={ref}
          type="text" 
          className="w-full dark:bg-[var(--layout-bg-dark)] rounded-lg p-2 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white  dark:text-white" 
          placeholder="Cari atau scan produk (F2 untuk fokus)..." 
          value={search} 
          onChange={(e) => onSearchChange(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
        />
        <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-400">
          <FiSearch size={20} />
        </span>
      </div>
      <button onClick={onScannerOpen} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white p-2 rounded-lg" title="Scan Barcode (F4)">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10M8 7v10M12 7v10M16 7v10M20 7v10" />
        </svg>
      </button>
    </div>
  );
});

export default POSProductSearch;