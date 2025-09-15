import React from 'react';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { shiftAPI } from '../api';
import { NumericFormat } from 'react-number-format';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  XCircle,
  ArrowUp,
  ArrowDown,
  Wallet,
  CircleDollarSign
} from 'lucide-react';


const formatRupiah = (amount) => {
  const number = Number(amount);
  if (isNaN(number)) {
    return 'Rp 0';
  }
  return 'Rp ' + number.toLocaleString('id-ID');
};

const StatCard = ({ icon, title, value, trend, className = '' }) => {
  return (
    <div className={`p-4 rounded-xl border ${className} bg-white dark:bg-[var(--bg-secondary)]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-muted)]">{title}</p>
          <p className="text-2xl font-bold mt-1 dark:text-[var(--text-default)]">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const ShiftManagementPage = () => {
  const { setSnackbar } = useOutletContext();
  const [shiftStatus, setShiftStatus] = useState({ isActive: false, shift: null });
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [shiftSummary, setShiftSummary] = useState(null);
  const [duration, setDuration] = useState('00:00:00');
  const [expectedCash, setExpectedCash] = useState(null);
  const [user, setUser] = useState(null);

  const fetchShiftStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await shiftAPI.getStatus();
      setShiftStatus(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memuat status shift';
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    fetchShiftStatus();
  }, [fetchShiftStatus]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (shiftStatus.isActive && shiftStatus.shift) {
      const opening = parseFloat(shiftStatus.shift.opening_cash || 0);
      const sales = parseFloat(shiftStatus.shift.total_sales || 0);
      const expenses = parseFloat(shiftStatus.shift.total_expenses || 0);
      const returns = parseFloat(shiftStatus.shift.total_returns || 0);
      const expected = (opening + sales) - expenses - returns;
      setExpectedCash(expected);
    } else {
      setExpectedCash(null);
    }
  }, [shiftStatus]);

  useEffect(() => {
    let intervalId;
    if (shiftStatus.isActive && shiftStatus.shift?.start_time) {
      const startTime = new Date(shiftStatus.shift.start_time);
      intervalId = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setDuration([
          hours.toString().padStart(2, '0'),
          minutes.toString().padStart(2, '0'),
          seconds.toString().padStart(2, '0')
        ].join(':'));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [shiftStatus.isActive, shiftStatus.shift?.start_time]);

  const handleStartShift = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await shiftAPI.start({ opening_cash: openingCash });
      setSnackbar({ open: true, message: response.data.message, severity: 'success' });
      setOpeningCash('');
      fetchShiftStatus();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memulai shift';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await shiftAPI.end({ closing_cash_physical: closingCash });
      setSnackbar({ open: true, message: response.data.message, severity: 'success' });
      setClosingCash('');
      setShiftSummary(response.data.summary);
      setShiftStatus({ isActive: false, shift: null });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengakhiri shift';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = useMemo(() => {
    if (loading) return true;
    if (expectedCash === null) return true;
    if (closingCash === '') return true;
    return parseFloat(closingCash) !== expectedCash;
  }, [loading, closingCash, expectedCash]);

  if (loading && expectedCash === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (shiftSummary) {
    const selisih = shiftSummary.closing_cash_physical - shiftSummary.closing_cash_system;
    const isDiscrepancy = selisih !== 0;
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-gray-200 dark:border-[var(--border-default)] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[var(--primary-color)] dark:to-[var(--primary-color-hover)] p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CircleDollarSign className="h-8 w-8" />
              <span>Rekap Shift</span>
            </h2>
            <p className="text-blue-100 dark:text-[var(--text-primary-color)]">Ringkasan transaksi shift terakhir</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              icon={<DollarSign className="h-6 w-6" />}
              title="Kas Awal"
              value={formatRupiah(parseFloat(shiftSummary.opening_cash))}
              trend="up"
              className="border-blue-200 dark:border-[var(--primary-color)]/50"
            />
            <StatCard 
              icon={<TrendingUp className="h-6 w-6" />}
              title="Total Penjualan"
              value={formatRupiah(parseFloat(shiftSummary.total_sales))}
              trend="up"
              className="border-green-200 dark:border-green-900/50"
            />
            <StatCard 
              icon={<TrendingDown className="h-6 w-6" />}
              title="Total Beban"
              value={`-${formatRupiah(parseFloat(shiftSummary.total_expenses || 0))}`}
              trend="down"
              className="border-red-200 dark:border-red-900/50"
            />
            <StatCard 
              icon={<TrendingDown className="h-6 w-6" />}
              title="Total Retur"
              value={`-${formatRupiah(parseFloat(shiftSummary.total_returns || 0))}`}
              trend="down"
              className="border-orange-200 dark:border-orange-900/50"
            />
            <StatCard 
              icon={<Wallet className="h-6 w-6" />}
              title="Kas Akhir (Sistem)"
              value={formatRupiah(parseFloat(shiftSummary.closing_cash_system))}
              trend={selisih >= 0 ? 'up' : 'down'}
              className="border-purple-200 dark:border-purple-900/50"
            />
          </div>
          
          <div className={`p-4 border-t dark:border-[var(--border-default)] ${isDiscrepancy ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isDiscrepancy ? (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
                <span className="font-semibold dark:text-[var(--text-default)]">Kas Fisik</span>
              </div>
              <div className={`font-bold ${isDiscrepancy ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatRupiah(parseFloat(shiftSummary.closing_cash_physical))}
              </div>
            </div>
            
            {isDiscrepancy && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm">Selisih:</span>
                <div className={`flex items-center gap-1 ${selisih > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {selisih > 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span className="font-bold">
                    {formatRupiah(Math.abs(selisih))} 
                    {selisih > 0 ? ' (Lebih)' : ' (Kurang)'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-[var(--bg-secondary)]/50 border-t border-gray-200 dark:border-[var(--border-default)]">
            <button 
              onClick={() => { setShiftSummary(null); fetchShiftStatus(); }} 
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-[var(--primary-color)] dark:hover:bg-[var(--primary-color-hover)] text-white font-medium rounded-lg transition duration-200"
            >
              Kembali ke Dashboard Shift
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-[var(--card-bg-dark)] rounded-2xl shadow-lg border-2 border-gray-200 dark:border-[var(--border-default)] overflow-hidden">
        {shiftStatus.isActive ? (
          <form onSubmit={handleEndShift}>
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 dark:from-yellow-800 dark:to-yellow-900 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Clock className="h-8 w-8" />
                    <span>Shift Aktif</span>
                  </h2>
                  <p className="text-red-100 dark:text-yellow-200">Shift Anda sedang berjalan</p>
                </div>
                {user && (
                  <div className="flex items-center gap-3">
                    <span className="text-base font-medium text-red-100 dark:text-yellow-200">Selamat datang, {user.username}</span>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-[var(--sidebar-bg-dark)] p-4 rounded-lg border border-blue-200 dark:border-[var(--primary-color)]/50">
                  <p className="text-sm text-blue-700 dark:text-[var(--text-muted)]">Durasi Shift</p>
                  <p className="text-2xl font-medium font-mono text-blue-800 dark:text-[var(--text-muted)] mt-1">{duration}</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-700 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">Kas Awal</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200 mt-1">
                    {formatRupiah(parseFloat(shiftStatus.shift?.opening_cash || 0))}
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300">Perkiraan Kas Akhir</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-200 mt-1">
                    {expectedCash ? formatRupiah(expectedCash) : 'Menghitung...'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="closingCash" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-2">
                    Jumlah Uang Fisik di Laci Kas <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">Wajib</span>
                  </label>
                  <NumericFormat 
                    id="closingCash" 
                    value={closingCash} 
                    onValueChange={(values) => setClosingCash(values.value)} 
                    className="pl-4 block w-full px-4 py-3 border border-gray-300 dark:border-[var(--border-default)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]" 
                    thousandSeparator='.' 
                    decimalSeparator=',' 
                    prefix='Rp ' 
                    required 
                    placeholder="Contoh: 1.500.000" 
                  />
                </div>
                
                {expectedCash !== null && (
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-[var(--text-muted)]">Kas Sistem Seharusnya:</p>
                      <p className="font-bold text-green-800 dark:text-[var(--text-muted)]">{formatRupiah(expectedCash)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-[var(--bg-secondary)]/50 border-t border-gray-200 dark:border-[var(--border-default)]">
              <button 
                type="submit" 
                disabled={isButtonDisabled} 
                className={`w-full py-3 px-4 font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 text-white ${
                  isButtonDisabled
                    ? 'bg-gray-400 dark:bg-[var(--bg-secondary)] text-gray-300 dark:text-[var(--text-muted)] cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    Tutup Shift
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStartShift}>
            <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Clock className="h-8 w-8" />
                    <span>Mulai Shift Baru</span>
                  </h2>
                  <p className="text-green-100 dark:text-green-200">Tidak ada shift yang aktif</p>
                </div>
                {user && (
                  <div className="flex items-center gap-3">
                    <span className="text-base font-medium text-green-100 dark:text-green-200">Selamat datang, {user.username}</span>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="openingCash" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-2">
                    Kas Awal <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">Wajib</span>
                  </label>
                  <NumericFormat 
                    id="openingCash" 
                    value={openingCash} 
                    onValueChange={(values) => setOpeningCash(values.value)} 
                    className="pl-4 block w-full px-4 py-3 border border-gray-300 dark:border-[var(--border-default)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]" 
                    thousandSeparator='.' 
                    decimalSeparator=',' 
                    prefix='Rp ' 
                    required 
                    placeholder="Contoh: 500.000" 
                  />
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-gray-100">
                    Pastikan jumlah kas awal sesuai dengan fisik uang di laci kas sebelum memulai shift
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-[var(--bg-secondary)]/50 border-t border-gray-200 dark:border-[var(--border-default)]">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Mulai Shift
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShiftManagementPage;
