/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, api } from '../api'; // Tambahkan import ini
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Custom SweetAlert configuration
const showSweetAlert = (config) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const defaultConfig = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    },
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700',
      title: 'text-xl font-bold mb-2',
      content: 'text-sm leading-relaxed',
      confirmButton: 'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 hover:scale-105 shadow-lg',
      cancelButton: 'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 hover:scale-105 shadow-lg mr-3'
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: true
  };
  
  return Swal.fire({
    ...defaultConfig,
    ...config
  });
};

// Safe wrapper to show SweetAlert without being blocked in some Electron prod contexts
const safeShowAlert = async (config) => {
  try {
    // Defer to next tick to avoid event-loop timing issues during form submit
    await new Promise((resolve) => setTimeout(resolve, 0));
    return await showSweetAlert(config);
  } catch (e) {
    console.error('SweetAlert failed, falling back to native alert:', e);
    try {
      const title = config && config.title ? String(config.title) : '';
      const text = config && config.text ? String(config.text) : '';
      const msg = (title ? title + ' - ' : '') + text;
      if (msg) window.alert(msg);
    } catch (error) {
      console.error('Native alert failed:', error);
    }
  }
};
    


function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAdminValidationModal, setShowAdminValidationModal] = useState(false);
  const [adminValidationData, setAdminValidationData] = useState({
    username: '',
    password: ''
  });
  const [adminValidationError, setAdminValidationError] = useState('');
  const [isAdminValidating, setIsAdminValidating] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    role: 'kasir'
  });
  const [registerError, setRegisterError] = useState('');
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const navigate = useNavigate();

  // Initialization overlay states
  const [initVisible, setInitVisible] = useState(true);
  const [initStep, setInitStep] = useState({
    backend: 'checking', // checking | connected | error
    db: 'pending',       // pending | checking | ready | error
    internet: (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean')
      ? (navigator.onLine ? 'online' : 'offline')
      : 'unknown'
  });
  const [initProgress, setInitProgress] = useState(10);
  const initCancelledRef = useRef(false);

  const checkDatabaseReady = async () => {
    setInitStep((s) => ({ ...s, db: 'checking' }));
    // Try up to 8 times with increasing delay
    for (let attempt = 0; attempt < 8 && !initCancelledRef.current; attempt++) {
      try {
        const res = await api.get('/api/products', { timeout: 4000 });
        if (res && res.status === 200) {
          setInitStep((s) => ({ ...s, db: 'ready' }));

          // Jika bukan dev atau sudah reload sekali, lanjutkan tutup overlay
          setInitProgress(100);
          setTimeout(() => {
            if (!initCancelledRef.current) setInitVisible(false);
          }, 300);
          return;
        }
      } catch (e) {
        // Wait before retrying
        
        await new Promise((r) => setTimeout(r, Math.min(1000 + attempt * 500, 4000)));
      }
    }
    setInitStep((s) => ({ ...s, db: 'error' }));
  };

  const handleBackendConnected = () => {
    setInitStep((s) => ({ ...s, backend: 'connected' }));
    setInitProgress(60);
    checkDatabaseReady();
  };

  const restartInitialization = () => {
    initCancelledRef.current = false;
    setInitVisible(true);
    setInitStep((prev) => ({
      ...prev,
      backend: 'checking',
      db: 'pending'
    }));
    setInitProgress(10);

    if (window.electron && window.electron.startBackend) {
      try { window.electron.startBackend(); } 
     
      catch (_) {}
    } else {
      api.get('/api/health', { timeout: 3000 })
        .then(() => handleBackendConnected())
        .catch(() => setInitStep((s) => ({ ...s, backend: 'error' })));
    }
  };

  useEffect(() => {
    initCancelledRef.current = false;

    const handleOnline = () => setInitStep((s) => ({ ...s, internet: 'online' }));
    const handleOffline = () => setInitStep((s) => ({ ...s, internet: 'offline' }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const onStatus = (statusPayload) => {
      if (!statusPayload || initCancelledRef.current) return;
      const { status } = statusPayload;
      if (status === 'connected') {
        handleBackendConnected();
      } else if (status === 'installing' || status === 'starting' || status === 'checking' || status === 'unknown') {
        setInitStep((s) => ({ ...s, backend: 'checking' }));
        setInitProgress(20);
      } else if (status === 'error' || status === 'stopped') {
        setInitStep((s) => ({ ...s, backend: 'error' }));
        setInitProgress(20);
      }
    };

    if (window.electron && window.electron.onBackendStatus) {
      try {
        window.electron.onBackendStatus(onStatus);
        if (window.electron.startBackend) window.electron.startBackend();
      } catch (err) {
        // Fallback to HTTP check
        api.get('/api/health', { timeout: 3000 })
          .then(() => handleBackendConnected())
          .catch(() => setInitStep((s) => ({ ...s, backend: 'error' })));
      }
    } else {
      // Web/dev fallback
      api.get('/api/health', { timeout: 3000 })
        .then(() => handleBackendConnected())
        .catch(() => setInitStep((s) => ({ ...s, backend: 'error' })));
    }

    return () => {
      initCancelledRef.current = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Avoid global cleanup that may remove other listeners; rely on page lifetime
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Perubahan utama di sini:
      const response = await authAPI.login({ username, password });

      // Axios sudah otomatis parsing JSON, jadi langsung bisa akses data:
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'kasir') {
        navigate('/pos');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      // Error handling yang lebih baik untuk Axios:
      let errorMessage = 'Terjadi kesalahan saat login';

      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          // Authentication failed
          if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = 'Username atau password salah';
          }
        } else if (err.response.status === 400) {
          // Bad request
          errorMessage = err.response.data.message || 'Data login tidak lengkap';
        } else if (err.response.status >= 500) {
          // Server error
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        // Other error
        errorMessage = err.message || 'Terjadi kesalahan yang tidak diketahui.';
      }

      setError(errorMessage);
      // Attempt to show an error modal as well (robust for Electron production)
      try {
        safeShowAlert({
          icon: 'error',
          title: 'Login Gagal',
          text: errorMessage,
          confirmButtonText: 'Oke',
          confirmButtonColor: '#ef4444',
          iconColor: '#ef4444'
        });
      } catch (e) {
        console.error('Failed to show SweetAlert:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminValidation = async (e) => {
    e.preventDefault();
    setAdminValidationError('');
    setIsAdminValidating(true);

    // Loading toast
   
   const loadingToast = Swal.fire({
      title: 'Mengkonfirmasi...',
      text: 'Mohon tunggu sebentar...',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 3000,
      timerProgressBar: true
    });

    try {
      // Validasi kredensial admin
      const response = await authAPI.login(adminValidationData);
      const { user } = response.data;

      // Close loading toast
      Swal.close();

      // Cek apakah user adalah admin
      if (user.role !== 'admin') {
        // SweetAlert untuk error role
        await showSweetAlert({
          icon: 'error',
          title: 'Akses Ditolak!',
          text: 'Hanya admin yang diizinkan membuat akun baru',
          confirmButtonText: 'Oke',
          confirmButtonColor: '#ef4444',
          iconColor: '#ef4444'
        });
        return;
      }

      // SweetAlert untuk success
      await showSweetAlert({
        icon: 'success',
        title: 'Validasi Berhasil!',
        html: `<div class="text-center">
                 <p class="mb-2">Selamat datang, <strong>${user.username}</strong></p>
                 <p class="text-green-600 dark:text-green-400">Anda dapat membuat akun baru</p>
               </div>`,
        confirmButtonText: 'Lanjutkan',
        confirmButtonColor: '#10b981',
        iconColor: '#10b981',
        timer: 2500,
        timerProgressBar: true
      });

      // Jika validasi berhasil, tutup modal validasi dan buka modal register
      setShowAdminValidationModal(false);
      setAdminValidationData({ username: '', password: '' });
      setAdminValidationError('');
      setShowRegisterModal(true);

    } catch (err) {
      // Close loading toast
      Swal.close();

      // More specific error handling for different authentication scenarios
      let errorMessage = 'Kredensial admin tidak valid';
      let errorTitle = 'Validasi Gagal!';

      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          // Authentication failed - more specific messaging
          if (err.response.data && err.response.data.message) {
            // Use backend message but make it more specific
            errorMessage = err.response.data.message;
            errorTitle = 'Autentikasi Gagal';
          } else {
            errorMessage = 'Username atau password salah';
          }
        } else if (err.response.status === 403) {
          // Forbidden access
          errorMessage = 'Akses ditolak. Anda tidak memiliki izin yang cukup.';
          errorTitle = 'Akses Ditolak';
        } else if (err.response.status === 400) {
          // Bad request
          errorMessage = err.response.data.message || 'Permintaan tidak valid. Periksa kembali data yang dimasukkan.';
          errorTitle = 'Data Tidak Valid';
        } else if (err.response.status >= 500) {
          // Server error
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
          errorTitle = 'Kesalahan Server';
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        errorTitle = 'Koneksi Gagal';
      } else {
        // Other error
        errorMessage = err.message || 'Terjadi kesalahan yang tidak diketahui.';
      }

      // SweetAlert untuk error login dengan pesan yang lebih spesifik
      await showSweetAlert({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        confirmButtonText: 'Coba Lagi',
        confirmButtonColor: '#ef4444',
        iconColor: '#ef4444'
      });
    } finally {
      setIsAdminValidating(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    // Konfirmasi sebelum registrasi
    const confirmResult = await showSweetAlert({
      icon: 'question',
      title: 'Konfirmasi Pembuatan Akun',
      html: `<div class="text-center">
               <p class="mb-2">Apakah Anda yakin ingin membuat akun baru?</p>
               <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-3">
                 <p><strong>Username:</strong> ${registerData.username}</p>
                 <p><strong>Role:</strong> ${registerData.role}</p>
               </div>
             </div>`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Buat Akun',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      iconColor: '#3b82f6'
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    setIsRegisterLoading(true);

    try {
      await authAPI.register(registerData);

      // SweetAlert untuk success registrasi
      await showSweetAlert({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        html: `<div class="text-center">
                 <p class="mb-2">Akun <strong>${registerData.username}</strong> berhasil dibuat</p>
                 <p class="text-green-600 dark:text-green-400">Silakan login dengan akun yang baru dibuat</p>
               </div>`,
        confirmButtonText: 'Oke',
        confirmButtonColor: '#10b981',
        iconColor: '#10b981',
        timer: 3500,
        timerProgressBar: true
      });

      setShowRegisterModal(false);
      setRegisterData({ username: '', password: '', role: 'kasir' });
      setRegisterError('');
      // Reset admin validation state juga
      setAdminValidationData({ username: '', password: '' });
      setAdminValidationError('');
    } catch (err) {
      // SweetAlert untuk error registrasi
      let registerErrorMessage = 'Terjadi kesalahan saat membuat akun';
      let registerErrorTitle = 'Registrasi Gagal!';

      if (err.response) {
        // Server responded with error
        if (err.response.status === 409) {
          // Conflict - username already exists
          registerErrorMessage = err.response.data.message || 'Username sudah digunakan. Silakan pilih username lain.';
          registerErrorTitle = 'Username Sudah Ada';
        } else if (err.response.status === 401 || err.response.status === 403) {
          // Authentication/Authorization error
          registerErrorMessage = 'Anda tidak memiliki izin untuk membuat akun. Pastikan Anda login sebagai admin.';
          registerErrorTitle = 'Akses Ditolak';
        } else if (err.response.status === 400) {
          // Bad request
          registerErrorMessage = err.response.data.message || 'Data registrasi tidak valid.';
          registerErrorTitle = 'Data Tidak Valid';
        } else if (err.response.status >= 500) {
          // Server error
          registerErrorMessage = 'Terjadi kesalahan server saat registrasi.';
          registerErrorTitle = 'Kesalahan Server';
        }
      } else if (err.request) {
        // Network error
        registerErrorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        registerErrorTitle = 'Koneksi Gagal';
      } else {
        // Other error
        registerErrorMessage = err.message || 'Terjadi kesalahan yang tidak diketahui.';
      }

      await showSweetAlert({
        icon: 'error',
        title: registerErrorTitle,
        text: registerErrorMessage,
        confirmButtonText: 'Coba Lagi',
        confirmButtonColor: '#ef4444',
        iconColor: '#ef4444'
      });
      setRegisterError(registerErrorMessage);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleAdminValidationInputChange = (e) => {
    setAdminValidationData({
      ...adminValidationData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterInputChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('http://localhost:5000/abs.jpeg')" }} // Modified line
    >
      {/* Div ini untuk membuat efek overlay gelap dan blur di atas gambar latar */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[var(--border-default)]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full">
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <div className="w-16 h-16 bg-[var(--primary-color)] rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-muted)]">DM POS</h1>
                  <p className="mt-1 text-gray-500 dark:text-[var(--text-default)] text-sm">Sign in to access your dashboard</p>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 dark:text-[var(--text-default)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] dark:border-[var(--border-default)] dark:placeholder-[var(--text-default)] dark:text-[var(--text-default)]"
                    placeholder="Enter your username"
                    required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 dark:text-[var(--text-default)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] dark:border-[var(--border-default)] dark:placeholder-[var(--text-default)] dark:text-[var(--text-default)]"
                    placeholder="Enter your password"
                    required />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)]'}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Login'}
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-[var(--text-default)]">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setShowAdminValidationModal(true)}
                  className="text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] font-medium transition-colors"
                >
                  Daftar di sini
                </button>
              </p>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500 dark:text-[var(--text-default)]">
              <p>© {new Date().getFullYear()} DM POS SOLUTION. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="hidden lg:block lg:w-1/2">
          <img src="http://localhost:5000/pos.jpg" alt="DM POS" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Admin Validation Modal */}
      {showAdminValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-200 dark:border-[var(--border-default)]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-2">
                Validasi Admin
              </h2>
              <p className="text-gray-500 dark:text-[var(--text-muted)] text-sm">
                Hanya admin yang diizinkan membuat akun baru. Silakan masukkan kredensial admin untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleAdminValidation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">
                  Username Admin
                </label>
                <input
                  type="text"
                  name="username"
                  value={adminValidationData.username}
                  onChange={handleAdminValidationInputChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
                  placeholder="Masukkan username admin"
                  required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">
                  Password Admin
                </label>
                <input
                  type="password"
                  name="password"
                  value={adminValidationData.password}
                  onChange={handleAdminValidationInputChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
                  placeholder="Masukkan password admin"
                  required />
              </div>

              {adminValidationError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {adminValidationError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminValidationModal(false);
                    setAdminValidationData({ username: '', password: '' });
                    setAdminValidationError('');
                  } }
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-[var(--border-default)] rounded-lg font-medium text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAdminValidating}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors ${isAdminValidating
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)]'}`}
                >
                  {isAdminValidating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memvalidasi...
                    </>
                  ) : 'Validasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-200 dark:border-[var(--border-default)]">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-2">
                Daftar Akun Baru
              </h2>
              <p className="text-gray-500 dark:text-[var(--text-muted)] text-sm">
                Buat akun untuk mengakses sistem
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterInputChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
                  placeholder="Masukkan username"
                  required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterInputChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
                  placeholder="Masukkan password"
                  required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterInputChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] dark:border-[var(--border-default)] dark:text-[var(--text-default)]"
                >
                  <option value="kasir">Kasir</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {registerError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {registerError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setRegisterData({ username: '', password: '', role: 'kasir' });
                    setRegisterError('');
                    // Reset admin validation state juga
                    setAdminValidationData({ username: '', password: '' });
                    setAdminValidationError('');
                  } }
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-[var(--border-default)] rounded-lg font-medium text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRegisterLoading}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors ${isRegisterLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)]'}`}
                >
                  {isRegisterLoading ? 'Mendaftar...' : 'Daftar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    {initVisible && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-[var(--border-default)]">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-color)] text-white flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m2 0h-1m0 0V9m0 4H9m4 0h1m0 0v4m0-4h1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">Menyiapkan Aplikasi</h3>
              <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Menghubungkan backend, memeriksa database, dan koneksi internet</p>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-3 bg-[var(--primary-color)] transition-all duration-1000" style={{ width: `${initProgress}%` }} />
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-[var(--text-muted)]">Backend</span>
              <span className={`font-medium ${initStep.backend === 'connected' ? 'text-green-600 dark:text-green-400' : initStep.backend === 'error' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {initStep.backend === 'connected' ? 'Terhubung' : initStep.backend === 'error' ? 'Gagal' : 'Memeriksa...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-[var(--text-muted)]">Database</span>
              <span className={`font-medium ${initStep.db === 'ready' ? 'text-green-600 dark:text-green-400' : initStep.db === 'error' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {initStep.db === 'ready' ? 'Siap' : initStep.db === 'error' ? 'Gagal' : initStep.backend === 'connected' ? 'Menyiapkan...' : 'Menunggu backend...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-[var(--text-muted)]">Koneksi Internet</span>
              <span className={`font-medium ${initStep.internet === 'online' ? 'text-green-600 dark:text-green-400' : initStep.internet === 'offline' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {initStep.internet === 'online' ? 'Online' : initStep.internet === 'offline' ? 'Offline' : 'Memeriksa...'}
              </span>
            </div>
          </div>

          {(initStep.backend === 'error' || initStep.db === 'error') && (
            <div className="mt-4">
              <button onClick={restartInitialization} className="w-full py-2 px-4 rounded-lg font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)]">
                Coba Lagi
              </button>
              <p className="mt-2 text-xs text-gray-500 dark:text-[var(--text-muted)]">Jika tetap gagal, coba pilih menu View → Reload.</p>
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  );
}

export default LoginPage;