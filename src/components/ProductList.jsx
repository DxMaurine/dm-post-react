
import ProductItem from './ProductItem';
import './ProductList.css';
import React from 'react';

const ProductList = ({ products, onAddToCart }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductList;