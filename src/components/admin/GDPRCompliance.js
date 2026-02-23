import React, { useState, useEffect } from 'react';
import { FaSync, FaLock, FaUserShield, FaDownload } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const GDPRCompliance = () => {
  const [exportRequests, setExportRequests] = useState([]);
  const [consentStats, setConsentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('exports');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exportsRes, consentRes] = await Promise.all([
        apiService.getGdprExportRequests().catch(() => ({ data: { requests: [] } })),
        apiService.getConsentAnalytics().catch(() => ({ data: {} })),
      ]);
      setExportRequests(exportsRes.data?.requests || exportsRes.data || []);
      setConsentStats(consentRes.data);
    } catch (err) {
      console.error('Failed to load GDPR data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading GDPR data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaLock className="mr-3 text-emerald-400" />
            GDPR & Privacy Compliance
          </h2>
          <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadData}>
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'exports', label: 'Data Export Requests', icon: FaDownload },
            { id: 'consent', label: 'Consent Analytics', icon: FaUserShield },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Data Export Requests */}
        {tab === 'exports' && (
          <div>
            {Array.isArray(exportRequests) && exportRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600 text-gray-400">
                      <th className="text-left py-3 px-2">User</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Requested</th>
                      <th className="text-left py-3 px-2">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportRequests.map((r, i) => (
                      <tr key={r.id || i} className="border-b border-gray-700">
                        <td className="py-3 px-2 text-white">{r.email || r.user_id || '—'}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            r.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {r.status || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400 text-xs">
                          {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-2 text-gray-400 text-xs">
                          {r.completed_at ? new Date(r.completed_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No data export requests</p>
            )}
          </div>
        )}

        {/* Consent Analytics */}
        {tab === 'consent' && consentStats && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-5 bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/20">
              <p className="text-green-200 text-sm mb-1">Consented Users</p>
              <p className="text-white text-3xl font-bold">{consentStats.consented || consentStats.total_consented || 0}</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/20">
              <p className="text-red-200 text-sm mb-1">Declined / Withdrawn</p>
              <p className="text-white text-3xl font-bold">{consentStats.declined || consentStats.total_declined || 0}</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/20">
              <p className="text-blue-200 text-sm mb-1">Pending</p>
              <p className="text-white text-3xl font-bold">{consentStats.pending || consentStats.total_pending || 0}</p>
            </Card>
          </div>
        )}
        {tab === 'consent' && !consentStats && (
          <p className="text-gray-400 text-center py-8">No consent data available</p>
        )}
      </Card>
    </div>
  );
};

export default GDPRCompliance;
