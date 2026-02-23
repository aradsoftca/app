import React, { useState, useEffect } from 'react';
import { FaGlobe, FaSync, FaChartBar, FaUsers, FaServer } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const GeoAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getGeoAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load geo-analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading analytics...</div>;
  if (!data) return <div className="text-center py-8 text-gray-400">No data available</div>;

  return (
    <div className="space-y-6">
      {/* Country Distribution */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaGlobe className="mr-3 text-blue-400" />
            Geo-Analytics
          </h2>
          <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadData}>Refresh</Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Countries */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaUsers className="mr-2 text-green-400" /> Active Connections by Country
            </h3>
            {data.countryDistribution?.length > 0 ? (
              <div className="space-y-2">
                {data.countryDistribution.map((item, i) => {
                  const maxConns = Math.max(...data.countryDistribution.map(d => d.connection_count));
                  const pct = maxConns > 0 ? (item.connection_count / maxConns) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-white w-24 text-sm truncate">{item.country}</span>
                      <div className="flex-1 bg-white bg-opacity-10 rounded-full h-5 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 text-sm w-16 text-right">{item.user_count} users</span>
                      <span className="text-gray-500 text-xs w-20 text-right">{item.connection_count} conns</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-500">No active connections</p>}
          </div>

          {/* Protocol Usage */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaChartBar className="mr-2 text-purple-400" /> Protocol Usage
            </h3>
            {data.protocolUsage?.length > 0 ? (
              <div className="space-y-3">
                {data.protocolUsage.map((item, i) => {
                  const total = data.protocolUsage.reduce((s, p) => s + parseInt(p.count), 0);
                  const pct = total > 0 ? (parseInt(item.count) / total) * 100 : 0;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-cyan-500'];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-white w-28 text-sm capitalize truncate">{item.protocol || 'Unknown'}</span>
                      <div className="flex-1 bg-white bg-opacity-10 rounded-full h-5 overflow-hidden">
                        <div className={`${colors[i % colors.length]} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 text-sm w-20 text-right">{item.count} ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-500">No protocol data</p>}
          </div>
        </div>
      </Card>

      {/* Server Load */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaServer className="mr-2 text-orange-400" /> Server Load Distribution
        </h3>
        {data.serverLoad?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.serverLoad.map((server, i) => {
              const load = parseFloat(server.load_percent) || 0;
              const color = load > 90 ? 'bg-red-500' : load > 70 ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <div key={i} className="bg-white bg-opacity-5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium truncate">{server.name}</span>
                    <span className="text-gray-400 text-xs">{server.country}</span>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-full h-3 overflow-hidden mb-1">
                    <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${Math.min(load, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{server.current_connections}/{server.capacity}</span>
                    <span>{load.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500">No server data</p>}
      </Card>

      {/* User Growth */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Growth (Last 30 Days)</h3>
        {data.userGrowth?.length > 0 ? (
          <div className="flex items-end gap-1 h-32">
            {data.userGrowth.map((day, i) => {
              const maxCount = Math.max(...data.userGrowth.map(d => parseInt(d.count)));
              const height = maxCount > 0 ? (parseInt(day.count) / maxCount) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div className="absolute -top-6 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {new Date(day.date).toLocaleDateString()}: {day.count} users
                  </div>
                  <div className="w-full bg-blue-500 rounded-t transition-all" style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }} />
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500">No user growth data</p>}
      </Card>
    </div>
  );
};

export default GeoAnalytics;
