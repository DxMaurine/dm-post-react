import { useState, useEffect, useRef } from 'react';
import { discountAPI } from '../api';
import React from 'react';

const PaymentModal = ({ show, onClose, cartItems, totalBelanja, onSubmit, onError }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [customerType, setCustomerType] = useState("Umum");
  const [customCustomerName, setCustomCustomerName] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cardNumber, setCardNumber] = useState("");
  const [showDiscountList, setShowDiscountList] = useState(false);
  const [discountList, setDiscountList] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const inputPayRef = useRef(null);

  useEffect(() => {
    if (show) {
      setPaymentAmount("");
      setCustomerType("Umum");
      setCustomCustomerName("");
      setDiscountCode("");
      setAppliedDiscount(null);
      setDiscountError(null);
      setPaymentMethod("cash");
      setCardNumber("");
      setTimeout(() => {
        if (inputPayRef.current) {
          inputPayRef.current.focus();
        }
      }, 100);
    }
  }, [show]);

 useEffect(() => {
    const validateDiscount = async () => {
      if (discountCode) {
        try {
          const response = await discountAPI.validate({
            code: discountCode,
            customer_type: customerType
          });
          if (response.data.valid) {
            setAppliedDiscount(response.data.discount);
            setDiscountError(null);
          } else {
            setAppliedDiscount(null);
            setDiscountError(response.data.message);
          }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          setAppliedDiscount(null);
          setDiscountError('Gagal memvalidasi diskon.');
        }
      } else {
        setAppliedDiscount(null);
        setDiscountError(null);
      }
    };

    const handler = setTimeout(() => validateDiscount(), 300);
    return () => clearTimeout(handler);
  }, [discountCode, customerType]);

  const handlePaymentChange = (e) => {
    let val = e.target.value.replace(/[^\d.,]/g, "");
    val = val.replace(/,/g, ".");
    setPaymentAmount(val);
  };

  const handleCustomerTypeChange = (e) => {
    const value = e.target.value;
    setCustomerType(value);
    if (value !== 'Custom') {
      setCustomCustomerName(value);
    } else {
      setCustomCustomerName('');
    }
  };

  const handleCustomCustomerNameChange = (e) => setCustomCustomerName(e.target.value);
  const handleDiscountCodeChange = (e) => setDiscountCode(e.target.value.toUpperCase());
  const handlePaymentMethodChange = (method) => setPaymentMethod(method);
  const handleCardNumberChange = (e) => setCardNumber(e.target.value.replace(/\D/g, ""));

  const calculateDiscountedTotal = () => {
    let currentTotal = totalBelanja;
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        currentTotal = totalBelanja * (1 - Number(appliedDiscount.value) / 100);
      } else if (appliedDiscount.type === 'fixed') {
        currentTotal = totalBelanja - Number(appliedDiscount.value);
      }
    }
    return Math.max(0, currentTotal);
  };

  const displayTotal = calculateDiscountedTotal();

  const handleSubmit = (e) => {
    e.preventDefault();
    let bayar = paymentAmount.replace(/\D/g, "");
    const finalCustomerName = customerType === 'Custom' ? customCustomerName : customerType;

    if (!finalCustomerName.trim()) {
      onError("Nama pelanggan tidak boleh kosong!");
      return;
    }

    if (paymentMethod === 'cash' && bayar < displayTotal) {
      onError("Nominal pembayaran kurang dari total belanja!");
      return;
    }

    onSubmit({
      customerName: finalCustomerName,
      customerType: customerType,
      bayar: paymentMethod === 'cash' ? parseInt(bayar || "0", 10) : displayTotal,
      discount_code: appliedDiscount ? discountCode : null,
      applied_discount_value: totalBelanja - displayTotal,
      payment_method: paymentMethod,
      card_number: paymentMethod !== 'cash' ? cardNumber : null
    });
  };

  const handleShowDiscountList = async () => {
    setShowDiscountList(true);
    try {
      const response = await discountAPI.getAll();
      setDiscountList(Array.isArray(response.data) ? response.data : []);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setDiscountList([]);
    }
  };


  const handleCloseDiscountList = () => setShowDiscountList(false);

  const handleCopyDiscountCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1200);
  };

  if (!show) {
    return null;
  }

  const bayarParsed = parseInt(paymentAmount.replace(/\D/g, "") || "0", 10);
  const kembalian = paymentMethod === 'cash' && bayarParsed >= displayTotal ? bayarParsed - displayTotal : 0;

  const isExpired = (discount) => {
    if (!discount.end_date) return false;
    const endOfDay = new Date(discount.end_date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" data-pos-no-refocus data-pos-disable-refocus>
      <div className="bg-white dark:bg-[var(--sidebar-bg-dark)] rounded-xl shadow-lg p-4 w-full max-w-4xl mx-5 max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold transition-colors"
          onClick={onClose}
          aria-label="Tutup"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">Pembayaran</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left Column: Cart Items */}
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Rincian Belanja</h3>
            <div className="max-h-77 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-yellow-100 dark:bg-yellow-900">
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-200 font-medium">Nama</th>
                    <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-200 font-medium">Qty</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-200 font-medium">Harga</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-200 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-1.5 truncate max-w-[120px] text-gray-800 dark:text-gray-200">{item.name}</td>
                      <td className="px-3 py-1.5 text-center text-gray-800 dark:text-gray-200">{item.qty}</td>
                      <td className="px-3 py-1.5 text-right text-gray-800 dark:text-gray-200">Rp {item.price.toLocaleString('id-ID')}</td>
                      <td className="px-3 py-1.5 text-right text-gray-800 dark:text-gray-200">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-200">Jumlah Barang (Qty) :</span>
              <span className="text-base font-semibold text-yellow-800 dark:text-yellow-100">
                {cartItems.reduce((total, item) => total + item.qty, 0)}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 italic font-medium">
              Hitung Kembali Jumlah (Qty) untuk cek dan konfirmasikan ke konsumen.
            </div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="w-full md:w-1/2">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="mb-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-100">Total:</span>
                <span className="font-semibold text-xl text-blue-700 dark:text-blue-200">Rp {displayTotal.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="flex-grow space-y-3">
                {/* Customer Type */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Tipe Pelanggan</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    value={customerType}
                    onChange={handleCustomerTypeChange}
                  >
                    <option value="Umum">Umum</option>
                    <option value="ASN">ASN</option>
                    <option value="Dropshipper">Dropshipper</option>
                    <option value="Custom">Custom</option>
                  </select>
                  {customerType === 'Custom' && (
                    <input
                      type="text"
                      className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      placeholder="Nama Pelanggan Custom"
                      value={customCustomerName}
                      onChange={handleCustomCustomerNameChange}
                    />
                  )}
                </div>

                {/* Discount Code */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Kode Diskon (Opsional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      placeholder="Masukkan kode diskon"
                      value={discountCode}
                      onChange={handleDiscountCodeChange}
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg text-xs font-medium transition"
                      onClick={handleShowDiscountList}
                    >
                      Discount (%)
                    </button>
                  </div>
                  {discountError && <p className="text-red-500 dark:text-red-400 text-xs mt-0.5">{discountError}</p>}
                  {appliedDiscount && !discountError && (
                    <p className="text-green-600 dark:text-green-400 text-xs mt-0.5">
                      Diskon diterapkan: {appliedDiscount.code} ({appliedDiscount.type === 'percentage' ? `${Number(appliedDiscount.value)}%` : `Rp ${Number(appliedDiscount.value).toLocaleString('id-ID')}`})
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('cash')}
                      className={`py-1.5 px-2 rounded-md border transition-all text-xs ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                    >
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Tunai
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('debit')}
                      className={`py-1.5 px-2 rounded-md border transition-all text-xs ${paymentMethod === 'debit' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                    >
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Debit
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('credit')}
                      className={`py-1.5 px-2 rounded-md border transition-all text-xs ${paymentMethod === 'credit' ? 'border-red-500 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                    >
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Credit
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('qris')}
                      className={`py-1.5 px-2 rounded-md border transition-all text-xs ${paymentMethod === 'qris' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                    >
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QRIS
                      </div>
                    </button>
                  </div>

                  {/* Payment Method Specific Fields */}
                  {paymentMethod === 'cash' && (
                    <div className="mt-2">
                      <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Nominal Pembayaran (Rp)</label>
                      <input
                        ref={inputPayRef}
                        type="text"
                        inputMode="decimal"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-all text-right font-semibold text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        placeholder="Masukkan nominal pembayaran"
                        value={paymentAmount.replace(/\D/g,"") ? parseInt(paymentAmount.replace(/\D/g,"")).toLocaleString('id-ID') : ""}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                  )}

                  {(paymentMethod === 'debit' || paymentMethod === 'credit') && (
                    <div className="mt-2">
                      <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Nomor Kartu</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        required
                      />
                    </div>
                  )}

                  {paymentMethod === 'qris' && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex flex-col items-center">
                      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 mb-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 text-center">Scan QR code untuk pembayaran</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total: Rp {displayTotal.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-2 space-y-2">
                {paymentMethod === 'cash' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Uang Kembalian:</span>
                    <span className={`font-medium ${kembalian > 0 ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                      Rp {kembalian.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                {appliedDiscount && !discountError && (
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Diskon Diterapkan:</span>
                    <span>- Rp {(totalBelanja - displayTotal).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <button 
                  type="submit" 
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg text-white font-medium text-sm shadow transition-all duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {paymentMethod === 'qris' ? 'Konfirmasi Pembayaran' : 'Proses Pembayaran'}
                </button>
              </div>
            </form>
            {/* Modal Daftar Diskon */}
            {showDiscountList && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 w-full max-w-xl mx-4 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg font-bold transition-colors"
                    onClick={handleCloseDiscountList}
                  >
                    ×
                  </button>
                  <h3 className="text-base font-semibold mb-2 text-blue-700 dark:text-blue-400">Daftar Diskon Tersedia</h3>
                  <div className="max-h-80 overflow-y-auto">
                    {discountList.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada diskon tersedia.</p>
                    ) : (
                      <table className="w-full text-xs border border-gray-200 dark:border-gray-700">
                        <thead>
                          <tr className="bg-blue-50 dark:bg-blue-900">
                            <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-200">Kode</th>
                            <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-200">Tipe</th>
                            <th className="px-2 py-1 text-right text-gray-700 dark:text-gray-200">Nilai</th>
                            <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-200">Pelanggan</th>
                            <th className="px-2 py-1 text-center text-gray-700 dark:text-gray-200">Mulai</th>
                            <th className="px-2 py-1 text-center text-gray-700 dark:text-gray-200">Berakhir</th>
                            <th className="px-2 py-1 text-center text-gray-700 dark:text-gray-200">Status</th>
                            <th className="px-2 py-1 text-center text-gray-700 dark:text-gray-200">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discountList.map((disc) => (
                            <tr key={disc.code} className="border-t border-gray-200 dark:border-gray-700">
                              <td className="px-2 py-1 font-mono text-blue-700 dark:text-blue-400">{disc.code}</td>
                              <td className="px-2 py-1 text-gray-800 dark:text-gray-200">{disc.type === 'percentage' ? 'Persentase' : 'Tetap'}</td>
                              <td className="px-2 py-1 text-right text-gray-800 dark:text-gray-200">
                                {disc.type === 'percentage'
                                  ? `${Number(disc.value)}%`
                                  : `Rp ${Number(disc.value).toLocaleString('id-ID')}`}
                              </td>
                              <td className="px-2 py-1 text-gray-800 dark:text-gray-200">{disc.customer_type || 'Semua'}</td>
                              <td className="px-2 py-1 text-center text-gray-800 dark:text-gray-200">{disc.start_date ? new Date(disc.start_date).toLocaleDateString('id-ID') : '-'}</td>
                              <td className="px-2 py-1 text-center text-gray-800 dark:text-gray-200">{disc.end_date ? new Date(disc.end_date).toLocaleDateString('id-ID') : '-'}</td>
                              <td className="px-2 py-1 text-center">
                                <span className={`px-2 py-0.5 rounded ${
                                  disc.active
                                    ? isExpired(disc)
                                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' // Kuning: Kadaluarsa
                                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' // Hijau: Aktif
                                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' // Merah: Nonaktif manual
                                }`}>
                                  {disc.active
                                    ? isExpired(disc)
                                      ? 'Kadaluarsa'
                                      : 'Aktif'
                                    : 'Nonaktif'}
                                </span>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <button
                                  type="button"
                                  className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition"
                                  onClick={() => handleCopyDiscountCode(disc.code)}
                                >
                                  Copy
                                </button>
                                {copiedCode === disc.code && (
                                  <span className="ml-2 text-green-600 dark:text-green-400 text-xs">Tersalin!</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;