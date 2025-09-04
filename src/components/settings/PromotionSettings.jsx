import React from 'react';

const PromotionSettings = ({ promoVideoFile, setPromoVideoFile, handleImageFileChange, handleUploadImages, handleRemoveImage, selectedFiles, promoImages, setFeedback, feedbackTimeoutRef }) => {
  const handleFileChange = (e) => {
    setPromoVideoFile(e.target.files[0]);
  };

  const handleUploadVideoInternal = async () => { // Renamed to avoid prop conflict
    if (!promoVideoFile) {
      // Use setFeedback from props
      setFeedback({ message: 'Pilih file video terlebih dahulu.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('promoVideoFile', promoVideoFile);

    try {
      const response = await fetch(`${window.API_URL}/api/settings/promo-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengunggah video.');
      }

      // Update settings in context and form state with the new path
      // This part needs to be handled by the parent (PengaturanPage) or a global state
      // For now, just notify success and trigger refresh
      setFeedback({ message: 'Video berhasil diunggah!', type: 'success' });
      setPromoVideoFile(null); // Clear the file input state
      if (window.electron && window.electron.sendPromoContentUpdated) {
        window.electron.sendPromoContentUpdated(); // Notify customer display
      }

    } catch (error) {
      setFeedback({ message: `Error: ${error.message}`, type: 'error' });
    }

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Pengaturan Promosi</h2>

      {/* Video Upload Section */}
      <div className="bg-gray-50 dark:bg-[var(--bg-card)] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-default)]">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">Video Promosi</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Unggah video promosi yang akan ditampilkan di layar pelanggan.</p>
        
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 dark:text-gray-100
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-200
              dark:hover:file:bg-blue-800
              cursor-pointer"
          />
          <button
            type="button"
            onClick={handleUploadVideoInternal}
            disabled={!promoVideoFile}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md
              hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-green-800 dark:hover:bg-green-700 transition-colors duration-200"
          >
            Unggah Video
          </button>
        </div>
        {promoVideoFile && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">File terpilih: {promoVideoFile.name}</p>
        )}
      </div>

      {/* Promo Images Upload Section */}
      <div className="bg-gray-50 dark:bg-[var(--bg-card)] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-default)]">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">Gambar Promosi (Carousel)</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Unggah hingga 10 gambar untuk ditampilkan di layar pelanggan. Ukuran file maksimal 5MB per gambar.</p>
        
        <div className="flex items-center space-x-4">
          <input
            type="file"
            id="promoImageFiles"
            name="promoImageFiles"
            accept="image/jpeg,image/png,image/gif"
            multiple
            onChange={handleImageFileChange}
            className="block w-full text-sm text-gray-900 dark:text-gray-100
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-200
              dark:hover:file:bg-blue-800
              cursor-pointer"
          />
          <button
            onClick={handleUploadImages}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors duration-200"
          >
            Unggah Gambar
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {selectedFiles.length} file terpilih.
          </p>
        )}

        {promoImages && promoImages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-800 dark:text-[var(--text-default)] mb-2">Gambar Saat Ini:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {promoImages.map((imagePath, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={imagePath.startsWith('http') ? imagePath : `${window.API_URL}${imagePath}`}
                    alt={`Promo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => handleRemoveImage(imagePath)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus Gambar"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionSettings;
