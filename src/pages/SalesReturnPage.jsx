import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaTimesCircle, FaFileInvoiceDollar, FaUser, FaExchangeAlt, FaPlus } from 'react-icons/fa';
import { FiArchive } from 'react-icons/fi';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';
import CreateReturnModal from '../components/CreateReturnModal';
import { salesReturnAPI } from '../api'; // Import the API service


const SalesReturnPage = () => {
  const { setSnackbar } = useOutletContext();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Token removed as it's now handled by api.js interceptor

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await salesReturnAPI.getAll(); // Using the API service
      setReturns(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleReturnCreated = () => {
    fetchReturns(); // Refresh the list of returns
  };

  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      if (!ret.return_date) return false;
      const returnDate = new Date(ret.return_date);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (returnDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire end date
        if (returnDate > end) return false;
      }

      // Filter by search term
      const searchTermLower = searchTerm.trim().toLowerCase();
      if (searchTermLower) {
        const transactionIdMatch = ret.transaction_id?.toString().toLowerCase().includes(searchTermLower);
        const cashierMatch = ret.user_name?.toLowerCase().includes(searchTermLower);
        const returnIdMatch = ret.id?.toString().toLowerCase().includes(searchTermLower);
        return transactionIdMatch || cashierMatch || returnIdMatch;
      }
      return true;
    });
  }, [returns, searchTerm, startDate, endDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const totalReturnedValue = useMemo(() => {
    return filteredReturns.reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0);
  }, [filteredReturns]);

  const formatDateTime = (dateString, timeString) => {
    try {
      if (!dateString) {
        return 'Invalid date';
      }

      // The dateString from MySQL DATE type can be a full ISO string like '2023-10-27T00:00:00.000Z'.
      // We only need the 'YYYY-MM-DD' part to avoid parsing issues.
      const datePart = dateString.slice(0, 10);
      const timePart = timeString || '00:00:00';
      const date = new Date(`${datePart}T${timePart}`);

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'dd MMM yyyy, HH:mm:ss', { locale: id });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    
    <div className="w-full max-w-7xl mx-auto">
      <div className="">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <FiArchive size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Retur Penjualan</h1>
              <p className="text-blue-100 dark:text-blue-200 mt-1">
                Kelola data retur penjualan dari pelanggan
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md"
          >
            <FaPlus />
            Buat Retur Baru
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-[var(--border-default)] shadow-sm">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
              <input
                type="text"
                id="search"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] dark:border-[var(--border-default)]"
                placeholder="Search by Return ID, Transaction ID, or Cashier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Start Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
              <input
                type="date"
                id="startDate"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] dark:border-[var(--border-default)]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">End Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
              <input
                type="date"
                id="endDate"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] dark:border-[var(--border-default)]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaTimesCircle /> Reset Filters
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-3 mb-2 md:mb-0">
              <div className="bg-white/20 p-3 rounded-full">
                <FaExchangeAlt className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-indigo-100">Total Returns</p>
                <p className="text-xl font-semibold text-white">{filteredReturns.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2 md:mb-0">
              <div className="bg-white/20 p-3 rounded-full">
                <FaFileInvoiceDollar className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-indigo-100">Total Return Value</p>
                <p className="text-xl font-semibold text-white">
                  Rp {totalReturnedValue.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mb-2"></div>
            <p className="dark:text-[var(--text-muted)]">Loading return data...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Returns Table */}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[var(--border-default)]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
              <thead className="bg-gray-50 dark:bg-[var(--bg-default)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Return ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-default)] uppercase tracking-wider">Cashier</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
                {filteredReturns.length > 0 ? (
                  filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-[var(--text-muted)]">{ret.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-[var(--text-muted)]">{ret.transaction_code || ret.transaction_id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-muted)]">
                        {formatDateTime(ret.return_date, ret.return_time)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600 dark:text-[var(--text-muted)]">
                        Rp {parseFloat(ret.total_amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-[var(--text-muted)] whitespace-nowrap overflow-hidden max-w-xs truncate">{ret.notes || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-muted)]">
                        <div className="flex items-center">
                          <FaUser className="mr-2 text-gray-400 dark:text-[var(--text-muted)]" />
                          {ret.user_name || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500 dark:text-[var(--text-muted)]">
                      No matching return records found.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-[var(--bg-secondary)] border-t border-gray-200 dark:border-[var(--border-default)]">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-base font-semibold text-gray-700 dark:text-[var(--text-default)] text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-base font-bold text-green-600 dark:text-[var(--text-default)] text-right">
                    Rp {totalReturnedValue.toLocaleString('id-ID')}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      <CreateReturnModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setSnackbar={setSnackbar}
        onReturnCreated={handleReturnCreated}
      />
    </div>
  );
};

export default SalesReturnPage;
