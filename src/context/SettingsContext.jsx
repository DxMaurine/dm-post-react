import React from 'react';
import { createContext, useState, useEffect } from 'react';

const defaultSettings = {
  // General Settings
  storeName: 'DM FOTOCOPY',
  storeTagline: 'Partner Kerja Anda',
  runningText: 'Selamat datang di DM Fotocopy! Nikmati berbagai promo menarik kami.',
  runningTextBgColor: 'bg-blue-100 dark:bg-blue-900', // light blue
  runningTextTextColor: 'text-blue-800 dark:text-blue-200', // dark blue
  runningTextSpeed: 20, // seconds for one loop
  storeAddress: 'Jl. Penawangan - sedadi km.5, Penawangan',
  receiptFooter: 'Barang yang sudah dibeli, tidak bisa dikembalikan atau diretur tanpa perjanjian terlebih dahulu',
  taxRate: 0,
  serviceCharge: 0,

  // Printer Settings
  printerType: 'thermal_80mm',
  printerName: '',
  printerIp: '',
  printerPort: 9100,
  receiptCopies: 1,
  printLogo: false,
  autoPrint: true,

  // Database Settings
  dbType: 'sqlite',
  dbName: 'pos_database',
  dbHost: 'localhost',
  dbPort: 3306,
  dbUsername: '',
  dbPassword: '',

  // Payment Settings
  cashPaymentEnabled: true,
  cardPaymentEnabled: false,
  cardProcessor: '',
  merchantId: '',
  apiKey: '',
  qrisEnabled: false,
  qrisMerchantName: '',
  qrisId: '',

  // Barcode Settings
  barcodeType: 'code128',
  barcodeWidth: 50,
  barcodeHeight: 30,
  barcodeText: true,

  // Cloud Sync Settings
  cloudSyncEnabled: false,
  cloudService: '',
  cloudUrl: '',
  cloudApiKey: '',
  syncInterval: 30,
  syncOnStartup: true,
  syncOnTransaction: true
};

// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const localData = localStorage.getItem('appSettings');
      return localData ? JSON.parse(localData) : defaultSettings;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return defaultSettings;
    }
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    return Promise.resolve(); // Return promise for async operations
  };

  const testPrinterConnection = async (printerSettings) => {
    // Simulate printer connection test
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (printerSettings.printerType && printerSettings.printerName) {
          resolve({ status: 'success', message: 'Printer connected successfully' });
        } else {
          reject(new Error('Printer settings incomplete'));
        }
      }, 1000);
    });
  };

  const testDatabaseConnection = async (databaseSettings) => {
    // Simulate database connection test
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (databaseSettings.dbType === 'sqlite' || 
            (databaseSettings.dbHost && databaseSettings.dbName)) {
          resolve({ 
            status: 'success', 
            message: 'Database connected successfully',
            tables: ['products', 'transactions', 'customers']
          });
        } else {
          reject(new Error('Database connection failed'));
        }
      }, 1500);
    });
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings,
      testPrinterConnection,
      testDatabaseConnection
    }}>
      {children}
    </SettingsContext.Provider>
  );
};