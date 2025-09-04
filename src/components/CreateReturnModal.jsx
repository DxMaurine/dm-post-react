import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { transactionAPI, salesReturnAPI } from '../api'; // Import API
import React from 'react';

const CreateReturnModal = ({ isOpen, onClose, setSnackbar, onReturnCreated }) => {
  const [transactionId, setTransactionId] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTransactionId('');
      setTransaction(null);
      setSelectedItems({});
      setNotes('');
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!transactionId) return;
    setLoading(true);
    setTransaction(null);
    setSelectedItems({});

    try {
      const response = await transactionAPI.getById(transactionId); // Pakai API module
      setTransaction(response.data);
    } catch  {
      setSnackbar({ open: true, message:'data tidak ditemukan', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (productId, newQty, maxQty) => {
    const qty = Math.max(0, Math.min(parseInt(newQty, 10) || 0, maxQty));
    setSelectedItems(prev => ({
      ...prev,
      [productId]: qty,
    }));
  };

  const handleSubmitReturn = async () => {
    const itemsToReturn = Object.entries(selectedItems)
      .map(([product_id, qty]) => ({ product_id: parseInt(product_id, 10), qty }))
      .filter(item => item.qty > 0);

    if (itemsToReturn.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one item to return.', severity: 'warning' });
      return;
    }

    setLoading(true);

    try {
      await salesReturnAPI.create({ // Pakai API module
        transaction_id: transaction.id,
        items: itemsToReturn,
        notes,
      });

      setSnackbar({ open: true, message: 'Return created successfully!', severity: 'success' });
      onReturnCreated();
      onClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-[var(--border-default)]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">Create New Sales Return</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-800 dark:hover:text-[var(--text-default)]">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {/* Search Section */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)]"
              placeholder="Enter Transaction ID..."
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 dark:bg-[var(--primary-color)] dark:hover:bg-[var(--primary-color-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={loading || !transactionId}
            >
              {loading && !transaction ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              <span>Search</span>
            </button>
          </div>

          {/* Loading and Error Display */}
          {loading && <div className="text-center p-4 dark:text-[var(--text-default)]">Loading transaction...</div>}

          {/* Transaction Details */}
          {transaction && (
            <div className="mt-6 border-t dark:border-[var(--border-default)] pt-6">
              <h3 className="text-lg font-semibold mb-2 dark:text-[var(--text-default)]">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-lg font-semibold text-gray-800 dark:text-green-400 mb-4">
                <p><strong>ID:</strong> {transaction.transaction_code || transaction.id}</p>
                <p><strong>Date:</strong> {new Date(transaction.tanggal).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> {transaction.customer}</p>
                <p><strong>Total:</strong> Rp {transaction.total.toLocaleString('id-ID')}</p>
              </div>

              <h4 className="font-semibold text-gray-800 dark:text-[var(--text-default)] mb-2">Items to Return</h4>
              <div className="space-y-2">
                {transaction.items.map(item => (
                  <div key={item.product_id} className="flex items-center justify-between bg-gray-50 dark:bg-[var(--bg-default)] p-3 rounded-lg">
                    <div className="flex-grow">
                      <p className="font-semibold dark:text-yellow-400">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Purchased: {item.qty} @ Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        max={item.qty}
                        value={selectedItems[item.product_id] || ''}
                        onChange={(e) => handleQtyChange(item.product_id, e.target.value, item.qty)}
                        className="w-full border border-gray-300 dark:border-[var(--border-default)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)] rounded-md px-2 py-1 text-center"
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Notes (Optional)</label>
                <textarea
                  id="notes"
                  rows="2"
                  className="w-full border border-gray-300 dark:border-[var(--border-default)] dark:bg-[var(--bg-default)] dark:text-[var(--text-default)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for return..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {transaction && (
          <div className="flex justify-end p-4 border-t dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-default)]">
            <button
              onClick={onClose}
              className="bg-gray-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] hover:bg-gray-300 dark:hover:bg-[var(--border-default)] text-gray-800 px-4 py-2 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReturn}
              className="bg-green-600 dark:bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:bg-green-300"
              disabled={loading}
            >
              {loading && <FaSpinner className="animate-spin" />}
              <span>Submit Return</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReturnModal;