import React from 'react';

const ShortcutGuide = () => (
    <div className="w-full bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 shadow-lg border-t border-gray-700 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-sm font-medium text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                <span>KEYBOARD SHORTCUTS</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
                <div className="flex items-center gap-1.5">
                    <kbd className="font-mono bg-gray-700 px-2.5 py-1 rounded-md text-sm font-bold border-b-2 border-gray-600">F1</kbd>
                    <span className="text-sm">Panduan</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="font-mono bg-gray-700 px-2.5 py-1 rounded-md text-sm font-bold border-b-2 border-gray-600">F2</kbd>
                    <span className="text-sm">Cari</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                    <kbd className="font-mono bg-gray-700 px-2.5 py-1 rounded-md text-sm font-bold border-b-2 border-gray-600">F4</kbd>
                    <span className="text-sm">Scan</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="font-mono bg-gray-700 px-2.5 py-1 rounded-md text-sm font-bold border-b-2 border-gray-600">F7</kbd>
                    <span className="text-sm">Tahan</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="font-mono bg-gray-700 px-2.5 py-1 rounded-md text-sm font-bold border-b-2 border-gray-600">F8</kbd>
                    <span className="text-sm">Bayar</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                    <kbd className="font-mono bg-gray-700 px-2.5 py-1 rounded-md text-sm font-bold border-b-2 border-gray-600">F9</kbd>
                    <span className="text-sm">Refresh</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="font-mono bg-gray-700 px-2.5 py-1 rounded-md text-sm font-bold border-b-2 border-gray-600">ESC</kbd>
                    <span className="text-sm">Tutup</span>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-black-400">
                <span>Press</span>
                <kbd className="font-mono bg-yellow-500 px-2 py-0.5 rounded">F1</kbd>
                <span>to toggle</span>
            </div>
        </div>
    </div>
);

export default ShortcutGuide;