import { FiMonitor } from 'react-icons/fi';
import RunningText from './RunningText';
import React from 'react';
const POSHeader = ({ settings, isFullScreen, onFullscreenToggle, onOpenCustomerDisplay }) => {
  return (
    <header className="w-full sticky top-0 z-10 bg-white dark:bg-[var(--bg-default)] shadow p-3 text-center flex justify-between items-center rounded-xl ">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-700 mb-0.5">{settings.storeName}</h1>
        <p className="font-normal text-left text-gray-500 dark:text-[var(--text-muted)] text-sm">{settings.storeTagline}</p>
      </div>
      <div className="flex-grow min-w-0 mx-4">
        <RunningText 
          text={settings.runningText} 
          bgColor={settings.runningTextBgColor} 
          textColor={settings.runningTextTextColor} 
        />
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenCustomerDisplay}
          className="flex-shrink-0 p-2 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
          title="Buka Tampilan Pelanggan (Dual Monitor)"
        >
          <FiMonitor size={20} />
        </button>
        <button 
          onClick={onFullscreenToggle} 
          className="flex-shrink-0 p-2 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200" 
          title={isFullScreen ? 'Keluar Layar Penuh (ESC)' : 'Aktifkan Layar Penuh'}
        >
          {isFullScreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 4l-5-5" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default POSHeader;