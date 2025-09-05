/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const { fork } = require('child_process');

const log = require('electron-log');
log.initialize();
log.transports.file.level = 'info';
log.catchErrors({
  showDialog: true,
  onError: (error) => {
    log.error('Application error:', error);
  }
});

const { autoUpdater } = require('electron-updater');
autoUpdater.logger = log;
autoUpdater.autoDownload = false; // manual download via UI
autoUpdater.autoInstallOnAppQuit = true;

// Set up auto-updater handlers
autoUpdater.on('checking-for-update', () => {
  broadcastUpdateStatus('checking');
});

autoUpdater.on('update-available', (info) => {
  broadcastUpdateStatus('available', '', info);
});

autoUpdater.on('update-not-available', (info) => {
  broadcastUpdateStatus('not-available', '', info);
});

autoUpdater.on('error', (err) => {
  broadcastUpdateStatus('error', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  broadcastUpdateStatus('downloading', '', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  broadcastUpdateStatus('downloaded', '', info);
});

// Handle IPC messages for updates
ipcMain.handle('update-check', () => {
  if (!app.isPackaged) {
    // If in development mode, send a special status
    broadcastUpdateStatus('dev-mode', 'Aplikasi dalam mode development. Fitur update tidak tersedia.');
    return Promise.resolve({ isDev: true });
  }
  return autoUpdater.checkForUpdates().catch(err => {
    broadcastUpdateStatus('error', `Error checking for updates: ${err.message}`);
    return { error: err.message };
  });
});

ipcMain.handle('update-download', () => {
  if (!app.isPackaged) {
    broadcastUpdateStatus('dev-mode', 'Tidak bisa mengunduh update dalam mode development.');
    return Promise.resolve({ isDev: true });
  }
  return autoUpdater.downloadUpdate().catch(err => {
    broadcastUpdateStatus('error', `Error downloading update: ${err.message}`);
    return { error: err.message };
  });
});

ipcMain.handle('update-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

// Broadcast updater status to all renderer windows
function broadcastUpdateStatus(status, message = '', extra = {}) {
  const payload = { status, message, ...extra };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', payload);
  }
  if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
    customerDisplayWindow.webContents.send('update-status', payload);
  }
  if (barcodePrinterWindow && !barcodePrinterWindow.isDestroyed()) {
    barcodePrinterWindow.webContents.send('update-status', payload);
  }
}


let backendProcess;
let mainWindow = null;
let customerDisplayWindow = null;
let barcodePrinterWindow = null;

const defaultRoute = 'pos';
const backendUrl = 'http://localhost:5000';

// Function to send backend status to all renderer processes
function sendBackendStatus(status, message = '') {
  const statusPayload = { status, message };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('backend-status', statusPayload);
  }
  if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
    customerDisplayWindow.webContents.send('backend-status', statusPayload);
  }
  if (barcodePrinterWindow && !barcodePrinterWindow.isDestroyed()) {
    barcodePrinterWindow.webContents.send('backend-status', statusPayload);
  }
}



function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL(`http://localhost:5173/#/${defaultRoute}`);
  } else {
    const distPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadURL(`file://${distPath}#${defaultRoute}`).catch((err) => {
      dialog.showErrorBox(
        'File Load Error',
        'Tidak bisa load file aplikasi.\n' + err.message
      );
      app.quit();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createCustomerDisplayWindow() {
  if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
    customerDisplayWindow.focus();
    return;
  }

  customerDisplayWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    customerDisplayWindow.loadURL('http://localhost:5173/#/customer-display');
  } else {
    const distPath = path.join(app.getAppPath(), 'dist', 'index.html');
    const url = `file://${distPath}#customer-display`;
    customerDisplayWindow.loadURL(url);
  }

  customerDisplayWindow.on('closed', () => {
    customerDisplayWindow = null;
  });
}

function createBarcodePrinterWindow() {
  if (barcodePrinterWindow && !barcodePrinterWindow.isDestroyed()) {
    barcodePrinterWindow.focus();
    return;
  }

  barcodePrinterWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  if (!app.isPackaged) {
    barcodePrinterWindow.loadURL('http://localhost:5173/#/print/barcodes');
  } else {
    const distPath = path.join(app.getAppPath(), 'dist', 'index.html');
    const url = `file://${distPath}#print/barcodes`;
    barcodePrinterWindow.loadURL(url);
  }

  barcodePrinterWindow.on('closed', () => {
    barcodePrinterWindow = null;
  });
}

function checkBackend(retries = 15, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    let finished = false;
    sendBackendStatus('checking', 'Mengecek koneksi backend...');

    const tryRequest = () => {
      if (finished) return; // safety guard
      attempt++;
      // Backend health check in progress

      const req = http.get(
        `${backendUrl}/api/health`,
        { agent: new http.Agent({ keepAlive: false }) },
        (res) => {
          if (finished) return;
          if (res.statusCode === 200) {
            // Backend health check successful
            finished = true;
            sendBackendStatus('connected', 'Backend aktif.');
            // Consume and discard any response data to free socket
            res.resume();
            try { req.destroy(); } catch (_) {}
            resolve(true);
            return;
          }
          // Backend responded with non-200 status
          res.resume();
          fail();
        }
      );

      req.setTimeout(delay, () => {
        if (finished) return;
        // Backend check attempt timed out
        try { req.destroy(new Error('Timeout')); } catch (_) {}
        fail();
      });

      req.on('error', (err) => {
        if (finished) return;
        // Backend check attempt failed
        fail();
      });

      function fail() {
        if (finished) return;
        if (attempt < retries) {
          // Waiting before next attempt
          setTimeout(tryRequest, delay);
        } else {
          const errorMsg = `Backend tidak merespon di ${backendUrl} setelah ${retries} kali percobaan.`;
          finished = true;
          sendBackendStatus('error', errorMsg);
          reject(new Error(errorMsg));
        }
      }
    };

    tryRequest();
  });
}

async function ensureBackendDependencies(backendDir) {
  const fs = require('fs');
  const { exec } = require('child_process');
  
  const nodeModulesPath = path.join(backendDir, 'node_modules');
  
  // Check if node_modules exists and is not empty
  if (!fs.existsSync(nodeModulesPath) || fs.readdirSync(nodeModulesPath).length === 0) {
    // Installing backend dependencies
    sendBackendStatus('installing', 'Installing backend dependencies...');
    
    return new Promise((resolve, reject) => {
      const installProcess = exec('npm install --production', { 
        cwd: backendDir,
        timeout: 120000 // 2 minutes timeout
      });
      
      installProcess.stdout.on('data', (data) => {
        console.log(`[NPM]: ${data}`);
      });
      
      installProcess.stderr.on('data', (data) => {
        console.error(`[NPM ERR]: ${data}`);
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          // Backend dependencies installed successfully
          resolve();
        } else {
          reject(new Error(`NPM install failed with code ${code}`));
        }
      });
      
      installProcess.on('error', (err) => {
        reject(new Error(`NPM install error: ${err.message}`));
      });
    });
  } else {
    // Backend dependencies already exist
  }
}

async function startBackend() {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    if (backendProcess && !backendProcess.killed) {
      sendBackendStatus('connected', 'Backend sudah berjalan.');
      resolve();
      return;
    }

    let backendPath;
    let backendDir;
    try {
      if (!app.isPackaged) {
        // Development mode
        backendPath = path.join(__dirname, '..', 'pos-backend', 'index.js');
        backendDir = path.join(__dirname, '..', 'pos-backend');
      } else {
        // Production mode - multiple fallback paths
        const possiblePaths = [
          path.join(process.resourcesPath, 'pos-backend', 'index.js'),
          path.join(app.getAppPath(), 'resources', 'pos-backend', 'index.js'),
          path.join(path.dirname(process.execPath), 'resources', 'pos-backend', 'index.js'),
          path.join(app.getAppPath(), 'pos-backend', 'index.js')
        ];
        
        // Try each path until we find one that exists
        const fs = require('fs');
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            backendPath = testPath;
            backendDir = path.dirname(testPath);
            // Found backend at testPath
            break;
          }
        }
        
        if (!backendPath) {
          throw new Error('Backend script tidak ditemukan di lokasi manapun');
        }
      }
      
      // Backend path resolution completed
      
      // Ensure dependencies are installed
      await ensureBackendDependencies(backendDir);
      
    } catch (pathError) {
      const errorMsg = `Gagal menemukan backend: ${pathError.message}`;
      sendBackendStatus('error', errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    sendBackendStatus('starting', `Memulai proses backend dari: ${backendPath}`);
    
    try {
      // Starting backend with fork method
      
      backendProcess = fork(backendPath, [], {
        cwd: backendDir, // Set working directory to backend folder
        env: { 
          ...process.env, 
          NODE_ENV: app.isPackaged ? 'production' : 'development',
          PORT: '5000',
          // Pass resource paths to the backend process
          ELECTRON_RESOURCES_PATH: process.resourcesPath || '',
          ELECTRON_APP_PATH: app.getAppPath()
        },
        silent: true // Use silent: true to capture stdout
      });
      
      // Check if fork was successful
      if (!backendProcess) {
        throw new Error('Fork process returned null');
      }
      
      let resolved = false;
      const readyTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Waktu tunggu backend habis (30 detik).'));
        }
      }, 30000); // 30 second timeout

      // Set up event listeners only if backendProcess is valid
      if (backendProcess.stdout) {
        backendProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`[BACKEND]: ${output}`); // Log backend output for debugging
          // Listen for the specific "ready" message
          if (output.includes('Backend ready') && !resolved) {
            resolved = true;
            clearTimeout(readyTimeout);
            sendBackendStatus('connected', 'Backend aktif via fork.');
            resolve();
          }
        });
      }
      
      if (backendProcess.stderr) {
        backendProcess.stderr.on('data', (data) => {
          const output = data.toString();
          console.error(`[BACKEND ERR]: ${output}`);
          // Don't reject on stderr, but log it. Some warnings are not fatal.
        });
      }

      backendProcess.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(readyTimeout);
          sendBackendStatus('error', `Backend error: ${err.message}`);
          reject(err);
        }
      });

      backendProcess.on('exit', (code, signal) => {
        const exitMsg = signal 
          ? `Backend berhenti dengan signal: ${signal}` 
          : `Backend berhenti dengan kode: ${code}`;
        sendBackendStatus('stopped', exitMsg);
        if (!resolved) {
          resolved = true;
          clearTimeout(readyTimeout);
          reject(new Error(exitMsg));
        }
        backendProcess = null;
      });
      
    } catch (forkError) {
      const errorMsg = `Gagal memulai backend process: ${forkError.message}`;
      sendBackendStatus('error', errorMsg);
      reject(new Error(errorMsg));
    }
  });
}

