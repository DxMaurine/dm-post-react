import React from 'react';

import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import { productAPI, shiftAPI, customerAPI, transactionAPI } from '../api';
import {
  POSHeader,
  POSQuickProducts,
  POSProductSearch,
  POSCustomerSearch,
  POSProductTable,
  POSCart,
  POSHeldCarts,
  POSModals,
  POSShortcutGuide,
  AddCustomerModal,
} from '../components/pos';
import LineProgressBar from '../components/LineProgressBar';
import { ActivationDialog } from '../components/activation';


const POSPage = () => {
  // State management
  const { settings } = useContext(SettingsContext);
  const { setSnackbar } = useOutletContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [quickProducts, setQuickProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [heldCarts, setHeldCarts] = useState([]);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [shiftStatus, setShiftStatus] = useState({ isActive: false, loading: true });
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [transactionDataForPrint, setTransactionDataForPrint] = useState(null);
  
  // Activation system states
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationRequired, setActivationRequired] = useState(false);
  const [transactionCounter, setTransactionCounter] = useState(null);
  
  const searchInputRef = useRef(null);
  const cartRef = useRef(null);
  const shortcutGuideRef = useRef(null);
  const POINT_TO_RUPIAH_CONVERSION_RATE = 100;

  // Fetch data functions
  const fetchProducts = useCallback(() => {
    setLoading(true);
    productAPI.getAll()
      .then((response) => {
        setProducts(response.data);
      })
      .catch(() => setSnackbar({ open: true, message: 'Gagal mengambil data produk!', severity: 'error' }))
      .finally(() => setLoading(false));
  }, [setSnackbar]);

  const fetchQuickProducts = async () => {
    try {
      const response = await productAPI.getQuickProducts();
      setQuickProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch quick products:', error);
    }
  };

  const handleCustomerSearch = async (searchTerm) => {
    if (searchTerm.trim() === '') {
      setCustomerSearchResults([]);
      return;
    }
    
    // Debouncing untuk mencegah terlalu banyak request
    clearTimeout(window.customerSearchTimeout);
    window.customerSearchTimeout = setTimeout(async () => {
      try {
        const response = await customerAPI.search(searchTerm);
        setCustomerSearchResults(response.data);
      } catch (error) {
        console.error('Customer search error:', error);
        setCustomerSearchResults([]);
        // Error akan ditangani oleh SweetAlert di komponen POSCustomerSearch
      }
    }, 300); // Debounce 300ms
  };

  // Product and cart functions
  const addToCart = (product, options = {}) => {
    if (product.stock <= 0) {
      setTimeout(() => setSnackbar({ open: true, message: `Stok ${product.name} sudah habis!`, severity: 'error' }), 0);
      return;
    }

    const exist = cartItems.find((item) => 
      (product.barcode && item.barcode === product.barcode) || item.id === product.id
    );

    if (exist) {
      const newQty = (parseInt(exist.qty, 10) || 0) + 1;
      handleQtyChange(exist, newQty); 
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }

    const { suppressFocus = false, keepSearch = false } = options;
    if (!keepSearch) {
      setSearch('');
    }
    // Kembalikan fokus ke kolom pencarian (F2 behavior) bila tidak disupress
    if (!suppressFocus) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
    // HAPUS FOKUS KE KERANJANG: setTimeout(() => cartRef.current?.focus(), 100);
  };

  const removeFromCart = (product) => {
    const exist = cartItems.find((item) => item.id === product.id);
    if (!exist) return;

    const newQty = exist.qty - 1;
    if (newQty > 0) {
      handleQtyChange(exist, newQty);
    } else {
      setCartItems(cartItems.filter((item) => item.id !== product.id));
    }
  };

  const handleQtyChange = (product, newQty) => {
    const qty = parseInt(newQty, 10);

    setCartItems(prevCartItems => {
      if (isNaN(qty) || qty < 1) {
        return prevCartItems.map(item =>
          item.id === product.id ? { ...item, qty: "" } : item
        );
      }

      if (qty > product.stock) {
        setTimeout(() => setSnackbar({ 
          open: true, 
          message: `Stok ${product.name} tidak mencukupi! Hanya ada ${product.stock}.`, 
          severity: 'warning' 
        }), 0);
        return prevCartItems.map(item =>
          item.id === product.id ? { ...item, qty: product.stock } : item
        );
      }

      return prevCartItems.map(item =>
        item.id === product.id ? { ...item, qty: qty } : item
      );
    });
  };

  const handleHoldCart = () => {
    if (cartItems.length === 0) return;
    const newHeldCart = { 
      id: Date.now(), 
      items: [...cartItems], 
      time: new Date() 
    };
    setHeldCarts([...heldCarts, newHeldCart]);
    setCartItems([]);
    setSelectedCustomer(null);
    setPointsToRedeem(0);
    setSnackbar({ open: true, message: 'Transaksi berhasil ditahan.', severity: 'info' });
  };

  const handleRestoreCart = (cartToRestore) => {
    if (cartItems.length > 0) {
      setSnackbar({ 
        open: true, 
        message: 'Selesaikan atau tahan transaksi saat ini terlebih dahulu!', 
        severity: 'warning' 
      });
      return;
    }
    setCartItems(cartToRestore.items);
    setHeldCarts(heldCarts.filter(cart => cart.id !== cartToRestore.id));
    setSnackbar({ 
      open: true, 
      message: `Transaksi #${cartToRestore.id.toString().slice(-5)} dilanjutkan.`, 
      severity: 'success' 
    });
  };

  const handlePaymentSubmit = async (paymentData) => {
    const { customerName, customerType, bayar, discount_code, applied_discount_value } = paymentData;
    const totalBelanja = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const pointsDiscount = (selectedCustomer ? pointsToRedeem : 0) * POINT_TO_RUPIAH_CONVERSION_RATE;
    const finalAmount = totalBelanja - applied_discount_value - pointsDiscount;
    const kembalianAmount = bayar - finalAmount;

    if (finalAmount < 0) {
      setSnackbar({ open: true, message: 'Total akhir tidak boleh negatif.', severity: 'error' });
      return;
    }

    // ACTIVATION SYSTEM: Increment transaction counter sebelum memproses transaksi
    try {
      const counterResponse = await fetch('http://localhost:5000/api/activation/increment-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const counterResult = await counterResponse.json();
      setTransactionCounter(counterResult);
      
      // Tampilkan warning jika mendekati limit
      if (counterResult.warning && counterResult.remaining > 0) {
        const warningMessage = counterResult.message || `⚠️ ${counterResult.remaining} transaksi tersisa!`;
        setSnackbar({
          open: true,
          message: warningMessage,
          severity: counterResult.warning === 'critical' ? 'error' : 'warning',
          action: counterResult.remaining <= 9 ? (
            <button 
              onClick={() => setShowActivationModal(true)}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.5)', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}
            >
              AKTIVASI
            </button>
          ) : null
        });
      }
    } catch (counterError) {
      if (counterError.response?.data?.error === 'TRIAL_LIMIT_REACHED') {
        setActivationRequired(true);
        setShowActivationModal(true);
        setSnackbar({
          open: true,
          message: '🔒 Batas trial 99 transaksi tercapai! Aktivasi diperlukan untuk melanjutkan.',
          severity: 'error'
        });
        return; // Stop transaction processing
      } else {
        console.error('Transaction counter error:', counterError);
        // Continue with transaction jika error lain (fallback)
      }
    }

    const transactionData = {
      customer: selectedCustomer ? selectedCustomer.name : customerName,
      items: cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        harga_beli: item.harga_beli
      })),
      total: finalAmount,
      subtotal: totalBelanja,
      bayar: bayar,
      kembalian: kembalianAmount,
      applied_discount_value: applied_discount_value || 0,
      points_discount: pointsDiscount || 0,
      redeemed_points: pointsToRedeem || 0,
      discount_code: discount_code,
      customer_id: selectedCustomer ? selectedCustomer.id : null,
      customer_type: selectedCustomer ? selectedCustomer.customer_type : customerType,
    };
    
    setLoading(true);
    try {
      const response = await transactionAPI.create(transactionData);
      const {  transactionCode, pointsEarned, updatedTotalPoints } = response.data;
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      // Use IPC to update customer display
      if (window.electron) { // Add conditional check
        window.electron.updateCustomerDisplay({
          type: 'PAYMENT_COMPLETE',
          payload: {
            total: finalAmount,
            bayar: bayar,
            kembalian: kembalianAmount,
            logo: settings?.logo_url || '/dm.jpg'
          }
        });
      }

      setTransactionDataForPrint({
        transactionId: transactionCode,
        settings,
        cartItems,
        totalBelanja,
        applied_discount_value: applied_discount_value || 0,
        pointsDiscount,
        finalTotal: finalAmount,
        bayar,
        kembalian: kembalianAmount,
        customerName: selectedCustomer ? selectedCustomer.name : customerName,
        cashierName: currentUser?.username || 'System',
        selectedCustomer,
        pointsEarned,
        updatedTotalPoints,
      });

      setSnackbar({ open: true, message: 'Transaksi berhasil disimpan!', severity: 'success' });
      setShowPrintDialog(true);
      setShowPayment(false);
      setCartItems([]);
      setSelectedCustomer(null);
      setPointsToRedeem(0);
      fetchProducts();
    } catch (err) {
      console.error('Transaction save error:', err);
      setSnackbar({ 
        open: true, 
        message: `Gagal menyimpan transaksi: ${err.response?.data?.message || err.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCustomer = async (customerData) => {
    setLoading(true);
    try {
      const response = await customerAPI.create(customerData);
      const newCustomer = response.data;
      setSnackbar({ open: true, message: 'Pelanggan baru berhasil ditambahkan!', severity: 'success' });
      setShowAddCustomerModal(false);
      
      setSelectedCustomer(newCustomer);
      setCustomerSearch(newCustomer.name);
      setCustomerSearchResults([]);
      // Kembalikan fokus ke kolom pencarian setelah simpan pelanggan
      setTimeout(() => searchInputRef.current?.focus(), 0);

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ open: true, message: `Gagal menambah pelanggan: ${errorMessage}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ACTIVATION SYSTEM: Handler untuk aktivasi berhasil
  const handleActivationSuccess = async (activationData) => {
    setActivationRequired(false);
    setShowActivationModal(false);
    
    // Refresh transaction counter status
    try {
      const response = await fetch('http://localhost:5000/api/activation/status');
      // eslint-disable-next-line no-unused-vars
      const status = await response.json();
      setTransactionCounter({
        remaining: 'unlimited',
        status: 'activated',
        warning: null
      });
      
      setSnackbar({
        open: true,
        message: `🎉 Aktivasi berhasil! ${activationData.temporary ? 'Lisensi sementara' : 'Transaksi unlimited'} tersedia.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to refresh activation status:', error);
    }
  };

  // ACTIVATION SYSTEM: Fetch status awal
  const fetchActivationStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/activation/status');
      const status = await response.json();
      setTransactionCounter({
        remaining: status.remaining,
        status: status.status,
        total: status.totalTransactions,
        activated: status.activated
      });
    } catch (error) {
      console.error('Failed to fetch activation status:', error);
    }
  };

  // NEW: Use IPC to open the customer display
  const handleOpenCustomerDisplay = () => {
    if (window.electron) { // Add conditional check
      window.electron.openCustomerDisplay();
    }
  };

  // NEW: Use IPC to update the customer display
  useEffect(() => {
    const totalBelanja = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const pointsDiscount = (selectedCustomer ? pointsToRedeem : 0) * POINT_TO_RUPIAH_CONVERSION_RATE;
    const finalTotal = totalBelanja - pointsDiscount;

    const payload = {
      items: cartItems,
      total: finalTotal,
      customerName: selectedCustomer ? selectedCustomer.name : '',
      logo: settings?.logo_url || '/dm.jpg'
    };
    if (window.electron) { // Add conditional check
      window.electron.updateCustomerDisplay({ type: 'UPDATE_CUSTOMER_DISPLAY', payload });
    }
  }, [cartItems, selectedCustomer, pointsToRedeem, settings, POINT_TO_RUPIAH_CONVERSION_RATE]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/logout');

    const checkShiftStatus = async () => {
      try {
        const response = await shiftAPI.getStatus();
        setShiftStatus({ isActive: response.data.isActive, loading: false });
      } catch (error) {
        setShiftStatus({ isActive: false, loading: false });
        setSnackbar({ 
          open: true, 
          message: error.message || 'Gagal memeriksa status shift.', 
          severity: 'error' 
        });
      }
    };

    checkShiftStatus();
    fetchProducts();
    fetchQuickProducts();
    fetchActivationStatus(); // Fetch activation status saat component mount
  }, [navigate, fetchProducts, setSnackbar]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') { 
        e.preventDefault(); 
        shortcutGuideRef.current.toggle();
      }
      if (e.key === 'F2') { 
        e.preventDefault(); 
        searchInputRef.current?.focus(); 
      }
      if (e.key === 'F4') { 
        e.preventDefault(); 
        setScannerOpen(prev => !prev); 
      }
      if (e.key === 'F7' && cartItems.length > 0) { 
        e.preventDefault(); 
        handleHoldCart(); 
      }
      if (e.key === 'F8' && cartItems.length > 0) { 
        e.preventDefault(); 
        setShowPayment(true); 
      }
      if (e.key === 'F9') { 
        e.preventDefault(); 
        fetchProducts(); 
      }
      if (e.key === 'Escape') {
        if (showPayment) setShowPayment(false);
        if (showPrintDialog) setShowPrintDialog(false);
        if (scannerOpen) setScannerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, showPayment, showPrintDialog, scannerOpen, fetchProducts]);

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto fullscreen when POS page is opened
  useEffect(() => {
    const autoFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    };
    
    // Delay sedikit untuk memastikan komponen sudah ter-render
    const timer = setTimeout(autoFullscreen, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (shiftStatus.isActive && !shiftStatus.loading) {
      searchInputRef.current?.focus();
    }
  }, [shiftStatus.isActive, shiftStatus.loading]);

  // Refocus search input when cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0) {
      searchInputRef.current?.focus();
    }
  }, [cartItems.length]);

  // Global refocus: pastikan input pencarian selalu fokus (scanner standby)
  useEffect(() => {
    const refocus = (ev) => {
      // Abaikan jika klik terjadi di area yang bertanda data-pos-no-refocus
      if (ev && ev.target && (ev.target.closest('[data-pos-no-refocus]'))) return;
      // Delay kecil agar tidak mengganggu event klik yang sedang berjalan
      setTimeout(() => searchInputRef.current?.focus(), 120);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refocus();
    };

    document.addEventListener('mousedown', refocus, true);
    document.addEventListener('touchstart', refocus, true);
    window.addEventListener('focus', () => refocus());
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('mousedown', refocus, true);
      document.removeEventListener('touchstart', refocus, true);
      window.removeEventListener('focus', refocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);


  if (shiftStatus.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Memeriksa status shift...</p>
        </div>
      </div>
    );
  }

  if (!shiftStatus.isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-10 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 dark:text-[var(--text-muted)] mb-4">Shift Belum Dimulai</h2>
        <p className="text-gray-600 dark:text-[var(--text-default] mb-6">
          Anda harus memulai shift terlebih dahulu sebelum dapat melakukan transaksi.
        </p>
        <button 
          onClick={() => navigate('/shift')} 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Mulai Shift Sekarang
        </button>
      </div>
    );
  }

  const totalBelanja = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const pointsDiscount = (selectedCustomer ? pointsToRedeem : 0) * POINT_TO_RUPIAH_CONVERSION_RATE;
  const finalTotal = totalBelanja - pointsDiscount;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-xl mt-1 mb-1 overflow-hidden shadow-lg">
      <LineProgressBar
        loading={loading}
      />
      <POSHeader 
        settings={settings} 
        isFullScreen={isFullScreen}
        onFullscreenToggle={handleFullscreenToggle}
        onOpenCustomerDisplay={handleOpenCustomerDisplay}
      />

      <main className="flex-1 flex flex-col items-center justify-start overflow-auto p-2 md:p-6">
        <div className="w-full max-w-6xl">
          <POSQuickProducts 
            products={quickProducts} 
            onAddToCart={addToCart}
          />

                    <POSProductSearch 
            ref={searchInputRef}
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              if (!search) return;
              const product = products.find(p => 
                p.id.toString() === search || 
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.barcode && p.barcode.toString() === search)
              );
              if (product) {
                addToCart(product);
                setSearch('');
                searchInputRef.current?.focus(); // KEMBALIKAN FOKUS
              } else {
                setTimeout(() => setSnackbar({ 
                  open: true, 
                  message: 'Produk tidak ditemukan.', 
                  severity: 'warning' 
                }), 0);
              }
            }}
            onScannerOpen={() => setScannerOpen(true)}
          />

          <POSCustomerSearch 
            customerSearch={customerSearch}
            selectedCustomer={selectedCustomer}
            searchResults={customerSearchResults}
            onSearchChange={(value) => {
              setCustomerSearch(value);
              handleCustomerSearch(value);
            }}
            onCustomerSelect={(customer) => {
              setSelectedCustomer(customer);
              setCustomerSearch(customer.name);
              setCustomerSearchResults([]);
              // Kembalikan fokus ke kolom pencarian setelah pilih pelanggan
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }}
            onCustomerRemove={() => {
              setSelectedCustomer(null);
              setPointsToRedeem(0);
              setCustomerSearch('');
              // Kembalikan fokus ke kolom pencarian setelah hapus/close pelanggan
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }}
            onAddCustomer={() => setShowAddCustomerModal(true)}
          />

          {search.trim() !== '' && (
            <POSProductTable 
              products={products.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) || 
                p.id.toString().includes(search) ||
                (p.barcode && p.barcode.toString().includes(search))
              )}
              loading={false}
              error={null}
              onAddToCart={addToCart}
              onClose={() => setSearch('')}
            />
          )}

          {cartItems.length > 0 && (
            <POSCart 
              ref={cartRef}
              cartItems={cartItems}
              selectedCustomer={selectedCustomer}
              pointsToRedeem={pointsToRedeem}
              onQtyChange={handleQtyChange}
              onRemoveFromCart={removeFromCart}
              onAddToCart={(item) => addToCart(item, { suppressFocus: true, keepSearch: true })}
              onRemoveItemCompletely={(product) => {
                setCartItems(prev => prev.filter((item) => item.id !== product.id));
                setTimeout(() => searchInputRef.current?.focus(), 0);
              }}
              onPointsRedeemChange={(e) => {
                if (!selectedCustomer) return;
                let value = parseInt(e.target.value, 10) || 0;
                value = Math.max(0, value);
                value = Math.min(value, selectedCustomer.loyalty_points);
                
                const maxRedeemable = Math.floor(totalBelanja / POINT_TO_RUPIAH_CONVERSION_RATE);
                if (value > maxRedeemable) {
                  value = maxRedeemable;
                  setSnackbar({ 
                    open: true, 
                    message: `Maksimal poin yang bisa ditukar untuk transaksi ini adalah ${value} poin.`, 
                    severity: 'warning' 
                  });
                }
                setPointsToRedeem(value);
              }}
              onHoldCart={handleHoldCart}
              onOpenPayment={() => setShowPayment(true)}
            />
          )}

          {heldCarts.length > 0 && (
            <POSHeldCarts 
              heldCarts={heldCarts}
              onRestoreCart={handleRestoreCart}
            />
          )}
        </div>
      </main>

      <POSModals 
        showPayment={showPayment}
        showPrintDialog={showPrintDialog}
        scannerOpen={scannerOpen}
        transactionData={transactionDataForPrint}
        cartItems={cartItems}
        totalBelanja={finalTotal}
        onClosePayment={() => setShowPayment(false)}
        onClosePrintDialog={() => {
          setShowPrintDialog(false);
          setTransactionDataForPrint(null);
        }}
        onCloseScanner={() => setScannerOpen(false)}
        onScanSuccess={(barcode) => {
          const product = products.find(p => p.barcode === barcode);
          if (product) {
            addToCart(product);
          } else {
            setSnackbar({ 
              open: true, 
              message: 'Produk dengan barcode tersebut tidak ditemukan', 
              severity: 'warning' 
            });
          }
          setScannerOpen(false);
        }}
        onPaymentSubmit={handlePaymentSubmit}
        onError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
      />

      <AddCustomerModal
        show={showAddCustomerModal}
        onClose={() => { 
          setShowAddCustomerModal(false);
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }}
        onSave={handleAddNewCustomer}
        onError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
      />

      {/* ACTIVATION SYSTEM: Dialog aktivasi lisensi */}
      <ActivationDialog 
        open={showActivationModal}
        onClose={() => !activationRequired && setShowActivationModal(false)}
        required={activationRequired}
        counterData={transactionCounter}
        onActivated={handleActivationSuccess}
      />

      <POSShortcutGuide ref={shortcutGuideRef} />
    </div>
  );
};

export default POSPage;