import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FaTimesCircle className="text-red-500 text-4xl" />;
      case 'success':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'warning':
      default:
        return <FaExclamationTriangle className="text-yellow-500 text-4xl" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'warning':
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-lg">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 ${getButtonColor()} text-white rounded-lg transition font-semibold disabled:opacity-50`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
