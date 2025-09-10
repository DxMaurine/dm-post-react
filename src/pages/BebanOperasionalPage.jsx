import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaPlus, FaTrash, FaMoneyBillWave, FaChartPie, FaFilter } from 'react-icons/fa';
import { formatDate } from '../utils';
import { expenseAPI } from '../api';
import Swal from 'sweetalert2';

const formatRupiah = (amount) => {
  const number = Number(amount);
  if (isNaN(number)) {
    return 'Rp 0';
  }
  return 'Rp ' + number.toLocaleString('id-ID');
};

const BebanOperasionalPage = () => {
  const { setSnackbar } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ description: '', category: 'Lain-lain', amount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalExpensesToday, setTotalExpensesToday] = useState(0);
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showStats, setShowStats] = useState(false);
  
  // Add proper null checking for user
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchExpenses = useCallback(async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [setSnackbar, user?.role]);

  const fetchTotalExpensesToday = useCallback(async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const response = await expenseAPI.getAll({ date: today });
      let expensesForTotal = response.data;

      // For cashiers, we only sum up the expenses they created themselves today.
      // This correctly scopes their view to their own activities for the day.
      if (user.role === 'kasir') {
        expensesForTotal = response.data.filter(exp => exp.username === user.username);
      }

      const total = expensesForTotal.reduce((acc, exp) => acc + parseFloat(exp.amount || 0), 0);
      setTotalExpensesToday(total);
    } catch (error) {
      setSnackbar({ open: true, message: "Gagal memuat total beban hari ini.", severity: 'error' });
    }
  }, [user?.role, user?.username, setSnackbar]);

  useEffect(() => {
    fetchExpenses();
    fetchTotalExpensesToday();
  }, [fetchExpenses, fetchTotalExpensesToday]);

  const categories = ['Perlengkapan Toko', 'Transportasi', 'Konsumsi', 'Gaji', 'Listrik/Air', 'Lain-lain'];

  // Filter expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesDate = !dateFilter || exp.expense_date.includes(dateFilter);
      const matchesCategory = !categoryFilter || exp.category === categoryFilter;
      return matchesDate && matchesCategory;
    });
  }, [expenses, dateFilter, categoryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const result = {
      total: 0,
      byCategory: {},
      byUser: {},
      dailyAverage: 0
    };

    if (expenses.length === 0) return result;

    // Calculate total and by category
    expenses.forEach(exp => {
      result.total += parseFloat(exp.amount || 0);
      
      if (!result.byCategory[exp.category]) {
        result.byCategory[exp.category] = 0;
      }
      result.byCategory[exp.category] += parseFloat(exp.amount || 0);
      
      if (!result.byUser[exp.username]) {
        result.byUser[exp.username] = 0;
      }
      result.byUser[exp.username] += parseFloat(exp.amount || 0);
    });

    // Calculate daily average
    const dateSet = new Set(expenses.map(exp => exp.expense_date));
    const uniqueDays = dateSet.size;
    result.dailyAverage = result.total / uniqueDays;

    return result;
  }, [expenses]);

  const totalBeban = useMemo(() => {
    return filteredExpenses.reduce((acc, exp) => acc + parseFloat(exp.amount || 0), 0);
  }, [filteredExpenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await expenseAPI.create(form);
      setSnackbar({ open: true, message: 'Beban berhasil dicatat.', severity: 'success' });
      setForm({ description: '', category: 'Lain-lain', amount: '' });
      if (user && (user.role === 'admin' || user.role === 'manager')) {
        fetchExpenses();
      }
      fetchTotalExpensesToday();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan dapat mengembalikan data beban ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await expenseAPI.delete(id);
        Swal.fire(
          'Terhapus!',
          'Beban berhasil dihapus.',
          'success'
        );
        fetchExpenses();
        fetchTotalExpensesToday();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire(
          'Gagal!',
          errorMessage,
          'error'
        );
      }
    }
  };

  const resetFilters = () => {
    setDateFilter('');
    setCategoryFilter('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 dark:bg-[var(--bg-secondary)] min-h-screen rounded-xl">
      <div className="bg-white dark:bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg mb-8 border border-gray-200 dark:border-[var(--border-default)]">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-6 flex items-center">
          <FaMoneyBillWave className="mr-3 text-green-500 dark:text-green-400" /> Catat Beban Operasional
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)]">Keterangan</label>
            <input
              type="text"
              name="description"
              id="description"
              value={form.description}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
              required
              placeholder="Contoh: Beli air galon"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)]">Kategori</label>
              <select
                name="category"
                id="category"
                value={form.category}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-muted)]">Jumlah (Rp)</label>
              <input
                type="number"
                name="amount"
                id="amount"
                value={form.amount}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                required
                placeholder="Contoh: 50000"
              />
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              <FaPlus className="mr-2" /> {isSubmitting ? 'Menyimpan...' : 'Simpan Beban'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-red-300">
            {user.role === 'kasir' ? 'Total Beban Anda (Hari Ini)' : 'Total Beban Hari Ini'}
          </p>
          <p className="text-2xl font-bold dark:text-red-200">{formatRupiah(totalExpensesToday)}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-blue-300">Total Beban Keseluruhan</p>
          <p className="text-2xl font-bold dark:text-blue-200">{formatRupiah(stats.total)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-green-300">Rata-rata Harian</p>
          <p className="text-2xl font-bold dark:text-green-200">{formatRupiah(stats.dailyAverage)}</p>
        </div>
      </div>

      {(user.role === 'admin' || user.role === 'manager') && (
        <>
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-gray-200 dark:border-[var(--border-default)] mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)]">Riwayat Beban Operasional</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center px-3 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800"
                >
                  <FaChartPie className="mr-2" /> {showStats ? 'Sembunyikan Statistik' : 'Tampilkan Statistik'}
                </button>
              </div>
            </div>

            {showStats && (
              <div className="mb-8 p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-lg">
                <h3 className="text-lg font-semibold mb-4 dark:text-[var(--text-default)]">Statistik Beban Operasional</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 dark:text-[var(--text-muted)]">Berdasarkan Kategori</h4>
                    <ul className="space-y-2">
                      {Object.entries(stats.byCategory).map(([category, amount]) => (
                        <li key={category} className="flex justify-between">
                          <span className="dark:text-[var(--text-muted)]">{category}</span>
                          <span className="font-medium dark:text-[var(--text-default)]">{formatRupiah(amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 dark:text-[var(--text-muted)]">Berdasarkan Pengguna</h4>
                    <ul className="space-y-2">
                      {Object.entries(stats.byUser).map(([username, amount]) => (
                        <li key={username} className="flex justify-between">
                          <span className="dark:text-[var(--text-muted)]">{username}</span>
                          <span className="font-medium dark:text-[var(--text-default)]">{formatRupiah(amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <FaFilter className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium dark:text-[var(--text-muted)]">Filter:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto">
                  <div>
                    <label htmlFor="dateFilter" className="sr-only">Filter Tanggal</label>
                    <input
                      type="date"
                      id="dateFilter"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {(dateFilter || categoryFilter) && (
                      <button
                        onClick={resetFilters}
                        className="px-3 py-2 bg-gray-200 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-muted)] rounded-md hover:bg-gray-300 dark:hover:bg-[var(--bg-default)]"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-[var(--bg-secondary)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-[var(--text-muted)]">Tanggal</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-[var(--text-muted)]">Keterangan</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-[var(--text-muted)]">Kategori</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-[var(--text-muted)]">Jumlah</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-[var(--text-muted)]">Dicatat oleh</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-600 dark:text-[var(--text-muted)]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 dark:text-[var(--text-muted)]">Memuat data...</td>
                    </tr>
                  ) : filteredExpenses.length > 0 ? (
                    filteredExpenses.map(exp => (
                      <tr key={exp.id} className="border-b hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] dark:border-[var(--border-default)]">
                        <td className="px-4 py-2 dark:text-[var(--text-default)]">{formatDate(exp.expense_date)}</td>
                        <td className="px-4 py-2 dark:text-[var(--text-default)]">{exp.description}</td>
                        <td className="px-4 py-2 dark:text-[var(--text-default)]">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right dark:text-[var(--text-default)]">{formatRupiah(exp.amount)}</td>
                        <td className="px-4 py-2 dark:text-[var(--text-default)]">{exp.username}</td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            onClick={() => handleDelete(exp.id)} 
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Hapus beban"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500 dark:text-[var(--text-muted)]">
                        {dateFilter || categoryFilter ? 
                          "Tidak ada data yang sesuai dengan filter" : 
                          "Belum ada data beban."
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-200 dark:bg-[var(--bg-secondary)] font-bold">
                    <td colSpan="3" className="px-4 py-3 text-right text-gray-700 dark:text-[var(--text-muted)]">Total Yang Ditampilkan</td>
                    <td className="px-4 py-3 text-right text-gray-800 dark:text-[var(--text-default)]">
                      {formatRupiah(totalBeban)}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BebanOperasionalPage;