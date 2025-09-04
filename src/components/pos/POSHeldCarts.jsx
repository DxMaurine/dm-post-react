import React from 'react';

const POSHeldCarts = ({ heldCarts, onRestoreCart }) => {
  if (heldCarts.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Transaksi Ditahan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heldCarts.map(cart => (
          <div 
            key={cart.id} 
            className="bg-white dark:bg-[var(--layout-bg-dark)] p-4 rounded-lg shadow border border-yellow-300 dark:border-yellow-600"
          >
            <p className="font-bold dark:text-white">Transaksi #{cart.id.toString().slice(-5)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Waktu: {new Date(cart.time).toLocaleTimeString('id-ID')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Jumlah Item: {cart.items.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Total: Rp {cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString('id-ID')}
            </p>
            <button 
              onClick={() => onRestoreCart(cart)}
              className="mt-3 w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Lanjutkan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default POSHeldCarts;