// App Lifecycle
app.whenReady().then(async () => {
  // Electron app initialization starting
  sendBackendStatus('unknown', 'Mempersiapkan aplikasi...');

  try {
    // Try to start or ensure the backend is running.
    // This will first do a quick check, and if that fails, it will start it.
    await startBackend();
    // If we reach here, the backend is confirmed to be running.
    
    // NOW, we can create the main window.
    createMainWindow();

    // Initialize and trigger updater check (only in production builds)
    if (app.isPackaged && autoUpdater) {
      autoUpdater.on('checking-for-update', () => {
        broadcastUpdateStatus('checking', 'Mengecek pembaruan...');
      });
      autoUpdater.on('update-available', (info) => {
        broadcastUpdateStatus('available', 'Pembaruan tersedia.', { version: info.version });
      });
      autoUpdater.on('update-not-available', (info) => {
        broadcastUpdateStatus('not-available', 'Tidak ada pembaruan tersedia.');
      });
      autoUpdater.on('error', (err) => {
        broadcastUpdateStatus('error', `Gagal memeriksa pembaruan: ${err == null ? "unknown" : (err.message || String(err))}`);
      });
      autoUpdater.on('download-progress', (progressObj) => {
        const percent = Math.round(progressObj.percent);
        broadcastUpdateStatus('downloading', `Mengunduh pembaruan... (${percent}%)`, { progress: percent });
      });
      autoUpdater.on('update-downloaded', (info) => {
        broadcastUpdateStatus('downloaded', 'Pembaruan siap diinstal.', { version: info.version });
      });

      // Trigger an initial update check
      setImmediate(() => {
        autoUpdater.checkForUpdates().catch((err) => {
          broadcastUpdateStatus('error', `Gagal memeriksa pembaruan: ${err == null ? "unknown" : (err.message || String(err))}`);
        });
      });
    }

  } catch (startError) {
    // If startBackend fails, we show an error.
    // We still create a window to show the error message.
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    }
    
    // Send the final error status to the renderer process.
    sendBackendStatus('error', `Gagal total memulai backend: ${startError.message}`);
    
    // Optional: You can show a native dialog box as a fallback
    dialog.showErrorBox(
      'Kesalahan Kritis Backend',
      `Tidak dapat memulai server backend. Aplikasi mungkin tidak berfungsi dengan benar.\n\nError: ${startError.message}`
    );
    
    // Optional: Navigate to a specific error page in the frontend
    if (mainWindow && !mainWindow.isDestroyed()) {
      const distPath = path.join(app.getAppPath(), 'dist', 'index.html');
      mainWindow.loadURL(`file://${distPath}#backend-error`).catch(() => {});
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // Re-check backend or create window on activation if no windows are open
      if (!mainWindow || mainWindow.isDestroyed()) {
        createMainWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    // Killing backend process
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.on('open-customer-display', createCustomerDisplayWindow);
ipcMain.on('open-barcode-printer', createBarcodePrinterWindow);
ipcMain.on('start-backend', async () => {
  try {
    await startBackend();
  } catch (err) {
    // Error starting backend via IPC - status already sent
  }
});

ipcMain.on('update-customer-display', (event, data) => {
  if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
    if (data.type === 'UPDATE_CUSTOMER_DISPLAY') {
      customerDisplayWindow.webContents.send('update-display', data.payload);
    } else if (data.type === 'PAYMENT_COMPLETE') {
      customerDisplayWindow.webContents.send('payment-complete', data.payload);
    }
  }
});

ipcMain.on('promo-content-updated', () => {
  if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
    customerDisplayWindow.webContents.send('refresh-promo-content');
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

