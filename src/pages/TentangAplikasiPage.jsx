/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react';
import { FiPackage, FiShoppingCart, FiBox, FiPieChart, FiUsers, FiHelpCircle } from 'react-icons/fi';
import { SettingsContext } from '../context/SettingsContext';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Alert, LinearProgress } from '@mui/material';

// Helper functions untuk status lisensi
const getLicenseStatusColor = (status) => {
  switch (status) {
    case 'activated':
      return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
    case 'trial':
      return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
    case 'temporary':
      return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
    default:
      return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
  }
};

const getLicenseStatusIcon = (status) => {
  switch (status) {
    case 'activated':
      return <CheckCircleIcon className="h-5 w-5" />;
    case 'trial':
      return <WarningIcon className="h-5 w-5" />;
    case 'temporary':
      return <ScheduleIcon className="h-5 w-5" />;
    default:
      return <ErrorIcon className="h-5 w-5" />;
  }
};

const getLicenseStatusText = (status) => {
  switch (status) {
    case 'activated':
      return 'Teraktivasi';
    case 'trial':
      return 'Trial';
    case 'temporary':
      return 'Sementara';
    default:
      return 'Tidak Aktif';
  }
};

const TentangAplikasiPage = () => {
  const [appVersion, setAppVersion] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useContext(SettingsContext);

  const fetchLicenseStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/activation/status');
      const data = await response.json();
      setLicenseStatus(data);
    } catch (error) {
      setLicenseStatus({ 
        status: 'error', 
        message: 'Status tidak tersedia',
        activated: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenseStatus();
    // Refresh setiap 30 detik
    const interval = setInterval(fetchLicenseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let unsub;
    if (window.electron?.onUpdateStatus) {
      unsub = window.electron.onUpdateStatus((payload) => {
        setUpdateInfo(payload);
        
        // Show SweetAlert2 for dev mode and not-available status
        if (payload.status === 'dev-mode') {
          Swal.fire({
            icon: 'info',
            title: 'Mode Development',
            text: 'Aplikasi dalam mode development. Fitur update tidak tersedia.',
            confirmButtonText: 'Mengerti',
            customClass: {
              popup: 'dark:bg-[var(--bg-default)] dark:text-white',
              title: 'dark:text-white',
              htmlContainer: 'dark:text-gray-300',
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
            }
          });
        } else if (payload.status === 'not-available') {
          Swal.fire({
            icon: 'success',
            title: 'Versi Terbaru',
            text: 'Aplikasi Anda sudah menggunakan versi terbaru.',
            confirmButtonText: 'OK',
            timer: 3000,
            customClass: {
              popup: 'dark:bg-[var(--bg-default)] dark:text-white',
              title: 'dark:text-white',
              htmlContainer: 'dark:text-gray-300',
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
            }
          });
        }

        // Automatically hide some messages after a delay
        if (payload.status === 'checking' || payload.status === 'not-available' || payload.status === 'dev-mode') {
          setTimeout(() => {
            setUpdateInfo(current => (current?.message === payload.message ? null : current));
          }, 4000);
        }
      });
    }
    return () => {
      if (unsub?.remove) unsub.remove();
    };
  }, []);
  
  useEffect(() => {
    const fetchVersion = async () => {
      if (window.electron) {
        try {
          const version = await window.electron.getAppVersion();
          setAppVersion(version);
        } catch (error) {
          console.error('Gagal mendapatkan versi aplikasi:', error);
        }
      }
    };

    fetchVersion();
  }, []);

  // Feature cards data
  const featureCards = [
    {
      title: 'Transaksi & Pembayaran',
      icon: <FiShoppingCart className="h-6 w-6" />,
      features: ['Kasir POS yang cepat & mudah', 'Dukungan berbagai metode pembayaran', 'Manajemen diskon & promosi'],
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    {
      title: 'Manajemen Produk',
      icon: <FiBox className="h-6 w-6" />,
      features: ['Kontrol stok real-time', 'Barcode & quick products', 'Retur barang terintegrasi'],
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      title: 'Pelaporan Bisnis',
      icon: <FiPieChart className="h-6 w-6" />,
      features: ['Laporan penjualan detail', 'Analisis laba/rugi', 'Monitoring kinerja kasir'],
      color: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      title: 'Dukungan Pengguna',
      icon: <FiUsers className="h-6 w-6" />,
      features: ['Multi-user dengan sistem peran', 'Dukungan teknis responsif', 'Pembaruan rutin & backup'],
      color: 'bg-gradient-to-br from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white text-center">Tentang Aplikasi</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom Kiri - Informasi Aplikasi */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg p-6 border border-[var(--border-default)]">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 rounded-xl shadow-md">
              <FiPackage className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">DM-POS System</h2>
              <p className="text-gray-600 dark:text-gray-300">Versi {appVersion || 'Loading...'}</p>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
            DM-POS adalah sistem kasir modern yang membantu Anda mengelola bisnis retail dengan lebih efisien. 
            Dirancang khusus untuk memberikan pengalaman terbaik dalam pengelolaan transaksi harian, 
            manajemen stok, dan pelaporan bisnis yang lengkap.
          </p>
          
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Fitur Bisnis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureCards.map((card, index) => (
              <div key={index} className={`${card.color} text-white rounded-xl p-4 shadow-lg transform transition-transform duration-300 hover:scale-105`}>
                <div className="flex items-center mb-3">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    {card.icon}
                  </div>
                  <h4 className="font-semibold text-lg">{card.title}</h4>
                </div>
                <ul className="space-y-2 text-white/90">
                  {card.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
        </div>

        {/* Kolom Kanan - Informasi Sistem */}
        <div className="space-y-8">
          {/* Status Lisensi */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg p-6 border border-[var(--border-default)]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Status Lisensi</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : licenseStatus ? (
              <div className="space-y-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-md font-medium ${getLicenseStatusColor(licenseStatus.status)} shadow-md`}>
                  {getLicenseStatusIcon(licenseStatus.status)}
                  <span className="ml-2">{getLicenseStatusText(licenseStatus.status)}</span>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 shadow-inner">
                  {licenseStatus.serialNumber && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Serial Number:</span>
                      <span className="font-mono text-gray-600 dark:text-gray-400">****{licenseStatus.serialNumber.slice(-4)}</span>
                    </div>
                  )}
                  {licenseStatus.activationDate && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Tanggal Aktivasi:</span>
                      <span className="text-gray-600 dark:text-gray-400">{new Date(licenseStatus.activationDate).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                  {licenseStatus.expires && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Berakhir:</span>
                      <span className="text-gray-600 dark:text-gray-400">{new Date(licenseStatus.expires).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Total Transaksi:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {licenseStatus.status === 'activated' ? 'Unlimited' : 
                        (licenseStatus.status === 'trial' ? `${licenseStatus.remaining}/99` : '-')}
                    </span>
                  </div>
                </div>

                {licenseStatus.status === 'trial' && licenseStatus.remaining <= 19 && (
                  <div className="mt-4">
                    <Alert severity={licenseStatus.remaining <= 4 ? 'error' : 'warning'}
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: licenseStatus.remaining <= 4 ? 'rgba(211, 47, 47, 0.15)' : 'rgba(237, 108, 2, 0.15)',
                        color: 'var(--text-default)',
                        '& .MuiAlert-icon': {
                          color: licenseStatus.remaining <= 4 ? '#d32f2f' : '#ed6c02'
                        }
                      }}>
                      {licenseStatus.remaining <= 4 
                        ? 'Segera aktivasi! Sisa transaksi hampir habis.'
                        : 'Aktivasi sekarang untuk transaksi unlimited!'}
                    </Alert>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-red-500 font-medium">
                Gagal memuat status lisensi
              </div>
            )}
          </div>

          {/* Pembaruan Aplikasi */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg p-6 border border-[var(--border-default)]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Pembaruan Aplikasi</h2>
            
            {updateInfo?.status && (
              <div className="mb-4">
                <p className={`text-sm mb-2 font-medium ${updateInfo.status === 'error' ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                  {updateInfo.message || updateInfo.status}
                </p>
                {typeof updateInfo.percent === 'number' && (
                  <div className="mt-2">
                    <LinearProgress 
                      variant="determinate" 
                      value={updateInfo.percent} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: '#3b82f6'
                        }
                      }} 
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {updateInfo.percent.toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => window.electron?.checkForUpdates()}
                disabled={updateInfo?.message === 'Update manager is not available.'}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md transition-all duration-300 transform hover:scale-105"
              >
                {updateInfo?.message === 'Update manager is not available.' ? 'Updater Tidak Tersedia' : 'Cek Pembaruan'}
              </button>
              
              {updateInfo?.status === 'available' && (
                <button
                  type="button"
                  onClick={() => window.electron?.downloadUpdate()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:from-emerald-600 hover:to-green-700 shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  Unduh Pembaruan
                </button>
              )}
              
              {updateInfo?.status === 'downloaded' && (
                <button
                  type="button"
                  onClick={() => window.electron?.installUpdate()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium hover:from-green-600 hover:to-teal-700 shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  Instal Sekarang
                </button>
              )}
              
              {updateInfo?.status === 'downloading' && (
                <div className="flex items-center text-blue-500 font-medium">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  Mengunduh...
                </div>
              )}
            </div>
          </div>

          {/* Bantuan & Dukungan */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg p-6 border border-[var(--border-default)]">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Bantuan & Dukungan</h3>
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-5 rounded-xl shadow-sm">
              <div className="flex items-start">
                <FiHelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-1 mr-4" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Untuk bantuan teknis dan pertanyaan, hubungi kami di:
                    <br />
                    <br />
                    <li className="font-medium">WhatsApp: +62 851 1704 2204 </li>
                    <li className="font-medium">Email: support@dm-pos.com </li>
                    <li className="font-medium">Jam kerja: 08.00 - 17.00 WIB || Senin - Jumat </li>
                    <br />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg p-6 border border-[var(--border-default)] text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2025 DM-POS. All rights reserved.
              <br />
              <span className="font-medium">Developed by PT. Diamond Media Software</span>
                <br />
              <ul className="font-medium">Alamat: Jl. Raya Penawangan KM 5, Grobogan, Jawa Tengah 58161</ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TentangAplikasiPage;