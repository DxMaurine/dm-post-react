import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React from 'react';

// Konfigurasi ukuran untuk setiap tipe printer
const PRINTER_CONFIGS = {
  thermal_80mm: {
    width: 80,
    centerX: 40,
    rightAlign: 75,
    leftMargin: 5,
    fontSize: { header: 12, normal: 8, points: 9, footer: 10 },
    columnWidths: { item: 52, price: 18 },
    lineSpacing: 5,
    sectionSpacing: 8
  },
  thermal_58mm: {
    width: 58,
    centerX: 29,
    rightAlign: 53,
    leftMargin: 3,
    fontSize: { header: 10, normal: 7, points: 8, footer: 9 },
    columnWidths: { item: 38, price: 15 },
    lineSpacing: 4,
    sectionSpacing: 6
  },
  dot_matrix: {
    width: 210, // A4 width
    centerX: 105,
    rightAlign: 195,
    leftMargin: 15,
    fontSize: { header: 14, normal: 10, points: 11, footer: 12 },
    columnWidths: { item: 140, price: 35 },
    lineSpacing: 6,
    sectionSpacing: 10
  },
  network_printer: {
    width: 80, // Default ke thermal 80mm
    centerX: 40,
    rightAlign: 75,
    leftMargin: 5,
    fontSize: { header: 12, normal: 8, points: 9, footer: 10 },
    columnWidths: { item: 52, price: 18 },
    lineSpacing: 5,
    sectionSpacing: 8
  },
  usb_printer: {
    width: 80, // Default ke thermal 80mm
    centerX: 40,
    rightAlign: 75,
    leftMargin: 5,
    fontSize: { header: 12, normal: 8, points: 9, footer: 10 },
    columnWidths: { item: 52, price: 18 },
    lineSpacing: 5,
    sectionSpacing: 8
  },
  bluetooth_printer: {
    width: 58, // Default ke thermal 58mm untuk mobile
    centerX: 29,
    rightAlign: 53,
    leftMargin: 3,
    fontSize: { header: 10, normal: 7, points: 8, footer: 9 },
    columnWidths: { item: 38, price: 15 },
    lineSpacing: 4,
    sectionSpacing: 6
  }
};

export const generateStruk = (
  settings, 
  cartItems, 
  totalBelanja, 
  applied_discount_value, 
  pointsDiscount,
  finalTotal, 
  bayar, 
  kembalianAmount, 
  customerName,
  selectedCustomer,
  transactionId,
  cashierName,
  pointsEarned,      // Data baru dari POSPage
  updatedTotalPoints, // Data baru dari POSPage
  isCopy = false, // Tambahkan isCopy sebagai parameter opsional
  printerType = 'thermal_80mm' // Parameter baru untuk tipe printer
) => {
  // Validasi parameter
  if (!settings || !cartItems || cartItems.length === 0) {
    throw new Error('Invalid receipt data provided');
  }
  
  // Ambil konfigurasi berdasarkan tipe printer
  const config = PRINTER_CONFIGS[printerType] || PRINTER_CONFIGS.thermal_80mm;
  
  // Debug log untuk development
  console.log(`🖨️ Menggunakan konfigurasi printer: ${printerType}`, {
    width: config.width,
    fontSize: config.fontSize,
    columnWidths: config.columnWidths
  });
  
  // Hitung tinggi dokumen dinamis berdasarkan layout
  const baseHeight = 120;
  const itemHeight = cartItems.length * 8;
  const discountHeight = (applied_discount_value > 0 ? 8 : 0) + (pointsDiscount > 0 ? 8 : 0);
  const pointsHeight = (selectedCustomer && selectedCustomer.customer_type !== 'Umum' ? 12 : 0);
  
  // Tambahan tinggi untuk layout 58mm yang berbeda
  const layoutAdjustment = (printerType === 'thermal_58mm' || printerType === 'bluetooth_printer') ? 8 : 0;
  
  const docHeight = baseHeight + itemHeight + discountHeight + pointsHeight + layoutAdjustment;
  
  const doc = new jsPDF({ 
    orientation: 'portrait', 
    unit: 'mm', 
    format: [config.width, docHeight] 
  });
  
  const now = new Date();
  const formatCurrency = (amount) => `Rp ${amount.toLocaleString('id-ID')}`;
  
  // --- HEADER SECTION ---
  doc.setFontSize(config.fontSize.header);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.storeName, config.centerX, 8, { align: 'center' });
  
  doc.setFontSize(config.fontSize.normal);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.storeTagline, config.centerX, 12, { align: 'center' });
  doc.text(settings.storeAddress, config.centerX, 16, { align: 'center' });
  
  // Divider line
  doc.setLineWidth(0.2);
  doc.line(config.leftMargin, 19, config.rightAlign, 19);
  
  // --- TRANSACTION INFO SECTION ---
  doc.setFontSize(config.fontSize.normal);
  
  // Layout khusus untuk printer 58mm - info transaksi di bawah pelanggan
  if (printerType === 'thermal_58mm' || printerType === 'bluetooth_printer') {
    // Info pelanggan di atas (jika ada)
    if (customerName) {
      doc.text(`Pelanggan: ${customerName}`, config.leftMargin, 23);
    }
    
    // Divider line
    const dividerY = customerName ? 27 : 23;
    doc.line(config.leftMargin, dividerY, config.rightAlign, dividerY);
    
    // Info transaksi di bawah
    const startY = dividerY + 4;
    doc.text(`No: ${transactionId}`, config.leftMargin, startY);
    doc.text(`Kasir: ${cashierName || 'N/A'}`, config.leftMargin, startY + 4);
    doc.text(`${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`, config.leftMargin, startY + 8);
    
    // Update startY untuk items table
    var itemsStartY = startY + 12;
  } else if (printerType === 'dot_matrix') {
    // Layout khusus untuk dot matrix - lebih lebar, tanggal jam terpisah
    doc.text(`No: ${transactionId}`, config.leftMargin, 23);
    doc.text(`Tanggal: ${now.toLocaleDateString('id-ID')}`, config.rightAlign, 23, { align: 'right' });
    
    doc.text(`Kasir: ${cashierName || 'N/A'}`, config.leftMargin, 28);
    doc.text(`Jam: ${now.toLocaleTimeString('id-ID')}`, config.rightAlign, 28, { align: 'right' });
    
    if (customerName) {
      doc.text(`Pelanggan: ${customerName}`, config.leftMargin, 33);
    }
    
    // eslint-disable-next-line no-redeclare
    var itemsStartY = customerName ? 38 : 33;
  } else {
    // Layout standar untuk printer lain
    doc.text(`No: ${transactionId}`, config.leftMargin, 23);
    doc.text(`Kasir: ${cashierName || 'N/A'}`, config.leftMargin, 27);
    
    doc.text(`Tanggal: ${now.toLocaleDateString('id-ID')}`, config.rightAlign, 23, { align: 'right' });
    doc.text(`Jam: ${now.toLocaleTimeString('id-ID')}`, config.rightAlign, 27, { align: 'right' });
    
    if (customerName) {
      doc.text(`Pelanggan: ${customerName}`, config.leftMargin, 31);
    }
    
    // eslint-disable-next-line no-redeclare
    var itemsStartY = 34;
  }
  
  // Divider line sebelum items
  doc.line(config.leftMargin, itemsStartY - 1, config.rightAlign, itemsStartY - 1);
  
  // --- ITEMS TABLE SECTION ---
  autoTable(doc, {
    startY: itemsStartY,
    body: cartItems.map(item => [
      {
        content: `${item.name}\n  ${item.qty} x ${formatCurrency(item.price)}`,
        styles: { halign: 'left' },
      },
      {
        content: formatCurrency(item.price * item.qty),
        styles: { halign: 'right' },
      },
    ]),
    theme: 'plain',
    styles: { 
      fontSize: config.fontSize.normal,
      cellPadding: { top: 1.5, right: 0, bottom: 1.5, left: 0 },
      valign: 'top',
    },
    columnStyles: { 
      0: { cellWidth: config.columnWidths.item },
      1: { cellWidth: config.columnWidths.price, halign: 'right' },
    },
    margin: { left: config.leftMargin, right: config.leftMargin },
  });
  
  let y = doc.lastAutoTable.finalY + 4;
  
  // Divider line
  doc.line(config.leftMargin, y, config.rightAlign, y);
  y += 6;
  
  // --- PAYMENT SUMMARY SECTION ---
  const rightAlign = { align: 'right' };
  const summaryLabelX = config.leftMargin; // Posisi label dari kiri margin
  const summaryValueX = config.rightAlign; // Posisi value dari kanan
  
  doc.text(`Subtotal:`, summaryLabelX, y);
  doc.text(formatCurrency(totalBelanja), summaryValueX, y, rightAlign);
  y += config.lineSpacing;
  
  if (applied_discount_value > 0) {
    doc.text(`Diskon:`, summaryLabelX, y);
    doc.text(`- ${formatCurrency(applied_discount_value)}`, summaryValueX, y, rightAlign);
    y += config.lineSpacing;
  }
  
  if (pointsDiscount > 0) {
    doc.text(`Tukar Poin:`, summaryLabelX, y);
    doc.text(`- ${formatCurrency(pointsDiscount)}`, summaryValueX, y, rightAlign);
    y += config.lineSpacing;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Total:`, summaryLabelX, y);
  doc.text(formatCurrency(finalTotal), summaryValueX, y, rightAlign);
  y += config.lineSpacing;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Bayar:`, summaryLabelX, y);
  doc.text(formatCurrency(bayar), summaryValueX, y, rightAlign);
  y += config.lineSpacing;
  
  doc.text(`Kembali:`, summaryLabelX, y);
  doc.text(formatCurrency(kembalianAmount), summaryValueX, y, rightAlign);
  y += config.sectionSpacing;
  
  // --- LOYALTY POINTS SECTION (MODIFIED) ---
  // Tampilkan info poin jika ada pelanggan yang dipilih (bukan transaksi umum)
  if (selectedCustomer) {
    doc.setFontSize(config.fontSize.points);
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Poin Member', config.centerX, y, { align: 'center' });
    y += config.lineSpacing;
    doc.setFont('helvetica', 'normal');
    doc.text(`Poin Didapat:`, config.leftMargin, y);
    doc.text(`${pointsEarned || 0} Poin`, config.rightAlign, y, rightAlign);
    y += config.lineSpacing;
    doc.text(`Total Poin Anda:`, config.leftMargin, y);
    doc.text(`${updatedTotalPoints || selectedCustomer.loyalty_points || 0} Poin`, config.rightAlign, y, rightAlign);
    y += config.sectionSpacing;
  }
  
  // --- FOOTER SECTION ---
  doc.setLineWidth(0.2);
  doc.line(config.leftMargin, y, config.rightAlign, y);
  y += config.sectionSpacing;
  
  doc.setFont('helvetica', 'semi-bold');
  doc.setFontSize(config.fontSize.footer);
  doc.text('Terima kasih telah berbelanja!', config.centerX, y, { align: 'center' });
  y += config.lineSpacing;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(config.fontSize.normal);
  doc.text(settings.receiptFooter, config.centerX, y, { align: 'center' });

  // --- WATERMARK SECTION ---
  if (isCopy) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230); // Warna abu-abu muda
    // Simpan state grafis saat ini
    doc.saveGraphicsState();
    // Atur transparansi
    doc.setGState(new doc.GState({ opacity: 0.5 }));
    doc.text('COPY', config.centerX, docHeight / 2 + 10, { align: 'center', angle: -45 });
    // Kembalikan state grafis
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0); // Reset warna teks ke hitam
  }

  return doc;
};
