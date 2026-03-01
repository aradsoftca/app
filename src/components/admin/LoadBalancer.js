import React, { useState, useEffect } from 'react';
import { FaSync, FaBalanceScale, FaServer } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const LoadBalancer = () => {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWeight, setEditingWeight] = useState(null);
  const [weightValue, setWeightValue] = useState('');

  useEffect(() => {
    loadDistribution();
    const interval = setInterval(loadDistribution, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDistribution = async () => {
    try {
      setLoading(true);
      const res = await apiService.getLoadDistribution();
      setDistribution(res.data?.distribution || []);
    } catch (err) {
      console.error('Failed to load distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWeight = async (serverId) => {
    try {
      await apiService.setServerWeight(serverId, parseFloat(weightValue));
      setEditingWeight(null);
      loadDistribution();
    } catch (err) {
      console.error('Failed to update weight:', err);
    }
  };

  if (loading && distribution.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading load data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaBalanceScale className="mr-3 text-indigo-400" />
            Load Balancer
          </h2>
          <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadDistribution}>
            Refresh
          </Button>
        </div>

        {distribution.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No load distribution data</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600 text-gray-400">
                  <th className="text-left py-3 px-2">Server</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Connections</th>
                  <th className="text-left py-3 px-2">Load %</th>
                  <th className="text-left py-3 px-2">Weight</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {distribution.map((s) => {
                  const loadPct = s.capacityPercent || 0;
                  return (
                    <tr key={s.id || s.server_id} className="border-b border-gray-700 hover:bg-white/5">
                      <td className="py-3 px-2 text-white flex items-center gap-2">
                        <FaServer className="text-gray-400" />
                        {s.name || s.location || s.id}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          s.healthStatus === 'healthy' ? 'bg-green-500/20 text-green-300' :
                          s.healthStatus === 'degraded' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {s.healthStatus || 'unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-300">
                        {s.activeConnections || 0} / {s.capacity || '∞'}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                loadPct > 80 ? 'bg-red-500' : loadPct > 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(loadPct, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-300 text-xs">{Math.round(loadPct)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {editingWeight === (s.id || s.server_id) ? (
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={weightValue}
                              onChange={(e) => setWeightValue(e.target.value)}
                              className="w-16 px-2 py-1 rounded bg-gray-600 text-white text-xs border border-gray-500"
                              step="0.1"
                              min="0"
                              max="10"
                            />
                            <button onClick={() => handleSaveWeight(s.id || s.server_id)}
                              className="text-xs text-green-400 hover:text-green-300">Save</button>
                            <button onClick={() => setEditingWeight(null)}
                              className="text-xs text-gray-400 hover:text-gray-300">✕</button>
                          </div>
                        ) : (
                          <span className="text-gray-300">{(s.routingWeight ?? 1.0).toFixed(1)}</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => {
                            setEditingWeight(s.id || s.server_id);
                            setWeightValue(String(s.routingWeight ?? 1.0));
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Edit Weight
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoadBalancer;
