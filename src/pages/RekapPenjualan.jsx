import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { formatDate } from '../utils';
import { transactionAPI } from '../api';
import React from 'react';

const RekapPenjualan = () => {
  const [chart, setChart] = useState([]);
  const [mode, setMode] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

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

  const titles = {
    daily: 'Harian',
    monthly: 'Bulanan',
    yearly: 'Tahunan'
  };

  useEffect(() => {
    setLoading(true);
    transactionAPI.getAll()
      .then(response => {
        setChart(response.data.chart || []);
        // Calculate total sales
        const total = response.data.chart?.reduce((sum, item) => sum + (Number(item.total) || 0), 0) || 0;
        setTotalSales(total);
        setTotalTransactions(response.data.chart?.length || 0); // Calculate total transactions
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mode]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="label text-sm text-gray-700 dark:text-gray-300">{formatDate(label)}</p>
          <p className="intro text-lg font-bold text-[var(--primary-color)]">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-32 bg-gray-200 dark:bg-[var(--bg-secondary)] rounded mb-2"></div>
            <div className="h-40 w-full bg-gray-100 dark:bg-[var(--bg-secondary)] rounded"></div>
          </div>
        </div>
      );
    }
    if (chart.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-[var(--text-muted)]">
          <svg className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Tidak ada data untuk ditampilkan</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Total Penjualan */}
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Total Penjualan ({titles[mode]})</h3>
            <p className="text-2xl font-bold mt-1 text-green-700 dark:text-green-300">{formatCurrency(totalSales)}</p>
          </div>

          {/* Card 2: Jumlah Transaksi */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Jumlah Transaksi ({titles[mode]})</h3>
            <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{totalTransactions}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="label"
                tickFormatter={(label) => formatDate(label)}
                tick={{
                  fontSize: 11,
                  fill: axisColor
                }}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
                interval={Math.max(0, Math.floor(chart.length / 10) -1)}
              />
              <YAxis 
                tickFormatter={val => `Rp${val.toLocaleString('id-ID', { notation: 'compact' })}`}
                tick={{ fontSize: 11, fill: axisColor }}
                width={80}
                stroke={gridColor}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: axisColor, strokeDasharray: '3 3' }} />
              <Legend />
              <Line 
                type="monotone"
                dataKey="total"
                stroke="var(--primary-color)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: '#ffffff', stroke: 'var(--primary-color)' }}
                activeDot={{ r: 6, stroke: 'var(--primary-color-hover)', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg  p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-1">Rekap Penjualan</h2>
          <p className="text-gray-600 dark:text-[var(--text-muted)]">Analisis performa penjualan Anda</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4 md:mt-0 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-lg p-1">
          <button 
            onClick={() => setMode('daily')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'daily' 
                ? 'bg-white dark:bg-[var(--bg-secondary)] text-[var(--primary-color)] shadow' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Harian
          </button>
          <button 
            onClick={() => setMode('monthly')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'monthly' 
                ? 'bg-white dark:bg-[var(--bg-secondary)] text-[var(--primary-color)] shadow' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Bulanan
          </button>
          <button 
            onClick={() => setMode('yearly')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'yearly' 
                ? 'bg-white dark:bg-[var(--bg-secondary)] text-[var(--primary-color)] shadow' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Chart Content */}
      {renderChart()}
    </div>
  );
};

export default RekapPenjualan;