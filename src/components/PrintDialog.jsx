import  { useState, useEffect } from 'react';
import { generateStruk } from './StrukGenerator'; // Import generateStruk
import React from 'react';

const PrintDialog = ({ show, onClose,
  // Props ini sekarang akan diisi dari POSPage
  settings, cartItems, totalBelanja, applied_discount_value, pointsDiscount,
  finalTotal, bayar, kembalian, customerName, selectedCustomer,
  transactionId, cashierName, pointsEarned, updatedTotalPoints, isCopy // Tambahkan isCopy
}) => {
  const [receiptPdfUrl, setReceiptPdfUrl] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  useEffect(() => {
    // Jika dialog tidak ditampilkan, pastikan URL bersih dan hentikan proses.
    if (!show) {
      setReceiptPdfUrl(null);
      setPdfDoc(null);
      return;
    }

    let url = null;
    // Pastikan semua properti yang dibutuhkan untuk membuat struk sudah ada.
    if (settings && cartItems && totalBelanja !== undefined &&
        applied_discount_value !== undefined && pointsDiscount !== undefined &&
        finalTotal !== undefined && bayar !== undefined && kembalian !== undefined) {
      // Generate the PDF, sekarang dengan data poin dan status isCopy
      const doc = generateStruk(
        settings, cartItems, totalBelanja, applied_discount_value,
        pointsDiscount, finalTotal, bayar, kembalian,
        customerName, selectedCustomer,
        transactionId, cashierName,
        pointsEarned, updatedTotalPoints, isCopy, // Teruskan isCopy
        settings.printerType || 'thermal_80mm' // Tambahkan printerType dari settings
      );
      setPdfDoc(doc); // Simpan objek dokumen PDF
      const pdfBlob = doc.output('blob');
      url = URL.createObjectURL(pdfBlob);
      setReceiptPdfUrl(url);
    }

    // Fungsi cleanup akan selalu dijalankan untuk membersihkan URL jika sudah dibuat.
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [show, settings, cartItems, totalBelanja, applied_discount_value, pointsDiscount,
      finalTotal, bayar, kembalian, customerName, selectedCustomer, transactionId, cashierName, 
      pointsEarned, updatedTotalPoints, isCopy]); // Tambahkan isCopy ke dependency array

  // Fungsi internal untuk menangani cetak
  const handlePrint = () => {
    if (pdfDoc) {
      pdfDoc.autoPrint();
      window.open(pdfDoc.output('bloburl'), '_blank');
    }
    onClose();
  };

  // Fungsi internal untuk menangani unduh
  const handleDownload = () => {
    if (pdfDoc) pdfDoc.save(`struk-dmpos-${Date.now()}.pdf`);
    onClose();
  };

  if (!show) {
    return null;
  }

  // SVG Icons (unchanged)
  const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white  dark:bg-[var(--sidebar-bg-dark)] rounded-xl shadow-2xl p-8 w-full max-w-5xl mx-4 text-center animate-fadeIn flex"> {/* Added flex */}
        {/* Left Column: Buttons and Kembalian */}
        <div className="w-1/2 pr-4 flex flex-col justify-between"> {/* Added flex-col and justify-between */}
          {typeof kembalian !== 'undefined' && kembalian >= 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl shadow-inner">
              <p className="text-2xl font-semibold text-gray-700 mb-2">UANG KEMBALIAN</p>
              <p className="text-6xl font-bold text-green-600 tracking-tighter">
                Rp {kembalian.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <div className="mt-4 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
            </div>
          )}

          <h3 className="text-2xl font-bold mb-6 text-blue-700">CETAK STRUK PEMBAYARAN</h3>
          <p className="mb-8 text-lg text-gray-300 font-medium">Terima kasih telah berbelanja di toko kami!</p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex-1 min-w-[200px] transition-all hover:scale-105 shadow-lg"
            >
              <PrintIcon />
              <span>Cetak Struk</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex-1 min-w-[200px] transition-all hover:scale-105 shadow-lg"
            >
              <DownloadIcon />
              <span>Unduh PDF</span>
            </button>
            {/* Pratinjau button removed */}
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] shadow-lg"
          >
            <CloseIcon />
            <span>Tutup Dialog</span>
          </button>
        </div>

        {/* Right Column: Receipt Display */}
        <div className="w-1/2 pl-4 flex flex-col items-center justify-center border-l border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-300">Pratinjau Struk</h3>
          {receiptPdfUrl ? (
            <iframe
              src={receiptPdfUrl}
              title="Struk Preview"
              className="w-full h-full min-h-[400px] border border-gray-300 rounded-lg"
            ></iframe>
          ) : (
            <p className="text-gray-500">Memuat pratinjau struk...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintDialog;