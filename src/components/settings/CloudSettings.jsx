// CloudSettings.jsx
import React from 'react';
const CloudSettings = ({ formState, handleChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">Pengaturan Cloud Sync</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="cloudSyncEnabled"
              id="cloudSyncEnabled"
              checked={formState.cloudSyncEnabled || false}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600 dark:text-primary-color rounded focus:ring-blue-500 dark:focus:ring-primary-color"
            />
            <label htmlFor="cloudSyncEnabled" className="ml-2 block text-gray-700 dark:text-[var(--text-default)] font-semibold">
              Aktifkan Cloud Sync
            </label>
          </div>
          
          {formState.cloudSyncEnabled && (
            <div className="ml-6 space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="cloudService">
                  Layanan Cloud
                </label>
                <select
                  name="cloudService"
                  id="cloudService"
                  value={formState.cloudService || ''}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 dark:border-border-default rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-color bg-white dark:bg-bg-secondary"
                >
                  <option value="">Pilih layanan cloud</option>
                  <option value="firebase">Firebase</option>
                  <option value="aws">AWS</option>
                  <option value="google_drive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="custom">Custom Server</option>
                </select>
              </div>
              
              {formState.cloudService && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="cloudUrl">
                      {formState.cloudService === 'custom' ? 'Server URL' : 'API Endpoint'}
                    </label>
                    <input
                      type="text"
                      name="cloudUrl"
                      id="cloudUrl"
                      value={formState.cloudUrl || ''}
                      onChange={handleChange}
                      className="shadow-sm appearance-none border border-gray-300 dark:border-border-default rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-bg-secondary dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-color"
                      placeholder={formState.cloudService === 'custom' ? 'https://your-server.com/api' : ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="cloudApiKey">
                      API Key
                    </label>
                    <input
                      type="password"
                      name="cloudApiKey"
                      id="cloudApiKey"
                      value={formState.cloudApiKey || ''}
                      onChange={handleChange}
                      className="shadow-sm appearance-none border border-gray-300 dark:border-border-default rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-bg-secondary dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-color"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {formState.cloudSyncEnabled && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2" htmlFor="syncInterval">
                  Interval Sync (menit)
                </label>
                <input
                  type="number"
                  name="syncInterval"
                  id="syncInterval"
                  min="1"
                  max="1440"
                  value={formState.syncInterval || 30}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 dark:border-border-default rounded-lg w-full py-2 px-3 text-gray-700 dark:bg-bg-secondary dark:text-[var(--text-default)] leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-color"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-[var(--text-default)] font-semibold mb-2">
                  Opsi Sync
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="syncOnStartup"
                      id="syncOnStartup"
                      checked={formState.syncOnStartup || true}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-blue-600 dark:text-primary-color rounded focus:ring-blue-500 dark:focus:ring-primary-color"
                    />
                    <span className="ml-2 text-gray-700 dark:text-[var(--text-default)]">Sync otomatis saat buka aplikasi</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="syncOnTransaction"
                      id="syncOnTransaction"
                      checked={formState.syncOnTransaction || true}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-blue-600 dark:text-primary-color rounded focus:ring-blue-500 dark:focus:ring-primary-color"
                    />
                    <span className="ml-2 text-gray-70 dark:text-[var(--text-default)]">Sync otomatis setelah transaksi</span>
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-primary-bg-dark dark:hover:bg-primary-color-hover text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Sync Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudSettings;