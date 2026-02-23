import { useState, useEffect, useCallback } from 'react';
import { apiService, getAccessToken } from '../services/api';

export const useVPN = () => {
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState('shadowsocks');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch servers on mount — only if user is authenticated
  useEffect(() => {
    // SEC-TOKEN-01: Check in-memory access token instead of localStorage.
    const token = getAccessToken();
    if (token) {
      fetchServers();
      checkConnectionStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchServers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getServers();
      setServers(response.data);
      
      if (response.data.length > 0 && !selectedServer) {
        setSelectedServer(response.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch servers');
      console.error('Fetch servers error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedServer]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await apiService.getStatus();
      if (response.data.connected) {
        setConnectionStatus('connected');
        setConnectionInfo(response.data.connection);
      } else {
        setConnectionStatus('disconnected');
        setConnectionInfo(null);
      }
    } catch (err) {
      console.error('Check status error:', err);
      setConnectionStatus('disconnected');
    }
  }, []);

  const connect = useCallback(async (serverId, protocol) => {
    try {
      setConnectionStatus('connecting');
      setError(null);

      const response = await apiService.connect(
        serverId || selectedServer?.id,
        protocol || selectedProtocol
      );

      // Simulate connection delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      setConnectionStatus('connected');
      setConnectionInfo(response.data);

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Connection failed';
      setError(errorMessage);
      setConnectionStatus('disconnected');
      return { success: false, error: errorMessage };
    }
  }, [selectedServer, selectedProtocol]);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      await apiService.disconnect();
      
      setConnectionStatus('disconnected');
      setConnectionInfo(null);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Disconnect failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const selectServer = useCallback((server) => {
    if (connectionStatus !== 'connected') {
      setSelectedServer(server);
    }
  }, [connectionStatus]);

  const selectProtocol = useCallback((protocol) => {
    if (connectionStatus !== 'connected') {
      setSelectedProtocol(protocol);
    }
  }, [connectionStatus]);

  return {
    servers,
    selectedServer,
    selectedProtocol,
    connectionStatus,
    connectionInfo,
    loading,
    error,
    connect,
    disconnect,
    selectServer,
    selectProtocol,
    refreshServers: fetchServers,
    checkStatus: checkConnectionStatus,
  };
};
