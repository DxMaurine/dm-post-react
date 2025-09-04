import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import CatalogModal from './CatalogModal';
import { ThemeProvider } from '../context/theme-provider';
import { Snackbar, Alert } from '@mui/material';

const Layout = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    if (window.electron && window.electron.getAppVersion) {
      window.electron.getAppVersion().then(version => {
        setAppVersion(version);
      });
    }

    // Listen for update status messages
    if (window.electron && window.electron.onUpdateStatus) {
      const handleUpdateStatus = (payload) => {
        let severity = 'info';
        switch (payload.status) {
          case 'downloaded':
            severity = 'success';
            break;
          case 'error':
            severity = 'error';
            break;
          case 'cancelled':
            severity = 'warning';
            break;
          default:
            severity = 'info';
        }
        setSnackbar({
          open: true,
          message: `Pembaruan: ${payload.message}`,
          severity: severity,
        });
      };

      window.electron.onUpdateStatus(handleUpdateStatus);

      // Cleanup listener
      return () => {
        window.electron.removeAllListeners('update-status'); // Assuming a cleanup method for all listeners or specific one
      };
    }
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="relative flex h-screen bg-gray-100 dark:bg-[var(--sidebar-bg-dark)] drop-shadow-blue-900">
      <ThemeProvider>
        <Sidebar onOpenCatalog={() => setIsCatalogOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet context={{ setSnackbar }} />
          </div>
          {appVersion && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
              Versi: {appVersion}
            </div>
          )}
        </main>
        <CatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      </ThemeProvider>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Layout;