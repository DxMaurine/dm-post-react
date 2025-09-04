import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils';
import { reportAPI } from '../api';
import React from 'react';

const LaporanLabaRugi = () => {
  const { setSnackbar } = useOutletContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('daily');

  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const axisColor = isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#6b7280';
  const gridColor = isDarkMode ? 'hsl(215 27.9% 26.9%)' : '#e5e7eb';
  // Define bar colors that adapt to dark mode. Recharts can't use CSS variables
  // directly in the `fill` prop, so we define them in JS.
  const barFillBlue = isDarkMode ? '#60a5fa' : '#3b82f6'; // Tailwind's blue-400 and blue-500
  const barFillGreen = isDarkMode ? '#4ade80' : '#22c55e'; // Tailwind's green-400 and green-500

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await reportAPI.getProfitReport({ params: { mode } });
        setData(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        });
        setData([]); // Set data kosong jika error
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [mode, setSnackbar]);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);

  const totalSales = data.reduce((acc, item) => acc + Number(item.total_penjualan), 0);
  const totalHPP = data.reduce((acc, item) => acc + Number(item.total_hpp), 0);
  const totalProfit = data.reduce((acc, item) => acc + Number(item.laba_kotor), 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="label text-sm text-gray-700 dark:text-gray-300">{formatDate(label)}</p>
          {payload.map((pld) => (
            <div key={pld.dataKey} className="flex items-center justify-between gap-4">
              <span style={{ color: pld.fill }}>{pld.name}</span>
              <span className="font-bold text-gray-800 dark:text-[var(--text-default)]">{formatCurrency(pld.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl p-6 bg-white dark:bg-[var(--bg-default)] mx-auto rounded-xl shadow-sm dark:shadow-gray-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-2">Laporan Laba & Rugi</h2>
          <p className="text-gray-600 dark:text-[var(--text-muted)]">Pantau profitabilitas bisnis Anda</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-lg p-1">
          <button 
            onClick={() => setMode('daily')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'daily' 
              ? 'bg-white dark:bg-[var(--bg-default)] text-[var(--primary-color)] shadow' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Harian
          </button>
          <button 
            onClick={() => setMode('monthly')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'monthly' 
              ? 'bg-white dark:bg-[var(--bg-default)] text-[var(--primary-color)] shadow' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Bulanan
          </button>
          <button 
            onClick={() => setMode('yearly')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'yearly' 
              ? 'bg-white dark:bg-[var(--bg-default)] text-[var(--primary-color)] shadow' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Stats Cards - Tampilkan hanya jika ada data */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Penjualan</h3>
            <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{formatCurrency(totalSales)}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Total HPP</h3>
            <p className="text-2xl font-bold mt-1 text-amber-700 dark:text-amber-300">{formatCurrency(totalHPP)}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Laba Kotor</h3>
            <p className="text-2xl font-bold mt-1 text-green-700 dark:text-green-300">{formatCurrency(totalProfit)}</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)] p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">Analisis Laba Rugi</h2>
          {loading && <div className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Memuat data...</div>}
        </div>
        
        {data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ top: 20, right: 30, left: 20, bottom: mode === 'daily' ? 60 : 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tickFormatter={(label) => {
                    if (mode === 'daily') return formatDate(label);
                    if (mode === 'monthly') {
                      const date = new Date(label);
                      return date.toLocaleString('id-ID', { month: 'short' });
                    }
                    if (typeof label === 'string' && label.match(/^\d{4}$/)) return label;
                    const date = new Date(label);
                    return isNaN(date) ? label : date.getFullYear().toString();
                  }}
                  tick={{
                    angle: mode === 'daily' ? -45 : 0,
                    textAnchor: mode === 'daily' ? 'end' : 'middle',
                    fontSize: 11, fill: axisColor
                  }}
                  height={mode === 'daily' ? 70 : mode === 'monthly' ? 50 : 40}
                  axisLine={{ stroke: gridColor }}
                  tickLine={{ stroke: gridColor }}
                  interval={mode === 'yearly' ? Math.max(1, Math.floor(data.length / 10)) :
                          data.length > 10 ? Math.ceil(data.length / 10) : 0}
                />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value)}
                  stroke={gridColor}
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="total_penjualan" 
                  fill={barFillBlue}
                  name="Total Penjualan" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="laba_kotor" 
                  fill={barFillGreen}
                  name="Laba Kotor" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-500 dark:text-[var(--text-muted)] text-center">
              {loading ? 'Memuat data...' : 'Tidak ada data yang tersedia untuk periode ini'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-600 mt-2 text-center">
              Silakan coba periode lain atau filter yang berbeda
            </p>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-sm dark:shadow-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Detail Laporan</h2>
          {data.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {data.length} data ditemukan
            </div>
          )}
        </div>

        {data.length > 0 ? (
          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-[var(--bg-default)] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Periode</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Penjualan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">HPP</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Laba</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {mode === 'daily' ? formatDate(row.label) : row.label}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(row.total_penjualan)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(row.total_hpp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(row.laba_kotor)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-[var(--bg-default)] sticky bottom-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalSales)}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalHPP)}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalProfit)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-500 dark:text-[var(--text-muted)]">Tidak ada data</h3>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">Tidak ada data laba rugi yang tersedia untuk ditampilkan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanLabaRugi;