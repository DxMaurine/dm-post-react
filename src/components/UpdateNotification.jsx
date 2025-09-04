import { useState, useEffect } from 'react';
import { FiInfo, FiDownload, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    const handleUpdateStatus = (statusPayload) => {
      console.log('Update Status:', statusPayload);
      setUpdateInfo(statusPayload);

      // Automatically hide some messages after a delay
      if (statusPayload.status === 'checking' || statusPayload.status === 'not-available') {
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
        <button onClick={() => setUpdateInfo(null)} className="ml-4 p-1 rounded-full hover:bg-white/20">
            <FiXCircle size={18} />
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;