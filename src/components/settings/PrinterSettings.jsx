// PrinterSettings.jsx
import { useState } from 'react';
import React from 'react';

const PrinterSettings = ({ formState, handleChange, context, setFeedback }) => {
  const [isTestingPrinter, setIsTestingPrinter] = useState(false);
  
  const handleTestPrinter = async () => {
    setIsTestingPrinter(true);
    try {
      await context.testPrinterConnection(formState.printerSettings);
      setFeedback({ message: 'Printer berhasil terhubung!', type: 'success' });
    } catch (error) {
      setFeedback({ message: `Gagal menghubungkan printer: ${error.message}`, type: 'error' });
    } finally {
      setIsTestingPrinter(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">Pengaturan Printer</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="printerType">
              Tipe Printer
            </label>
            <select
              name="printerType"
              id="printerType"
              value={formState.printerType || 'thermal_80mm'}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            >
              <option value="thermal_80mm">Thermal 80mm</option>
              <option value="thermal_58mm">Thermal 58mm</option>
              <option value="dot_matrix">Dot Matrix</option>
              <option value="network_printer">Network Printer</option>
              <option value="usb_printer">USB Printer</option>
              <option value="bluetooth_printer">Bluetooth Printer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="printerName">
              Nama Printer/Port
            </label>
            <input
              type="text"
              name="printerName"
              id="printerName"
              value={formState.printerName || ''}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
              placeholder="Nama printer atau COM port"
            />
          </div>
          
          {formState.printerType === 'network_printer' && (
            <>
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="printerIp">
                  IP Address Printer
                </label>
                <input
                  type="text"
                  name="printerIp"
                  id="printerIp"
                  value={formState.printerIp || ''}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="printerPort">
                  Port
                </label>
                <input
                  type="number"
                  name="printerPort"
                  id="printerPort"
                  value={formState.printerPort || 9100}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="receiptCopies">
              Jumlah Copy Struk
            </label>
            <input
              type="number"
              name="receiptCopies"
              id="receiptCopies"
              min="1"
              max="5"
              value={formState.receiptCopies || 1}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2">
              Opsi Cetak
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="printLogo"
                  id="printLogo"
                  checked={formState.printLogo || false}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-[var(--primary-color)] rounded focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                />
                <span className="ml-2 text-gray-700 dark:text-[var(--text-default)]">Aktifkan cetak logo</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="autoPrint"
                  id="autoPrint"
                  checked={formState.autoPrint || false}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-[var(--primary-color)] rounded focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                />
                <span className="ml-2 text-gray-700 dark:text-[var(--text-default)]">Auto print setelah transaksi</span>
              </label>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              onClick={handleTestPrinter}
              disabled={isTestingPrinter}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-[var(--primary-color)] dark:hover:bg-[var(--primary-color-hover)] text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 shadow-md hover:shadow-lg mr-4"
            >
              {isTestingPrinter ? 'Menguji...' : 'Test Printer'}
            </button>
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-[var(--bg-secondary)] dark:hover:bg-[var(--border-default)] text-gray-800 dark:text-[var(--text-default)] font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Print Test Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettings;