import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { formatDate } from '../utils';
import { transactionAPI } from '../api';
import React from 'react';
import { FiDollarSign, FiFileText } from 'react-icons/fi';

const RekapPenjualan = () => {
  const [chart, setChart] = useState([]);
  const [mode, setMode] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [lineColor, setLineColor] = useState('#2563eb'); // Default color

  useEffect(() => {
    const updateLineColor = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      if (isDarkMode) {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        setLineColor(primaryColor || '#8884d8');
      } else {
        setLineColor('#2563eb'); // Hardcoded visible blue for light mode
      }
    };

    updateLineColor(); // Set initial color

    // Observe theme changes
    const observer = new MutationObserver(updateLineColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

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
        const total = response.data.chart?.reduce((sum, item) => sum + (Number(item.total) || 0), 0) || 0;
        setTotalSales(total);
        setTotalTransactions(response.data.chart?.length || 0);
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
        <div className="p-3 bg-[var(--bg-primary)]/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm shadow-lg rounded-lg border border-[var(--border-default)]">
          <p className="label text-sm text-[var(--text-muted)]">{formatDate(label)}</p>
          <p className="intro text-lg font-bold text-[var(--primary-color)]">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const SummaryCard = ({ icon, title, value, colorClass }) => (
    <div className={`bg-[var(--bg-secondary)] p-4 rounded-xl shadow-md border-l-4 ${colorClass}`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg mr-4 bg-opacity-20 ${colorClass.replace('border', 'bg').replace('-500', '-500/10')}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)]">{title}</h3>
          <p className="text-xl font-bold mt-1 text-[var(--text-default)]">{value}</p>
        </div>
      </div>
    </div>
  );

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="h-4 w-32 bg-[var(--bg-secondary)] rounded mb-2"></div>
            <div className="h-40 w-full bg-[var(--bg-tertiary)] rounded"></div>
          </div>
        </div>
      );
    }
    if (chart.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
          <svg className="w-12 h-12 mb-4 text-[var(--text-muted)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Tidak ada data untuk ditampilkan</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard 
            icon={<FiDollarSign className="text-[var(--text-default)]" />} 
            title={`Total Penjualan (${titles[mode]})`} 
            value={formatCurrency(totalSales)} 
            colorClass="border-[var(--primary-color)]" 
          />
          <SummaryCard 
            icon={<FiFileText className="text-[var(--text-default)]" />} 
            title={`Jumlah Transaksi (${titles[mode]})`} 
            value={totalTransactions} 
            colorClass="border-[var(--primary-color)]" 
          />
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis 
                dataKey="label"
                tickFormatter={(label) => formatDate(label)}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--border-default)' }}
                tickLine={{ stroke: 'var(--border-default)' }}
                interval={Math.max(0, Math.floor(chart.length / 10) -1)}
              />
              <YAxis 
                tickFormatter={val => `Rp${val.toLocaleString('id-ID', { notation: 'compact' })}`}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                width={80}
                stroke="var(--border-default)"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary-color)', strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ color: 'var(--text-muted)' }}/>
              <Line 
                type="monotone"
                dataKey="total"
                stroke={lineColor}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: 'var(--bg-default)', stroke: lineColor }}
                activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2, fill: 'var(--bg-default)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-[var(--bg-primary)] rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-default)] mb-1">Rekap Penjualan</h2>
          <p className="text-[var(--text-default)]">Analisis performa penjualan Anda</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4 md:mt-0 bg-[var(--bg-tertiary)] rounded-lg p-1">
          <button 
            onClick={() => setMode('daily')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'daily' 
                ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            Harian
          </button>
          <button 
            onClick={() => setMode('monthly')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'monthly' 
                ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            Bulanan
          </button>
          <button 
            onClick={() => setMode('yearly')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'yearly' 
                ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)]'
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

