import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaChartLine, FaUserMinus, FaGem, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from '../common/Card';
import { apiService } from '../../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const RevenueDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRevenue();
  }, []);

  const loadRevenue = async () => {
    try {
      setLoading(true);
      const res = await apiService.getRevenue();
      setData(res.data);
    } catch (err) {
      setError('Failed to load revenue data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${parseFloat(val).toFixed(2)}`;
  };

  if (loading) return <div className="text-center text-gray-400 py-12">Loading revenue data...</div>;
  if (error) return <div className="text-center text-red-400 py-12">{error}</div>;
  if (!data) return null;

  const pieData = (data.planDistribution || []).map(p => ({
    name: p.plan_type === '6month' ? '6-Month' : p.plan_type === 'yearly' ? 'Yearly' : p.plan_type === 'monthly' ? 'Monthly' : p.plan_type,
    value: parseInt(p.count)
  }));

  const chartData = (data.dailyRevenue || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(d.revenue),
    transactions: parseInt(d.transactions)
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-xs font-medium uppercase tracking-wider">Monthly Recurring</p>
              <p className="text-white text-2xl font-bold mt-1">{formatCurrency(data.mrr)}</p>
              <p className="text-green-400 text-xs mt-1">ARR: {formatCurrency(data.arr)}</p>
            </div>
            <FaDollarSign className="text-green-400 text-3xl opacity-50" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-xs font-medium uppercase tracking-wider">Last 30 Days</p>
              <p className="text-white text-2xl font-bold mt-1">{formatCurrency(data.last30DaysRevenue)}</p>
              <p className="text-blue-400 text-xs mt-1">{data.totalTransactions} total txns</p>
            </div>
            <FaChartLine className="text-blue-400 text-3xl opacity-50" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-xs font-medium uppercase tracking-wider">Churn Rate</p>
              <p className="text-white text-2xl font-bold mt-1">{data.churnRate}%</p>
              <p className="text-red-400 text-xs mt-1">{data.churned} churned (30d)</p>
            </div>
            <FaUserMinus className="text-red-400 text-3xl opacity-50" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-xs font-medium uppercase tracking-wider">Lifetime Value</p>
              <p className="text-white text-2xl font-bold mt-1">{formatCurrency(data.ltv)}</p>
              <p className="text-purple-400 text-xs mt-1">ARPU: {formatCurrency(data.arpu)}/mo</p>
            </div>
            <FaGem className="text-purple-400 text-3xl opacity-50" />
          </div>
        </Card>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Active Paid Users</span>
            <span className="text-white font-bold text-lg">{data.activePaid}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">New Subs This Month</span>
            <span className="text-green-400 font-bold text-lg flex items-center gap-1">
              <FaArrowUp className="text-xs" /> {data.newSubscriptionsThisMonth}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Revenue</span>
            <span className="text-white font-bold text-lg">{formatCurrency(data.totalRevenue)}</span>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Revenue (Last 30 Days)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(v) => [`$${parseFloat(v).toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-center py-12">No revenue data for this period</div>
          )}
        </Card>

        {/* Plan distribution pie */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Plan Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-center py-12">No plan data</div>
          )}
        </Card>
      </div>

      {/* Plan Breakdown Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown by Plan</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="text-left py-3 px-4 text-gray-300">Plan</th>
                <th className="text-right py-3 px-4 text-gray-300">Active Users</th>
                <th className="text-right py-3 px-4 text-gray-300">Monthly Equiv.</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown && Object.entries(data.breakdown).map(([plan, info]) => (
                <tr key={plan} className="border-b border-white border-opacity-10">
                  <td className="py-3 px-4 text-white capitalize">{plan === 'sixmonth' ? '6-Month' : plan}</td>
                  <td className="py-3 px-4 text-white text-right">{info.count}</td>
                  <td className="py-3 px-4 text-green-400 text-right">{formatCurrency(info.revenue)}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RevenueDashboard;
