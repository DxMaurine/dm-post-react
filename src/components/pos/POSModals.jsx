import PaymentModal from '../PaymentModal';
import PrintDialog from '../PrintDialog';
import BarcodeScannerModal from '../BarcodeScannerModal';
import React from 'react';
const POSModals = ({
  showPayment,
  onClosePayment,
  cartItems,
  totalBelanja,
  onPaymentSubmit,
  onError,
  showPrintDialog,
  onClosePrintDialog,
  transactionData,
  scannerOpen,
  onCloseScanner,
  onScanSuccess,
}) => {
  return (
    <>
      <PaymentModal
        show={showPayment}
        onClose={onClosePayment}
        cartItems={cartItems}
        totalBelanja={totalBelanja}
        onSubmit={onPaymentSubmit}
        onError={onError}
      />
      <PrintDialog
        show={showPrintDialog}
        onClose={onClosePrintDialog}
        {...transactionData}
      />
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={onCloseScanner}
        onScanSuccess={onScanSuccess}
      />
    </>
  );
};

export default POSModals;