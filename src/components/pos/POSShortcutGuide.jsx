import { useState, useImperativeHandle, forwardRef } from 'react';
import React from 'react';
const shortcuts = [
  { key: 'F1', label: 'Sembunyikan' },
  { key: 'F2', label: 'Cari' },
  { key: 'F4', label: 'Scan', hideOnMobile: true },
  { key: 'F7', label: 'Tahan' },
  { key: 'F8', label: 'Bayar' },
  { key: 'F9', label: 'Refresh', hideOnMobile: true },
  { key: 'ESC', label: 'Tutup' }
];

const POSShortcutGuide = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGuide = () => setIsOpen(!isOpen);

  useImperativeHandle(ref, () => ({
    toggle() {
      toggleGuide();
    }
  }));

  return (
    <>
      <style>{`
        .shortcut-item-vertical {
          transition: all 0.2s ease-in-out;
          opacity: 0;
          transform: translateY(15px);
        }
        .shortcut-item-vertical.open {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Shortcut Items Container */}
      <div className={`fixed bottom-20 right-5 z-40 flex flex-col-reverse items-end space-y-2 space-y-reverse w-48 ${isOpen ? 'visible' : 'invisible'}`}>
        {shortcuts.map((item, index) => (
          <div 
            key={item.key} 
            className={`shortcut-item-vertical ${isOpen ? 'open' : ''} w-full flex items-center justify-between group p-2 rounded-lg bg-white/70 dark:bg-[var(--bg-secondary)]/70 backdrop-blur-md border border-gray-200 dark:border-[var(--border-default)] ${item.hideOnMobile ? 'hidden md:flex' : 'flex'}`}
            style={{
              transitionDelay: isOpen ? `${(shortcuts.length - index) * 0.04}s` : '0s'
            }}
          >
            <span className="text-sm font-medium text-gray-800 dark:text-[var(--text-default)] group-hover:text-black dark:group-hover:text-white transition-colors duration-150">
              {item.label}
            </span>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-[var(--text-default)] bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300/50 dark:border-gray-600/50 shadow-sm">
              {item.key}
            </kbd>
          </div>
        ))}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleGuide}
        className={`fixed bottom-5 right-5 w-12 h-12 bg-blue-400 dark:bg-[var(--bg-default)] text-white rounded-full flex items-center justify-center shadow-sm z-50  hover:bg-blue-500 dark:hover:bg-[var(--primary-color-hover)] transition-all duration-300 transform ${isOpen ? 'rotate-180' : ''}`}
        aria-label="Toggle Shortcut Guide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
});

export default POSShortcutGuide;