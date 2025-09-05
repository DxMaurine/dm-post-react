
import PrintReportsPage from './pages/PrintReportsPage';
import React, {  useEffect } from 'react';
import TentangAplikasiPage from './pages/TentangAplikasiPage';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import POSPage from './pages/POSPage';
import PengaturanPage from './pages/PengaturanPage';
import RekapPenjualan from './pages/RekapPenjualan';
import ReturPembelianPage from './pages/ReturPembelianPage';
import SupplierManagementPage from './pages/SupplierManagementPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import DataBarang from './pages/DataBarang';
import Layout from './components/Layout';
import SalesReturnPage from './pages/SalesReturnPage';
import PenerimaanBarang from './pages/PenerimaanBarang';
import ManajemenPengguna from './pages/ManajemenPengguna';
import LaporanLabaRugi from './pages/LaporanLabaRugi';
import StockOpname from './pages/StockOpname';
import LaporanProdukTerlaris from './pages/LaporanProdukTerlaris';
import LaporanPerKasir from './pages/LaporanPerKasir';
import DiscountManagementPage from './pages/DiscountManagementPage';
import KartuStokPage from './pages/KartuStokPage';
import HistoryPage from './pages/HistoryPage';
import ListProduk from './pages/ListProduk';
import ShiftManagementPage from './pages/ShiftManagementPage';
import BebanOperasionalPage from './pages/BebanOperasionalPage';
import PrintBarcodePage from './pages/PrintBarcodePage';
import BarcodeManagementPage from './pages/BarcodeManagementPage';
import BarcodePrintSheet from './pages/BarcodePrintSheet';
import { CustomerDisplay } from './components/pos';
import ProtectedRoute from './components/ProtectedRoute';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let backendStatusListener;
    if (window.electron) {
      backendStatusListener = window.electron.onBackendStatus((statusPayload) => {
        if (statusPayload.status === 'connected') {
          navigate('/login');
        } else {
          navigate('/backend-setup');
        }
      });
      // Request current status from main process
      window.electron.startBackend(); // This will trigger a status broadcast
    } else {
      // Fallback for web environment or if electron API is not available
      navigate('/login');
    }

    // Cleanup listener on unmount
    return () => {
      if (backendStatusListener) {
        backendStatusListener.remove();
      }
    };
  }, [navigate]);
  return null;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer-display" element={<CustomerDisplay />} />
        <Route path="/logout" element={<Logout />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          
          <Route index element={<Navigate to="/pos" />} />
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Dashboard /></ProtectedRoute>} />
          <Route path="pos" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kasir']}><POSPage /></ProtectedRoute>} />
          <Route path="data-barang" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DataBarang /></ProtectedRoute>} />
          <Route path="penerimaan-barang" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PenerimaanBarang /></ProtectedRoute>} />
          <Route path="stock-opname" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><StockOpname /></ProtectedRoute>} />
          <Route path="retur-pembelian" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ReturPembelianPage /></ProtectedRoute>} />
          <Route path="sales-return" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kasir']}><SalesReturnPage /></ProtectedRoute>} />
          <Route path="rekap" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kasir']}><RekapPenjualan /></ProtectedRoute>} />
          <Route path="laporan-laba-rugi" element={<ProtectedRoute allowedRoles={['admin']}><LaporanLabaRugi /></ProtectedRoute>} />
          <Route path="laporan-per-kasir" element={<ProtectedRoute allowedRoles={['admin']}><LaporanPerKasir /></ProtectedRoute>} />
          <Route path="laporan-produk-terlaris" element={<ProtectedRoute allowedRoles={['admin']}><LaporanProdukTerlaris /></ProtectedRoute>} />
          <Route path="customers" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kasir']}><CustomerManagementPage /></ProtectedRoute>} />
          <Route path="suppliers" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><SupplierManagementPage /></ProtectedRoute>} />
          <Route path="manajemen-pengguna" element={<ProtectedRoute allowedRoles={['admin']}><ManajemenPengguna /></ProtectedRoute>} />
          <Route path="discounts" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DiscountManagementPage /></ProtectedRoute>} />
          <Route path="kartu-stok" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><KartuStokPage /></ProtectedRoute>} />
          <Route path="history" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kasir']}><HistoryPage /></ProtectedRoute>} />
          <Route path="list-produk" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ListProduk /></ProtectedRoute>} />
          <Route path="pengaturan" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PengaturanPage /></ProtectedRoute>} />
          <Route path="tentang-aplikasi" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><TentangAplikasiPage /></ProtectedRoute>} />
          <Route path="shift" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kasir']}><ShiftManagementPage /></ProtectedRoute>} />
          <Route path="beban-operasional" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kasir']}><BebanOperasionalPage /></ProtectedRoute>} />
          <Route path="print-barcode/:productId" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PrintBarcodePage /></ProtectedRoute>} />
          <Route path="barcode-management" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><BarcodeManagementPage /></ProtectedRoute>} />

          <Route path="print-reports" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PrintReportsPage /></ProtectedRoute>} />
        </Route>
        <Route path="/print/barcodes" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><BarcodePrintSheet /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;