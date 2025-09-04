const { contextBridge, ipcRenderer } = require('electron');

const createListener = (channel) => (callback) => {
  const listener = (event, ...args) => callback(...args);
  ipcRenderer.on(channel, listener);
  return {
    remove: () => ipcRenderer.removeListener(channel, listener)
  };
};

contextBridge.exposeInMainWorld('electron', {
  // From renderer to main
  openCustomerDisplay: () => ipcRenderer.send('open-customer-display'),
  updateCustomerDisplay: (payload) => ipcRenderer.send('update-customer-display', payload),
  openBarcodePrinter: () => ipcRenderer.send('open-barcode-printer'),
  startBackend: () => ipcRenderer.send('start-backend'),
  sendPromoContentUpdated: () => ipcRenderer.send('promo-content-updated'),

  // From main to renderer
  onUpdateDisplay: createListener('update-display'),
  onPaymentComplete: createListener('payment-complete'),
  onBackendStatus: createListener('backend-status'),
  onRefreshPromoContent: createListener('refresh-promo-content'),
  onUpdateStatus: createListener('update-status'),
  
  // Invokable
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('update-check'),
  downloadUpdate: () => ipcRenderer.invoke('update-download'),
  installUpdate: () => ipcRenderer.invoke('update-install'),
});

// Expose API_URL to the renderer process
contextBridge.exposeInMainWorld('API_URL', 'http://localhost:5000');
