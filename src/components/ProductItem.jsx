import React from 'react';
import './ProductItem.css';

const ProductItem = ({ product, onAddToCart }) => {
  return (
    <div
      className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center border border-blue-100 hover:border-blue-400"
      onClick={() => onAddToCart(product)}
    >
      <h4 className="font-semibold text-lg text-blue-700 mb-1">{product.name}</h4>
      <p className="text-gray-600 text-sm">Rp {product.price.toLocaleString('id-ID')}</p>
      <span className="mt-2 text-xs text-blue-400">Klik untuk tambah</span>
    </div>
  );
};

export default ProductItem;