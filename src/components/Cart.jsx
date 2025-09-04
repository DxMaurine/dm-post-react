import React from 'react';
import CartItem from './CartItem';
import './Cart.css';

const Cart = ({ cartItems, onAddToCart, onRemoveFromCart }) => {
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="cart space-y-4">
      {cartItems.length === 0 && (
        <div className="text-center text-gray-400 py-8">Keranjang kosong</div>
      )}
      {cartItems.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onAdd={onAddToCart}
          onRemove={onRemoveFromCart}
        />
      ))}
      {cartItems.length !== 0 && (
        <>
          <hr className="my-2" />
          <div className="flex justify-between items-center text-lg font-semibold text-blue-700">
            <span>Total:</span>
            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">Bayar</button>
        </>
      )}
    </div>
  );
};

export default Cart;