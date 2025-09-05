
/* eslint-disable no-unused-vars */
// GeneralSettings.jsx
import React, { useState, useEffect } from 'react';

// Helper function untuk mendapatkan URL gambar yang kompatibel dengan Electron
const getImageUrl = (path) => {
  const backendUrl = 'http://localhost:5000';
  if (!path) return `${backendUrl}/dm.jpg`;
  if (path.startsWith('http')) return path;
  return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const GeneralSettings = ({ formState, handleChange  }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi file type
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, GIF)');
      return;
    }

    // Validasi file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('http://localhost:5000/api/settings/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const result = await response.json();
      
      // Update form state dengan path logo yang baru
      handleChange({
        target: {
          name: 'storeLogo',
          value: result.logoPath
        }
      });

      // Update preview
      setLogoPreview(getImageUrl(result.logoPath));
      alert('Logo berhasil diupload!');

    } catch (error) {
      alert('Gagal mengupload logo. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">Pengaturan Umum Toko</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="storeName">
            Nama Toko
          </label>
          <input
            type="text"
            name="storeName"
            id="storeName"
            value={formState.storeName || ''}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="storeTagline">
            Tagline Toko
          </label>
          <input
            type="text"
            name="storeTagline"
            id="storeTagline"
            value={formState.storeTagline || ''}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="storeAddress">
          Alamat Toko
        </label>
        <textarea
          name="storeAddress"
          id="storeAddress"
          value={formState.storeAddress || ''}
          onChange={handleChange}
          rows={3}
          className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="receiptFooter">
            Footer Struk
          </label>
          <textarea
            name="receiptFooter"
            id="receiptFooter"
            value={formState.receiptFooter || ''}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)] h-24"
            placeholder="Terima kasih telah berbelanja"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="taxRate">
              Pajak (%)
            </label>
            <input
              type="number"
              name="taxRate"
              id="taxRate"
              min="0"
              max="100"
              step="0.1"
              value={formState.taxRate || 0}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="serviceCharge">
              Service Charge (%)
            </label>
            <input
              type="number"
              name="serviceCharge"
              id="serviceCharge"
              min="0"
              max="100"
              step="0.1"
              value={formState.serviceCharge || 0}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)] mb-4">Pengaturan Text Berjalan</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="runningTextBgColor">
            Warna Latar Belakang Teks Berjalan
          </label>
          <select
            name="runningTextBgColor"
            id="runningTextBgColor"
            value={formState.runningTextBgColor || ''}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
          >
            <option value="bg-blue-100 dark:bg-blue-900">Biru Muda</option>
            <option value="bg-green-100 dark:bg-green-900">Hijau Muda</option>
            <option value="bg-yellow-100 dark:bg-yellow-900">Kuning Muda</option>
            <option value="bg-red-100 dark:bg-red-900">Merah Muda</option>
            <option value="bg-gray-100 dark:bg-gray-800">Abu-abu</option>
            <option value="bg-white dark:bg-black">Putih/Hitam</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="runningTextTextColor">
            Warna Teks Berjalan
          </label>
          <select
            name="runningTextTextColor"
            id="runningTextTextColor"
            value={formState.runningTextTextColor || ''}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
          >
            <option value="text-blue-800 dark:text-blue-200">Biru Tua</option>
            <option value="text-green-800 dark:text-green-200">Hijau Tua</option>
            <option value="text-yellow-800 dark:text-yellow-200">Kuning Tua</option>
            <option value="text-red-800 dark:text-red-200">Merah Tua</option>
            <option value="text-gray-800 dark:text-gray-200">Abu-abu Tua</option>
            <option value="text-black dark:text-white">Hitam/Putih</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="runningText">
            Teks Berjalan (Promo/Info)
          </label>
          <input
            type="text"
            name="runningText"
            id="runningText"
            value={formState.runningText || ''}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            placeholder="Teks untuk promo atau informasi"
          />
        </div>
      </div>

      {/* Logo Upload Section */}
      <div>
        <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2">
          Logo Toko
        </label>
        <div className="flex items-start space-x-4">
          {/* Preview Logo */}
          <div className="flex-shrink-0">
            <img 
              src={logoPreview || getImageUrl(formState.storeLogo) || getImageUrl('/dm.jpg')}
              alt="Logo Toko" 
              className="h-20 w-20 object-cover rounded-lg border-2 border-gray-300 dark:border-[var(--border-default)] shadow-sm"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = getImageUrl('/dm.jpg');
              }}
            />
          </div>
          
          {/* Upload Controls */}
          <div className="flex-1">
            <input
              type="file"
              id="logoUpload"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label 
              htmlFor="logoUpload"
              className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-[var(--text-default)] bg-white dark:bg-[var(--bg-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Mengupload...' : 'Pilih Logo'}
            </label>
            <p className="mt-2 text-sm text-gray-500 dark:text-[var(--text-muted)]">
              Format: JPG, PNG, GIF. Maksimal 5MB. Rekomendasi: 200x200px
            </p>
          </div>
        </div>

    </div>
    </div>
  );
};


export default GeneralSettings;