import { FiBell, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';

const NotificationPanel = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-gray-200 dark:bg-[var(--bg-secondary)] dark:hover:bg-[var(--primary-color)]">
        <FiBell className="text-gray-600 dark:text-[var(--text-default)]" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1 py-0.5">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-[var(--bg-secondary)] dark:border-slate-600 rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-gray-800 dark:text-[var(--text-muted)]">Notifikasi</h3>
            <button onClick={() => setIsOpen(false)} className=" bg-red-500 dark:text-[var(--text-muted)] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[var(--primary-color-hover)]">
              <FiX className="text-gray-600 dark:text-white h-4 w-4" />
            </button>
          </div>
          <div className="p-2 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.path)}
                  className="p-3 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-lg cursor-pointer"
                >
                  <p className="font-semibold text-sm text-gray-800 dark:text-emerald-500">{notif.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{notif.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">{new Date(notif.date).toLocaleString('id-ID')}</p>
                </div>
              ))
            ) : (
              <div className="text-center p-8">
                <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Tidak ada notifikasi baru.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;