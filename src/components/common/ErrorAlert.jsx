import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ErrorAlert = ({ 
  message, 
  type = 'error', 
  onClose, 
  dismissible = true,
  className = '' 
}) => {
  if (!message) return null;

  const getAlertConfig = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-red-500 bg-opacity-20',
          borderColor: 'border-red-500',
          textColor: 'text-red-200',
          icon: <FaExclamationCircle className="text-red-400" />
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-500 bg-opacity-20',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-200',
          icon: <FaExclamationTriangle className="text-yellow-400" />
        };
      case 'info':
        return {
          bgColor: 'bg-blue-500 bg-opacity-20',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-200',
          icon: <FaInfoCircle className="text-blue-400" />
        };
      default:
        return {
          bgColor: 'bg-red-500 bg-opacity-20',
          borderColor: 'border-red-500',
          textColor: 'text-red-200',
          icon: <FaExclamationCircle className="text-red-400" />
        };
    }
  };

  const config = getAlertConfig();

  return (
    <motion.div
      className={`mb-6 p-4 ${config.bgColor} border ${config.borderColor} rounded-lg ${config.textColor} ${className}`}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorAlert;
