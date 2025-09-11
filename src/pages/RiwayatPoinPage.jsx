import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiCalendar, FiFilter, FiSearch, FiInbox, FiTrendingUp, FiTrendingDown, FiRepeat } from 'react-icons/fi';
import { pointsAPI } from '../api';
import { format } from 'date-fns';

const RiwayatPoinPage = () => {
  const { setSnackbar } = useOutletContext();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    type: '',
    customerName: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pointsAPI.getHistory(filters);
      setHistory(response.data.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal mengambil riwayat poin.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [filters, setSnackbar]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, customerName: searchTerm }));
  };

  const typeInfoMapping = {
    earn: { text: 'Dapat Poin', className: 'text-[var(--success-color)]', icon: <FiTrendingUp /> },
    redeem_catalog: { text: 'Tukar Hadiah', className: 'text-[var(--danger-color)]', icon: <FiTrendingDown /> },
    redeem_discount: { text: 'Tukar Diskon', className: 'text-[var(--danger-color)]', icon: <FiTrendingDown /> },
    transfer_in: { text: 'Transfer Masuk', className: 'text-[var(--primary-color)]', icon: <FiRepeat /> },
    transfer_out: { text: 'Transfer Keluar', className: 'text-[var(--warning-color)]', icon: <FiRepeat /> },
    default: { text: 'Lainnya', className: 'text-[var(--text-muted)]', icon: null },
  };

  const getTransactionTypeInfo = (type) => {
    return typeInfoMapping[type] || { ...typeInfoMapping.default, text: type };
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-[var(--bg-primary)] rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-default)]">Riwayat Poin Pelanggan</h1>
        <p className="text-[var(--text-muted)]">Lacak semua pergerakan poin, termasuk perolehan, penukaran, dan transfer.</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Filters */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Tanggal Mulai</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/70" />
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full pl-10 p-2 border rounded-lg bg-[var(--bg-primary)] text-[var(--text-default)] border-[var(--border-default)]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Tanggal Akhir</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/70" />
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full pl-10 p-2 border rounded-lg bg-[var(--bg-primary)] text-[var(--text-default)] border-[var(--border-default)]" />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Jenis Transaksi</label>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/70" />
              <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full pl-10 p-2 border rounded-lg bg-[var(--bg-primary)] text-[var(--text-default)] border-[var(--border-default)]">
                <option value="">Semua Jenis</option>
                <option value="earn">Dapat Poin</option>
                <option value="redeem_catalog">Tukar Hadiah</option>
                <option value="redeem_discount">Tukar Diskon</option>
                <option value="transfer_in">Transfer Masuk</option>
                <option value="transfer_out">Transfer Keluar</option>
              </select>
            </div>
          </div>

          {/* Customer Search */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Nama Pelanggan</label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-grow">
                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/70" />
                <input type="text" placeholder="Cari pelanggan..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 p-2 border rounded-lg bg-[var(--bg-primary)] text-[var(--text-default)] border-[var(--border-default)]" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-auto rounded-lg border border-[var(--border-default)]">
        <table className="min-w-full divide-y divide-[var(--border-default)]">
          <thead className="bg-[var(--bg-default)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Tanggal & Waktu</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Pelanggan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Jenis</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Deskripsi</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Perubahan Poin</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Sisa Poin</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-primary)] divide-y divide-[var(--border-default)]">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10"><div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
            ) : history.length > 0 ? (
              history.map(item => {
                const typeInfo = getTransactionTypeInfo(item.type);
                return (
                  <tr key={item.id} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--text-default)]">
                      {item.customer_name}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${typeInfo.className}`}>
                      <div className="flex items-center gap-2">
                        {typeInfo.icon}
                        <span>{typeInfo.text}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {item.description}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${item.points_change > 0 ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
                      {item.points_change > 0 ? `+${item.points_change}` : item.points_change}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-[var(--text-default)]">
                      {item.balance_after.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-[var(--text-muted)]">
                  <FiInbox className="mx-auto text-4xl mb-2" />
                  Tidak ada riwayat poin yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiwayatPoinPage;