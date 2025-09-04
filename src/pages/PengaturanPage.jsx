// PengaturanPage.jsx
import { useContext, useState, useEffect, useRef } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import TabNavigation from '../components/settings/TabNavigation';
import GeneralSettings from '../components/settings/GeneralSettings';
import PrinterSettings from '../components/settings/PrinterSettings';
import DatabaseSettings from '../components/settings/DatabaseSettings';
import PaymentSettings from '../components/settings/PaymentSettings';
import BarcodeSettings from '../components/settings/BarcodeSettings';
import CloudSettings from '../components/settings/CloudSettings';
import PromotionSettings from '../components/settings/PromotionSettings'; // Import the new component
import QuickProductsSettings from '../components/settings/QuickProductsSettings';
import React from 'react';

const PengaturanPage = () => {
  const context = useContext(SettingsContext);
  const [activeTab, setActiveTab] = useState('general');
  const [formState, setFormState] = useState({});
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [promoImagePaths, setPromoImagePaths] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const feedbackTimeoutRef = useRef(null);

  // Safeguard in case context is not available
  if (!context) {
    return <div className="container mx-auto p-4">Loading settings... or context provider is missing.</div>;
  }

  const { settings, updateSettings } = context;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { // This effect syncs form state when settings are loaded/changed from context
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  // Fetch promo images on component mount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchPromoImages = async () => {
      try {
        const response = await fetch(`${window.API_URL}/api/settings/promo-images`);
        if (!response.ok) {
          throw new Error('Gagal mengambil gambar promosi.');
        }
        const data = await response.json();
        setPromoImagePaths(data.paths || []);
      } catch (error) {
        console.error('Error fetching promo images:', error);
        setFeedback({ message: `Gagal mengambil gambar promosi: ${error.message}`, type: 'error' });
      }
    };
    fetchPromoImages();
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { // This effect is for cleaning up the feedback timeout
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({ 
      ...prevState, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    setSelectedImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formState);
      setFeedback({ message: 'Pengaturan berhasil disimpan!', type: 'success' });
    } catch (error) {
      setFeedback({ message: `Gagal menyimpan pengaturan: ${error.message}`, type: 'error' });
    }

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  const handleUploadImages = async () => {
    if (selectedImageFiles.length === 0) {
      setFeedback({ message: 'Pilih setidaknya satu file gambar untuk diunggah.', type: 'error' });
      return;
    }

    const formData = new FormData();
    selectedImageFiles.forEach(file => {
      formData.append('promoImageFiles', file);
    });

    try {
      const response = await fetch(`${window.API_URL}/api/settings/promo-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengunggah gambar.');
      }

      setFeedback({ message: 'Gambar berhasil diunggah!', type: 'success' });
      setSelectedImageFiles([]); // Clear selected files
      // Re-fetch images to get the latest list from the server
      const updatedResponse = await fetch(`${window.API_URL}/api/settings/promo-images`);
      const updatedData = await updatedResponse.json();
      setPromoImagePaths(updatedData.paths || []);
      if (window.electron && window.electron.sendPromoContentUpdated) {
        window.electron.sendPromoContentUpdated(); // Notify customer display
      }

    } catch (error) {
      setFeedback({ message: `Error: ${error.message}`, type: 'error' });
    }

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  const handleRemoveImage = async (imagePathToRemove) => {
    // Extract filename from the full path
    const filename = imagePathToRemove.split('/').pop();

    try {
      const response = await fetch(`${window.API_URL}/api/settings/promo-images/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus gambar.');
      }

      setFeedback({ message: 'Gambar berhasil dihapus!', type: 'success' });
      // Update local state to reflect the deletion
      setPromoImagePaths(prevPaths => prevPaths.filter(path => path !== imagePathToRemove));
      if (window.electron && window.electron.sendPromoContentUpdated) {
        window.electron.sendPromoContentUpdated(); // Notify customer display
      }

    } catch (error) {
      setFeedback({ message: `Error: ${error.message}`, type: 'error' });
    }

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  

  const tabs = [
    { id: 'general', icon: 'receipt', label: 'Umum' },
    { id: 'printer', icon: 'printer', label: 'Printer' },
    { id: 'database', icon: 'database', label: 'Database' },
    { id: 'payment', icon: 'credit-card', label: 'Pembayaran' },
    { id: 'barcode', icon: 'barcode', label: 'Barcode' },
    { id: 'cloud', icon: 'cloud', label: 'Cloud Sync' },
    { id: 'promotion', icon: 'play-circle', label: 'Promosi' }, // New tab for promotions
    { id: 'quick-products', icon: 'zap', label: 'Produk Cepat' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': // Added 'case 'general':'
        return <GeneralSettings 
                  formState={formState} 
                  handleChange={handleChange} 
                />;
      case 'promotion':
        return <PromotionSettings 
                  feedback={feedback} 
                  setFeedback={setFeedback} 
                  feedbackTimeoutRef={feedbackTimeoutRef}
                  handleImageFileChange={handleFileChange} // Pass handleFileChange as handleImageFileChange
                  handleUploadImages={handleUploadImages}
                  handleRemoveImage={handleRemoveImage}
                  selectedFiles={selectedImageFiles}
                  promoImages={promoImagePaths}
                />;
      case 'quick-products':
        return <QuickProductsSettings />;
      case 'printer':
        return <PrinterSettings formState={formState} handleChange={handleChange} context={context} setFeedback={setFeedback} />;
      case 'database':
        return <DatabaseSettings formState={formState} handleChange={handleChange} context={context} setFeedback={setFeedback} />;
      case 'payment':
        return <PaymentSettings formState={formState} handleChange={handleChange} />;
      case 'barcode':
        return <BarcodeSettings formState={formState} handleChange={handleChange} />;
      case 'cloud':
        return <CloudSettings formState={formState} handleChange={handleChange} />;
      default:
        return <GeneralSettings 
                  formState={formState} 
                  handleChange={handleChange} 
                />;
    }
  };



  

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {feedback.message && (
        <div className= {`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 flex items-center ${
          feedback.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
        }`}>
          {feedback.type === 'success' && (
            <svg 
              className="w-6 h-6 mr-2 animate-[checkmark_0.4s_ease-in-out]" 
              viewBox="0 0 24 24"
              fill="none" 
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path 
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {feedback.message}
        </div>
      )}

      <div className="bg-white dark:bg-[var(--bg-default)] rounded-2xl shadow-lg overflow-hidden mx-auto border border-gray-200 dark:border-[var(--border-default)] flex flex-col md:flex-row ">
        <aside className="w-full md:w-1/4 lg:w-1/5 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-[var(--border-default)]">
          <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {renderTabContent()}
            
            {activeTab !== 'quick-products' && (
              <div className="border-t border-gray-200 dark:border-[var(--border-default)] pt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-[var(--primary-color)] dark:hover:bg-[var(--primary-color-hover)] text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Simpan Pengaturan
                </button>
              </div>
            )}
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default PengaturanPage;
