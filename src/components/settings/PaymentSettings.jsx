// PaymentSettings.jsx
import React from 'react';
const PaymentSettings = ({ formState, handleChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">Pengaturan Pembayaran</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="cashPaymentEnabled"
              id="cashPaymentEnabled"
              checked={formState.cashPaymentEnabled || true}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600 dark:text-[var(--primary-color)] rounded focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            />
            <label htmlFor="cashPaymentEnabled" className="ml-2 block text-gray-700 dark:text-[var(--text-default)] font-semibold">
              Aktifkan Pembayaran Tunai
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="cardPaymentEnabled"
              id="cardPaymentEnabled"
              checked={formState.cardPaymentEnabled || false}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600 dark:text-[var(--primary-color)] rounded focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            />
            <label htmlFor="cardPaymentEnabled" className="ml-2 block text-gray-700 dark:text-[var(--text-default)] font-semibold">
              Aktifkan Pembayaran Kartu
            </label>
          </div>
          
          {formState.cardPaymentEnabled && (
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="cardProcessor">
                  Payment Processor
                </label>
                <select
                  name="cardProcessor"
                  id="cardProcessor"
                  value={formState.cardProcessor || ''}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                >
                  <option value="">Pilih processor</option>
                  <option value="midtrans">Midtrans</option>
                  <option value="doku">Doku</option>
                  <option value="xendit">Xendit</option>
                  <option value="manual">Manual Entry</option>
                </select>
              </div>
              
              {formState.cardProcessor && formState.cardProcessor !== 'manual' && (
                <>
                  <div>
                    <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="merchantId">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      name="merchantId"
                      id="merchantId"
                      value={formState.merchantId || ''}
                      onChange={handleChange}
                      className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="apiKey">
                      API Key
                    </label>
                    <input
                      type="password"
                      name="apiKey"
                      id="apiKey"
                      value={formState.apiKey || ''}
                      onChange={handleChange}
                      className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="qrisEnabled"
              id="qrisEnabled"
              checked={formState.qrisEnabled || false}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600 dark:text-[var(--primary-color)] rounded focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
            />
            <label htmlFor="qrisEnabled" className="ml-2 block text-gray-700 dark:text-[var(--text-default)] font-semibold">
              Aktifkan QRIS
            </label>
          </div>
          
          {formState.qrisEnabled && (
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="qrisMerchantName">
                  Nama Merchant QRIS
                </label>
                <input
                  type="text"
                  name="qrisMerchantName"
                  id="qrisMerchantName"
                  value={formState.qrisMerchantName || ''}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="qrisId">
                  QRIS ID
                </label>
                <input
                  type="text"
                  name="qrisId"
                  id="qrisId"
                  value={formState.qrisId || ''}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 dark:border-[var(--border-default)] rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--primary-color)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;