import { useState, useEffect, useContext } from 'react';
import React from 'react';
import ImageCarousel from '../ImageCarousel'; 
import RunningText from './RunningText';
import { SettingsContext } from '../../context/SettingsContext';
// --- Helper & Placeholder Components ---

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getImageUrl = (path) => {
  const backendUrl = 'http://localhost:5000';
  if (!path) return `${backendUrl}/dm.jpg`;
  if (path.startsWith('http')) return path;
  return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const VideoPlayer = ({ videoSrc }) => {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      {videoSrc ? (
        <video className="w-full h-full object-cover" src={videoSrc} autoPlay loop muted />
      ) : (
        <p className="text-white">Video promosi tidak tersedia.</p>
      )}
    </div>
  );
};

// Remove the placeholder ImageCarousel component

const CartDisplay = ({ cart, transactionResult, view }) => {
  // Tampilan "Pembayaran Selesai"
  if (view === 'complete' && transactionResult) {
    return (
      <div className="bg-[var(--bg-default)] text-white h-full p-8 flex flex-col justify-center items-center font-sans text-center">
        <img src={getImageUrl(transactionResult.logo)} alt="Logo Toko" className="h-24 mx-auto mb-6 rounded-lg shadow-2xl" />
        <h1 className="text-4xl font-bold mb-2">Terima Kasih!</h1>
        <p className="text-lg text-blue-200 mb-8">Pembayaran Anda telah berhasil.</p>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full max-w-md space-y-3 border border-white/20">
          <div className="flex justify-between text-lg"><span className="text-blue-200">Total:</span><span className="font-semibold">{formatRupiah(transactionResult.total)}</span></div>
          <div className="flex justify-between text-lg"><span className="text-blue-200">Bayar:</span><span className="font-semibold">{formatRupiah(transactionResult.bayar)}</span></div>
          <div className="border-t border-white/20 my-2"></div>
          <div className="flex justify-between text-2xl font-bold"><span className="text-blue-100">Kembali:</span><span>{formatRupiah(transactionResult.kembalian)}</span></div>
        </div>
      </div>
    );
  }

  // Tampilan default (keranjang belanja)
  return (
    <div className="bg-gray-100 dark:bg-[var(--bg-default)] text-gray-800 dark:text-[var(--text-default)] h-full p-6 flex flex-col font-sans">
      <header className="text-center mb-4">
        <img src={getImageUrl(cart.logo)} alt="Logo Toko" className="h-20 mx-auto mb-3 rounded-lg shadow-lg" />
        <h1 className="text-2xl font-bold">Selamat Datang!</h1>
        {cart.customerName && <p className="text-lg mt-1 text-gray-600 dark:text-[var(--text-muted)]">Pelanggan: {cart.customerName}</p>}
      </header>
      <main className="flex-1 bg-white dark:bg-[var(--bg-secondary)] text-gray-800 dark:text-[var(--text-default)] rounded-lg p-4 overflow-y-auto shadow-inner border border-gray-200 dark:border-[var(--border-default)]">
        {cart.items.length > 0 ? (
          <ul className="space-y-2">
            {cart.items.map(item => (
              <li key={item.id} className="flex justify-between text-base border-b border-gray-100 dark:border-[var(--border-default)] pb-2">
                 <div>
                   <p className="font-medium">{item.name}</p>
                   <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{item.qty} x {formatRupiah(item.price)}</p>
                 </div>
                 <span className="font-semibold">{formatRupiah(item.price * item.qty)}</span>
               </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full"><p className="text-gray-400 dark:text-[var(--text-muted)]">Keranjang masih kosong...</p></div>
        )}
      </main>
      <footer className="mt-4 text-center">
        <p className="text-xl uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]">Total</p>
        <p className="text-5xl font-bold tracking-tighter">{formatRupiah(cart.total)}</p>
      </footer>
    </div>
  );
};

// --- Main Customer Display Component ---

const CustomerDisplay = () => {
  const { settings } = useContext(SettingsContext);
  const [cart, setCart] = useState({ 
    items: [], 
    total: 0, 
    customerName: '', 
    logo: settings?.storeLogo || '/dm.jpg' 
  });
  const [view, setView] = useState('cart'); // 'cart' or 'complete'
  const [transactionResult, setTransactionResult] = useState(null);
  const [promoVideoSrc, setPromoVideoSrc] = useState(null);
  const [promoImagePaths, setPromoImagePaths] = useState([]); // New state for image paths

  useEffect(() => {
    const fetchPromoContent = async () => {
      try {
        // Fetch promo video
        const videoResponse = await fetch(`${window.API_URL}/api/settings/promo-video`);
        const videoData = await videoResponse.json();
        if (videoData.path) {
          setPromoVideoSrc(`${window.API_URL}${videoData.path}`);
        } else {
          setPromoVideoSrc(null); // Clear video if no path
        }

        // Fetch promo images
        const imageResponse = await fetch(`${window.API_URL}/api/settings/promo-images`);
        const imageData = await imageResponse.json();
        if (imageData.paths) {
          // Prepend backend URL to image paths
          setPromoImagePaths(imageData.paths.map(path => `${window.API_URL}${path}`));
        }

      } catch (error) {
        console.error('Error fetching promo content:', error);
      }
    };

    fetchPromoContent(); // Initial fetch

    const handleUpdate = (payload) => {
      if (view !== 'complete') {
        // Pastikan logo menggunakan dari settings
        const updatedPayload = {
          ...payload,
          logo: settings?.storeLogo || payload.logo || '/dm.jpg'
        };
        setCart(updatedPayload);
      }
    };

    const handlePaymentComplete = (payload) => {
      setTransactionResult(payload);
      setView('complete');
      setTimeout(() => {
        setView('cart');
        setTransactionResult(null);
        setCart(prev => ({ ...prev, items: [], total: 0, customerName: '' }));
      }, 10000); // Kembali ke cart setelah 10 detik
    };

    // New IPC listener for promo content refresh
    const handleRefreshPromoContent = () => {
      console.log('Received refresh-promo-content event. Re-fetching promo content...');
      fetchPromoContent();
    };

    if (window.electron) {
      window.electron.onUpdateDisplay(handleUpdate);
      window.electron.onPaymentComplete(handlePaymentComplete);
      window.electron.onRefreshPromoContent(handleRefreshPromoContent); // Register new listener
    }

    return () => {
      if (window.electron) {
        window.electron.cleanup();
        // window.electron.removeListener('refresh-promo-content', handleRefreshPromoContent); // This line is no longer needed as onRefreshPromoContent handles cleanup internally
      }
    };
  }, [view]);

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
      {/* Top Section (70% height) */}
      <div className="h-[70%] flex flex-row">
        {/* Left Panel (60% width) */}
        <div className="w-[60%] h-full overflow-hidden">
          {promoVideoSrc ? (
            <VideoPlayer videoSrc={promoVideoSrc} />
          ) : promoImagePaths.length > 0 ? (
            <ImageCarousel images={promoImagePaths} />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <p className="text-white">Konten promosi tidak tersedia.</p>
            </div>
          )}
        </div>
        {/* Right Panel (40% width) */}
        <div className="w-[40%] h-screen flex flex-col overflow-hidden transition-all"> 
          <CartDisplay cart={cart} transactionResult={transactionResult} view={view} />
        </div>
      </div>

      {/* Bottom Section (30% height) */}
      <div className="h-[30%] w-full flex flex-row">
        {/* Left Panel - Image Carousel (60% width to match video above) */}
        <div className="w-[60%] h-full flex flex-col overflow-hidden">
          <div className="flex-grow overflow-hidden">
            <ImageCarousel images={promoImagePaths} />
          </div>
          
          {/* Running Text Section - same width as video */}
          <div className="bg-white dark:bg-[var(--bg-default)] p-2 mb-1 flex-shrink-0">
            <RunningText 
              text={settings.runningText || "Selamat datang di DM POS - Terima kasih atas kunjungan Anda"}
              bgColor={settings.runningTextBgColor}
              textColor={settings.runningTextTextColor}
              className="text-white" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDisplay;
