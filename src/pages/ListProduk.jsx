import { useEffect, useState } from 'react';
import { productAPI } from '../api'; // Import the productAPI module
import React from 'react';

const ListProduk = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productAPI.getAll() // Use the API method
      .then(response => {
        setProducts(response.data); // Axios wraps the response in a data object
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal mengambil data produk!');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Daftar Produk (MySQL)</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="min-w-full bg-white rounded shadow text-sm mt-2">
        <thead>
          <tr className="bg-blue-100 text-blue-700">
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Nama</th>
            <th className="px-3 py-2 text-right">Harga</th>
            <th className="px-3 py-2 text-left">Tipe</th>
            <th className="px-3 py-2 text-left">Jenis</th>
            <th className="px-3 py-2 text-left">Ukuran</th>
            <th className="px-3 py-2 text-left">Keyword</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && !loading && (
            <tr><td colSpan="7" className="text-center py-4 text-gray-400">Belum ada produk</td></tr>
          )}
          {products.map(prod => (
            <tr key={prod.id} className="border-b border-blue-50">
              <td className="px-3 py-2">{prod.id}</td>
              <td className="px-3 py-2">{prod.name}</td>
              <td className="px-3 py-2 text-right">Rp {prod.price?.toLocaleString('id-ID')}</td>
              <td className="px-3 py-2">{prod.type}</td>
              <td className="px-3 py-2">{prod.jenis}</td>
              <td className="px-3 py-2">{prod.ukuran}</td>
              <td className="px-3 py-2">{prod.keyword}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListProduk;
