import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import CatalogModal from './CatalogModal';
import { ThemeProvider } from '../context/theme-provider';
import { Snackbar, Alert } from '@mui/material';
import UpdateNotification from './UpdateNotification';

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
    <div className="relative flex h-screen bg-gray-100 dark:bg-[var(--bg-secondary)] drop-shadow-blue-900 blue-ocean-gradient">
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
      <UpdateNotification />
    </div>
  );
};

export default Layout;