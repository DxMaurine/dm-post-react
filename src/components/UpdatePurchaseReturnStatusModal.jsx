import { useState, useEffect } from 'react';
import React from 'react';

const UpdatePurchaseReturnStatusModal = ({ isOpen, onClose, purchaseReturn, onSave }) => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (purchaseReturn) {
      setStatus(purchaseReturn.status);
    }
  }, [purchaseReturn]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(purchaseReturn.id, status);
  };

  return (
    <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-[var(--bg-default)]  p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Update Status Retur</h2>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-[var(--bg-default)]  dark:text-white dark:border-gray-600"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-500 dark:text-white text-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-red-600 hover:text-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-gray-800 dark:text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePurchaseReturnStatusModal;
