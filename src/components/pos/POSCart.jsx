import { forwardRef, useImperativeHandle, useRef } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import React from 'react';

const POSCart = forwardRef(({
  cartItems,
  selectedCustomer,
  pointsToRedeem,
  onQtyChange,
  onRemoveFromCart,
  onAddToCart,
  onRemoveItemCompletely,
  onPointsRedeemChange,
  onHoldCart,
  onOpenPayment
}, ref) => {
  const totalBelanja = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const POINT_TO_RUPIAH_CONVERSION_RATE = 100;
  const pointsDiscount = (selectedCustomer ? pointsToRedeem : 0) * POINT_TO_RUPIAH_CONVERSION_RATE;
  const finalTotal = totalBelanja - pointsDiscount;

  const lastItemRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (lastItemRef.current) {
        lastItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          lastItemRef.current.focus();
          lastItemRef.current.select();
        }, 300); // Small delay to ensure scrolling has time to start/finish
      }
    }
  }));

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center"> <FiShoppingCart size={18} fontSize= "18" className= "mr-2" />Keranjang Belanja</h2>
      <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-[var(--layout-bg-dark)] p-4 ">
        <table className="min-w-full text-sm rounded-xl shadow-md">
          <thead>
            <tr className="bg-blue-100 dark:bg-[var(--sidebar-bg-dark)] text-blue-700 dark:text-white rounded-xl">
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-right">Harga</th>
              <th className="px-3 py-2 text-center">Qty</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, idx) => (
              <tr 
                key={item.id} 
                className={`border-b border-blue-200 dark:border-slate-600 ${idx === cartItems.length - 1 ? 'last:border-b-2 last:border-blue-400 dark:last:border-blue-600' : ''}`}
              >
                <td className="px-3 py-2 dark:text-gray-300">{item.name}</td>
                <td className="px-3 py-2 text-right dark:text-gray-300">
                  Rp {item.price.toLocaleString('id-ID')}
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    ref={idx === cartItems.length - 1 ? lastItemRef : null}
                    type="number"
                    value={item.qty}
                    onChange={(e) => onQtyChange(item, e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                        onQtyChange(item, '1');
                      }
                    }}
                    className="w-20 text-center bg-gray-100 dark:bg-[var(--sidebar-bg-dark)] border border-gray-300 dark:border-slate-600 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    min="1"
                    max={item.stock}
                  />
                </td>
                <td className="px-3 py-2 text-right dark:text-gray-300">
                  Rp {(item.price * item.qty).toLocaleString('id-ID')}
                </td>
                <td className="px-3 py-2 text-center flex items-center justify-center space-x-2">
                  <button 
                    className="bg-red-100 hover:bg-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 rounded-xl px-3 py-2 text-lg font-bold"
                    onClick={() => onRemoveFromCart(item)}
                  >
                    -
                  </button>
                  <button 
                    className="bg-green-100 hover:bg-green-300 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-300 rounded-xl px-3 py-2 text-lg font-bold"
                    onClick={() => onAddToCart(item)}
                  >
                    +
                  </button>
                  <button 
                    className="bg-gray-100 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded-xl p-2"
                    onClick={() => onRemoveItemCompletely(item)}
                    title="Hapus Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            
            <tr className="bg-blue-50 dark:bg-[var(--sidebar-bg-dark)] text-blue-700 dark:text-white font-bold">
              <td className="px-3 py-2 text-right" colSpan="3">Subtotal</td>
              <td className="px-3 py-2 text-right" colSpan="2">
                Rp {totalBelanja.toLocaleString('id-ID')}
              </td>
            </tr>
            
            {selectedCustomer && selectedCustomer.loyalty_points > 0 && (
              <tr className="bg-blue-50 dark:bg-[var(--layout-bg-dark)] text-blue-700 dark:text-white font-bold">
                <td className="px-3 py-2 text-right" colSpan="3">
                  <div className="flex items-center justify-end gap-2">
                    <span>Tukar Poin (Maks: {selectedCustomer.loyalty_points})</span>
                    <input 
                      type="number" 
                      value={pointsToRedeem} 
                      onChange={onPointsRedeemChange}
                      className="w-24 rounded-md p-1 text-right text-black dark:bg-slate-800 dark:text-white" 
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right" colSpan="2">
                  - Rp {pointsDiscount.toLocaleString('id-ID')}
                </td>
              </tr>
            )}
            
            <tr className="bg-blue-50 dark:bg-[var(--sidebar-bg-dark)] text-blue-700 dark:text-white font-bold text-lg">
              <td className="px-3 py-2 text-right" colSpan="3">Total</td>
              <td className="px-3 py-2 text-right" colSpan="2">
                Rp {finalTotal.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="flex justify-end mt-4 gap-4">
          <button 
            className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600"
            onClick={onHoldCart}
            disabled={cartItems.length === 0}
          >
            Tahan (F7)
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600"
            onClick={onOpenPayment}
            disabled={cartItems.length === 0}
          >
            Bayar (F8)
          </button>
        </div>
      </div>
    </div>
  );
});

export default POSCart;