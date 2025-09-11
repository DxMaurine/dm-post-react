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
          {/* Card 1: Total Penjualan */}
          <div className="bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-[var(--primary-color)]/80">Total Penjualan ({titles[mode]})</h3>
            <p className="text-2xl font-bold mt-1 text-[var(--primary-color)]">{formatCurrency(totalSales)}</p>
          </div>

          {/* Card 2: Jumlah Transaksi */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-[var(--text-muted)]">Jumlah Transaksi ({titles[mode]})</h3>
            <p className="text-2xl font-bold mt-1 text-[var(--text-default)]">{totalTransactions}</p>
          </div>
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
                stroke="var(--primary-color)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: 'var(--bg-primary)', stroke: 'var(--primary-color)' }}
                activeDot={{ r: 6, stroke: 'var(--primary-color-hover)', strokeWidth: 2, fill: 'var(--bg-primary)' }}
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
          <p className="text-[var(--text-muted)]">Analisis performa penjualan Anda</p>
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