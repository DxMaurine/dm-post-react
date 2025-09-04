import { useState, useEffect, useRef } from 'react';
import React from 'react';

// Helper to get the full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Assuming the backend runs on port 5000 and serves static files from the root
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${backendUrl}${imagePath}`;
};

const ProductModal = ({ show, onClose, onSave, product, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    jenis: '',
    ukuran: '',
    price: '',
    harga_beli: '',
    stock: '',
    keyword: '',
    barcode: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      if (product) {
        setFormData({
          name: product.name || '',
          type: product.type || '',
          jenis: product.jenis || '',
          ukuran: product.ukuran || '',
          price: product.price ? parseInt(product.price, 10) : '',
          harga_beli: product.harga_beli ? parseInt(product.harga_beli, 10) : '',
          stock: product.stock || '',
          keyword: product.keyword || '',
          barcode: product.barcode || '',
        });
        setImagePreview(getImageUrl(product.image_url));
        setImageFile(null); // Reset file input on open
      } else {
        setFormData({
          name: '', type: '', jenis: '', ukuran: '',
          price: '', harga_beli: '', stock: '',
          keyword: '', barcode: '',
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [product, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onError('Nama barang tidak boleh kosong!');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      onError('Harga Jual harus berupa angka yang valid!');
      return;
    }
    if (!formData.harga_beli || isNaN(Number(formData.harga_beli)) || Number(formData.harga_beli) < 0) {
      onError('Harga Beli harus berupa angka yang valid!');
      return;
    }
    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      onError('Stok harus berupa angka non-negatif!');
      return;
    }

    const productData = new FormData();
    // Append all form data
    Object.keys(formData).forEach(key => {
      productData.append(key, formData[key]);
    });

    // Append image file if it exists
    if (imageFile) {
      productData.append('image', imageFile);
    }
    
    // If we are editing, add the product ID
    if (product && product.id) {
        productData.append('id', product.id);
    }

    onSave(productData);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[var(--border-default)]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-default)]">
            {product ? 'Edit Barang' : 'Tambah Barang Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-default)] focus:outline-none transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: Form inputs */}
            <div className="flex-grow space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Nama Barang *</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" required />
                </div>
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Barcode</label>
                  <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" placeholder="Kosongkan untuk auto-generate" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="harga_beli" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Harga Beli (Rp) *</label>
                  <input type="number" name="harga_beli" id="harga_beli" value={formData.harga_beli} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" required />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Harga Jual (Rp) *</label>
                  <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Stok *</label>
                    <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" required />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Tipe</label>
                  <input type="text" name="type" id="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jenis" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Jenis</label>
                  <input type="text" name="jenis" id="jenis" value={formData.jenis} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" />
                </div>
                <div>
                  <label htmlFor="ukuran" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Ukuran</label>
                  <input type="text" name="ukuran" id="ukuran" value={formData.ukuran} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" />
                </div>
              </div>
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Keyword Pencarian</label>
                <input type="text" name="keyword" id="keyword" value={formData.keyword} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-[var(--bg-default)] text-gray-900 dark:text-[var(--text-default)] transition-all" placeholder="e.g. cat, pakan, makanan kering" />
              </div>
            </div>

            {/* Right side: Image upload */}
            <div className="w-full md:w-1/3 flex-shrink-0">
              <label className="block text-sm font-medium text-gray-600 dark:text-[var(--text-muted)] mb-1">Gambar Produk</label>
              <div 
                className="aspect-square w-full border-2 border-dashed border-gray-300 dark:border-[var(--border-default)] rounded-lg flex items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-gray-400 dark:text-[var(--text-muted)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="mt-1 text-sm">Klik untuk upload</p>
                    <p className="text-xs">PNG, JPG, WEBP (Max 2MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg font-medium text-gray-700 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-default)]">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-[var(--primary-color)] rounded-lg font-medium text-white hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]">
              Simpan Barang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;