import React from 'react';
import { format } from 'date-fns';


const PrintableReportContent = React.forwardRef(({
  reportData,
  dates,
  formatCurrency
}, ref) => {
  return (
    <div ref={ref} className="printable-area bg-white dark:bg-white p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-300">
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            width: 100%;
            background: white !important;
            color: black !important;
            /* Ensure content is within A4 margins and centered */
            margin: 0 auto; /* Center the content horizontally */
            padding: 20mm; /* Apply padding to match @page margin, or adjust as needed */
            box-sizing: border-box; /* Include padding in the width calculation */
            box-shadow: none !important; /* Remove shadow for print */
            border: none !important; /* Remove border for print */
            border-radius: 0 !important; /* Remove border-radius for print */
          }
          .printable-area .overflow-x-auto {
            overflow-x: visible !important;
          }
          .printable-area table {
            table-layout: fixed;
            width: 100%;
          }
          .printable-area table th,
          .printable-area table td {
            white-space: normal; /* Allow text to wrap */
            word-wrap: break-word; /* Break long words */
          }
          @page {
            size: A4;
            margin: 0; /* Remove margin here as we're handling it with padding on .printable-area */
          }
        }
      `}</style>

      {reportData && (
        <div className="space-y-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Laporan Gabungan</h1>
            <p className="text-gray-600 mt-2">Periode: {format(new Date(dates.startDate), 'dd MMMM yyyy')} - {format(new Date(dates.endDate), 'dd MMMM yyyy')}</p>
            <p className="text-sm text-gray-500 mt-1">Dicetak pada: {format(new Date(), 'dd MMMM yyyy, HH:mm')}</p>
          </div>

          {/* Render Sales Summary */}
          {reportData.sales_summary && (
            <section>
              <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4 text-gray-800">{reportData.sales_summary.title}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">ID Transaksi</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Pelanggan</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Kasir</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.sales_summary.data.map(trx => (
                      <tr key={trx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{format(new Date(trx.tanggal), 'dd-MM-yyyy')} {trx.jam}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{trx.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{trx.customer}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{trx.cashier_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(trx.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right">Total</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          reportData.sales_summary.data.reduce((acc, trx) => acc + trx.total, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* Render Profit Loss */}
          {reportData.profit_loss && (
            <section>
              <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4 text-gray-800">{reportData.profit_loss.title}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Total Penjualan</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Total HPP</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Laba Kotor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.profit_loss.data.map(item => (
                      <tr key={item.label} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{format(new Date(item.label), 'dd-MM-yyyy')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(item.total_penjualan)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(item.total_hpp)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">{formatCurrency(item.laba_kotor)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-right">Total</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          reportData.profit_loss.data.reduce((acc, item) => acc + Number(item.total_penjualan), 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          reportData.profit_loss.data.reduce((acc, item) => acc + Number(item.total_hpp), 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(
                          reportData.profit_loss.data.reduce((acc, item) => acc + Number(item.laba_kotor), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* Render Sales by Cashier */}
          {reportData.sales_by_cashier && (
            <section>
              <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4 text-gray-800">{reportData.sales_by_cashier.title}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Nama Kasir</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Total Transaksi</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Total Penjualan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.sales_by_cashier.data.map(item => (
                      <tr key={item.cashier_name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{item.cashier_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{item.total_transactions}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">{formatCurrency(item.total_sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-right">Total</td>
                      <td className="px-4 py-3 text-right">
                        {reportData.sales_by_cashier.data.reduce((acc, item) => acc + item.total_transactions, 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(
                          reportData.sales_by_cashier.data.reduce((acc, item) => acc + Number(item.total_sales), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* Render Shift Report */}
          {reportData.shift_report && (
            <section>
              <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4 text-gray-800">{reportData.shift_report.title}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Kasir</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Waktu Mulai</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Waktu Selesai</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Kas Awal</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Total Penjualan</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Kas Akhir (Sistem)</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Kas Akhir (Fisik)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.shift_report.data.map(shift => (
                      <tr key={shift.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{shift.username}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{format(new Date(shift.start_time), 'dd-MM-yy HH:mm')}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{format(new Date(shift.end_time), 'dd-MM-yy HH:mm')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(shift.opening_cash)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(shift.total_sales)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(shift.closing_cash_system)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">{formatCurrency(shift.closing_cash_physical)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right">Total</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          reportData.shift_report.data.reduce((acc, shift) => acc + Number(shift.opening_cash), 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          reportData.shift_report.data.reduce((acc, shift) => acc + Number(shift.total_sales), 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          reportData.shift_report.data.reduce((acc, shift) => acc + Number(shift.closing_cash_system), 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(
                          reportData.shift_report.data.reduce((acc, shift) => acc + Number(shift.closing_cash_physical), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* Render Point History */}
          {reportData.point_history && (
            <section>
              <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4 text-gray-800">{reportData.point_history.title}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Pelanggan</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Jenis</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Deskripsi</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Perubahan Poin</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider">Sisa Poin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.point_history.data.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{format(new Date(item.created_at), 'dd-MM-yyyy HH:mm')}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.customer_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.type}</td>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">{item.points_change}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">{item.balance_after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
});

export default PrintableReportContent;