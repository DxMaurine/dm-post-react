// src/components/BarcodeScannerModal.jsx
import { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import React from 'react';
const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [laserPosition, setLaserPosition] = useState(0);
  const [error, setError] = useState('');

  // Inisialisasi ZXing
  useEffect(() => {
    const hints = new Map();
    // Daftar format barcode yang umum digunakan untuk produk dan QRIS
    const formats = [
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.QR_CODE, // Tetap aktifkan untuk QRIS
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    codeReader.current = new BrowserMultiFormatReader(hints);
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  // Animasi laser
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setLaserPosition((prev) => (prev + 2) % 200);
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Mulai scan saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    const startScan = async () => {
      try {
        setError('');
        const devices = await codeReader.current.listVideoInputDevices();

        if (devices.length === 0) {
          setError('Tidak ada kamera ditemukan.');
          return;
        }

        const selectedDeviceId = devices[0].deviceId;

        await codeReader.current.decodeFromConstraints(
          {
            video: {
              deviceId: { exact: selectedDeviceId },
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          },
          videoRef.current,
          (result, err) => {
            if (result) {
              onScanSuccess(result.getText());
              onClose();
            } else if (err && !(err instanceof TypeError)) {
              // Scanning in progress...
            }
          }
        );
      } catch (err) {
        // Handle camera access errors
        if (err.name === 'NotAllowedError') {
          setError('Izin kamera ditolak. Cek pengaturan browser.');
        } else if (err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan.');
        } else if (err.name === 'NotReadableError') {
          setError('Kamera sedang dipakai aplikasi lain.');
        } else {
          setError(`Error: ${err.message}`);
        }
      }
    };

    startScan();

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
      {/* Header */}
      <div className="w-full max-w-md p-4 text-center border-b border-gray-600">
        <h3 className="text-lg font-semibold">Scan Barcode Produk</h3>
        <p className="text-sm text-gray-300">Arahkan ke kode batang</p>
      </div>

      {/* Area Kamera */}
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden mt-2">
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
          playsInline
        />

        {/* Laser Scanning */}
        <div
          className="absolute left-0 right-0 h-0.5 pointer-events-none"
          style={{
            top: `${laserPosition}px`,
            background: 'linear-gradient(90deg, transparent, yellow, transparent)',
            boxShadow: '0 0 10px 1px yellow',
            transition: 'none',
            zIndex: 10,
          }}
        />

        {/* Frame Scanner */}
        <div
          className="absolute inset-4 border-4 border-red-500 opacity-70 pointer-events-none rounded-lg"
          style={{ zIndex: 5 }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-600 rounded-lg text-center text-sm max-w-md">
          {error}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-center px-6 text-sm text-gray-300">
        Arahkan kamera ke barcode produk
      </div>

      {/* Tombol Tutup */}
      <button
        onClick={onClose}
        className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
      >
        Tutup
      </button>
    </div>
  );
};

export default BarcodeScannerModal;