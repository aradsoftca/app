import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-500',
          icon: <FaCheckCircle className="text-white text-xl" />,
          progressColor: 'bg-green-700'
        };
      case 'error':
        return {
          bgColor: 'bg-red-500',
          icon: <FaExclamationCircle className="text-white text-xl" />,
          progressColor: 'bg-red-700'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-500',
          icon: <FaExclamationTriangle className="text-white text-xl" />,
          progressColor: 'bg-yellow-700'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-500',
          icon: <FaInfoCircle className="text-white text-xl" />,
          progressColor: 'bg-blue-700'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const config = getToastConfig();

  return (
    <motion.div
      className={`fixed ${getPositionClasses()} z-50 max-w-md`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`${config.bgColor} text-white rounded-lg shadow-2xl overflow-hidden`}>
        <div className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed break-words">
              {message}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>
        {duration && (
          <motion.div
            className={`h-1 ${config.progressColor}`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Toast;
