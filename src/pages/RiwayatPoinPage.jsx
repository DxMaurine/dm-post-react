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

  const getTransactionTypeInfo = (type) => {
    switch (type) {
      case 'earn':
        return { text: 'Dapat Poin', color: 'text-green-500', icon: <FiTrendingUp /> };
      case 'redeem_catalog':
        return { text: 'Tukar Hadiah', color: 'text-red-500', icon: <FiTrendingDown /> };
      case 'redeem_discount':
        return { text: 'Tukar Diskon', color: 'text-red-500', icon: <FiTrendingDown /> };
      case 'transfer_in':
        return { text: 'Transfer Masuk', color: 'text-blue-500', icon: <FiRepeat /> };
      case 'transfer_out':
        return { text: 'Transfer Keluar', color: 'text-orange-500', icon: <FiRepeat /> };
      default:
        return { text: type, color: 'text-gray-500', icon: null };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white dark:bg-[var(--bg-default)] rounded-xl shadow-sm dark:shadow-gray-700/50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Riwayat Poin Pelanggan</h1>
        <p className="text-gray-600 dark:text-[var(--text-muted)]">Lacak semua pergerakan poin, termasuk perolehan, penukaran, dan transfer.</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl border dark:border-[var(--border-default)] mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">Tanggal Mulai</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full pl-10 p-2 border rounded-lg bg-white dark:bg-[var(--bg-default)] dark:text-white dark:border-gray-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">Tanggal Akhir</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full pl-10 p-2 border rounded-lg bg-white dark:bg-[var(--bg-default)] dark:text-white dark:border-gray-600" />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">Jenis Transaksi</label>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full pl-10 p-2 border rounded-lg bg-white dark:bg-[var(--bg-default)] dark:text-white dark:border-gray-600">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)] mb-1">Nama Pelanggan</label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-grow">
                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Cari pelanggan..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 p-2 border rounded-lg bg-white dark:bg-[var(--bg-default)] dark:text-white dark:border-gray-600" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-[var(--border-default)]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
          <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal & Waktu</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pelanggan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jenis</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deskripsi</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perubahan Poin</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sisa Poin</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[var(--bg-default)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10"><div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
            ) : history.length > 0 ? (
              history.map(item => {
                const typeInfo = getTransactionTypeInfo(item.type);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                      {item.customer_name}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${typeInfo.color}`}>
                      <div className="flex items-center gap-2">
                        {typeInfo.icon}
                        <span>{typeInfo.text}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {item.description}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${item.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.points_change > 0 ? `+${item.points_change}` : item.points_change}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-800 dark:text-white">
                      {item.balance_after.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500 dark:text-gray-400">
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
