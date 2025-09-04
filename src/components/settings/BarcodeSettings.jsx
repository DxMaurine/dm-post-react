// BarcodeSettings.jsx
import React from 'react';
const BarcodeSettings = ({ formState, handleChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">Pengaturan Barcode</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="barcodeType">
              Tipe Barcode
            </label>
            <select
              name="barcodeType"
              id="barcodeType"
              value={formState.barcodeType || 'code128'}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-border-default rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-color bg-white dark:bg-bg-secondary"
            >
              <option value="code128">CODE 128</option>
              <option value="ean13">EAN-13</option>
              <option value="upc">UPC</option>
              <option value="code39">CODE 39</option>
              <option value="itf14">ITF-14</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="barcodeWidth">
              Lebar Barcode (mm)
            </label>
            <input
              type="number"
              name="barcodeWidth"
              id="barcodeWidth"
              min="10"
              max="100"
              value={formState.barcodeWidth || 50}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-border-default rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-bg-secondary dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-color"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="barcodeHeight">
              Tinggi Barcode (mm)
            </label>
            <input
              type="number"
              name="barcodeHeight"
              id="barcodeHeight"
              min="10"
              max="100"
              value={formState.barcodeHeight || 30}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-border-default rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-bg-secondary dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-color"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2">
              Opsi Barcode
            </label>
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="barcodeText"
                  id="barcodeText"
                  checked={formState.barcodeText || true}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-primary-color rounded focus:ring-blue-500 dark:focus:ring-primary-color"
                />
                <span className="ml-2 text-gray-700 dark:text-[var(--text-default)]">Tampilkan teks di bawah barcode</span>
              </label>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-primary-bg-dark dark:hover:bg-primary-color-hover text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Generate Test Barcode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeSettings;