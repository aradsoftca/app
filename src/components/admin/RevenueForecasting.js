import React, { useState, useEffect } from 'react';
import { FaSync, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const RevenueForecasting = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const res = await apiService.getRevenuePredictions();
      setPredictions(res.data);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading forecasts...</span>
      </div>
    );
  }

  const churn = predictions?.churn || predictions?.churn_prediction || {};
  const revenue = predictions?.revenue || predictions?.revenue_forecast || {};
  const predictedUsers = predictions?.predicted_churn_users || [];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaChartLine className="mr-3 text-yellow-400" />
            Revenue Forecasting & Churn Prediction
          </h2>
          <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadPredictions}>
            Refresh
          </Button>
        </div>

        {!predictions ? (
          <p className="text-gray-400 text-center py-8">No forecast data available</p>
        ) : (
          <>
            {/* Revenue Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-5 bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/20">
                <p className="text-green-200 text-sm mb-1">Current MRR</p>
                <p className="text-white text-2xl font-bold">
                  ${(revenue.current_mrr || revenue.mrr || 0).toLocaleString()}
                </p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/20">
                <p className="text-blue-200 text-sm mb-1">Predicted Next Month</p>
                <p className="text-white text-2xl font-bold">
                  ${(revenue.predicted_next_month || revenue.forecast_30d || 0).toLocaleString()}
                </p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/20">
                <p className="text-yellow-200 text-sm mb-1">Growth Rate</p>
                <p className="text-white text-2xl font-bold flex items-center gap-2">
                  {(revenue.growth_rate || 0) >= 0 ? (
                    <FaArrowUp className="text-green-400" />
                  ) : (
                    <FaArrowDown className="text-red-400" />
                  )}
                  {Math.abs(revenue.growth_rate || 0).toFixed(1)}%
                </p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/20">
                <p className="text-red-200 text-sm mb-1">Churn Risk</p>
                <p className="text-white text-2xl font-bold">
                  {churn.at_risk_count || churn.high_risk || 0} users
                </p>
              </Card>
            </div>

            {/* Churn Details */}
            <h3 className="text-lg font-bold text-white mb-4">Churn Risk Overview</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 text-sm">Predicted Churn Rate</p>
                <p className="text-white text-xl font-bold">{(churn.churn_rate || 0).toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 text-sm">Revenue at Risk</p>
                <p className="text-white text-xl font-bold">${(churn.revenue_at_risk || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 text-sm">Avg Lifetime Value</p>
                <p className="text-white text-xl font-bold">${(revenue.avg_ltv || revenue.ltv || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* At-Risk Users */}
            {predictedUsers.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4">Users at Risk of Churning</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600 text-gray-400">
                        <th className="text-left py-3 px-2">User</th>
                        <th className="text-left py-3 px-2">Risk Score</th>
                        <th className="text-left py-3 px-2">Days Since Active</th>
                        <th className="text-left py-3 px-2">Plan Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictedUsers.slice(0, 20).map((u, i) => (
                        <tr key={u.id || i} className="border-b border-gray-700">
                          <td className="py-3 px-2 text-white">{u.email || u.user_id || '—'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              (u.risk_score || 0) > 70 ? 'bg-red-500/20 text-red-300' :
                              (u.risk_score || 0) > 40 ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {u.risk_score || 0}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-300">{u.days_inactive || '—'}</td>
                          <td className="py-3 px-2 text-gray-400 text-xs">
                            {u.subscription_end_date ? new Date(u.subscription_end_date).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default RevenueForecasting;
