import React, { useEffect, useState } from 'react';
import { LicenseStatusBadge } from '../activation';

const POSQuickProducts = ({ products, onAddToCart }) => {
  // eslint-disable-next-line no-unused-vars
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 pr-1 md:pr-4">
        <h3 className="text-lg font-semibold text-gray-600 dark:text-[var(--text-muted)]">Produk Cepat</h3>
        <div className="mr-3 md:mr-1 no-hover:text-gray-500 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-400">
          <LicenseStatusBadge />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 pl-1">
            {products.map((product) => {
              let bgColor, hoverColor, textColor, borderColor, darkBgColor, darkHoverColor, darkTextColor, darkBorderColor;
              
              switch(product.color) {
                case 'red':
                  bgColor = 'bg-red-100'; hoverColor = 'hover:bg-red-200'; textColor = 'text-red-700'; borderColor = 'border-red-300';
                  darkBgColor = 'dark:bg-red-900/30'; darkHoverColor = 'dark:hover:bg-red-900/50'; darkTextColor = 'dark:text-red-300'; darkBorderColor = 'dark:border-red-700';
                  break;
                case 'green':
                  bgColor = 'bg-green-100'; hoverColor = 'hover:bg-green-200'; textColor = 'text-green-700'; borderColor = 'border-green-300';
                  darkBgColor = 'dark:bg-green-900/30'; darkHoverColor = 'dark:hover:bg-green-900/50'; darkTextColor = 'dark:text-green-300'; darkBorderColor = 'dark:border-green-700';
                  break;
                case 'yellow':
                  bgColor = 'bg-yellow-100'; hoverColor = 'hover:bg-yellow-200'; textColor = 'text-yellow-700'; borderColor = 'border-yellow-300';
                  darkBgColor = 'dark:bg-yellow-900/30'; darkHoverColor = 'dark:hover:bg-yellow-900/50'; darkTextColor = 'dark:text-yellow-300'; darkBorderColor = 'dark:border-yellow-700';
                  break;
                default:
                  bgColor = 'bg-white'; hoverColor = 'hover:bg-blue-100'; textColor = 'text-blue-700'; borderColor = 'border-blue-300';
                  darkBgColor = 'dark:bg-slate-700'; darkHoverColor = 'dark:hover:bg-slate-600'; darkTextColor = 'dark:text-blue-300'; darkBorderColor = 'dark:border-blue-500';
              }

              return (
                <button key={product.id} onClick={() => onAddToCart(product)} className={`${bgColor} ${hoverColor} ${textColor} ${borderColor} ${darkBgColor} ${darkHoverColor} ${darkTextColor} ${darkBorderColor} font-semibold py-2 px-4 border rounded-lg shadow-sm transition-colors duration-200`}>
                  {product.name}
                </button>
              );
            })}
          </div>
        </div>
    );
};

export default POSQuickProducts;