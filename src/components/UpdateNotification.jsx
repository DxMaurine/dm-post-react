import { useState, useEffect, useMemo } from 'react';
import { FiInfo, FiDownload, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    const handleUpdateStatus = (statusPayload) => {
      console.log('Update Status:', statusPayload);
      setUpdateInfo(statusPayload);

      // Show SweetAlert2 for dev mode and not-available status
      if (statusPayload.status === 'dev-mode') {
        Swal.fire({
          icon: 'info',
          title: 'Mode Development',
          text: 'Aplikasi dalam mode development. Fitur update tidak tersedia.',
          confirmButtonText: 'Mengerti',
          customClass: {
            popup: 'dark:bg-[var(--bg-default)] dark:text-white',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300',
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
          }
        });
      } else if (statusPayload.status === 'not-available') {
        Swal.fire({
          icon: 'success',
          title: 'Versi Terbaru',
          text: 'Aplikasi Anda sudah menggunakan versi terbaru.',
          confirmButtonText: 'OK',
          timer: 3000,
          customClass: {
            popup: 'dark:bg-[var(--bg-default)] dark:text-white',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300',
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
          }
        });
      }

      // Automatically hide some messages after a delay
      if (statusPayload.status === 'checking' || statusPayload.status === 'not-available' || statusPayload.status === 'dev-mode') {
        setTimeout(() => {
          setUpdateInfo(current => (current?.message === statusPayload.message ? null : current));
        }, 4000);
      }
    };

    let listener;
    if (window.electron) {
      listener = window.electron.onUpdateStatus(handleUpdateStatus);
    }

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, []);

  const canDownload = useMemo(() => updateInfo?.status === 'available', [updateInfo]);
  const canInstall = useMemo(() => updateInfo?.status === 'downloaded', [updateInfo]);
  const isDownloading = useMemo(() => updateInfo?.status === 'downloading', [updateInfo]);

  if (!updateInfo) {
    return null;
  }

  const getIcon = () => {
    switch (updateInfo.status) {
      case 'checking':
        return <FiInfo className="animate-pulse" />;
      case 'downloading':
        return <FiDownload className="animate-bounce" />;
      case 'available':
      case 'downloaded':
        return <FiCheckCircle />;
      case 'error':
      case 'cancelled':
        return <FiXCircle />;
      default:
        return <FiInfo />;
    }
  };

  const getBgColor = () => {
     switch (updateInfo.status) {
      case 'error':
      case 'cancelled':
        return 'bg-red-500';
      case 'available':
      case 'downloaded':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  }

  const onCheck = async () => {
    try {
      await window.electron?.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };
  const onDownload = async () => {
    try {
      await window.electron?.downloadUpdate();
    } catch (error) {
      console.error('Failed to download update:', error);
    }
  };
  const onInstall = async () => {
    try {
      await window.electron?.installUpdate();
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  };

  const renderActions = () => (
    <div className="ml-4 flex items-center gap-2">
      <button
        onClick={onCheck}
        disabled={updateInfo?.message === 'Update manager is not available.'}
        className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 flex items-center gap-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Check for updates"
      >
        <FiRefreshCw size={14} /> Cek
      </button>
      {canDownload && (
        <button
          onClick={onDownload}
          className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 flex items-center gap-1"
          title="Download update"
        >
          <FiDownload size={14} /> Download
        </button>
      )}
      {isDownloading && (
        <span className="text-xs opacity-90">
          {typeof updateInfo.percent === 'number' ? `${updateInfo.percent.toFixed(0)}%` : ''}
        </span>
      )}
      {canInstall && (
        <button
          onClick={onInstall}
          className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 flex items-center gap-1"
          title="Restart & Install"
        >
          <FiCheckCircle size={14} /> Instal
        </button>
      )}
      <button onClick={() => setUpdateInfo(null)} className="p-1 rounded-full hover:bg-white/20" title="Tutup">
        <FiXCircle size={18} />
      </button>
    </div>
  );

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${getBgColor()} transition-all duration-300 max-w-sm`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 text-2xl mr-3">
          {getIcon()}
        </div>
        <div>
          <p className="font-bold text-sm capitalize">{updateInfo.status.replace('-', ' ')}</p>
          <p className="text-xs">{updateInfo.message}</p>
        </div>
        {renderActions()}
      </div>
    </div>
  );
};

export default UpdateNotification;