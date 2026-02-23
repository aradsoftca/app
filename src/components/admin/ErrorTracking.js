import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaExclamationTriangle,
  FaBug,
  FaTimesCircle,
  FaCheckCircle,
  FaSearch,
  FaTrash,
  FaCode,
  FaClock,
} from 'react-icons/fa';
import { apiService } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const ErrorTracking = () => {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, critical, error, warning
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedError, setSelectedError] = useState(null);
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  useEffect(() => {
    loadErrors();
    const interval = setInterval(loadErrors, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadErrors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getErrors();
      setErrors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (errorId) => {
    try {
      await apiService.markErrorAsResolved(errorId);
      setErrors(errors.map(err =>
        err.id === errorId ? { ...err, resolved: true } : err
      ));
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
    }
  };

  const deleteError = async (errorId) => {
    const ok = await confirmDialog({ title: 'Delete Error', message: 'Are you sure you want to delete this error?', confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;

    try {
      await apiService.deleteError(errorId);
      setErrors(errors.filter(err => err.id !== errorId));
      if (selectedError?.id === errorId) {
        setSelectedError(null);
      }
    } catch (error) {
      console.error('Failed to delete error:', error);
    }
  };

  const clearAllResolved = async () => {
    const ok = await confirmDialog({ title: 'Clear Resolved Errors', message: 'Are you sure you want to clear all resolved errors?', confirmText: 'Clear All', variant: 'warning' });
    if (!ok) return;

    try {
      await apiService.clearResolvedErrors();
      setErrors(errors.filter(err => !err.resolved));
    } catch (error) {
      console.error('Failed to clear resolved errors:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500';
      case 'error':
        return 'text-orange-400 bg-orange-500';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500';
      default:
        return 'text-blue-400 bg-blue-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <FaTimesCircle />;
      case 'error':
        return <FaExclamationTriangle />;
      case 'warning':
        return <FaBug />;
      default:
        return <FaCheckCircle />;
    }
  };

  const filteredErrors = errors.filter(err => {
    const matchesFilter =
      filter === 'all' ||
      err.severity === filter;

    const matchesSearch =
      err.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.stack?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.endpoint?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unresolvedCount = errors.filter(err => !err.resolved).length;
  const criticalCount = errors.filter(err => err.severity === 'critical' && !err.resolved).length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-xl">Loading errors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Error Tracking</h2>
            <p className="text-gray-300">
              {unresolvedCount} unresolved error{unresolvedCount !== 1 ? 's' : ''}
              {criticalCount > 0 && (
                <span className="text-red-400 ml-2">
                  ({criticalCount} critical)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadErrors}>
              Refresh
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={clearAllResolved}
              disabled={errors.filter(e => e.resolved).length === 0}
            >
              Clear Resolved
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
            <div className="text-red-400 text-2xl font-bold">
              {errors.filter(e => e.severity === 'critical' && !e.resolved).length}
            </div>
            <div className="text-gray-300 text-sm">Critical</div>
          </div>
          <div className="bg-orange-500 bg-opacity-10 border border-orange-500 rounded-lg p-4">
            <div className="text-orange-400 text-2xl font-bold">
              {errors.filter(e => e.severity === 'error' && !e.resolved).length}
            </div>
            <div className="text-gray-300 text-sm">Errors</div>
          </div>
          <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4">
            <div className="text-yellow-400 text-2xl font-bold">
              {errors.filter(e => e.severity === 'warning' && !e.resolved).length}
            </div>
            <div className="text-gray-300 text-sm">Warnings</div>
          </div>
          <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4">
            <div className="text-green-400 text-2xl font-bold">
              {errors.filter(e => e.resolved).length}
            </div>
            <div className="text-gray-300 text-sm">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'error'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              Errors
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              Warnings
            </button>
          </div>
        </div>

        {/* Errors List */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Error List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredErrors.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FaCheckCircle className="text-6xl mx-auto mb-4 opacity-50" />
                <p>No errors found</p>
              </div>
            ) : (
              filteredErrors.map((error) => (
                <motion.div
                  key={error.id}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedError?.id === error.id
                      ? 'bg-blue-600 bg-opacity-30 border-2 border-blue-500'
                      : error.resolved
                      ? 'bg-white bg-opacity-5 hover:bg-opacity-10 opacity-60'
                      : `${getSeverityColor(error.severity)} bg-opacity-10 hover:bg-opacity-20 border border-current`
                  }`}
                  onClick={() => setSelectedError(error)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={getSeverityColor(error.severity)}>
                        {getSeverityIcon(error.severity)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(error.severity)} bg-opacity-20`}>
                        {error.severity.toUpperCase()}
                      </span>
                      {error.resolved && (
                        <span className="text-xs px-2 py-1 rounded bg-green-500 bg-opacity-20 text-green-400">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <FaClock />
                      {new Date(error.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm mb-2 line-clamp-2">
                    {error.message}
                  </p>
                  {error.endpoint && (
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <FaCode />
                      {error.endpoint}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(error.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>

          {/* Error Detail */}
          <div>
            {selectedError ? (
              <Card className="p-6 sticky top-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${getSeverityColor(selectedError.severity)}`}>
                      {getSeverityIcon(selectedError.severity)}
                    </span>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(selectedError.severity)} bg-opacity-20`}>
                        {selectedError.severity.toUpperCase()}
                      </span>
                      {selectedError.resolved && (
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-green-500 bg-opacity-20 text-green-400">
                          RESOLVED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!selectedError.resolved && (
                      <button
                        onClick={() => markAsResolved(selectedError.id)}
                        className="p-2 bg-green-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                        title="Mark as resolved"
                      >
                        <FaCheckCircle className="text-green-400" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteError(selectedError.id)}
                      className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                      title="Delete"
                    >
                      <FaTrash className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-400 text-sm">
                    Occurred: {new Date(selectedError.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2">Error Message:</h4>
                  <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
                    <p className="text-red-200 font-mono text-sm">
                      {selectedError.message}
                    </p>
                  </div>
                </div>

                {selectedError.endpoint && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Endpoint:</h4>
                    <div className="bg-white bg-opacity-5 rounded-lg p-3">
                      <p className="text-gray-300 font-mono text-sm">
                        {selectedError.endpoint}
                      </p>
                    </div>
                  </div>
                )}

                {selectedError.user_id && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">User ID:</h4>
                    <p className="text-gray-300">{selectedError.user_id}</p>
                  </div>
                )}

                {selectedError.stack && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Stack Trace:</h4>
                    <div className="bg-black bg-opacity-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap">
                        {selectedError.stack}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedError.metadata && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Additional Info:</h4>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4">
                      <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap">
                        {JSON.stringify(selectedError.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {!selectedError.resolved && (
                  <Button
                    variant="success"
                    fullWidth
                    icon={<FaCheckCircle />}
                    onClick={() => markAsResolved(selectedError.id)}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <FaBug className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select an error to view details</p>
              </Card>
            )}
          </div>
        </div>
      </Card>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default ErrorTracking;
