import React, { useState } from 'react';
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