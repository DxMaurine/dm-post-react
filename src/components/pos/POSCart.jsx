import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiPause, FiAward } from 'react-icons/fi';
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
  const [isScrolled, setIsScrolled] = useState(false);

  const lastItemRef = useRef(null);
  const cartBodyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (cartBodyRef.current) {
        setIsScrolled(cartBodyRef.current.scrollTop > 0);
      }
    };

    const cartBody = cartBodyRef.current;
    if (cartBody) {
      cartBody.addEventListener('scroll', handleScroll);
      return () => cartBody.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [cartItems]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (lastItemRef.current) {
        lastItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          lastItemRef.current.focus();
          lastItemRef.current.select();
        }, 300);
      }
    }
  }));

  return (
    <div className="mt-8" data-pos-no-refocus>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-700 dark:text-[var(--primary-color)] flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:bg-[var(--primary-color)] p-2 rounded-lg mr-3">
            <FiShoppingCart size={20} className="text-white" />
          </div>
          Keranjang Belanja
        </h2>
        {cartItems.length > 0 && (
          <span className="bg-blue-100 text-blue-800 dark:bg-[var(--primary-color)]/20 dark:text-[var(--primary-color)] px-3 py-1 rounded-full text-sm font-medium">
            {cartItems.length} item
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-[var(--border-default)]">
        {/* Cart Header - Sticky */}
        <div className={`bg-gradient-to-r from-blue-600 to-indigo-700 dark:bg-[var(--primary-color)] text-white  text-center text-sm font-medium px-4 py-3 sticky top-0 z-10 ${isScrolled ? 'shadow-md' : ''}`}>
          <div className="grid grid-cols-12 gap-2 font-semibold text-sm">
            <div className="col-span-5">Nama Produk</div>
            <div className="col-span-2 text-right">Harga</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Subtotal</div>
            <div className="col-span-1 text-center">Aksi</div>
          </div>
        </div>

        {/* Cart Body - Scrollable */}
        <div ref={cartBodyRef} className="max-h-[40vh] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-[var(--text-muted)]">
              <FiShoppingCart className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg">Keranjang kosong</p>
              <p className="text-sm">Tambahkan produk untuk mulai berbelanja</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-[var(--border-default)]">
              {cartItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[var(--bg-default)] transition-colors duration-200"
                  ref={idx === cartItems.length - 1 ? lastItemRef : null}
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <div className="font-medium text-gray-800 dark:text-[var(--text-muted)]">{item.name}</div>
                      {item.stock < 10 && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Stok hampir habis: {item.stock}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <div className="text-gray-700 dark:text-[var(--text-default)]">
                        Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => onQtyChange(item, e.target.value)}
                          onBlur={(e) => {
                            let finalQty = parseInt(e.target.value, 10);
                            if (isNaN(finalQty) || finalQty < 1) finalQty = 1;
                            if (finalQty > item.stock) finalQty = item.stock;
                            onQtyChange(item, finalQty);
                          }}
                          className="w-16 text-center bg-gray-100 dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-default)] rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-[var(--text-default)]"
                          min="1"
                          max={item.stock}
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <div className="font-medium text-gray-800 dark:text-[var(--text-default)]">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="flex items-center justify-center space-x-1">
                        <button 
                          onClick={() => onRemoveFromCart(item)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Kurangi jumlah"
                        >
                          <FiMinus size={16} />
                        </button>
                        <button 
                          onClick={() => onAddToCart(item)}
                          className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Tambah jumlah"
                        >
                          <FiPlus size={16} />
                        </button>
                        <button 
                          onClick={() => onRemoveItemCompletely(item)}
                          className="p-1 text-gray-500 dark:text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-red-500/30 rounded-lg transition-colors"
                          title="Hapus item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer - Fixed (Not affected by scroll) */}
        <div className="border-t border-gray-200 dark:border-[var(--border-default)] bg-white dark:bg-[var(--card-bg-dark)] p-4">
          {/* Subtotal */}
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-[var(--text-muted)] font-medium">Subtotal</span>
            <span className="text-lg font-semibold text-gray-800 dark:text-[var(--text-default)]">
              Rp {totalBelanja.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Points Redeem Section */}
          {selectedCustomer && selectedCustomer.loyalty_points > 0 && (
            <div className="bg-white dark:bg-[var(--bg-default)] p-3 rounded-lg mb-3 border border-amber-200 dark:border-white-700/30">
              <div className="flex items-center justify-between ">
                <div className="flex items-center">
                  <div className="bg-amber-100 dark:bg-[var(--bg-secondary)] p-2 rounded-lg mr-3">
                    <FiAward className="text-amber-600 dark:text-amber-400" size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-amber-800 dark:text-[var(--text-default)]">
                      Tukar Poin
                    </div>
                    <div className="text-sm text-amber-600 dark:text-[var(--text-muted)]">
                      Maks: {selectedCustomer.loyalty_points} poin
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    value={pointsToRedeem} 
                    onChange={onPointsRedeemChange}
                    className="w-20 p-2 border border-amber-300 dark:border-amber-600 rounded-lg text-right bg-white dark:bg-[var(--bg-default)] text-amber-800 dark:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="0"
                    max={selectedCustomer.loyalty_points}
                  />
                </div>
              </div>
              {pointsToRedeem > 0 && (
                <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-700/50 text-right">
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    Diskon: - Rp {pointsDiscount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-[var(--border-default)]">
            <span className="text-lg font-bold text-gray-800 dark:text-[var(--text-default)]">Total</span>
            <span className="text-xl font-bold text-blue-600 dark:text-[var(--primary-color)]">
              Rp {finalTotal.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              onClick={onHoldCart} 
              disabled={cartItems.length === 0}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              <FiPause size={18} />
              <span>Tahan (F7)</span>
            </button>
            <button 
              onClick={onOpenPayment} 
              disabled={cartItems.length === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 dark:bg-[var(--primary-color)] dark:hover:bg-[var(--primary-color-hover)] text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              <span className="font-bold text-base -mt-0.5">Rp</span>
              <span>Bayar (F8)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default POSCart;