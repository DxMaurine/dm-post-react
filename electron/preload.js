const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // From renderer to main
  openCustomerDisplay: () => ipcRenderer.send('open-customer-display'),
  updateCustomerDisplay: (payload) => ipcRenderer.send('update-customer-display', payload),
  openBarcodePrinter: () => ipcRenderer.send('open-barcode-printer'),
  startBackend: () => ipcRenderer.send('start-backend'),

  // From main to renderer
  onUpdateDisplay: (callback) => ipcRenderer.on('update-display', (event, ...args) => callback(...args)),
  onPaymentComplete: (callback) => ipcRenderer.on('payment-complete', (event, ...args) => callback(...args)),
  onBackendStatus: (callback) => ipcRenderer.on('backend-status', (event, ...args) => callback(...args)),
  onRefreshPromoContent: (callback) => ipcRenderer.on('refresh-promo-content', (event, ...args) => callback(...args)), // New listener exposed
  
  // Function to remove listeners
  cleanup: () => {
    ipcRenderer.removeAllListeners('update-display');
    ipcRenderer.removeAllListeners('payment-complete');
    ipcRenderer.removeAllListeners('backend-status');
    ipcRenderer.removeAllListeners('refresh-promo-content'); // Add cleanup for new listener
  },
  sendPromoContentUpdated: () => ipcRenderer.send('promo-content-updated'), // New function
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});

// Expose API_URL to the renderer process
contextBridge.exposeInMainWorld('API_URL', 'http://localhost:5000');