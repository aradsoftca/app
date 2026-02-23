import React, { useState, useEffect } from 'react';
import { FaSync, FaTachometerAlt } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const QoSManagement = () => {
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await apiService.getQoSConfig();
      const data = res.data?.config || res.data || [];
      setConfig(Array.isArray(data) ? data : Object.entries(data).map(([tier, cfg]) => ({ tier, ...cfg })));
    } catch (err) {
      console.error('Failed to load QoS config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tier) => {
    const cfg = config.find(c => c.tier === tier) || {};
    setEditForm({
      max_download_mbps: cfg.max_download_mbps || '',
      max_upload_mbps: cfg.max_upload_mbps || '',
      max_daily_gb: cfg.max_daily_gb || '',
      max_monthly_gb: cfg.max_monthly_gb || '',
      priority: cfg.priority || '',
    });
    setEditing(tier);
  };

  const handleSave = async () => {
    try {
      await apiService.updateQoSConfig(editing, editForm);
      setEditing(null);
      setMessage({ type: 'success', text: `QoS updated for ${editing} tier` });
      loadConfig();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update QoS config' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading QoS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaTachometerAlt className="mr-3 text-cyan-400" />
            QoS Management
          </h2>
          <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadConfig}>
            Refresh
          </Button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {['free', 'paid', 'admin'].map((tier) => {
            const cfg = config.find(c => c.tier === tier) || {};
            const isEditing = editing === tier;
            return (
              <Card key={tier} className="p-5 bg-gradient-to-br from-gray-700/50 to-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white capitalize">{tier} Tier</h3>
                  {!isEditing && (
                    <button onClick={() => handleEdit(tier)}
                      className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    {[
                      { key: 'max_download_mbps', label: 'Max Download (Mbps)' },
                      { key: 'max_upload_mbps', label: 'Max Upload (Mbps)' },
                      { key: 'max_daily_gb', label: 'Max Daily (GB)' },
                      { key: 'max_monthly_gb', label: 'Max Monthly (GB)' },
                      { key: 'priority', label: 'Priority (1-10)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-gray-400 text-xs">{label}</label>
                        <input
                          type="number"
                          value={editForm[key]}
                          onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSave}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm">Save</button>
                      <button onClick={() => setEditing(null)}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Download</span>
                      <span className="text-white">{cfg.max_download_mbps || '∞'} Mbps</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Upload</span>
                      <span className="text-white">{cfg.max_upload_mbps || '∞'} Mbps</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Daily Limit</span>
                      <span className="text-white">{cfg.max_daily_gb || '∞'} GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Monthly Limit</span>
                      <span className="text-white">{cfg.max_monthly_gb || '∞'} GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Priority</span>
                      <span className="text-white">{cfg.priority || '—'}</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default QoSManagement;
