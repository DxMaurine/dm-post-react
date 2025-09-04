import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Barcode from 'react-barcode';
import React from 'react';

const PrintBarcodePage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Gagal memuat data produk');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, token]);

  if (loading) return <div className="text-center p-10">Memuat...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center p-10">Produk tidak ada.</div>;

  return (
    <div className="print-container p-10">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none; }
          }
        `}
      </style>
      <div className="print-area flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-md font-semibold mb-2">Rp {product.price.toLocaleString('id-ID')}</p>
        {product.barcode ? (
          <Barcode value={product.barcode} />
        ) : (
          <p className="text-red-500">Produk ini tidak memiliki barcode.</p>
        )}
      </div>
      <div className="text-center mt-8 no-print">
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Cetak</button>
      </div>
    </div>
  );
};

export default PrintBarcodePage;