import React from 'react';
import './CartItem.css';

const CartItem = ({ item, onAdd, onRemove }) => {
  return (
    <div className="cart-item flex justify-between items-center bg-white rounded-lg shadow p-3 border border-blue-100 mb-2">
      <div>
        <h4 className="font-medium text-blue-700">{item.name}</h4>
        <p className="text-gray-500 text-sm">Rp {item.price.toLocaleString('id-ID')}</p>
      </div>
      <div className="cart-item-actions flex items-center space-x-2">
        <button
          className="w-8 h-8 bg-red-100 hover:bg-red-300 text-red-600 rounded-full font-bold text-lg transition"
          onClick={() => onRemove(item)}
        >
          -
        </button>
        <span className="font-semibold text-blue-700 w-6 text-center">{item.qty}</span>
        <button
          className="w-8 h-8 bg-green-100 hover:bg-green-300 text-green-600 rounded-full font-bold text-lg transition"
          onClick={() => onAdd(item)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CartItem;