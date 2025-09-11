import { useState, useEffect } from 'react';
import { productAPI } from '../api'; // Import the API module
import React from 'react';

const KartuStokReport = ({ productId }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) return;

    const fetchReport = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Migrated to use productAPI
        const response = await productAPI.getStockCard(productId);
        setReportData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal mengambil data kartu stok');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [productId]);

  if (isLoading) {
    return <div className="text-center p-4">Memuat laporan...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  if (!reportData || !reportData.history) {
    return <div className="text-center p-4">Tidak ada data untuk ditampilkan.</div>;
  }
  
  return (
    <div className="bg-white dark:bg-[var(--bg-secondary)] dark:border-slate-600 p-4">
      <h2 className="text-xl font-bold mb-2 dark:text-[var(--text-default)]">Kartu Stok: {reportData.productName}</h2>
      <p className="mb-4 dark:text-[var(--text-default)]">Stok Saat Ini: <span className="font-semibold dark:text-[var(--text-muted)]">{reportData.currentStock}</span></p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-[var(--bg-secondary)] ">
          <thead className="bg-gray-100 dark:bg-[var(--bg-default)] border border-gray-200 dark:border-[var(--border-default)] border-b-2">
            <tr>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600 dark:text-white">Tanggal</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600 dark:text-white">Keterangan</th>
              <th className="px-4 py-2 border-b text-center text-sm font-medium text-gray-600 dark:text-white">Masuk</th>
              <th className="px-4 py-2 border-b text-center text-sm font-medium text-gray-600 dark:text-white">Keluar</th>
              <th className="px-4 py-2 border-b text-center text-sm font-medium text-gray-600 dark:text-white">Sisa</th>
            </tr>
          </thead>
          <tbody>
            {reportData.history.length > 0 ? (
              reportData.history.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-default)]">
                  <td className="px-4 py-2 border-b dark:text-white">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-2 border-b dark:text-white">{item.description}</td>
                  <td className="px-4 py-2 border-b text-center text-green-600 dark:text-white">{item.stock_in || ''}</td>
                  <td className="px-4 py-2 border-b text-center text-red-600 dark:text-white">{item.stock_out || ''}</td>
                  <td className="px-4 py-2 border-b text-center font-medium dark:text-white">{item.balance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 dark:text-white">Tidak ada riwayat pergerakan stok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KartuStokReport;
