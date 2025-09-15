import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils';
import { reportAPI } from '../api';
import React from 'react';
import { FiArrowUp, FiArrowDown, FiDollarSign } from 'react-icons/fi';

const LaporanLabaRugi = () => {
  const { setSnackbar } = useOutletContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('daily');

  const [chartColors, setChartColors] = useState({ primary: '#8884d8', success: '#22c55e' });

  useEffect(() => {
    const getChartColors = () => {
      if (typeof window !== 'undefined') {
        const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#8884d8';
        const success = getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim() || '#22c55e';
        setChartColors({ primary, success });
      }
    };
    getChartColors();
    const observer = new MutationObserver(getChartColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await reportAPI.getProfitReport({ params: { mode } });
        setData(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [mode, setSnackbar]);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const totalSales = data.reduce((acc, item) => acc + Number(item.total_penjualan), 0);
  const totalHPP = data.reduce((acc, item) => acc + Number(item.total_hpp), 0);
  const totalProfit = data.reduce((acc, item) => acc + Number(item.laba_kotor), 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-[var(--bg-primary)]/90 backdrop-blur-sm shadow-lg rounded-lg border border-[var(--border-default)]">
          <p className="label text-sm text-[var(--text-muted)]">{formatDate(label)}</p>
          {payload.map((pld) => (
            <div key={pld.dataKey} className="flex items-center justify-between gap-4">
              <span style={{ color: pld.fill }}>{pld.name}</span>
              <span className="font-bold text-[var(--text-default)]">{formatCurrency(pld.value)}</span>
            </div>
          ))}
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

  return (
    <div className="w-full max-w-7xl p-6 bg-[var(--bg-primary)] mx-auto rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-default)] mb-2">Laporan Laba & Rugi</h2>
          <p className="text-[var(--text-default)]">Pantau profitabilitas bisnis Anda</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0 bg-[var(--bg-tertiary)] rounded-lg p-1">
          <button onClick={() => setMode('daily')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'daily' ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow' : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)]'}`}>
            Harian
          </button>
          <button onClick={() => setMode('monthly')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'monthly' ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow' : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)]'}`}>
            Bulanan
          </button>
          <button onClick={() => setMode('yearly')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'yearly' ? 'bg-[var(--bg-primary)] text-[var(--primary-color)] shadow' : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)]'}`}>
            Tahunan
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard 
            icon={<FiArrowUp className="text-blue-500" />} 
            title="Total Penjualan" 
            value={formatCurrency(totalSales)} 
            colorClass="border-blue-500" 
          />
          <SummaryCard 
            icon={<FiArrowDown className="text-red-500" />} 
            title="Total HPP" 
            value={formatCurrency(totalHPP)} 
            colorClass="border-red-500" 
          />
          <SummaryCard 
            icon={<FiDollarSign className="text-green-500" />} 
            title="Laba Kotor" 
            value={formatCurrency(totalProfit)} 
            colorClass="border-green-500" 
          />
        </div>
      )}

      <div className="bg-[var(--bg-primary)] rounded-xl shadow-sm border-2 border-[var(--border-default)] p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-default)]">Analisis Laba Rugi</h2>
          {loading && <div className="text-sm text-[var(--text-muted)]">Memuat data...</div>}
        </div>
        
        {data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: mode === 'daily' ? 60 : 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tickFormatter={(label) => {
                    if (mode === 'daily') return formatDate(label);
                    if (mode === 'monthly') return new Date(label).toLocaleString('id-ID', { month: 'short' });
                    if (typeof label === 'string' && label.match(/^\d{4}$/)) return label;
                    const date = new Date(label);
                    return isNaN(date) ? label : date.getFullYear().toString();
                  }}
                  tick={{ angle: mode === 'daily' ? -45 : 0, textAnchor: mode === 'daily' ? 'end' : 'middle', fontSize: 11, fill: 'var(--text-muted)' }}
                  height={mode === 'daily' ? 70 : mode === 'monthly' ? 50 : 40}
                  axisLine={{ stroke: 'var(--border-default)' }}
                  tickLine={{ stroke: 'var(--border-default)' }}
                  interval={mode === 'yearly' ? Math.max(1, Math.floor(data.length / 10)) : data.length > 10 ? Math.ceil(data.length / 10) : 0}
                />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value)} stroke="var(--border-default)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-default)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', color: 'var(--text-muted)' }} />
                <Bar dataKey="total_penjualan" fill={chartColors.primary} name="Total Penjualan" radius={[4, 4, 0, 0]} />
                <Bar dataKey="laba_kotor" fill={chartColors.success}  name="Laba Kotor" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-[var(--text-muted)]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-lg font-medium text-[var(--text-muted)] text-center">{loading ? 'Memuat data...' : 'Tidak ada data yang tersedia untuk periode ini'}</p>
            <p className="text-sm text-[var(--text-muted)]/80 mt-2 text-center">Silakan coba periode lain atau filter yang berbeda</p>
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-primary)] rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-default)]">Detail Laporan</h2>
          {data.length > 0 && <div className="text-sm text-[var(--text-muted)]">{data.length} data ditemukan</div>}
        </div>

        {data.length > 0 ? (
          <div className="overflow-auto rounded-lg border border-[var(--border-default)]">
            <table className="min-w-full divide-y divide-[var(--border-default)]">
              <thead className="bg-[var(--bg-tertiary)] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Periode</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Penjualan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">HPP</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Laba</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-primary)] divide-y divide-[var(--border-default)]">
                {data.map((row) => (
                  <tr key={row.label} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--text-default)]">{mode === 'daily' ? formatDate(row.label) : row.label}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-[var(--text-default)]">{formatCurrency(row.total_penjualan)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-[var(--text-default)]">{formatCurrency(row.total_hpp)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-[var(--success-color)]">{formatCurrency(row.laba_kotor)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[var(--bg-tertiary)] sticky bottom-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-default)]">Total</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[var(--text-default)]">{formatCurrency(totalSales)}</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[var(--text-default)]">{formatCurrency(totalHPP)}</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[var(--success-color)]">{formatCurrency(totalProfit)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-[var(--border-default)] p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-[var(--text-muted)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="mt-2 text-sm font-medium text-[var(--text-muted)]">Tidak ada data</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]/80">Tidak ada data laba rugi yang tersedia untuk ditampilkan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanLabaRugi;