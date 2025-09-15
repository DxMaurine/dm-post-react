import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPrinter, FiCalendar, FiFileText, FiBarChart2, FiUserCheck, FiTrendingUp, FiRepeat, FiAward } from 'react-icons/fi';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { reportAPI } from '../api';
import Swal from 'sweetalert2';
import Snackbar from '@mui/material/Snackbar';
import ReactDOM from 'react-dom/client'; // Import ReactDOM
import PrintableReportContent from '../components/PrintableReportContent'; // Import the new component
import React from 'react';

const reportOptions = [
  { id: 'sales_summary', label: 'Laporan Penjualan', icon: FiFileText, roles: ['admin', 'manager'] },
  { id: 'profit_loss', label: 'Laporan Laba Rugi', icon: FiTrendingUp, roles: ['admin'] },
  { id: 'sales_by_cashier', label: 'Laporan per Kasir', icon: FiUserCheck, roles: ['admin', 'manager'] },
  { id: 'shift_report', label: 'Laporan Shift', icon: FiRepeat, roles: ['admin', 'manager'] },
  { id: 'point_history', label: 'Laporan Riwayat Poin', icon: FiAward, roles: ['admin', 'manager'] },
];

const PrintReportsPage = () => {
  const { setSnackbar } = useOutletContext();
  const [selectedReports, setSelectedReports] = useState([]);
  const [dates, setDates] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const handleCheckboxChange = (reportId) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = async () => {
    if (selectedReports.length === 0) {
      setSnackbar({
        open: true,
        message: 'Pilih setidaknya satu jenis laporan.',
        severity: 'warning',
      });
      return;
    }

    setLoading(true);
    setReportData(null);

    try {
      const response = await reportAPI.generateReports({
        reports: selectedReports,
        startDate: dates.startDate,
        endDate: `${dates.endDate} 23:59:59`
      });

      setReportData(response.data);
      setSnackbar({
        open: true,
        message: 'Laporan berhasil dibuat!',
        severity: 'success',
        AnchorOrigin: 'top-right'
      });
      Swal.fire({
        title: 'Laporan Siap!',
        html: 'Pratinjau laporan Anda tersedia.!! <br>Gunakan tombol <b>Cetak Laporan</b> untuk mencetak atau <b>Export ke Excel</b> untuk menyimpannya.',
        icon: 'info',
        confirmButtonText: 'Mengerti'
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const handleExportExcel = () => {
    if (!reportData) {
      setSnackbar({
        open: true,
        message: 'Tidak ada data laporan untuk diekspor.',
        severity: 'warning',
      });
      return;
    }

    const wb = XLSX.utils.book_new();

    Object.keys(reportData).forEach(reportKey => {
        const report = reportData[reportKey];
        if (!report) return;

        let dataForSheet = [];
        const reportTitle = reportOptions.find(opt => opt.id === reportKey)?.label || reportKey;

        dataForSheet.push([reportTitle]);
        dataForSheet.push(['Periode:', `${dates.startDate} s/d ${dates.endDate}`]);
        dataForSheet.push([]); // Spacer

        switch (reportKey) {
            case 'sales_summary':
                dataForSheet.push(['Total Penjualan', 'Total Transaksi', 'Produk Terlaris', 'Total Kuantitas Terjual']);
                dataForSheet.push([
                    report.totalSales,
                    report.totalTransactions,
                    report.bestSellingProduct?.name,
                    report.bestSellingProduct?.totalQuantity
                ]);
                break;
            case 'profit_loss':
                dataForSheet.push(['Total Pendapatan', 'Total HPP', 'Laba Kotor']);
                dataForSheet.push([report.totalRevenue, report.totalCOGS, report.grossProfit]);
                break;
            case 'sales_by_cashier':
                dataForSheet.push(['Nama Kasir', 'Total Transaksi', 'Total Penjualan']);
                report.cashierSales.forEach(cashier => {
                    dataForSheet.push([cashier.cashierName, cashier.transactionCount, cashier.totalSales]);
                });
                break;
            case 'shift_report':
                dataForSheet.push(['Shift', 'Total Penjualan', 'Total Transaksi', 'Waktu Mulai', 'Waktu Selesai']);
                report.shifts.forEach(shift => {
                    dataForSheet.push([
                        shift.shiftName,
                        shift.totalSales,
                        shift.transactionCount,
                        shift.startTime ? format(new Date(shift.startTime), 'Pp') : '-',
                        shift.endTime ? format(new Date(shift.endTime), 'Pp') : '-'
                    ]);
                });
                break;
            case 'point_history':
                dataForSheet.push(['Tanggal', 'Pelanggan', 'Jenis', 'Deskripsi', 'Perubahan Poin', 'Sisa Poin']);
                report.data.forEach(item => {
                    dataForSheet.push([
                        format(new Date(item.created_at), 'dd-MM-yyyy HH:mm'),
                        item.customer_name,
                        item.type,
                        item.description,
                        item.points_change,
                        item.balance_after
                    ]);
                });
                break;
            default:
                break;
        }

        if (dataForSheet.length > 3) {
            const ws = XLSX.utils.aoa_to_sheet(dataForSheet, { 
                cellStyles: true,
                // Assuming numeric data starts from row 5 (index 4)
                // and you want to format specific columns as currency.
                // This requires more advanced setup with cell objects.
            });

            // Example of setting column widths
            const colWidths = dataForSheet[3].map(h => ({ wch: String(h).length + 5 }));
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, reportTitle.substring(0, 31));
        }
    });

    if (wb.SheetNames.length > 0) {
        const fileName = `Laporan_POS_${dates.startDate}_sd_${dates.endDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
        setSnackbar({
            open: true,
            message: 'Laporan Excel berhasil diekspor!',
            severity: 'success',
        });
    } else {
        setSnackbar({
            open: true,
            message: 'Tidak ada data yang valid untuk diekspor.',
            severity: 'warning',
        });
    }
};


  const handlePrint = () => {
    if (!reportData) {
      setSnackbar({
        open: true,
        message: 'Tidak ada data laporan untuk dicetak.',
        severity: 'warning',
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    const currentTheme = Array.from(document.documentElement.classList).find(c => c.startsWith('theme-'));
    
    printWindow.document.write(`<html><head><title>Cetak Laporan</title>`);

    // Copy styles from the main document
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
      printWindow.document.write(style.outerHTML);
    });

    printWindow.document.write(`</head><body class="dark ${currentTheme || ''}"><div id="print-root"></div></body></html>`);
    printWindow.document.close();

    const printRoot = printWindow.document.getElementById('print-root');
    const root = ReactDOM.createRoot(printRoot);

    // Wrap the content in a div with the appropriate theme classes
    const ThemedPrintableContent = () => (
      <div className={`dark ${currentTheme || ''}`}>
        <PrintableReportContent
          reportData={reportData}
          dates={dates}
          formatCurrency={formatCurrency}
        />
      </div>
    );

    root.render(<ThemedPrintableContent />);

    // Wait for content to render before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // printWindow.close(); // Consider closing the window after printing
    }, 500);
  };

  const availableReportOptions = reportOptions.filter(opt => userRole && opt.roles.includes(userRole));

 return (
  <>
    <div className="w-full max-w-7xl p-6 bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg dark:shadow-gray-800/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div className="mb-6 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-default)]">Laporan Terpusat</h1>
          <p className="text-sm text-gray-600 dark:text-[var(--text-default)] mt-1">
            Pilih jenis laporan dan periode untuk menghasilkan laporan terpadu
          </p>
        </div>
        
        {reportData && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-md"
            >
              <FiFileText className="h-4 w-4 mr-2" />
              Export Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-md"
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Cetak
            </button>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Report Selection Panel */}
        <div className="xl:col-span-5">
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-5 rounded-xl border-2 dark:border-[var(--border-default)] shadow-sm">
            <div className="flex items-center mb-5">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg w-8 h-8 flex items-center justify-center mr-3">
                <span className="font-semibold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">
                Jenis Laporan
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableReportOptions.map(opt => (
                <div
                  key={opt.id}
                  className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedReports.includes(opt.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm'
                      : 'bg-white dark:bg-[var(--bg-default)] border-gray-200 dark:border-gray-600 hover:shadow-md'
                  }`}
                  onClick={() => handleCheckboxChange(opt.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(opt.id)}
                      onChange={() => {}}
                      className="h-4 w-4 mt-1 rounded border-gray-300 dark:border-gray-500 text-blue-600 dark:text-[var(--text-default)] focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700"
                    />
                    <div className="ml-3">
                      <div className={`flex items-center mb-1 ${selectedReports.includes(opt.id) ? 'text-blue-600 dark:text-[var(--text-default)]' : 'text-gray-600 dark:text-[var(--text-default)]'}`}>
                        <opt.icon className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range & Actions Panel */}
        <div className="xl:col-span-7">
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-5 rounded-xl border-2 dark:border-[var(--border-default)] shadow-sm">
            <div className="flex items-center mb-5">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg w-8 h-8 flex items-center justify-center mr-3">
                <span className="font-semibold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">
                Periode Laporan
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-2">
                  Tanggal Mulai
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    value={dates.startDate}
                    onChange={handleDateChange}
                    className="block w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--bg-secondary)] text-gray-900 dark:text-[var(--text-default)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-2">
                  Tanggal Akhir
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    value={dates.endDate}
                    onChange={handleDateChange}
                    className="block w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--bg-secondary)] text-gray-900 dark:text-[var(--text-default)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors" 
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={loading || selectedReports.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                loading || selectedReports.length === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white hover:shadow-lg'
              } flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <FiBarChart2 className="h-5 w-5" />
                  Buat Laporan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export default PrintReportsPage;